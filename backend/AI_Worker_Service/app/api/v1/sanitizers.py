"""
Input sanitizers for Upload/Generate API endpoints.

Purpose:
  Prevent Swagger default values ("string", 0, etc.) from polluting the
  course/subject database. These functions normalize form-field inputs before
  any business logic runs.

Rules:
  - sanitize_optional_int: None/0/negative → None; invalid negative → raise 422
  - sanitize_optional_text: None/""/whitespace/"string"/"null" → None
  - sanitize_topic: None/""/default Swagger values → raise ValidationError(422)
"""


from app.core.exceptions import ValidationError

# Text values that indicate the user left the Swagger default and did NOT
# actually provide a meaningful value.
_DUMMY_TEXT_VALUES = frozenset({"string", "null", "none", "undefined", "na", "n/a"})
_DUMMY_TOPIC_VALUES = _DUMMY_TEXT_VALUES | frozenset(
    {
        "topic",
        "default",
        "untitled",
        "unknown",
        "test",
        "subject",
        "môn học",
        "chủ đề",
        "chưa xác định",
    }
)
_UNKNOWN_TOPIC = "Chưa xác định"


def sanitize_optional_int(
    value: int | str | None, field_name: str = "field"
) -> int | None:
    """
    Convert placeholder integer values to None.

    Rules:
      - None  → None
      - 0     → None  (0 is not a valid DB row ID)
      - < 0   → raise 422 (negative IDs are invalid)
      - >= 1  → keep as-is

    Args:
        value: Raw integer or string from form/body input.
        field_name: Used in error messages.

    Returns:
        Sanitized int or None.

    Raises:
        ValidationError (HTTP 422) if value is negative.
    """
    if value is None:
        return None

    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return None
        if stripped.lower() in _DUMMY_TEXT_VALUES:
            return None
        try:
            value = int(stripped)
        except ValueError as exc:
            raise ValidationError(
                f"'{field_name}' must be a positive integer or empty. Got: {stripped}"
            ) from exc

    if value == 0:
        return None
    if value < 0:
        raise ValidationError(f"'{field_name}' cannot be negative. Got: {value}")
    return value


def sanitize_optional_text(
    value: str | None, field_name: str = "field"
) -> str | None:
    """
    Convert placeholder / empty text values to None.

    Rules:
      - None           → None
      - ""             → None  (empty)
      - whitespace-only → None
      - "string"       → None  (Swagger default)
      - "null"         → None
      - "none"         → None
      - "undefined"    → None
      - "na" / "n/a"  → None
      - Everything else → stripped value

    Args:
        value: Raw string from form/body input.
        field_name: Used in debug/logging if needed.

    Returns:
        Stripped string or None.
    """
    if value is None:
        return None
    stripped = value.strip()
    if not stripped:
        return None
    if stripped.lower() in _DUMMY_TEXT_VALUES:
        return None
    return stripped


def sanitize_topic(value: str | None) -> str:
    """
    Validate and sanitize the required `topic` field.

    Topic is mandatory — if it is empty or a Swagger placeholder, we raise
    a 422 so the caller gets an explicit error instead of silently using a
    bad default.

    Args:
        value: Raw topic string from form/body input.

    Returns:
        Stripped topic string.

    Raises:
        ValidationError (HTTP 422) if topic is missing or a dummy value.
    """
    if value is None:
        return _UNKNOWN_TOPIC
    stripped = value.strip()
    if not stripped:
        return _UNKNOWN_TOPIC
    if stripped.lower() in _DUMMY_TOPIC_VALUES:
        return _UNKNOWN_TOPIC
        raise ValidationError(
            f"topic value '{stripped}' looks like a Swagger placeholder. "
            "Please provide a real topic (e.g., 'Lịch Sử Đảng')."
        )
    return stripped


def sanitize_upload_fields(
    *,
    topic: str | None,
    course_id: int | str | None = None,
    course_name: str | None = None,
    subject_id: int | str | None = None,
    subject_name: str | None = None,
    chapter_id: int | str | None = None,
    knowledge_unit_id: int | str | None = None,
) -> dict:
    """
    Convenience wrapper: sanitize all common upload/generate fields at once.

    Returns a dict with cleaned values ready to pass to CreateGenerationRequestUseCase.

    Raises:
        ValidationError (422) for invalid topic or negative IDs.
    """
    return {
        "topic": sanitize_topic(topic),
        "course_id": sanitize_optional_int(course_id, "course_id"),
        "course_name": sanitize_optional_text(course_name, "course_name"),
        "subject_id": sanitize_optional_int(subject_id, "subject_id"),
        "subject_name": sanitize_optional_text(subject_name, "subject_name"),
        "chapter_id": sanitize_optional_int(chapter_id, "chapter_id"),
        "knowledge_unit_id": sanitize_optional_int(
            knowledge_unit_id, "knowledge_unit_id"
        ),
    }
