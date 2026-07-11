"""
API upload tài liệu đầu vào.

Route này chỉ nhận file, lưu vào thư mục data/raw, tạo document/task và đẩy việc
xử lý nặng sang worker để pipeline OCR/Gemini chạy nền.
"""
import json
import uuid
from typing import Any, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.background_tasks import dispatch_generation_task
from app.api.v1.sanitizers import sanitize_upload_fields
from app.application.use_cases.create_generation_request import (
    CreateGenerationRequestUseCase,
)
from app.core.config import get_settings
from app.core.exceptions import DocumentError, UnsupportedFileTypeError
from app.domain.enums import DifficultyLevel, InputType, QuestionType
from app.infrastructure.db.repositories import DocumentRepository
from app.infrastructure.db.session import get_db
from app.infrastructure.documents.storage import save_upload_file
from app.schemas.document import DocumentBatchUploadResponse, DocumentUploadResponse

router = APIRouter(prefix="/ai/documents", tags=["Documents"])

_OPTIONAL_FORM_DESCRIPTION = (
    "Optional. Leave blank for auto-resolve. Swagger placeholder values like "
    "'string' are ignored."
)
_UPLOAD_DESCRIPTION = (
    "API only stores the uploaded file and creates a generation task. "
    "Worker reads the file from the shared volume, extracts text, chunks it, "
    "calls Gemini, validates/deduplicates questions, and saves results."
)
_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
_SINGLE_FILE_DESCRIPTION = "Upload a PDF, DOCX, TXT, PNG, JPG, JPEG, or WEBP file"
_BATCH_FILE_DESCRIPTION = "Upload multiple PDF/DOCX/TXT/PNG/JPG/JPEG/WEBP files"


def _detect_input_type(filename: str) -> InputType:
    """Return InputType from filename extension or raise UnsupportedFileTypeError."""
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext == "pdf":
        return InputType.PDF
    if ext == "docx":
        return InputType.DOCX
    if ext == "txt":
        return InputType.TXT
    if ext in _IMAGE_EXTENSIONS:
        return InputType.IMAGE
    raise UnsupportedFileTypeError(filename)


async def _store_document(file: UploadFile, db: AsyncSession, course_id: int, uploaded_by: uuid.UUID) -> dict[str, Any]:
    """
    Validate extension, save the uploaded file under data/raw, and persist metadata.

    The original filename is never used as a storage path. It is stored only as
    metadata for display/debugging.
    """
    settings = get_settings()
    filename = file.filename or "unknown"
    input_type = _detect_input_type(filename)
    doc_id = uuid.uuid4()

    storage_path, file_size = await save_upload_file(
        file,
        destination_dir=settings.raw_upload_dir,
        max_size_bytes=settings.max_file_size_bytes,
        max_size_mb=settings.max_file_size_mb,
        document_id=doc_id,
    )

    document = await DocumentRepository(db).create(
        {
            "document_id": doc_id,
            "course_id": course_id,
            "uploaded_by": uploaded_by,
            "file_name": filename,
            "original_filename": filename,
            "storage_path": storage_path,
            "mime_type": file.content_type,
            "file_size": file_size,
            "status": "stored",
        }
    )

    return {
        "document_id": document.document_id,
        "filename": filename,
        "mime_type": file.content_type,
        "file_size": file_size,
        "storage_path": storage_path,
        "input_type": input_type,
        "status": document.status,
    }


def _document_reference(document_info: dict[str, Any]) -> dict[str, Any]:
    """Build JSON-serializable document metadata stored in task.input_reference."""
    return {
        "document_id": str(document_info["document_id"]),
        "storage_path": document_info["storage_path"],
        "original_filename": document_info["filename"],
        "mime_type": document_info.get("mime_type") or document_info.get("content_type"),
        "file_size": document_info["file_size"],
        "status": document_info["status"],
    }


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    summary="Upload a single document and create a generation task",
    description=_UPLOAD_DESCRIPTION,
)
async def upload_document(
    file: UploadFile = File(..., description=_SINGLE_FILE_DESCRIPTION),
    user_id: uuid.UUID = Form(..., description="User UUID"),
    topic: Optional[str] = Form(default=None, description="Topic / subject of the questions. Leave blank for worker-side auto-detect."),
    quantity: int = Form(..., description="Number of questions to generate (1 to MAX_QUESTIONS_PER_TASK; default cap 50)"),
    difficulty: DifficultyLevel = Form(DifficultyLevel.MEDIUM, description="easy|medium|hard|very_hard"),
    question_type: QuestionType = Form(QuestionType.MULTIPLE_CHOICE, description="Type of questions"),
    course_id: Optional[str] = Form(default=None, description=_OPTIONAL_FORM_DESCRIPTION, examples=[""]),
    course_name: Optional[str] = Form(default=None, description=_OPTIONAL_FORM_DESCRIPTION, examples=[""]),
    subject_id: Optional[str] = Form(default=None, description=_OPTIONAL_FORM_DESCRIPTION, examples=[""]),
    subject_name: Optional[str] = Form(default=None, description=_OPTIONAL_FORM_DESCRIPTION, examples=[""]),
    chapter_id: Optional[str] = Form(default=None, description=_OPTIONAL_FORM_DESCRIPTION, examples=[""]),
    knowledge_unit_id: Optional[str] = Form(default=None, description=_OPTIONAL_FORM_DESCRIPTION, examples=[""]),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks(),
) -> Any:
    """
    Store a single source document and create a pending generation task.

    Text extraction intentionally does not happen in the API layer anymore.
    Worker-side file loading/extraction happens after the task is dispatched.
    """
    settings = get_settings()
    
    # Sanitize course_id first to get actual value
    clean = sanitize_upload_fields(
        topic=topic,
        course_id=course_id,
        course_name=course_name,
        subject_id=subject_id,
        subject_name=subject_name,
        chapter_id=chapter_id,
        knowledge_unit_id=knowledge_unit_id,
    )
    
    # Use sanitized course_id or default to 1
    actual_course_id = clean["course_id"] if clean["course_id"] and clean["course_id"] > 0 else 1
    
    document_info = await _store_document(file, db, course_id=actual_course_id, uploaded_by=user_id)
    document_ref = _document_reference(document_info)

    result = await CreateGenerationRequestUseCase(db).execute(
        user_id=user_id,
        course_id=clean["course_id"],
        course_name=clean["course_name"],
        chapter_id=clean["chapter_id"],
        knowledge_unit_id=clean["knowledge_unit_id"],
        subject_id=clean["subject_id"],
        subject_name=clean["subject_name"],
        topic=clean["topic"],
        difficulty=difficulty,
        question_type=question_type,
        quantity=quantity,
        context=None,
        input_type=document_info["input_type"],
        input_reference=json.dumps(document_ref, ensure_ascii=False),
    )

    request_id = result["request_id"]
    task_id = result["task_id"]
    trace_id = result["mq_message"]["trace_id"]

    await dispatch_generation_task(
        use_rabbitmq=settings.use_rabbitmq,
        background_tasks=background_tasks,
        request_id=request_id,
        task_id=task_id,
        trace_id=trace_id,
        extra_payload={"document": document_ref},
    )

    return DocumentUploadResponse(
        request_id=request_id,
        task_id=task_id,
        document_id=document_info["document_id"],
        filename=document_info["filename"],
        file_path=document_info["storage_path"],
        file_size=document_info["file_size"],
        status=result["status"],
    )


@router.post(
    "/upload-batch",
    response_model=DocumentBatchUploadResponse,
    summary="Upload multiple documents and create one batch generation task",
    description=_UPLOAD_DESCRIPTION,
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "required": ["files", "user_id", "quantity"],
                        "properties": {
                            "files": {
                                "type": "array",
                                "items": {"type": "string", "format": "binary"},
                                "description": _BATCH_FILE_DESCRIPTION,
                            },
                            "user_id": {"type": "string", "format": "uuid"},
                            "topic": {
                                "type": "string",
                                "nullable": True,
                                "description": "Topic / subject. Leave blank for worker-side auto-detect.",
                            },
                            "quantity": {
                                "type": "integer",
                                "description": "Number of questions to generate (1 to MAX_QUESTIONS_PER_TASK; default cap 50)",
                            },
                            "difficulty": {"type": "string", "default": "medium"},
                            "question_type": {"type": "string", "default": "multiple_choice"},
                            "batch_mode": {"type": "string", "default": "merge"},
                            "course_id": {"type": "string", "nullable": True, "description": _OPTIONAL_FORM_DESCRIPTION, "example": ""},
                            "course_name": {"type": "string", "nullable": True, "description": _OPTIONAL_FORM_DESCRIPTION, "example": ""},
                            "subject_id": {"type": "string", "nullable": True, "description": _OPTIONAL_FORM_DESCRIPTION, "example": ""},
                            "subject_name": {"type": "string", "nullable": True, "description": _OPTIONAL_FORM_DESCRIPTION, "example": ""},
                            "chapter_id": {"type": "string", "nullable": True, "description": _OPTIONAL_FORM_DESCRIPTION, "example": ""},
                            "knowledge_unit_id": {"type": "string", "nullable": True, "description": _OPTIONAL_FORM_DESCRIPTION, "example": ""},
                        },
                    }
                }
            },
            "required": True,
        }
    },
)
async def upload_document_batch(
    files: List[UploadFile] = File(..., description=_BATCH_FILE_DESCRIPTION),
    user_id: uuid.UUID = Form(..., description="User UUID"),
    topic: Optional[str] = Form(default=None, description="Topic / subject of the questions. Leave blank for worker-side auto-detect."),
    quantity: int = Form(..., description="Number of questions to generate (1 to MAX_QUESTIONS_PER_TASK; default cap 50)"),
    difficulty: DifficultyLevel = Form(DifficultyLevel.MEDIUM, description="easy|medium|hard|very_hard"),
    question_type: QuestionType = Form(QuestionType.MULTIPLE_CHOICE, description="Type of questions"),
    batch_mode: str = Form("merge", description="Batch mode: only 'merge' is supported"),
    course_id: Optional[str] = Form(default=None, description=_OPTIONAL_FORM_DESCRIPTION, examples=[""]),
    course_name: Optional[str] = Form(default=None, description=_OPTIONAL_FORM_DESCRIPTION, examples=[""]),
    subject_id: Optional[str] = Form(default=None, description=_OPTIONAL_FORM_DESCRIPTION, examples=[""]),
    subject_name: Optional[str] = Form(default=None, description=_OPTIONAL_FORM_DESCRIPTION, examples=[""]),
    chapter_id: Optional[str] = Form(default=None, description=_OPTIONAL_FORM_DESCRIPTION, examples=[""]),
    knowledge_unit_id: Optional[str] = Form(default=None, description=_OPTIONAL_FORM_DESCRIPTION, examples=[""]),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks(),
) -> Any:
    """
    Store multiple source documents and create exactly one batch task.

    The worker loads each stored file, extracts text, and merges the content
    for chunked AI generation.
    """
    if batch_mode != "merge":
        raise DocumentError("Only batch_mode=merge is supported in this version.")
    if not files:
        raise DocumentError("At least one file is required.")

    settings = get_settings()
    
    # Sanitize fields first
    clean = sanitize_upload_fields(
        topic=topic,
        course_id=course_id,
        course_name=course_name,
        subject_id=subject_id,
        subject_name=subject_name,
        chapter_id=chapter_id,
        knowledge_unit_id=knowledge_unit_id,
    )
    
    # Use sanitized course_id or default to 1
    actual_course_id = clean["course_id"] if clean["course_id"] and clean["course_id"] > 0 else 1
    
    file_results = []
    document_refs: list[dict[str, Any]] = []

    for file in files:
        document_info = await _store_document(file, db, course_id=actual_course_id, uploaded_by=user_id)
        document_ref = _document_reference(document_info)
        document_refs.append(document_ref)
        file_results.append(
            {
                "document_id": document_info["document_id"],
                "filename": document_info["filename"],
                "file_path": document_info["storage_path"],
                "file_size": document_info["file_size"],
                "status": document_info["status"],
            }
        )

    batch_reference = {
        "batch_mode": batch_mode,
        "documents": document_refs,
    }

    result = await CreateGenerationRequestUseCase(db).execute(
        user_id=user_id,
        course_id=clean["course_id"],
        course_name=clean["course_name"],
        chapter_id=clean["chapter_id"],
        knowledge_unit_id=clean["knowledge_unit_id"],
        subject_id=clean["subject_id"],
        subject_name=clean["subject_name"],
        topic=clean["topic"],
        difficulty=difficulty,
        question_type=question_type,
        quantity=quantity,
        context=None,
        input_type=InputType.BATCH_MERGE,
        input_reference=json.dumps(batch_reference, ensure_ascii=False),
    )

    request_id = result["request_id"]
    task_id = result["task_id"]
    trace_id = result["mq_message"]["trace_id"]

    await dispatch_generation_task(
        use_rabbitmq=settings.use_rabbitmq,
        background_tasks=background_tasks,
        request_id=request_id,
        task_id=task_id,
        trace_id=trace_id,
        extra_payload=batch_reference,
    )

    return DocumentBatchUploadResponse(
        batch_id=uuid.uuid4(),
        batch_mode=batch_mode,
        request_id=request_id,
        task_id=task_id,
        files=file_results,
        status=result["status"],
    )
