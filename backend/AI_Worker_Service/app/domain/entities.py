"""
Domain entities (pure Python dataclasses, no DB dependencies).
These represent the core business objects.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from app.domain.enums import (
    DifficultyLevel,
    InputType,
    LogStatus,
    QuestionStatus,
    QuestionType,
    RequestStatus,
    TaskStatus,
)


@dataclass
class GenerationRequest:
    id: uuid.UUID
    user_id: uuid.UUID
    course_id: int
    subject_id: int
    topic: str
    difficulty: DifficultyLevel
    question_type: QuestionType
    quantity: int
    context: str
    status: RequestStatus
    chapter_id: Optional[int] = None
    knowledge_unit_id: Optional[int] = None
    progress: int = 0
    error_message: Optional[str] = None
    trace_id: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class GenerationTask:
    id: uuid.UUID
    request_id: uuid.UUID
    subject_id: int
    topic: str
    input_type: InputType
    number_of_questions: int
    difficulty: DifficultyLevel
    status: TaskStatus
    created_by: uuid.UUID
    input_reference: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


@dataclass
class GeneratedQuestion:
    id: uuid.UUID
    task_id: uuid.UUID
    question_content: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str  # "A" | "B" | "C" | "D"
    difficulty: DifficultyLevel
    topic: str
    explanation: str
    status: QuestionStatus = QuestionStatus.PENDING_REVIEW
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class GenerationLog:
    id: uuid.UUID
    request_id: uuid.UUID
    ai_model: str
    prompt: str
    response: str
    status: LogStatus
    question_id: Optional[uuid.UUID] = None
    tokens_used: Optional[int] = None
    cost: Optional[float] = None
    error_message: Optional[str] = None
    trace_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
