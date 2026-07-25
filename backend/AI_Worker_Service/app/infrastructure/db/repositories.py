"""
Repository layer â€” all database operations isolated here.
No business logic, only CRUD and queries.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DatabaseError
from app.core.logging import get_logger
from app.infrastructure.db.models import (
    AIGenerationLog,
    AIGenerationRequest,
    AIGenerationTask,
    Course,
    Document,
    GeneratedQuestion,
    Question,
    Subject,
)

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Course Repository
# ---------------------------------------------------------------------------


class CourseRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_name(self, name: str) -> Course | None:
        try:
            result = await self.db.execute(select(Course).where(Course.name == name))
            return result.scalar_one_or_none()
        except Exception as e:
            raise DatabaseError(f"Failed to fetch course: {e}") from e

    async def create(self, name: str) -> Course:
        try:
            obj = Course(name=name)
            self.db.add(obj)
            await self.db.flush()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            raise DatabaseError(f"Failed to create course: {e}") from e

    async def list_all(self) -> list[Course]:
        try:
            result = await self.db.execute(select(Course).order_by(Course.name.asc()))
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to list courses: {e}") from e


# ---------------------------------------------------------------------------
# Subject Repository
# ---------------------------------------------------------------------------


class SubjectRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_name(self, name: str, course_id: int | None) -> Subject | None:
        try:
            stmt = select(Subject).where(Subject.name == name)
            if course_id is None:
                stmt = stmt.where(Subject.course_id.is_(None))
            else:
                stmt = stmt.where(Subject.course_id == course_id)
            result = await self.db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            raise DatabaseError(f"Failed to fetch subject: {e}") from e

    async def create(self, name: str, course_id: int | None) -> Subject:
        try:
            obj = Subject(name=name, course_id=course_id)
            self.db.add(obj)
            await self.db.flush()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            raise DatabaseError(f"Failed to create subject: {e}") from e

    async def list_all(self) -> list[Subject]:
        try:
            result = await self.db.execute(select(Subject).order_by(Subject.name.asc()))
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to list subjects: {e}") from e

    async def list_by_course_id(self, course_id: int) -> list[Subject]:
        try:
            result = await self.db.execute(
                select(Subject)
                .where(Subject.course_id == course_id)
                .order_by(Subject.name.asc())
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to list subjects by course: {e}") from e


# ---------------------------------------------------------------------------
# Document Repository
# ---------------------------------------------------------------------------


class DocumentRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, data: dict) -> Document:
        """Persist metadata for an uploaded source document."""
        try:
            obj = Document(**data)
            self.db.add(obj)
            await self.db.flush()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            raise DatabaseError(f"Failed to create document: {e}") from e

    async def get_by_id(self, document_id: uuid.UUID) -> Document | None:
        """Fetch an uploaded document metadata record by document_id."""
        try:
            result = await self.db.execute(
                select(Document).where(Document.document_id == document_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise DatabaseError(f"Failed to fetch document: {e}") from e

    async def get_by_id_or_primary(self, id_value: uuid.UUID) -> Document | None:
        """Fetch document by document_id or legacy id (for backward compatibility)."""
        try:
            result = await self.db.execute(
                select(Document).where(
                    (Document.document_id == id_value) | (Document.id == id_value)
                )
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise DatabaseError(f"Failed to fetch document: {e}") from e

    async def update_status(
        self,
        document_id: uuid.UUID,
        status: str,
        error_message: str | None = None,
    ) -> None:
        """Update document status."""
        try:
            values: dict = {"status": status}
            if error_message is not None:
                values["error_message"] = error_message

            await self.db.execute(
                update(Document)
                .where(Document.document_id == document_id)
                .values(**values)
            )
        except Exception as e:
            raise DatabaseError(f"Failed to update document status: {e}") from e


# ---------------------------------------------------------------------------
# Generation Request Repository
# ---------------------------------------------------------------------------


class GenerationRequestRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, data: dict) -> AIGenerationRequest:
        try:
            obj = AIGenerationRequest(**data)
            self.db.add(obj)
            await self.db.flush()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            logger.error("Failed to create generation request: %s", e)
            raise DatabaseError(f"Failed to create generation request: {e}") from e

    async def get_by_id(self, request_id: uuid.UUID) -> AIGenerationRequest | None:
        try:
            result = await self.db.execute(
                select(AIGenerationRequest).where(AIGenerationRequest.id == request_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise DatabaseError(f"Failed to fetch request: {e}") from e

    async def update_status(
        self,
        request_id: uuid.UUID,
        status: str,
        progress: int = 0,
        error_message: str | None = None,
        started_at: datetime | None = None,
        completed_at: datetime | None = None,
    ) -> None:
        try:
            values: dict = {"status": status, "progress": progress}
            if error_message is not None:
                values["error_message"] = error_message
            if started_at is not None:
                values["started_at"] = started_at
            if completed_at is not None:
                values["completed_at"] = completed_at

            await self.db.execute(
                update(AIGenerationRequest)
                .where(AIGenerationRequest.id == request_id)
                .values(**values)
            )
        except Exception as e:
            raise DatabaseError(f"Failed to update request status: {e}") from e


# ---------------------------------------------------------------------------
# Generation Task Repository
# ---------------------------------------------------------------------------


class GenerationTaskRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, data: dict) -> AIGenerationTask:
        try:
            obj = AIGenerationTask(**data)
            self.db.add(obj)
            await self.db.flush()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            raise DatabaseError(f"Failed to create generation task: {e}") from e

    async def get_by_id(self, task_id: uuid.UUID) -> AIGenerationTask | None:
        try:
            result = await self.db.execute(
                select(AIGenerationTask).where(AIGenerationTask.id == task_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise DatabaseError(f"Failed to fetch task: {e}") from e

    async def update_status(
        self,
        task_id: uuid.UUID,
        status: str,
        error_message: str | None = None,
        completed_at: datetime | None = None,
    ) -> None:
        try:
            values: dict = {"status": status}
            if error_message is not None:
                values["error_message"] = error_message
            if completed_at is not None:
                values["completed_at"] = completed_at

            await self.db.execute(
                update(AIGenerationTask)
                .where(AIGenerationTask.id == task_id)
                .values(**values)
            )
        except Exception as e:
            raise DatabaseError(f"Failed to update task status: {e}") from e

    async def update_topic(self, task_id: uuid.UUID, topic: str) -> None:
        """Update task topic after worker-side topic detection."""
        try:
            task_table = AIGenerationTask.__table__
            await self.db.execute(
                update(task_table)
                .where(task_table.c.id == task_id)
                .values(topic=topic)
                .execution_options(synchronize_session=False)
            )
        except Exception as e:
            raise DatabaseError(f"Failed to update task topic: {e}") from e


# ---------------------------------------------------------------------------
# Generated Question Repository
# ---------------------------------------------------------------------------


class GeneratedQuestionRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def bulk_create(self, questions_data: list[dict]) -> list[GeneratedQuestion]:
        """Insert multiple questions in one flush."""
        try:
            objs = [GeneratedQuestion(**data) for data in questions_data]
            self.db.add_all(objs)
            await self.db.flush()
            for obj in objs:
                await self.db.refresh(obj)
            return objs
        except Exception as e:
            raise DatabaseError(f"Failed to bulk create questions: {e}") from e

    async def get_by_id(self, question_id: uuid.UUID) -> GeneratedQuestion | None:
        try:
            result = await self.db.execute(
                select(GeneratedQuestion).where(GeneratedQuestion.id == question_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise DatabaseError(f"Failed to fetch question: {e}") from e

    async def get_by_task_id(self, task_id: uuid.UUID) -> list[GeneratedQuestion]:
        try:
            result = await self.db.execute(
                select(GeneratedQuestion)
                .where(GeneratedQuestion.task_id == task_id)
                .order_by(
                    GeneratedQuestion.display_order.asc().nulls_last(),
                    GeneratedQuestion.created_at.asc(),
                )
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to fetch questions for task: {e}") from e

    async def list_pending_review(
        self,
        task_id: uuid.UUID | None = None,
        difficulty: str | None = None,
        topic: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[GeneratedQuestion], int]:
        """List questions with status=pending_review, with optional filters and pagination."""
        try:
            from sqlalchemy import func as sa_func

            conditions = [GeneratedQuestion.status == "pending_review"]
            if task_id:
                conditions.append(GeneratedQuestion.task_id == task_id)
            if difficulty:
                conditions.append(GeneratedQuestion.difficulty == difficulty)
            if topic:
                conditions.append(GeneratedQuestion.topic.ilike(f"%{topic}%"))

            base_query = select(GeneratedQuestion).where(and_(*conditions))

            # Count total
            count_result = await self.db.execute(
                select(sa_func.count()).select_from(base_query.subquery())
            )
            total = count_result.scalar() or 0

            # Paginate
            offset = (page - 1) * page_size
            result = await self.db.execute(
                base_query.order_by(GeneratedQuestion.created_at.desc())
                .offset(offset)
                .limit(page_size)
            )
            items = list(result.scalars().all())
            return items, total
        except Exception as e:
            raise DatabaseError(f"Failed to list pending review questions: {e}") from e

    async def update_status(self, question_id: uuid.UUID, status: str) -> None:
        try:
            await self.db.execute(
                update(GeneratedQuestion)
                .where(GeneratedQuestion.id == question_id)
                .values(status=status)
            )
        except Exception as e:
            raise DatabaseError(f"Failed to update question status: {e}") from e

    async def update_content(self, question_id: uuid.UUID, data: dict) -> None:
        """Update question content fields (for edit before approve)."""
        try:
            await self.db.execute(
                update(GeneratedQuestion)
                .where(GeneratedQuestion.id == question_id)
                .values(**data)
            )
        except Exception as e:
            raise DatabaseError(f"Failed to update question content: {e}") from e


# ---------------------------------------------------------------------------
# Question Bank Repository (question_db.questions)
# ---------------------------------------------------------------------------


class QuestionBankRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_source_generated_id(self, source_id: uuid.UUID) -> Question | None:
        """Check if a generated question was already approved (by source ID)."""
        try:
            result = await self.db.execute(
                select(Question).where(
                    Question.source_generated_question_id == source_id
                )
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise DatabaseError(f"Failed to check question bank: {e}") from e

    async def create_from_generated(
        self,
        generated: GeneratedQuestion,
        task: AIGenerationTask,
        request: AIGenerationRequest,
        ai_model: str,
    ) -> Question:
        """
        Copy an approved generated_question into the question bank.
        Maps all fields including source_generated_question_id for dedup.
        """
        try:
            options = {
                "A": generated.option_a,
                "B": generated.option_b,
                "C": generated.option_c,
                "D": generated.option_d,
            }
            # Sanitize: treat 0 same as None (not a valid FK)
            safe_chapter_id = (
                request.chapter_id
                if (request.chapter_id and request.chapter_id > 0)
                else None
            )
            safe_ku_id = (
                request.knowledge_unit_id
                if (request.knowledge_unit_id and request.knowledge_unit_id > 0)
                else None
            )
            safe_subject_id = (
                task.subject_id if (task.subject_id and task.subject_id > 0) else None
            )

            obj = Question(
                id=uuid.uuid4(),
                source_generated_question_id=generated.id,
                course_id=request.course_id,
                subject_id=safe_subject_id,
                chapter_id=safe_chapter_id,
                knowledge_unit_id=safe_ku_id,
                created_by=request.user_id,
                question_type=request.question_type,
                difficulty=generated.difficulty,
                content=generated.question_content,
                options=options,
                correct_answer=generated.correct_answer,
                explanation=generated.explanation,
                points=Decimal("1.0"),
                time_limit=None,
                keywords=None,
                is_ai_generated=True,
                ai_model=ai_model,
                is_active=True,
                is_public=False,
            )
            self.db.add(obj)
            await self.db.flush()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            raise DatabaseError(f"Failed to create question in bank: {e}") from e

    async def list_questions(
        self,
        course_id: int | None = None,
        subject_id: int | None = None,
        chapter_id: int | None = None,
        knowledge_unit_id: int | None = None,
        difficulty: str | None = None,
        topic: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Question], int]:
        """List approved questions from the question bank with filters and pagination."""
        try:
            from sqlalchemy import func as sa_func

            conditions = [Question.is_active == True]  # noqa: E712
            if course_id is not None:
                conditions.append(Question.course_id == course_id)
            if subject_id is not None:
                conditions.append(Question.subject_id == subject_id)
            if chapter_id is not None:
                conditions.append(Question.chapter_id == chapter_id)
            if knowledge_unit_id is not None:
                conditions.append(Question.knowledge_unit_id == knowledge_unit_id)
            if difficulty:
                conditions.append(Question.difficulty == difficulty)
            if topic:
                conditions.append(Question.content.ilike(f"%{topic}%"))

            base_query = select(Question).where(and_(*conditions))

            # Count total
            count_result = await self.db.execute(
                select(sa_func.count()).select_from(base_query.subquery())
            )
            total = count_result.scalar() or 0

            # Paginate
            offset = (page - 1) * page_size
            result = await self.db.execute(
                base_query.order_by(Question.created_at.desc())
                .offset(offset)
                .limit(page_size)
            )
            items = list(result.scalars().all())
            return items, total
        except Exception as e:
            raise DatabaseError(f"Failed to list question bank: {e}") from e


# ---------------------------------------------------------------------------
# Generation Log Repository
# ---------------------------------------------------------------------------


class GenerationLogRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, data: dict) -> AIGenerationLog:
        try:
            obj = AIGenerationLog(**data)
            self.db.add(obj)
            await self.db.flush()
            return obj
        except Exception as e:
            raise DatabaseError(f"Failed to create generation log: {e}") from e
