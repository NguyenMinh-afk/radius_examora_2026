"""
Dựng prompt gửi sang Gemini.

File này gom context, topic, số lượng câu hỏi và các ràng buộc chất lượng để
Gemini trả về đúng cấu trúc trắc nghiệm mà pipeline đang cần.
"""

from app.core.logging import get_logger

logger = get_logger(__name__)

_OUTPUT_SCHEMA = """\
JSON Schema bắt buộc:
{
  "questions": [
    {
      "question_content": "Nội dung câu hỏi...",
      "options": {
        "A": "Phương án A...",
        "B": "Phương án B...",
        "C": "Phương án C...",
        "D": "Phương án D..."
      },
      "correct_answer": "A",
      "difficulty": "medium",
      "topic": "{topic}",
      "explanation": "Giải thích ngắn gọn, chỉ ra căn cứ trong tài liệu..."
    }
  ]
}
"""

_QUALITY_RULES = """\
Quy tắc chất lượng bắt buộc:
1. Chỉ sử dụng thông tin xuất hiện rõ trong CONTEXT. Không suy diễn, không dùng kiến thức ngoài tài liệu.
2. Không trộn sự kiện, mốc thời gian, đại hội, chiến dịch, hiệp định hoặc giai đoạn lịch sử khác nhau.
3. Không tự gán các mốc như "Đại hội VII", "Đại hội IX", "15 năm đổi mới", "kế hoạch Nava", "Hiệp định Sơ bộ 6/3/1946" nếu CONTEXT không nêu rõ.
4. Mỗi câu hỏi phải có duy nhất 1 đáp án đúng rõ ràng.
5. Ba đáp án nhiễu phải sai rõ ràng theo CONTEXT; không được đúng một phần, gần đúng, đúng ở giai đoạn khác, hoặc đúng tùy cách hiểu.
6. Không tạo câu hỏi nếu nhiều phương án đều có thể đúng một phần.
7. Hạn chế tối đa câu hỏi phủ định. Tránh các dạng "KHÔNG phải", "Ngoại trừ", "Đâu không đúng", "không thuộc".
8. Nếu bắt buộc dùng câu phủ định, toàn bộ lô chỉ nên có tối đa 1 câu và phải có đúng 1 phương án sai rõ ràng; explanation phải nói rõ vì sao phương án đó sai.
9. Tránh câu hỏi quá rộng như "Ý nghĩa lịch sử của ... là gì?" khi nhiều đáp án có thể đúng. Hãy hỏi cụ thể về tác động trực tiếp, nội dung văn kiện, chủ trương, quyết định, mốc thời gian, hoặc hệ quả được nêu trong tài liệu.
10. Câu hỏi phải bám vào một chi tiết hoặc một quan hệ cụ thể trong tài liệu. Ví dụ tốt: "Ý nghĩa trực tiếp của chiến thắng Điện Biên Phủ đối với kế hoạch Nava là gì?", "Hiệp định Sơ bộ 6/3/1946 quy định Việt Nam có vị thế pháp lý như thế nào?", "Đại hội VI xác định đổi mới kinh tế theo hướng nào?".
11. Explanation phải chứng minh được đáp án đúng bằng căn cứ trong CONTEXT, không chỉ lặp lại đáp án.
12. Mảng questions phải có đúng {quantity} câu nếu CONTEXT đủ nội dung chắc chắn; không bao giờ trả nhiều hơn {quantity} câu.
13. Nếu CONTEXT không đủ chắc để tạo đủ {quantity} câu, hãy trả ít câu hơn. Ưu tiên chất lượng hơn số lượng; tuyệt đối không bịa câu hỏi để đủ số lượng.
14. Không thêm field ngoài schema JSON hiện tại, kể cả warning. Nếu trả ít hơn {quantity}, chỉ cần trả mảng questions ngắn hơn.
15. difficulty của mỗi câu phải thuộc: easy, medium, hard, very_hard.
16. Chỉ trả về JSON hợp lệ theo schema bên dưới. Không thêm markdown, lời giải thích ngoài JSON, hoặc text bao quanh.

Self-check nội bộ trước khi trả JSON (không đưa checklist này vào output):
- Câu hỏi có đúng 1 đáp án đúng không?
- Từng đáp án nhiễu có sai rõ theo CONTEXT không?
- Có mốc thời gian/sự kiện/đại hội/chiến dịch/hiệp định nào bị trộn sai không?
- Câu hỏi có quá rộng hoặc mơ hồ không?
- Explanation có nêu được căn cứ trong tài liệu không?
- Nếu câu nào không đạt, loại bỏ và tạo câu khác; nếu vẫn không đủ câu chắc chắn, trả ít hơn {quantity}.
"""

_QUESTION_CONTENT_STYLE_RULES = """\

Quy tắc riêng cho question_content:
- Không mở đầu câu hỏi bằng "Theo nội dung được cung cấp", "Theo tài liệu", "Dựa trên đoạn văn",
  "Dựa vào tài liệu", "Trong bài học này", "Qua tài liệu" hoặc bất kỳ cụm tham chiếu tài liệu nào.
- Câu hỏi phải đi thẳng vào nội dung cần hỏi, không cần nhắc nguồn.
- Không tạo câu hỏi quá chung chung, mơ hồ như:
  + "Ý nào sau đây đúng theo tài liệu?"
  + "Nội dung nào được đề cập trong bài?"
  + "Điều nào sau đây là đúng?"
  + "Phát biểu nào sau đây phù hợp?"
- Câu hỏi phải hỏi về một chi tiết cụ thể: khái niệm, mốc thời gian, sự kiện, chủ trương,
  quyết định, ý nghĩa trực tiếp, hoặc mối quan hệ nhân quả được nêu trong CONTEXT.
- Ví dụ câu hỏi TỐT:
  + "Đại hội VI (1986) xác định đổi mới kinh tế theo hướng nào?"
  + "Chiến thắng Điện Biên Phủ có ý nghĩa trực tiếp gì đối với kế hoạch Nava?"
  + "Hiệp định Sơ bộ 6/3/1946 công nhận Việt Nam có vị thế pháp lý gì?"
- Ví dụ câu hỏi XẤU (tránh):
  + "Theo tài liệu, điều gì đã xảy ra vào năm 1986?"
  + "Nội dung nào đề cập đến chiến tranh?"
"""

_QUESTION_GENERATION_TEMPLATE = """\
Bạn là chuyên gia biên soạn câu hỏi trắc nghiệm giáo dục.

Nhiệm vụ:
Tạo đúng {quantity} câu hỏi trắc nghiệm từ nội dung học tập được cung cấp nếu CONTEXT đủ nội dung chắc chắn.
quantity={quantity} nghĩa là sinh toàn bộ số câu đó trong MỘT lần trả JSON, không chia thành nhiều lượt.

Metadata:
- course_id: {course_id}
- chapter_id: {chapter_id}
- knowledge_unit_id: {knowledge_unit_id}
- Chủ đề/môn học: {topic}
- difficulty yêu cầu: {difficulty}
- question_type: {question_type}

{quality_rules}

{output_schema}

CONTEXT:
{context}
"""

_QUESTION_GENERATION_BATCH_MERGE_TEMPLATE = """\
Bạn là chuyên gia biên soạn câu hỏi trắc nghiệm giáo dục.

Nhiệm vụ:
Tạo đúng {quantity} câu hỏi trắc nghiệm từ nội dung học tập được tổng hợp từ NHIỀU FILE nếu CONTEXT đủ nội dung chắc chắn.
quantity={quantity} nghĩa là sinh toàn bộ số câu đó trong MỘT lần trả JSON, không chia thành nhiều lượt.

Metadata:
- course_id: {course_id}
- chapter_id: {chapter_id}
- knowledge_unit_id: {knowledge_unit_id}
- Chủ đề/môn học: {topic}
- difficulty yêu cầu: {difficulty}
- question_type: {question_type}

Quy tắc riêng cho batch merge:
1. CONTEXT là kết quả gộp nhiều file, mỗi file có marker dạng "===== FILE N: filename =====".
2. Khi có đủ nội dung, hãy phân bổ câu hỏi tương đối đều theo các file; không chỉ tập trung vào file đầu tiên.
3. Không trộn chi tiết giữa hai file nếu CONTEXT không thể hiện rõ chúng thuộc cùng một sự kiện/giai đoạn.

{quality_rules}

{output_schema}

CONTEXT:
{context}
"""

_REGENERATE_TEMPLATE = """\
Bạn là chuyên gia biên soạn câu hỏi trắc nghiệm giáo dục.

Nhiệm vụ:
Tạo LẠI 1 câu hỏi trắc nghiệm mới để thay thế câu hỏi hiện tại có vấn đề.

Lý do cần tạo lại:
{reason}

Câu hỏi cũ để tham khảo, KHÔNG sao chép:
{old_question}

Metadata:
- topic: {topic}
- difficulty: {difficulty}

Quy tắc bắt buộc:
1. Câu hỏi mới phải khác hoàn toàn câu hỏi cũ.
2. Chỉ dùng thông tin trong CONTEXT, không suy diễn ngoài tài liệu.
3. Có đúng 4 phương án A, B, C, D.
4. Có duy nhất 1 đáp án đúng rõ ràng.
5. Ba đáp án nhiễu phải sai rõ ràng, không đúng một phần và không đúng ở giai đoạn khác.
6. Hạn chế câu hỏi phủ định như "KHÔNG phải", "Ngoại trừ", "Đâu không đúng"; nếu dùng thì chỉ có đúng 1 phương án sai rõ ràng.
7. Tránh câu hỏi quá rộng hoặc mơ hồ.
8. Explanation phải nêu căn cứ trong CONTEXT.
9. Trả về JSON theo schema dưới đây, không thêm markdown hoặc text khác.

Self-check nội bộ trước khi trả JSON:
- Có đúng 1 đáp án đúng không?
- Đáp án nhiễu có sai rõ không?
- Mốc thời gian/sự kiện có khớp CONTEXT không?
- Explanation có chứng minh được đáp án đúng không?

JSON Schema:
{
  "questions": [
    {
      "question_content": "...",
      "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
      "correct_answer": "A|B|C|D",
      "difficulty": "{difficulty}",
      "topic": "{topic}",
      "explanation": "..."
    }
  ]
}

CONTEXT:
{context}
"""


class PromptBuilder:
    """Builds prompts for Gemini API calls."""

    def build_generation_prompt(
        self,
        context: str,
        topic: str,
        quantity: int,
        difficulty: str,
        question_type: str,
        course_id: int,
        chapter_id: int | None,
        knowledge_unit_id: int | None,
        batch_merge: bool = False,
    ) -> str:
        """
        Build the main question generation prompt.

        Args:
            context: Preprocessed text content.
            topic: Subject topic.
            quantity: Maximum number of questions to generate.
            difficulty: easy|medium|hard|very_hard.
            question_type: multiple_choice|true_false|etc.
            course_id: Course identifier.
            chapter_id: Optional chapter identifier.
            knowledge_unit_id: Optional knowledge unit identifier.
            batch_merge: Whether the context was merged from multiple files.

        Returns:
            Complete prompt string ready for Gemini.
        """
        template = (
            _QUESTION_GENERATION_BATCH_MERGE_TEMPLATE
            if batch_merge
            else _QUESTION_GENERATION_TEMPLATE
        )
        prompt = template.format(
            quantity=quantity,
            course_id=course_id,
            chapter_id=chapter_id or "N/A",
            knowledge_unit_id=knowledge_unit_id or "N/A",
            topic=topic,
            difficulty=difficulty,
            question_type=question_type,
            quality_rules=(
                _QUALITY_RULES.format(quantity=quantity) + _QUESTION_CONTENT_STYLE_RULES
            ),
            output_schema=_OUTPUT_SCHEMA.replace("{topic}", topic),
            context=context.strip(),
        )
        logger.debug(
            "Built generation prompt: %d chars | topic=%s | qty=%d | diff=%s",
            len(prompt),
            topic,
            quantity,
            difficulty,
        )
        return prompt

    def build_regenerate_prompt(
        self,
        context: str,
        topic: str,
        difficulty: str,
        old_question_content: str,
        reason: str,
    ) -> str:
        """
        Build a prompt to regenerate a single replacement question.

        Args:
            context: Original context text.
            topic: Subject topic.
            difficulty: Difficulty level.
            old_question_content: The problematic question to replace.
            reason: Why the question needs to be regenerated.

        Returns:
            Regeneration prompt string.
        """
        prompt = (
            _REGENERATE_TEMPLATE.replace("{reason}", reason)
            .replace("{old_question}", old_question_content)
            .replace("{topic}", topic)
            .replace("{difficulty}", difficulty)
            .replace("{context}", context.strip()[:4000])
        )
        logger.debug(
            "Built regeneration prompt: %d chars | topic=%s", len(prompt), topic
        )
        return prompt
