"""
API routes for Course and Subject lookup.

GET /api/v1/courses            — List all courses
GET /api/v1/subjects           — List all subjects (optionally filtered by course_id)
"""

from typing import Any, List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.repositories import CourseRepository, SubjectRepository
from app.infrastructure.db.session import get_db

router = APIRouter(tags=["Courses & Subjects"])


# ---------------------------------------------------------------------------
# Response schemas (local — simple enough to keep here)
# ---------------------------------------------------------------------------


class CourseItem(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class SubjectItem(BaseModel):
    id: int
    name: str
    course_id: Optional[int] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get(
    "/courses",
    response_model=List[CourseItem],
    summary="List all courses",
)
async def list_courses(
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Return all courses sorted by name.

    Courses are created automatically when the first upload uses a given
    `course_name` (or falls back to `DEFAULT_COURSE_NAME` from config).
    IDs are database-generated — never hardcoded.
    """
    repo = CourseRepository(db)
    items = await repo.list_all()
    return [CourseItem(id=c.id, name=c.name) for c in items]


@router.get(
    "/subjects",
    response_model=List[SubjectItem],
    summary="List all subjects",
)
async def list_subjects(
    course_id: Optional[int] = Query(
        default=None, description="Filter subjects by course ID"
    ),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Return all subjects sorted by name, optionally filtered by `course_id`.

    Subjects are created automatically when the first upload uses a given
    `subject_name` / `topic` with a resolved `course_id`.
    IDs are database-generated — never hardcoded.
    """
    repo = SubjectRepository(db)
    if course_id is not None:
        items = await repo.list_by_course_id(course_id)
    else:
        items = await repo.list_all()
    return [SubjectItem(id=s.id, name=s.name, course_id=s.course_id) for s in items]
