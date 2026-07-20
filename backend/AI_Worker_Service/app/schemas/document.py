"""
Pydantic v2 schemas for document upload endpoint.
"""

import uuid
from typing import Optional

from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    request_id: uuid.UUID
    task_id: uuid.UUID
    document_id: uuid.UUID
    filename: str
    file_path: str
    file_size: int
    status: str


class BatchFileResult(BaseModel):
    document_id: uuid.UUID
    filename: str
    file_path: str
    file_size: int
    status: str
    text_length: Optional[int] = None


class DocumentBatchUploadResponse(BaseModel):
    batch_id: uuid.UUID
    batch_mode: str
    request_id: uuid.UUID
    task_id: uuid.UUID
    files: list[BatchFileResult]
    status: str
