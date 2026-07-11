"""
Nạp nội dung tài liệu cho worker.

Service này đọc metadata từ task/message, xác định file nguồn và gọi bộ trích
text phù hợp để trả về context thô cho pipeline sinh câu hỏi.
"""
import json
import uuid
from dataclasses import dataclass
from typing import Any

from app.core.exceptions import DocumentError
from app.core.logging import get_logger
from app.infrastructure.db.repositories import DocumentRepository
from app.infrastructure.documents.document_text_extractor import DocumentTextExtractor

logger = get_logger(__name__)

_DOCUMENT_INPUT_TYPES = {"pdf", "docx", "txt", "image", "batch_merge"}


@dataclass(frozen=True)
class DocumentSource:
    """Resolved source file metadata needed by the worker."""

    storage_path: str
    original_filename: str
    content_type: str | None = None
    document_id: uuid.UUID | None = None


class DocumentContextLoader:
    """Load text context for document-backed tasks from shared-volume files."""

    def __init__(
        self,
        document_repo: DocumentRepository,
        extractor: DocumentTextExtractor,
        quota_service: Any | None = None,
    ) -> None:
        self.document_repo = document_repo
        self.extractor = extractor
        self.quota_service = quota_service
        self.last_sources: list[DocumentSource] = []

    async def load_context(
        self,
        *,
        task: Any,
        message_payload: dict[str, Any] | None = None,
    ) -> str | None:
        """
        Return merged document text for document-backed tasks.

        Returns None for normal text-based tasks so the caller can use
        request.context exactly as before.
        """
        self.last_sources = []
        refs = self._collect_references(task, message_payload)
        input_type = str(getattr(task, "input_type", "") or "").lower()

        if not refs:
            if input_type in _DOCUMENT_INPUT_TYPES:
                raise DocumentError("Document-backed task is missing document reference.")
            return None

        loaded_parts: list[str] = []
        multiple_files = len(refs) > 1
        for index, ref in enumerate(refs, start=1):
            source = await self._resolve_source(ref)
            self.last_sources.append(source)
            if self.quota_service is not None:
                self.extractor.set_ocr_space_runtime_status(
                    await self.quota_service.get_ocr_space_status()
                )
            else:
                self.extractor.set_ocr_space_runtime_status(None)

            try:
                text = self.extractor.extract_from_path(
                    source.storage_path,
                    original_filename=source.original_filename,
                    content_type=source.content_type,
                )
            finally:
                await self._record_ocr_space_usage_if_needed(source)

            if multiple_files:
                loaded_parts.append(
                    f"===== FILE {index}: {source.original_filename} =====\n{text}"
                )
            else:
                loaded_parts.append(text)

        merged = "\n\n".join(loaded_parts).strip()
        logger.info(
            "Loaded document context | files=%d | chars=%d | task=%s",
            len(refs),
            len(merged),
            getattr(task, "id", "unknown"),
        )
        return merged

    async def _record_ocr_space_usage_if_needed(self, source: DocumentSource) -> None:
        if self.quota_service is None:
            return
        if not getattr(self.extractor, "last_ocr_space_response_received", False):
            return
        try:
            new_count = await self.quota_service.record_ocr_space_call()
            logger.info(
                "OCR.Space usage recorded | filename=%s | model=%s | used_today=%d",
                source.original_filename,
                self.quota_service.settings.ocr_space_model_name,
                new_count,
            )
        except Exception as exc:
            logger.warning(
                "OCR.Space usage record failed; continuing without blocking task | filename=%s | error=%s",
                source.original_filename,
                str(exc)[:300],
            )

    def _collect_references(
        self,
        task: Any,
        message_payload: dict[str, Any] | None,
    ) -> list[dict[str, Any]]:
        """Collect document references from RabbitMQ payload or task.input_reference."""
        payload_refs = self._references_from_mapping(message_payload or {})
        if payload_refs:
            return payload_refs

        input_reference = getattr(task, "input_reference", None)
        if not input_reference:
            return []

        try:
            parsed = json.loads(input_reference)
        except (TypeError, json.JSONDecodeError) as exc:
            raise DocumentError("Task input_reference contains invalid JSON.") from exc

        if not isinstance(parsed, dict):
            raise DocumentError("Task input_reference must be a JSON object.")

        return self._references_from_mapping(parsed)

    def _references_from_mapping(self, payload: dict[str, Any]) -> list[dict[str, Any]]:
        """Normalize supported payload shapes into a list of document refs."""
        if not payload:
            return []

        documents = payload.get("documents")
        if isinstance(documents, list):
            return [item for item in documents if isinstance(item, dict)]

        document = payload.get("document")
        if isinstance(document, dict):
            return [document]

        if any(key in payload for key in ("document_id", "storage_path", "file_path")):
            return [payload]

        return []

    async def _resolve_source(self, ref: dict[str, Any]) -> DocumentSource:
        """
        Resolve storage metadata. document_id wins over raw path when present.
        """
        document_id_value = ref.get("document_id")
        if document_id_value:
            try:
                document_id = uuid.UUID(str(document_id_value))
            except ValueError as exc:
                raise DocumentError(f"Invalid document_id: {document_id_value}") from exc

            document = await self.document_repo.get_by_id(document_id)
            if document is None:
                raise DocumentError(f"Document with id '{document_id}' not found.")

            return DocumentSource(
                document_id=document_id,
                storage_path=document.storage_path,
                original_filename=document.original_filename,
                content_type=document.mime_type,
            )

        storage_path = ref.get("storage_path") or ref.get("file_path")
        if not storage_path:
            raise DocumentError("Document storage_path is missing.")

        return DocumentSource(
            storage_path=str(storage_path),
            original_filename=str(ref.get("original_filename") or ref.get("filename") or storage_path),
            content_type=ref.get("mime_type") or ref.get("content_type"),
        )
