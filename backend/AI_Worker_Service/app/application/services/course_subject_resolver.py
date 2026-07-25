"""Course/Subject resolver for auto-resolving IDs from topic or names."""

from dataclasses import dataclass

from app.core.config import get_settings
from app.core.exceptions import ValidationError
from app.core.logging import get_logger
from app.infrastructure.db.repositories import CourseRepository, SubjectRepository

logger = get_logger(__name__)


@dataclass
class ResolvedCourseSubject:
    course_id: int
    subject_id: int
    course_name: str
    subject_name: str


class CourseSubjectResolver:
    def __init__(
        self,
        course_repo: CourseRepository,
        subject_repo: SubjectRepository,
    ) -> None:
        self.course_repo = course_repo
        self.subject_repo = subject_repo
        self.settings = get_settings()

    async def resolve(
        self,
        topic: str | None,
        course_id: int | None,
        subject_id: int | None,
        course_name: str | None = None,
        subject_name: str | None = None,
    ) -> ResolvedCourseSubject:
        topic_value = (topic or "").strip()
        if not self.settings.auto_resolve_course_subject_from_topic:
            if course_id is None or subject_id is None:
                raise ValidationError(
                    "course_id and subject_id are required when auto-resolve is disabled"
                )

        if (
            not topic_value
            and not course_id
            and not subject_id
            and not course_name
            and not subject_name
        ):
            raise ValidationError(
                "topic is required when course/subject are not provided"
            )

        resolved_course_id, resolved_course_name = await self._resolve_course(
            topic_value, course_id, course_name
        )
        resolved_subject_id, resolved_subject_name = await self._resolve_subject(
            topic_value, subject_id, subject_name, resolved_course_id
        )

        return ResolvedCourseSubject(
            course_id=resolved_course_id,
            subject_id=resolved_subject_id,
            course_name=resolved_course_name,
            subject_name=resolved_subject_name,
        )

    async def _resolve_course(
        self,
        topic: str,
        course_id: int | None,
        course_name: str | None,
    ) -> tuple[int, str]:
        if course_id is not None:
            return course_id, course_name or ""

        resolved_name = (course_name or "").strip()
        if not resolved_name:
            if self.settings.use_topic_as_course_name:
                resolved_name = topic
            else:
                resolved_name = self.settings.default_course_name

        if not resolved_name:
            raise ValidationError(
                "course_name is required when course_id is not provided"
            )

        existing = await self.course_repo.get_by_name(resolved_name)
        if existing:
            logger.info(
                "Resolved course: existing name=%s id=%d", resolved_name, existing.id
            )
            return existing.id, resolved_name

        created = await self.course_repo.create(resolved_name)
        logger.info("Resolved course: created name=%s id=%d", resolved_name, created.id)
        return created.id, resolved_name

    async def _resolve_subject(
        self,
        topic: str,
        subject_id: int | None,
        subject_name: str | None,
        course_id: int | None,
    ) -> tuple[int, str]:
        if subject_id is not None:
            return subject_id, subject_name or ""

        resolved_name = (subject_name or "").strip()
        if not resolved_name:
            if self.settings.use_topic_as_subject_name:
                resolved_name = topic
            else:
                resolved_name = self.settings.default_subject_name or ""

        if not resolved_name:
            raise ValidationError(
                "subject_name is required when subject_id is not provided"
            )

        existing = await self.subject_repo.get_by_name(resolved_name, course_id)
        if existing:
            logger.info(
                "Resolved subject: existing name=%s id=%d course_id=%s",
                resolved_name,
                existing.id,
                course_id,
            )
            return existing.id, resolved_name

        created = await self.subject_repo.create(resolved_name, course_id)
        logger.info(
            "Resolved subject: created name=%s id=%d course_id=%s",
            resolved_name,
            created.id,
            course_id,
        )
        return created.id, resolved_name
