"""
Use case trung tam cua worker.

Luong chinh: lay noi dung dau vao, tien xu ly, dung context, goi LLM (OpenAI/Gemini),
validate + loai trung, roi luu cau hoi hop le vao DB.
"""

import json
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.application.services.document_context_loader import DocumentContextLoader
from app.application.services.llm_model_router import LLMModelRouter
from app.application.services.local_question_generator import LocalQuestionGenerator
from app.application.services.prompt_builder import PromptBuilder
from app.application.services.question_deduplicator import QuestionDeduplicator
from app.application.services.question_text_normalizer import (
    normalize_question_content,
    normalize_question_payload,
)
from app.application.services.question_validator import QuestionValidator
from app.application.services.quota_service import ApiQuotaService
from app.application.services.text_chunker import TextChunker
from app.application.services.text_preprocessor import TextPreprocessor
from app.application.services.topic_resolver import (
    UNKNOWN_TOPIC,
    TopicResolver,
    TopicResolveResult,
)
from app.core.config import get_settings
from app.core.exceptions import (
    GeminiError,
    InsufficientContextError,
    NotFoundError,
    TaskRequestMismatchError,
)
from app.core.logging import get_logger, set_request_id, set_task_id
from app.domain.enums import (
    GenerationSource,
    LogStatus,
    QuestionStatus,
    RequestStatus,
    TaskStatus,
)
from app.infrastructure.db.repositories import (
    DocumentRepository,
    GeneratedQuestionRepository,
    GenerationLogRepository,
    GenerationRequestRepository,
    GenerationTaskRepository,
)
from app.infrastructure.documents.document_text_extractor import DocumentTextExtractor

logger = get_logger(__name__)


@dataclass(frozen=True)
class _RequestSnapshot:
    id: uuid.UUID
    quantity: int
    question_type: str
    course_id: int | None
    chapter_id: int | None
    knowledge_unit_id: int | None
    context: str | None


@dataclass(frozen=True)
class _TaskSnapshot:
    id: uuid.UUID
    topic: str
    difficulty: str
    input_type: str
    input_reference: str | None


def _select_and_merge_chunks(chunks: list, max_chars: int) -> str:
    if not chunks:
        return ""
    ranked = sorted(chunks, key=lambda c: len(c.text), reverse=True)
    selected = []
    total_chars = 0
    for chunk in ranked:
        if total_chars + len(chunk.text) <= max_chars:
            selected.append(chunk)
            total_chars += len(chunk.text)
        else:
            budget = max_chars - total_chars
            if budget > 200:
                from app.application.services.text_chunker import TextChunk
                selected.append(
                    TextChunk(
                        index=chunk.index,
                        text=chunk.text[:budget],
                        char_start=chunk.char_start,
                        char_end=chunk.char_start + budget,
                        is_heading_based=chunk.is_heading_based,
                    )
                )
            break
    if not selected:
        return ""
    selected.sort(key=lambda c: c.index)
    return "\n\n".join(c.text for c in selected)


def _build_question_records(
    questions: list[dict],
    task_id: uuid.UUID,
    topic: str,
    generation_source: str,
) -> list[dict]:
    records = []
    for index, q in enumerate(questions, start=1):
        opts = q.get("options", {})
        records.append(
            {
                "id": uuid.uuid4(),
                "task_id": task_id,
                "question_content": normalize_question_content(q["question_content"]),
                "option_a": opts.get("A", ""),
                "option_b": opts.get("B", ""),
                "option_c": opts.get("C", ""),
                "option_d": opts.get("D", ""),
                "correct_answer": q["correct_answer"],
                "difficulty": q["difficulty"],
                "topic": topic,
                "explanation": q.get("explanation", ""),
                "status": QuestionStatus.PENDING_REVIEW.value,
                "display_order": index,
                "generation_source": generation_source,
            }
        )
    return records


def _limit_questions_to_requested(
    questions: list[dict],
    requested_quantity: int,
    task_id: uuid.UUID,
) -> list[dict]:
    if requested_quantity <= 0 or len(questions) <= requested_quantity:
        return questions
    logger.warning(
        "LLM returned more questions than requested | requested=%d valid=%d task=%s",
        requested_quantity,
        len(questions),
        task_id,
    )
    return questions[:requested_quantity]


def _build_short_warning(valid_count: int, requested_count: int) -> str | None:
    if valid_count >= requested_count:
        return None
    return (
        f"Generated {valid_count}/{requested_count} requested questions after "
        "validation and deduplication."
    )


def _snapshot_request(request: Any) -> _RequestSnapshot:
    return _RequestSnapshot(
        id=request.id,
        quantity=int(request.quantity),
        question_type=str(request.question_type),
        course_id=request.course_id,
        chapter_id=request.chapter_id,
        knowledge_unit_id=request.knowledge_unit_id,
        context=request.context,
    )


def _snapshot_task(task: Any) -> _TaskSnapshot:
    return _TaskSnapshot(
        id=task.id,
        topic=(task.topic or UNKNOWN_TOPIC),
        difficulty=str(task.difficulty),
        input_type=str(task.input_type),
        input_reference=task.input_reference,
    )


class ProcessAITaskUseCase:
    """
    Unified LLM pipeline: OpenAI -> Gemini (model fallback) -> Local fallback.

    Single-call mode: one LLM call per task, regardless of context length.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.req_repo = GenerationRequestRepository(db)
        self.task_repo = GenerationTaskRepository(db)
        self.q_repo = GeneratedQuestionRepository(db)
        self.log_repo = GenerationLogRepository(db)
        self.preprocessor = TextPreprocessor()
        self.prompt_builder = PromptBuilder()
        self.validator = QuestionValidator()
        self.deduplicator = QuestionDeduplicator()
        self.quota_svc = ApiQuotaService(db)
        self.local_gen = LocalQuestionGenerator()
        self.settings = get_settings()
        self.topic_resolver = TopicResolver(
            catalog_path=self.settings.topic_catalog_path,
            min_confidence=self.settings.min_topic_confidence,
            mismatch_override=self.settings.topic_mismatch_override,
            max_chars=self.settings.topic_detection_max_chars,
        )
        self.topic_detector = self.topic_resolver
        self.chunker = TextChunker(
            chunk_size=self.settings.chunk_size,
            overlap=self.settings.chunk_overlap,
        )
        self.document_context_loader = DocumentContextLoader(
            document_repo=DocumentRepository(db),
            extractor=DocumentTextExtractor(settings=self.settings),
            quota_service=self.quota_svc,
        )

    async def execute(
        self,
        request_id: uuid.UUID,
        task_id: uuid.UUID,
        trace_id: str | None = None,
        message_payload: dict[str, Any] | None = None,
        defer_failure_status: bool = False,
    ) -> None:
        set_request_id(str(request_id))
        set_task_id(str(task_id))
        logger.info(
            "Starting AI task | trace=%s | openai_configured=%s",
            trace_id,
            self.settings.has_openai_key,
        )

        request = await self.req_repo.get_by_id(request_id)
        task = await self.task_repo.get_by_id(task_id)

        if not request:
            raise NotFoundError("Request", str(request_id))
        if not task:
            raise NotFoundError("Task", str(task_id))
        if task.request_id != request_id:
            raise TaskRequestMismatchError(str(request_id), str(task_id))

        if task.status in {
            TaskStatus.COMPLETED.value,
            "completed_with_local_fallback",
        }:
            logger.info(
                "Skipping duplicate completed task | request=%s task=%s status=%s",
                request_id,
                task_id,
                task.status,
            )
            return

        request_data = _snapshot_request(request)
        task_data = _snapshot_task(task)

        started_at = datetime.now(timezone.utc)
        await self.req_repo.update_status(
            request_id, RequestStatus.PROCESSING.value, started_at=started_at
        )
        await self.task_repo.update_status(task_id, TaskStatus.PROCESSING.value)
        await self.db.commit()

        prompt_text = ""
        response_text = ""
        model_used = "unknown"
        provider_used = "unknown"
        generation_source = "unknown"

        try:
            # Step 1: Resolve source text
            context = await self._resolve_source_text(
                request=request_data,
                task=task_data,
                message_payload=message_payload,
            )
            source_filename = self._resolve_topic_filename(
                task=task_data,
                message_payload=message_payload,
            )

            logger.info(
                "Context resolved | raw_length=%d | request_id=%s",
                len(context),
                request_id,
            )

            if len(context.strip()) < 50:
                raise InsufficientContextError()

            cleaned = self.preprocessor.preprocess(context)
            if not cleaned.strip():
                raise InsufficientContextError()

            topic_detection = await self._resolve_task_topic(
                cleaned=cleaned,
                user_topic=task_data.topic,
                task_id=task_id,
                filename=source_filename,
            )
            resolved_topic = topic_detection.topic
            logger.info(
                "Topic resolved | task=%s | topic=%s | confidence=%.3f",
                task_id,
                topic_detection.topic,
                topic_detection.confidence,
            )

            # Step 2: Try LLM (OpenAI -> Gemini with fallback)
            questions_to_insert, prompt_text, response_text, model_used, provider_used = (
                await self._run_llm_single_call(
                    request=request_data,
                    task=task_data,
                    resolved_topic=resolved_topic,
                    cleaned=cleaned,
                    request_id=request_id,
                    task_id=task_id,
                    trace_id=trace_id,
                )
            )
            generation_source = provider_used
            final_task_status = TaskStatus.COMPLETED.value
            final_req_status = RequestStatus.COMPLETED.value
            log_status = LogStatus.SUCCESS.value

            # Step 3: Dedup (LLM path only)
            if provider_used in ("gemini", "openai"):
                unique = self.deduplicator.deduplicate(
                    [
                        {
                            "question_content": r["question_content"],
                            "options": {
                                "A": r["option_a"],
                                "B": r["option_b"],
                                "C": r["option_c"],
                                "D": r["option_d"],
                            },
                            "correct_answer": r["correct_answer"],
                            "difficulty": r["difficulty"],
                            "topic": r["topic"],
                            "explanation": r["explanation"],
                        }
                        for r in questions_to_insert
                    ]
                )
                questions_to_insert = _build_question_records(
                    unique, task_id, resolved_topic, generation_source
                )

            if not questions_to_insert:
                raise GeminiError("No valid questions generated.")

            # Step 4: Save questions
            await self.q_repo.bulk_create(questions_to_insert)

            # Step 5: Write log
            await self.log_repo.create(
                {
                    "id": uuid.uuid4(),
                    "request_id": request_id,
                    "ai_model": model_used,
                    "prompt": prompt_text[:5000],
                    "response": (
                        response_text[:5000]
                        if isinstance(response_text, str)
                        else str(response_text)[:5000]
                    ),
                    "status": log_status,
                    "trace_id": trace_id,
                }
            )

            # Step 6: Mark completed
            completed_at = datetime.now(timezone.utc)
            await self.task_repo.update_status(
                task_id, final_task_status, completed_at=completed_at
            )
            await self.req_repo.update_status(
                request_id, final_req_status, progress=100, completed_at=completed_at
            )
            await self.db.commit()

            logger.info(
                "Task completed | task=%s | provider=%s | model=%s | questions=%d",
                task_id,
                provider_used,
                model_used,
                len(questions_to_insert),
            )

        except Exception as e:
            if defer_failure_status:
                await self.db.rollback()
                logger.warning(
                    "Deferring failed status to RabbitMQ retry handler | task=%s error=%s",
                    task_id,
                    str(e),
                )
                raise
            await self._handle_failure(
                request_id=request_id,
                task_id=task_id,
                error=e,
                prompt_text=prompt_text,
                response_text=response_text,
                model_used=model_used,
                trace_id=trace_id,
            )

    async def _resolve_task_topic(
        self,
        *,
        cleaned: str,
        user_topic: str,
        task_id: uuid.UUID,
        filename: str | None = None,
    ) -> TopicResolveResult:
        original_topic = (user_topic or "").strip()

        if not self.settings.auto_detect_topic:
            topic = original_topic or UNKNOWN_TOPIC
            return TopicResolveResult(
                topic=topic,
                confidence=1.0 if original_topic else 0.0,
                matched_keywords=[],
                title_candidates=[],
                evidence=[],
                source="user" if original_topic else "fallback",
                reason="AUTO_DETECT_TOPIC=false",
            )

        resolver = getattr(self, "topic_resolver", None) or self.topic_detector
        if hasattr(resolver, "detect_topic"):
            result = resolver.detect_topic(
                cleaned,
                user_topic=original_topic,
                filename=filename,
            )
        else:
            result = resolver.resolve(
                cleaned,
                user_topic=original_topic,
                filename=filename,
            )

        if result.topic != original_topic:
            if result.source not in {"user", "fallback"}:
                logger.info("%s | task=%s", result.reason, task_id)
            try:
                await self.task_repo.update_topic(task_id, result.topic)
            except Exception as exc:
                logger.warning(
                    "Topic metadata update failed: %s", str(exc)[:300]
                )
                try:
                    await self.db.rollback()
                except Exception:
                    pass

        return result

    def _resolve_topic_filename(
        self,
        *,
        task: Any,
        message_payload: dict[str, Any] | None,
    ) -> str | None:
        sources = getattr(self.document_context_loader, "last_sources", None) or []
        names = [
            str(getattr(source, "original_filename", "")).strip()
            for source in sources
            if str(getattr(source, "original_filename", "")).strip()
        ]
        if names:
            return ", ".join(names[:3])

        for payload in (
            message_payload,
            self._parse_input_reference(task.input_reference),
        ):
            filename = self._filename_from_mapping(payload)
            if filename:
                return filename
        return None

    def _parse_input_reference(self, value: str | None) -> dict[str, Any] | None:
        if not value:
            return None
        try:
            parsed = json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return None
        return parsed if isinstance(parsed, dict) else None

    def _filename_from_mapping(self, payload: dict[str, Any] | None) -> str | None:
        if not isinstance(payload, dict):
            return None

        refs: list[dict[str, Any]] = []
        documents = payload.get("documents")
        if isinstance(documents, list):
            refs.extend(item for item in documents if isinstance(item, dict))
        document = payload.get("document")
        if isinstance(document, dict):
            refs.append(document)
        if any(
            key in payload
            for key in ("original_filename", "filename", "storage_path", "file_path")
        ):
            refs.append(payload)

        for ref in refs:
            name = ref.get("original_filename") or ref.get("filename")
            if name:
                return str(name)
            storage_path = ref.get("storage_path") or ref.get("file_path")
            if storage_path:
                return Path(str(storage_path)).name
        return None

    async def _resolve_source_text(
        self,
        *,
        request: Any,
        task: Any,
        message_payload: dict[str, Any] | None,
    ) -> str:
        document_context = await self.document_context_loader.load_context(
            task=task,
            message_payload=message_payload,
        )
        if document_context is not None:
            return document_context
        return request.context or ""

    async def _run_llm_single_call(
        self,
        request: Any,
        task: Any,
        cleaned: str,
        request_id: uuid.UUID,
        task_id: uuid.UUID,
        trace_id: str | None,
        resolved_topic: str | None = None,
    ) -> tuple[list[dict], str, str, str, str]:
        """
        Call LLM via unified router (OpenAI -> Gemini -> Local fallback).
        """
        max_ctx = self.settings.max_single_call_context_chars
        requested_quantity = int(request.quantity)
        topic_for_generation: str = (
            resolved_topic or getattr(task, "topic", UNKNOWN_TOPIC) or ""
        )

        # Prepare single-call context
        if len(cleaned) <= max_ctx:
            context_for_call = cleaned
            logger.info(
                "Single-call context: full text | chars=%d | task=%s",
                len(cleaned),
                task_id,
            )
        else:
            chunks = self.chunker.chunk(cleaned)
            max_merged = self.settings.max_merged_context_chars
            context_for_call = _select_and_merge_chunks(chunks, max_merged)
            logger.info(
                "Single-call context: merged | original=%d | merged=%d | task=%s",
                len(cleaned),
                len(context_for_call),
                task_id,
            )

        if not context_for_call.strip():
            raise InsufficientContextError()

        # Build prompt
        prompt_text = self.prompt_builder.build_generation_prompt(
            context=context_for_call,
            topic=topic_for_generation,
            quantity=requested_quantity,
            difficulty=task.difficulty,
            question_type=request.question_type,
            course_id=request.course_id,
            chapter_id=request.chapter_id,
            knowledge_unit_id=request.knowledge_unit_id,
            batch_merge=task.input_type == "batch_merge",
        )

        logger.info(
            "LLM single call | context_chars=%d | qty=%d | task=%s",
            len(context_for_call),
            requested_quantity,
            task_id,
        )

        # Call via unified LLM router
        router = LLMModelRouter(db=self.db, request_id=str(request_id))
        raw_response, provider, model = await router.generate_with_fallback(
            prompt=prompt_text,
            context=context_for_call,
            topic=topic_for_generation,
            quantity=requested_quantity,
            difficulty=task.difficulty,
        )
        response_text = str(raw_response)

        # Validate
        normalized = normalize_question_payload(raw_response)
        validation = self.validator.validate_batch(normalized)
        valid_questions = validation.valid_questions

        # Warn if fewer questions
        warning = _build_short_warning(len(valid_questions), requested_quantity)
        if warning:
            logger.warning("%s | task=%s | model=%s", warning, task_id, model)

        limited = _limit_questions_to_requested(
            valid_questions, requested_quantity, task_id
        )
        records = _build_question_records(
            limited, task_id, topic_for_generation, provider
        )
        return records, prompt_text, response_text, model, provider

    def _run_local_fallback(
        self,
        cleaned: str,
        quantity: int,
        topic: str,
        difficulty: str,
        task_id: uuid.UUID,
    ) -> list[dict]:
        qty = int(quantity or 0)
        logger.info(
            "LOCAL FALLBACK activated | task=%s | qty=%d | topic=%s",
            task_id,
            qty,
            topic,
        )
        questions = self.local_gen.generate(
            context=cleaned,
            quantity=qty,
            topic=topic,
            difficulty=difficulty,
        )
        return _build_question_records(
            questions, task_id, topic, GenerationSource.LOCAL_FALLBACK.value
        )

    async def mark_failed(
        self,
        request_id: uuid.UUID,
        task_id: uuid.UUID,
        error: Exception,
        trace_id: str | None = None,
    ) -> None:
        await self._handle_failure(
            request_id=request_id,
            task_id=task_id,
            error=error,
            prompt_text="",
            response_text="",
            model_used=self.settings.gemini_model,
            trace_id=trace_id,
        )

    async def _handle_failure(
        self,
        request_id: uuid.UUID,
        task_id: uuid.UUID,
        error: Exception,
        prompt_text: str,
        response_text: str,
        model_used: str,
        trace_id: str | None,
    ) -> None:
        error_msg = str(error)
        logger.error("Task FAILED | task=%s | error=%s", task_id, error_msg)

        await self.db.rollback()
        try:
            await self.log_repo.create(
                {
                    "id": uuid.uuid4(),
                    "request_id": request_id,
                    "ai_model": model_used,
                    "prompt": prompt_text[:5000] if prompt_text else "N/A",
                    "response": response_text[:5000] if response_text else "N/A",
                    "status": LogStatus.FAILED.value,
                    "error_message": error_msg,
                    "trace_id": trace_id,
                }
            )
        except Exception as log_err:
            logger.error("Failed to write error log: %s", log_err)
            await self.db.rollback()

        completed_at = datetime.now(timezone.utc)
        await self.task_repo.update_status(
            task_id,
            TaskStatus.FAILED.value,
            error_message=error_msg,
            completed_at=completed_at,
        )
        await self.req_repo.update_status(
            request_id,
            RequestStatus.FAILED.value,
            error_message=error_msg,
            completed_at=completed_at,
        )
        await self.db.commit()
