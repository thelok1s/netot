export const feedbackReasons = [
  {
    id: "question-unreadable",
    label: "Вопрос/задача повреждена (не читаема)",
  },
  {
    id: "answer-unreadable",
    label: "Ответ повреждён (не читаем)",
  },
  {
    id: "answer-incorrect",
    label: "Ответ на вопрос/задачу полностью неверный",
  },
  {
    id: "answer-partially-incorrect",
    label: "Ответ на вопрос/задачу частично неверный",
  },
  {
    id: "answers-mismatch",
    label: "Ответы не соответствуют вопросу/задаче",
  },
] as const;

export type FeedbackReason = (typeof feedbackReasons)[number]["id"];

const feedbackReasonIds = new Set<string>(
  feedbackReasons.map((reason) => reason.id),
);

export function isFeedbackReason(value: string): value is FeedbackReason {
  return feedbackReasonIds.has(value);
}
