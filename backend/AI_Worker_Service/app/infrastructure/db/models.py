"""
SQLAlchemy ORM models matching the required schema exactly.
- Schema ai_db: ai_generation_requests, ai_generation_tasks, generated_questions, ai_generation_logs
- Schema question_db: questions
"""

import uuid
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    DECIMAL,
    JSON,
    TIMESTAMP,
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import ARRAY, ENUM, UUID
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Schema: public (courses, subjects)
# ---------------------------------------------------------------------------


class Course(Base):
    """Course lookup table for auto-resolving course_id."""

    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class Subject(Base):
    """Subject lookup table for auto-resolving subject_id."""

    __tablename__ = "subjects"
    __table_args__ = (
        UniqueConstraint("name", "course_id", name="uq_subjects_name_course"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


# ---------------------------------------------------------------------------
# Schema: ai_db
# ---------------------------------------------------------------------------


class AIGenerationRequest(Base):
    """Tracks a user's request to generate questions."""

    __tablename__ = "ai_generation_requests"
    __table_args__ = {"schema": "ai_db"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    course_id = Column(Integer, nullable=False)
    chapter_id = Column(Integer, nullable=True)
    knowledge_unit_id = Column(Integer, nullable=True)
    difficulty = Column(
        ENUM(
            "easy",
            "medium",
            "hard",
            "very_hard",
            name="difficulty_level",
            schema="public",
            create_type=False,
        ),
        nullable=False,
    )
    question_type = Column(
        ENUM(
            "multiple_choice",
            "true_false",
            "matching",
            "fill_blank",
            name="question_type",
            schema="public",
            create_type=False,
        ),
        nullable=False,
    )
    quantity = Column(Integer, nullable=False)
    context = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    progress = Column(Integer, nullable=False, default=0)
    error_message = Column(Text, nullable=True)
    trace_id = Column(String(100), nullable=True)
    started_at = Column(TIMESTAMP(timezone=True), nullable=True)
    completed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    tasks = relationship("AIGenerationTask", back_populates="request", lazy="select")
    logs = relationship("AIGenerationLog", back_populates="request", lazy="select")


class AIGenerationTask(Base):
    """Individual processing task for a generation request."""

    __tablename__ = "ai_generation_tasks"
    __table_args__ = {"schema": "ai_db"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ai_db.ai_generation_requests.id", ondelete="CASCADE"),
        nullable=False,
    )
    subject_id = Column(Integer, nullable=True)
    topic = Column(Text, nullable=False)
    input_type = Column(String(20), nullable=False, default="text")
    input_reference = Column(Text, nullable=True)
    number_of_questions = Column(Integer, nullable=False)
    difficulty = Column(
        ENUM(
            "easy",
            "medium",
            "hard",
            "very_hard",
            name="difficulty_level",
            schema="public",
            create_type=False,
        ),
        nullable=False,
    )
    status = Column(String(20), nullable=False, default="pending")
    created_by = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    completed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)

    # Relationships
    request = relationship("AIGenerationRequest", back_populates="tasks")
    generated_questions = relationship(
        "GeneratedQuestion", back_populates="task", lazy="select"
    )


class GeneratedQuestion(Base):
    """AI-generated question pending human review."""

    __tablename__ = "generated_questions"
    __table_args__ = {"schema": "ai_db"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ai_db.ai_generation_tasks.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_content = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_answer = Column(String(1), nullable=False)
    difficulty = Column(
        ENUM(
            "easy",
            "medium",
            "hard",
            "very_hard",
            name="difficulty_level",
            schema="public",
            create_type=False,
        ),
        nullable=False,
    )
    topic = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="pending_review")
    display_order = Column(Integer, nullable=True)
    # Tracks whether this question was generated by Gemini or local CPU fallback
    generation_source = Column(String(20), nullable=False, default="gemini")
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    task = relationship("AIGenerationTask", back_populates="generated_questions")


class AIGenerationLog(Base):
    """Audit log for every Gemini API call."""

    __tablename__ = "ai_generation_logs"
    __table_args__ = {"schema": "ai_db"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ai_db.ai_generation_requests.id", ondelete="SET NULL"),
        nullable=True,
    )
    question_id = Column(UUID(as_uuid=True), nullable=True)
    ai_model = Column(String(100), nullable=False)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    tokens_used = Column(Integer, nullable=True)
    cost = Column(DECIMAL(10, 6), nullable=True)
    status = Column(String(20), nullable=False)
    error_message = Column(Text, nullable=True)
    trace_id = Column(String(100), nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    request = relationship("AIGenerationRequest", back_populates="logs")


class AIApiUsage(Base):
    """
    Tracks daily API usage per provider/model.
    Used to enforce GEMINI_DAILY_REQUEST_LIMIT without relying on Gemini's own quota messages.
    """

    __tablename__ = "ai_api_usage"
    __table_args__ = (
        UniqueConstraint(
            "provider", "model", "usage_date", name="uq_api_usage_provider_model_date"
        ),
        {"schema": "ai_db"},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider = Column(String(50), nullable=False)  # e.g. "gemini"
    model = Column(String(100), nullable=False)  # e.g. "gemini-2.5-flash-lite"
    usage_date = Column(String(10), nullable=False)  # ISO date: "2026-06-03"
    request_count = Column(Integer, nullable=False, default=0)
    token_estimate = Column(Integer, nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class Document(Base):
    """
    Uploaded source file metadata.
    Schema: ai_db.documents

    Fields match database schema exactly:
    - document_id (PRIMARY KEY) - UUID
    - course_id (NOT NULL) - INTEGER
    - uploaded_by (NOT NULL) - UUID
    - file_name - VARCHAR
    - original_filename (NOT NULL) - VARCHAR
    - storage_path (NOT NULL) - TEXT
    - file_url - TEXT
    - mime_type - VARCHAR
    - file_size - BIGINT
    - status (NOT NULL) - VARCHAR
    - error_message - TEXT
    - trace_id - VARCHAR
    - created_at - TIMESTAMP
    - updated_at - TIMESTAMP
    """

    __tablename__ = "documents"
    __table_args__ = {"schema": "ai_db"}

    # document_id is the primary key matching schema
    document_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
    )
    course_id = Column(Integer, nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), nullable=False)
    file_name = Column(String(255), nullable=True)
    original_filename = Column(String(255), nullable=False)
    storage_path = Column(Text, nullable=False)
    file_url = Column(Text, nullable=True)
    mime_type = Column(String(100), nullable=True)
    file_size = Column(BigInteger, nullable=True)
    status = Column(String(20), nullable=False, default="stored")
    error_message = Column(Text, nullable=True)
    trace_id = Column(String(100), nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


# ---------------------------------------------------------------------------
# Schema: question_db
# ---------------------------------------------------------------------------


class Question(Base):
    """Approved questions stored in the question bank."""

    __tablename__ = "questions"
    __table_args__ = (
        UniqueConstraint(
            "source_generated_question_id", name="uq_questions_source_gen_id"
        ),
        {"schema": "question_db"},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Track which AI-generated question was approved (unique = no duplicates)
    source_generated_question_id = Column(UUID(as_uuid=True), nullable=True)
    course_id = Column(Integer, nullable=False)
    subject_id = Column(Integer, nullable=True)
    chapter_id = Column(Integer, nullable=True)
    knowledge_unit_id = Column(Integer, nullable=True)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    question_type = Column(
        ENUM(
            "multiple_choice",
            "true_false",
            "matching",
            "fill_blank",
            name="question_type",
            schema="public",
            create_type=False,
        ),
        nullable=False,
    )
    difficulty = Column(
        ENUM(
            "easy",
            "medium",
            "hard",
            "very_hard",
            name="difficulty_level",
            schema="public",
            create_type=False,
        ),
        nullable=False,
    )
    content = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    points = Column(DECIMAL(5, 2), nullable=True, default=Decimal("1.0"))
    time_limit = Column(Integer, nullable=True)
    keywords = Column(ARRAY(String), nullable=True)
    is_ai_generated = Column(Boolean, nullable=False, default=False)
    ai_model = Column(String(100), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    is_public = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
