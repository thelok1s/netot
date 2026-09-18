"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { feedbackReasons, type FeedbackReason } from "@/lib/feedback";

interface FeedbackDialogProps {
  lab: string;
  questionId: string;
  answerId?: string;
}

type FeedbackStatus = "success" | "error" | "rate-limited" | null;

export default function FeedbackDialog({
  lab,
  questionId,
  answerId,
}: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<FeedbackReason[]>([]);
  const [status, setStatus] = useState<FeedbackStatus>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successRef = useRef<HTMLParagraphElement>(null);
  const formId = useId();
  const targetLabel = answerId
    ? `ответ ${String(+answerId)}`
    : `вопрос ${String(+questionId)}`;

  useEffect(() => {
    if (status === "success") {
      successRef.current?.focus();
    }
  }, [status]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSelectedReasons([]);
      setStatus(null);
      setIsSubmitting(false);
    }
  }

  function toggleReason(reason: FeedbackReason) {
    setStatus(null);
    setSelectedReasons((previous) =>
      previous.includes(reason)
        ? previous.filter((item) => item !== reason)
        : [...previous, reason],
    );
  }

  async function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedReasons.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lab,
          questionId,
          answerId,
          reasons: selectedReasons,
          website: formData.get("website"),
        }),
      });

      if (response.ok) {
        setStatus("success");
        setSelectedReasons([]);
      } else if (response.status === 429) {
        setStatus("rate-limited");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="feedback-trigger"
        >
          <Flag aria-hidden="true" />
          Сообщить
        </Button>
      </DialogTrigger>
      <DialogContent className="feedback-dialog">
        <DialogHeader>
          <DialogTitle>Сообщить о проблеме</DialogTitle>
          <DialogDescription>
            Лабораторная работа {lab}, {targetLabel}. Сохраняются только
            выбранные категории.
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <p
            ref={successRef}
            className="feedback-status feedback-status-success"
            role="status"
            tabIndex={-1}
          >
            Спасибо. Сообщение учтено.
          </p>
        ) : (
          <form id={formId} className="feedback-form" onSubmit={submitFeedback}>
            <fieldset className="feedback-reasons" disabled={isSubmitting}>
              <legend>Что не так?</legend>
              {feedbackReasons.map((reason) => {
                const inputId = `${formId}-${reason.id}`;

                return (
                  <label
                    key={reason.id}
                    className="feedback-reason"
                    htmlFor={inputId}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={selectedReasons.includes(reason.id)}
                      onChange={() => toggleReason(reason.id)}
                    />
                    <span>{reason.label}</span>
                  </label>
                );
              })}
            </fieldset>
            <input
              className="feedback-honeypot"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            {status === "rate-limited" && (
              <p className="feedback-status feedback-status-error" role="alert">
                Лимит сообщений исчерпан. Попробуйте снова завтра.
              </p>
            )}
            {status === "error" && (
              <p className="feedback-status feedback-status-error" role="alert">
                Не удалось отправить сообщение. Попробуйте позже.
              </p>
            )}
          </form>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              {status === "success" ? "Закрыть" : "Отмена"}
            </Button>
          </DialogClose>
          {status !== "success" && (
            <Button
              type="submit"
              form={formId}
              disabled={selectedReasons.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Отправка…" : "Отправить"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
