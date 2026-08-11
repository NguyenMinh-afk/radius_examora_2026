"""
Quality Evaluation for Generated Questions

This module provides comprehensive quality assessment for AI-generated questions,
addressing Reviewer #2's concern: "How do you evaluate the quality of the generated question?"

Quality Metrics:
1. Structural Validity: Schema compliance (already validated by QuestionValidator)
2. Semantic Quality: Context relevance, clarity, difficulty appropriateness
3. Educational Value: Answer plausibility, explanation quality
4. Consistency: Difficulty level consistency across generated questions
"""

import re
import statistics
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class QualityMetrics:
    """Comprehensive quality metrics for a question."""
    question_id: str
    overall_score: float = 0.0

    # Structural metrics
    schema_valid: bool = True
    required_fields_present: bool = True

    # Semantic metrics
    context_relevance: float = 0.0  # 0-1: How relevant to source material
    question_clarity: float = 0.0    # 0-1: How clear and unambiguous
    ambiguity_score: float = 0.0     # 0-1: Lower is better (no ambiguity)

    # Educational metrics
    answer_plausibility: float = 0.0  # 0-1: Distractors are plausible but wrong
    explanation_quality: float = 0.0   # 0-1: Explanation explains WHY answer is correct
    difficulty_appropriate: float = 0.0  # 0-1: Difficulty matches intended level

    # Consistency metrics
    internal_consistency: float = 0.0  # 0-1: Options are internally consistent
    option_balance: float = 0.0        # 0-1: Options are roughly same length/detail

    # Detailed feedback
    strengths: list[str] = field(default_factory=list)
    weaknesses: list[str] = field(default_factory=list)
    suggestions: list[str] = field(default_factory=list)


class QuestionQualityEvaluator:
    """
    Evaluates the quality of AI-generated questions across multiple dimensions.

    This addresses Reviewer #2's question: "How do you evaluate the quality of
    the generated question?" by providing quantifiable metrics.
    """

    def __init__(self, source_context: str = ""):
        """
        Initialize evaluator with optional source context for relevance checking.

        Args:
            source_context: The original document/text from which questions were generated
        """
        self.source_context = source_context.lower() if source_context else ""
        self.source_keywords = self._extract_keywords(self.source_context)

    def _extract_keywords(self, text: str) -> set[str]:
        """Extract important keywords from source text."""
        if not text:
            return set()

        # Remove common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this',
            'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
        }

        # Extract words (alphanumeric, 3+ chars)
        words = re.findall(r'\b[a-z]{3,}\b', text.lower())
        return {w for w in words if w not in stop_words}

    def evaluate_question(self, question: dict[str, Any], expected_difficulty: str = "medium") -> QualityMetrics:
        """
        Evaluate a single question's quality.

        Args:
            question: The question dict with keys: question_content, options,
                     correct_answer, difficulty, topic, explanation
            expected_difficulty: The difficulty level that was requested

        Returns:
            QualityMetrics object with scores and feedback
        """
        qid = question.get("id", f"q_{hash(question.get('question_content', ''))}")
        metrics = QualityMetrics(question_id=str(qid))

        # 1. Schema validity (using existing validator rules)
        metrics.schema_valid = self._check_schema(question)
        if not metrics.schema_valid:
            metrics.overall_score = 0.0
            metrics.weaknesses.append("Schema validation failed")
            return metrics

        # 2. Question clarity
        metrics.question_clarity = self._evaluate_clarity(question)
        if metrics.question_clarity < 0.5:
            metrics.weaknesses.append("Question lacks clarity")
            metrics.suggestions.append("Rewrite with clearer phrasing")
        else:
            metrics.strengths.append("Question is clear and well-phrased")

        # 3. Ambiguity check
        metrics.ambiguity_score = self._evaluate_ambiguity(question)
        if metrics.ambiguity_score < 0.7:
            metrics.weaknesses.append("Question or options contain ambiguity")
            metrics.suggestions.append("Remove ambiguous terms or phrasing")

        # 4. Answer plausibility (distractors are plausible but wrong)
        metrics.answer_plausibility = self._evaluate_distractors(question)
        if metrics.answer_plausibility < 0.5:
            metrics.weaknesses.append("Distractors are too obviously wrong")
            metrics.suggestions.append("Make all options plausible but only one correct")
        else:
            metrics.strengths.append("Good distractor quality")

        # 5. Explanation quality
        metrics.explanation_quality = self._evaluate_explanation(question)
        if metrics.explanation_quality < 0.5:
            metrics.weaknesses.append("Explanation does not clearly justify the answer")
            metrics.suggestions.append("Provide clearer explanation linking to the correct answer")
        else:
            metrics.strengths.append("Explanation clearly justifies the answer")

        # 6. Difficulty appropriateness
        metrics.difficulty_appropriate = self._evaluate_difficulty(question, expected_difficulty)
        if metrics.difficulty_appropriate < 0.6:
            metrics.weaknesses.append("Question difficulty may not match intended level")

        # 7. Context relevance (if source context provided)
        if self.source_keywords:
            metrics.context_relevance = self._evaluate_context_relevance(question)
            if metrics.context_relevance < 0.5:
                metrics.weaknesses.append("Question may not be well-grounded in source material")
                metrics.suggestions.append("Ensure question content relates directly to source material")

        # 8. Internal consistency
        metrics.internal_consistency = self._evaluate_internal_consistency(question)
        if metrics.internal_consistency < 0.6:
            metrics.weaknesses.append("Options lack internal consistency")
            metrics.suggestions.append("Ensure all options follow same format and detail level")

        # 9. Option balance
        metrics.option_balance = self._evaluate_option_balance(question)
        if metrics.option_balance < 0.5:
            metrics.weaknesses.append("Options are uneven in length or detail")
            metrics.suggestions.append("Make options more parallel in structure")

        # Calculate overall score (weighted average)
        metrics.overall_score = self._calculate_overall_score(metrics)

        return metrics

    def _check_schema(self, question: dict) -> bool:
        """Check if question has all required schema fields."""
        required = {
            'question_content', 'options', 'correct_answer',
            'difficulty', 'topic', 'explanation'
        }
        if not all(k in question for k in required):
            return False
        if not isinstance(question.get('options'), dict):
            return False
        if set(question['options'].keys()) != {'A', 'B', 'C', 'D'}:
            return False
        if question.get('correct_answer') not in ['A', 'B', 'C', 'D']:
            return False
        return True

    def _evaluate_clarity(self, question: dict) -> float:
        """
        Evaluate question clarity.
        Checks: complete sentences, no typos, clear structure.
        """
        content = question.get('question_content', '')

        # Must have question mark or be a complete statement
        if '?' not in content and len(content) <= 10:
            return 0.3

        # Check for common clarity issues
        issues = 0
        total_checks = 4

        # Too short
        if len(content.split()) < 5:
            issues += 1

        # Too long (verbose)
        if len(content.split()) > 50:
            issues += 1

        # Contains common vague words
        vague_words = ['thing', 'stuff', 'something', 'whatever', 'etc']
        if any(w in content.lower() for w in vague_words):
            issues += 1

        # Missing context (starts with pronoun without antecedent)
        vague_starters = ['it', 'this', 'that', 'they']
        if any(content.lower().startswith(w + ' ') for w in vague_starters):
            issues += 1

        clarity = 1 - (issues / total_checks)
        return max(0.0, min(1.0, clarity))

    def _evaluate_ambiguity(self, question: dict) -> float:
        """
        Evaluate potential ambiguity.
        Lower score = more ambiguous (worse).
        """
        content = question.get('question_content', '').lower()
        options = list(question.get('options', {}).values())

        ambiguity_score = 1.0

        # Check for double negatives
        if re.search(r'\bnot\b.*\bnot\b', content, re.IGNORECASE):
            ambiguity_score -= 0.2
        if any('not' in opt.lower() for opt in options):
            ambiguity_score -= 0.15

        # Check for "all of the above" or "none of the above"
        for opt in options:
            if 'all of the above' in opt.lower() or 'none of the above' in opt.lower():
                ambiguity_score -= 0.3
                break

        # Check for overlapping options
        option_texts = ' '.join(options).lower()
        if re.search(r'\ball\b', option_texts):
            ambiguity_score -= 0.1

        return max(0.0, min(1.0, ambiguity_score))

    def _evaluate_distractors(self, question: dict) -> float:
        """
        Evaluate distractor quality.
        Good distractors are plausible but clearly wrong.
        """
        options = question.get('options', {})
        correct = question.get('correct_answer', '')

        if not options or correct not in options:
            return 0.0

        correct_answer = options[correct].lower()
        distractors = [options[k] for k in ['A', 'B', 'C', 'D'] if k != correct and k in options]

        if not distractors:
            return 0.5

        issues = 0

        for distractor in distractors:
            d_lower = distractor.lower()

            # Obviously wrong (completely different topic)
            if not any(word in d_lower for word in correct_answer.split()[:3]):
                # Allow if plausible but different
                pass

            # Too short or vague
            if len(d_lower) < 3:
                issues += 0.2

            # Exact copy with minor change
            if self._levenshtein_ratio(correct_answer, d_lower) > 0.9:
                issues += 0.3

            # Contradictory (contains negation of correct)
            if ('not' in d_lower) != ('not' in correct_answer):
                if d_lower.replace('not ', '') in correct_answer or \
                   correct_answer.replace('not ', '') in d_lower:
                    issues += 0.15

        plausibility = 1.0 - (issues / len(distractors))
        return max(0.0, min(1.0, plausibility))

    def _levenshtein_ratio(self, s1: str, s2: str) -> float:
        """Calculate similarity ratio between two strings."""
        if not s1 or not s2:
            return 0.0

        len1, len2 = len(s1), len(s2)
        if len1 > len2:
            s1, s2 = s2, s1
            len1, len2 = len2, len1

        # Simple approximation for speed
        matches = sum(1 for a, b in zip(s1, s2) if a == b)
        return matches / len1 if len1 > 0 else 0

    def _evaluate_explanation(self, question: dict) -> float:
        """
        Evaluate explanation quality.
        Good explanation explains WHY the answer is correct.
        """
        explanation = question.get('explanation', '')
        correct_answer = question.get('correct_answer', '')
        correct_option = question.get('options', {}).get(correct_answer, '')

        if len(explanation) < 10:
            return 0.0

        score = 0.5  # Base score for having an explanation

        # Check explanation length (should be substantive)
        if len(explanation.split()) >= 10:
            score += 0.1
        elif len(explanation.split()) >= 5:
            score += 0.05

        # Does it mention the correct answer?
        if correct_option.lower()[:20] in explanation.lower():
            score += 0.15

        # Does it explain the reasoning?
        reasoning_words = ['because', 'since', 'therefore', 'reason', 'explains',
                          'indicates', 'shows', 'means', 'is correct', 'is right']
        if any(word in explanation.lower() for word in reasoning_words):
            score += 0.15

        # Does it distinguish from distractors?
        distractor_words = ['however', 'unlike', 'whereas', 'although', 'but']
        if any(word in explanation.lower() for word in distractor_words):
            score += 0.1

        return max(0.0, min(1.0, score))

    def _evaluate_difficulty(self, question: dict, expected: str) -> float:
        """
        Evaluate if question difficulty matches expectations.
        """
        content = question.get('question_content', '').lower()

        # Simple heuristic: shorter questions tend to be easier
        word_count = len(content.split())

        if expected == 'easy':
            # Easy: shorter, simpler vocabulary
            if word_count < 20:
                return 0.8
            elif word_count < 35:
                return 0.6
            else:
                return 0.3
        elif expected == 'hard' or expected == 'very_hard':
            # Hard: longer, more complex
            if word_count >= 30:
                return 0.8
            elif word_count >= 20:
                return 0.6
            else:
                return 0.3
        else:  # medium
            if 15 <= word_count <= 40:
                return 0.8
            elif 10 <= word_count <= 50:
                return 0.6
            else:
                return 0.3

    def _evaluate_context_relevance(self, question: dict) -> float:
        """
        Evaluate how well question relates to source context.
        """
        if not self.source_keywords:
            return 0.5  # No context to compare against

        content = question.get('question_content', '').lower()
        explanation = question.get('explanation', '').lower()
        topic = question.get('topic', '').lower()

        # Extract keywords from question
        q_keywords = self._extract_keywords(content + ' ' + explanation + ' ' + topic)

        if not q_keywords:
            return 0.3

        # Calculate overlap
        overlap = len(q_keywords & self.source_keywords)
        total_q_keywords = len(q_keywords)

        relevance = overlap / total_q_keywords if total_q_keywords > 0 else 0

        # Bonus if topic is specific (not generic)
        if topic and len(topic.split()) <= 3:
            relevance += 0.1

        return max(0.0, min(1.0, relevance))

    def _evaluate_internal_consistency(self, question: dict) -> float:
        """
        Evaluate if all options follow the same format/structure.
        """
        options = question.get('options', {})
        option_texts = [options.get(k, '') for k in ['A', 'B', 'C', 'D']]

        if len(option_texts) < 4:
            return 0.0

        # Check if options start with similar patterns
        starts = []
        for opt in option_texts:
            if opt:
                words = opt.split()
                starts.append(words[0] if words else '')

        # All should start consistently (e.g., all with capital letters, or same prefix)
        unique_starts = len(set(starts))
        if unique_starts == 1:
            base_score = 1.0
        elif unique_starts <= 3:
            base_score = 0.7
        else:
            base_score = 0.4

        # Check length consistency
        lengths = [len(opt) for opt in option_texts if opt]
        if lengths:
            avg_len = sum(lengths) / len(lengths)
            variance = sum((length - avg_len) ** 2 for length in lengths) / len(lengths)
            std_dev = variance ** 0.5

            # If standard deviation is too high relative to average, penalize
            if avg_len > 0 and std_dev / avg_len > 0.5:
                base_score -= 0.2

        return max(0.0, min(1.0, base_score))

    def _evaluate_option_balance(self, question: dict) -> float:
        """
        Evaluate if options are balanced in length and detail.
        """
        options = question.get('options', {})
        option_texts = [options.get(k, '') for k in ['A', 'B', 'C', 'D']]

        if len(option_texts) < 4 or not all(option_texts):
            return 0.0

        lengths = [len(opt) for opt in option_texts]
        avg_len = sum(lengths) / len(lengths)

        # Calculate coefficient of variation (lower is better = more balanced)
        if avg_len > 0:
            variance = sum((length - avg_len) ** 2 for length in lengths) / len(lengths)
            cv = (variance ** 0.5) / avg_len

            # CV < 0.2 is good, > 0.5 is poor
            if cv < 0.2:
                return 0.9
            elif cv < 0.35:
                return 0.7
            elif cv < 0.5:
                return 0.5
            else:
                return 0.3

        return 0.5

    def _calculate_overall_score(self, metrics: QualityMetrics) -> float:
        """Calculate weighted overall quality score."""
        weights = {
            'question_clarity': 0.15,
            'ambiguity_score': 0.15,
            'answer_plausibility': 0.20,
            'explanation_quality': 0.20,
            'difficulty_appropriate': 0.10,
            'internal_consistency': 0.10,
            'option_balance': 0.10,
        }

        # Context relevance bonus if available
        if metrics.context_relevance > 0:
            weights['context_relevance'] = 0.10
            # Reduce other weights proportionally
            for k in weights:
                if k != 'context_relevance':
                    weights[k] *= 0.9

        total = sum(
            getattr(metrics, attr) * weight
            for attr, weight in weights.items()
            if hasattr(metrics, attr)
        )

        return round(total, 3)

    def evaluate_batch(self, questions: list[dict], expected_difficulty: str = "medium") -> dict[str, Any]:
        """
        Evaluate a batch of questions and return aggregate statistics.

        Returns:
            Dict with per-question metrics and aggregate statistics
        """
        individual_metrics = []
        for q in questions:
            metrics = self.evaluate_question(q, expected_difficulty)
            individual_metrics.append({
                'question_id': metrics.question_id,
                'question_preview': q.get('question_content', '')[:100],
                'overall_score': metrics.overall_score,
                'schema_valid': metrics.schema_valid,
                'question_clarity': metrics.question_clarity,
                'answer_plausibility': metrics.answer_plausibility,
                'explanation_quality': metrics.explanation_quality,
                'difficulty_appropriate': metrics.difficulty_appropriate,
                'strengths': metrics.strengths,
                'weaknesses': metrics.weaknesses,
                'suggestions': metrics.suggestions,
            })

        # Calculate aggregate statistics
        overall_scores = [m['overall_score'] for m in individual_metrics]
        valid_scores = [s for s in overall_scores if s > 0]

        aggregate = {
            'total_questions': len(questions),
            'schema_valid_count': sum(1 for m in individual_metrics if m['schema_valid']),
            'average_overall_score': round(statistics.mean(valid_scores), 3) if valid_scores else 0,
            'median_overall_score': round(statistics.median(valid_scores), 3) if valid_scores else 0,
            'min_overall_score': round(min(valid_scores), 3) if valid_scores else 0,
            'max_overall_score': round(max(valid_scores), 3) if valid_scores else 0,
            'std_overall_score': round(statistics.stdev(valid_scores), 3) if len(valid_scores) > 1 else 0,
            'quality_distribution': self._score_distribution(overall_scores),
        }

        return {
            'timestamp': datetime.now().isoformat(),
            'expected_difficulty': expected_difficulty,
            'aggregate': aggregate,
            'individual': individual_metrics,
        }

    def _score_distribution(self, scores: list[float]) -> dict[str, int]:
        """Categorize scores into quality tiers."""
        distribution = {
            'excellent': 0,  # >= 0.8
            'good': 0,       # 0.6 - 0.8
            'acceptable': 0,  # 0.4 - 0.6
            'poor': 0,       # < 0.4
        }

        for s in scores:
            if s >= 0.8:
                distribution['excellent'] += 1
            elif s >= 0.6:
                distribution['good'] += 1
            elif s >= 0.4:
                distribution['acceptable'] += 1
            else:
                distribution['poor'] += 1

        return distribution


# ==================== CLI Interface ====================

def run_quality_evaluation(questions: list[dict], source_context: str = "",
                          expected_difficulty: str = "medium") -> dict[str, Any]:
    """
    Run quality evaluation on generated questions.

    This can be called from benchmark scripts to automatically assess
    question quality alongside performance metrics.
    """
    evaluator = QuestionQualityEvaluator(source_context)
    results = evaluator.evaluate_batch(questions, expected_difficulty)

    logger.info(
        "Quality evaluation complete | questions=%d | avg_score=%.3f | distribution=%s",
        results['aggregate']['total_questions'],
        results['aggregate']['average_overall_score'],
        results['aggregate']['quality_distribution'],
    )

    return results


if __name__ == "__main__":
    # Demo/test with sample questions
    sample_questions = [
        {
            "id": "q1",
            "question_content": "What is the primary purpose of a database index?",
            "options": {
                "A": "To speed up data retrieval operations",
                "B": "To store data more compactly",
                "C": "To validate data integrity",
                "D": "To encrypt sensitive information"
            },
            "correct_answer": "A",
            "difficulty": "easy",
            "topic": "Database Indexes",
            "explanation": "Database indexes primarily speed up data retrieval by providing quick access paths to rows, similar to a book index."
        },
        {
            "id": "q2",
            "question_content": "Which of the following statements about SQL JOIN operations is correct?",
            "options": {
                "A": "INNER JOIN returns only matching rows from both tables",
                "B": "LEFT JOIN returns only rows from the right table",
                "C": "CROSS JOIN combines rows from multiple tables without any condition",
                "D": "FULL OUTER JOIN returns only non-matching rows"
            },
            "correct_answer": "A",
            "difficulty": "medium",
            "topic": "SQL JOIN Operations",
            "explanation": "INNER JOIN returns only rows where there is a match in both participating tables based on the join condition."
        },
    ]

    results = run_quality_evaluation(
        sample_questions,
        source_context="Database systems, SQL, indexes, query optimization",
        expected_difficulty="medium"
    )

    print("\n" + "=" * 60)
    print("QUALITY EVALUATION RESULTS")
    print("=" * 60)
    print(f"\nTotal Questions: {results['aggregate']['total_questions']}")
    print(f"Average Score: {results['aggregate']['average_overall_score']:.3f}")
    print(f"Score Range: {results['aggregate']['min_overall_score']:.3f} - {results['aggregate']['max_overall_score']:.3f}")
    print("\nQuality Distribution:")
    for tier, count in results['aggregate']['quality_distribution'].items():
        print(f"  {tier}: {count}")
    print("\nPer-Question Details:")
    for m in results['individual']:
        print(f"\n  {m['question_id']}: Score={m['overall_score']:.3f}")
        print(f"    Strengths: {', '.join(m['strengths']) if m['strengths'] else 'None'}")
        print(f"    Weaknesses: {', '.join(m['weaknesses']) if m['weaknesses'] else 'None'}")
