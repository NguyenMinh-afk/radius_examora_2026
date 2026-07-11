"""
API sinh câu hỏi từ text và đọc trạng thái/kết quả task.

Nhóm route này phục vụ cả tạo task từ context text lẫn truy vấn tiến độ, retry
và lấy danh sách câu hỏi đã được worker lưu.
"""
import uuid
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.background_tasks import dispatch_generation_task
from app.api.v1.sanitizers import sanitize_upload_fields
from app.application.use_cases.create_generation_request import (
    CreateGenerationRequestUseCase,
)
from app.application.use_cases.get_task_results import GetTaskResultsUseCase
from app.application.use_cases.retry_generation_task import RetryGenerationTaskUseCase
from app.core.config import get_settings
from app.core.exceptions import NotFoundError
from app.domain.enums import InputType
from app.infrastructure.db.repositories import GenerationRequestRepository
from app.infrastructure.db.session import get_db
from app.schemas.generation import (
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    RequestStatusResponse,
    RetryTaskResponse,
)
from app.schemas.question import TaskResultsResponse

router = APIRouter(prefix="/ai", tags=["Generation"])


@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions(
    req: GenerateQuestionsRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Create a new task to generate questions from provided text context.
    """
    use_case = CreateGenerationRequestUseCase(db)

    # Sanitize — catches any dummy values not already caught by Pydantic validator
    clean = sanitize_upload_fields(
        topic=req.topic,
        course_id=req.course_id,
        course_name=req.course_name,
        subject_id=req.subject_id,
        subject_name=req.subject_name,
        chapter_id=req.chapter_id,
        knowledge_unit_id=req.knowledge_unit_id,
    )

    result = await use_case.execute(
        user_id=req.user_id,
        course_id=clean["course_id"],
        course_name=clean["course_name"],
        chapter_id=clean["chapter_id"],
        knowledge_unit_id=clean["knowledge_unit_id"],
        subject_id=clean["subject_id"],
        subject_name=clean["subject_name"],
        topic=clean["topic"],
        difficulty=req.difficulty,
        question_type=req.question_type,
        quantity=req.quantity,
        context=req.context,
        input_type=InputType.TEXT,
    )
    
    request_id = result["request_id"]
    task_id = result["task_id"]
    msg_payload = result["mq_message"]
    
    settings = get_settings()
    await dispatch_generation_task(
        use_rabbitmq=settings.use_rabbitmq,
        background_tasks=background_tasks,
        request_id=request_id,
        task_id=task_id,
        trace_id=msg_payload["trace_id"],
    )

    return GenerateQuestionsResponse(
        request_id=request_id,
        task_id=task_id,
        status=result["status"],
        message=result["message"],
    )


@router.get("/requests/{request_id}", response_model=RequestStatusResponse)
async def get_request_status(
    request_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Check the current status and progress of a generation request.
    """
    repo = GenerationRequestRepository(db)
    req = await repo.get_by_id(request_id)
    if not req:
        raise NotFoundError("GenerationRequest", str(request_id))

    return RequestStatusResponse(
        request_id=req.id,
        status=req.status,
        progress=req.progress,
        error_message=req.error_message,
    )


_TASK_RESULTS_EXAMPLES = {
    "completed": {
        "summary": "Completed task",
        "value": {
            "task_id": "11111111-1111-4111-8111-111111111111",
            "status": "completed",
            "warning": None,
            "error_message": None,
            "questions": [
                {
                    "id": "22222222-2222-4222-8222-222222222222",
                    "question_content": "Đại hội VI xác định đổi mới kinh tế theo hướng nào?",
                    "options": {
                        "A": "Phát triển nền kinh tế hàng hóa nhiều thành phần.",
                        "B": "Xóa bỏ ngay mọi thành phần kinh tế ngoài quốc doanh.",
                        "C": "Chỉ tập trung phát triển công nghiệp nặng.",
                        "D": "Tạm dừng cải cách cơ chế quản lý kinh tế.",
                    },
                    "correct_answer": "A",
                    "difficulty": "medium",
                    "topic": "Lịch sử Đảng",
                    "explanation": "Đáp án A phù hợp với nội dung đổi mới kinh tế được nêu.",
                    "status": "pending_review",
                    "generation_source": "gemini",
                }
            ],
        },
    },
    "failed": {
        "summary": "Failed scanned PDF task",
        "value": {
            "task_id": "33333333-3333-4333-8333-333333333333",
            "status": "failed",
            "warning": None,
            "error_message": "PDF scan/image-only, OCR is required but not enabled.",
            "questions": [],
        },
    },
}


@router.get(
    "/tasks/{task_id}/results",
    response_model=TaskResultsResponse,
    responses={
        200: {
            "description": "Generated questions, warning, and failed-task error message if any.",
            "content": {
                "application/json": {
                    "examples": _TASK_RESULTS_EXAMPLES,
                }
            },
        }
    },
)
async def get_task_results(
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get the generated questions for a specific task once completed.
    """
    use_case = GetTaskResultsUseCase(db)
    result = await use_case.execute(task_id)
    
    return TaskResultsResponse(
        task_id=result["task_id"],
        status=result["status"],
        warning=result.get("warning"),
        error_message=result.get("error_message"),
        questions=result["questions"],
    )


@router.post(
    "/tasks/{task_id}/retry",
    response_model=RetryTaskResponse,
    summary="Retry a failed or queued generation task",
    description=(
        "Retry is only allowed for tasks in 'failed' or "
        "'queued_until_tomorrow' status. Do not use it for pending, "
        "processing, completed, or completed_with_local_fallback tasks."
    ),
    responses={
        409: {
            "description": (
                "Task is not retryable because it is not failed or "
                "queued_until_tomorrow."
            )
        }
    },
)
async def retry_task(
    task_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Retry a task that is in `failed` or `queued_until_tomorrow` status.
    This will reset its status to `pending` and re-queue it for processing.
    """
    from fastapi import HTTPException, status
    
    use_case = RetryGenerationTaskUseCase(db)
    try:
        result = await use_case.execute(task_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    
    request_id = result["request_id"]
    trace_id = result["trace_id"]
    
    settings = get_settings()
    await dispatch_generation_task(
        use_rabbitmq=settings.use_rabbitmq,
        background_tasks=background_tasks,
        request_id=request_id,
        task_id=task_id,
        trace_id=trace_id,
    )

    return {
        "task_id": task_id,
        "request_id": request_id,
        "status": result["status"],
        "message": result["message"],
    }
