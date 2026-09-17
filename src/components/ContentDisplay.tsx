"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  Contrast,
  ListOrdered,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionContent {
  question: string;
  problem?: string;
  answers: {
    id: string;
    content: string;
  }[];
}

interface ContentDisplayProps {
  lab: string;
  questionIds: string[];
}

interface QuestionCardProps {
  lab: string;
  questionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type OrderMode = "ordered" | "reverse" | "random";
type ReadabilityMode = "auto" | "light" | "dark";

const readabilityModeLabels: Record<ReadabilityMode, string> = {
  auto: "Авто",
  light: "Светлый",
  dark: "Тёмный",
};

function getNextReadabilityMode(mode: ReadabilityMode): ReadabilityMode {
  if (mode === "auto") return "light";
  if (mode === "light") return "dark";
  return "auto";
}

function shuffleQuestionIds(ids: string[]) {
  const result = [...ids];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function QuestionCard({
  lab,
  questionId,
  open,
  onOpenChange,
}: QuestionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const requestInFlight = useRef(false);
  const [content, setContent] = useState<QuestionContent | null>(null);
  const [error, setError] = useState(false);
  const [readabilityMode, setReadabilityMode] =
    useState<ReadabilityMode>("auto");

  useEffect(() => {
    const controller = new AbortController();

    async function loadQuestion() {
      if (requestInFlight.current) return;

      requestInFlight.current = true;
      setError(false);

      try {
        const response = await fetch(
          `/api/lab-content?lab=${lab}&question=${questionId}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Ошибка получения вопроса");
        }

        const data: QuestionContent = await response.json();

        if (!controller.signal.aborted) {
          setContent(data);
        }
      } catch (error) {
        if (
          !controller.signal.aborted &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          console.error("Error fetching question content:", error);
          setError(true);
        }
      } finally {
        requestInFlight.current = false;
      }
    }

    const element = cardRef.current;

    if (!element || !("IntersectionObserver" in window)) {
      void loadQuestion();
      return () => controller.abort();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          void loadQuestion();
        }
      },
      { rootMargin: "900px 0px" },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [lab, questionId]);

  const nextReadabilityMode = getNextReadabilityMode(readabilityMode);

  return (
    <div ref={cardRef}>
      {error ? (
        <Alert variant="destructive" className="content-error-state">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>Не удалось загрузить вопрос.</AlertDescription>
        </Alert>
      ) : !content ? (
        <div className="study-card question-card-loading" aria-busy="true">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-5 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <Skeleton className="mt-6 h-9 w-40" />
        </div>
      ) : (
        <Collapsible
          className="study-card"
          open={open}
          onOpenChange={onOpenChange}
        >
          <div className="question-card-heading">
            <h3 className="study-card-title">Вопрос {String(+questionId)}</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="question-readability-toggle"
              onClick={() =>
                setReadabilityMode((mode) => getNextReadabilityMode(mode))
              }
              aria-label={`Контраст содержимого: ${readabilityModeLabels[readabilityMode]}. Переключить на ${readabilityModeLabels[nextReadabilityMode]}.`}
              title={`Контраст: ${readabilityModeLabels[readabilityMode]}. Переключить на ${readabilityModeLabels[nextReadabilityMode]}`}
            >
              <Contrast aria-hidden="true" />
              Контраст: {readabilityModeLabels[readabilityMode]}
            </Button>
          </div>

          <div
            className={`question-document question-document--${readabilityMode}`}
          >
            <div className="contentBlock mb-6">
              {content.problem && (
                <div className="problem-panel">
                  <div
                    className="document-content prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: content.problem }}
                  />
                </div>
              )}
              <div
                className="document-content prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content.question }}
              />
            </div>

            <div className="answer-section">
              <CollapsibleTrigger asChild>
                <Button
                  className="answer-toggle"
                  variant="outline"
                  size="default"
                >
                  {open ? "Скрыть ответ" : "Показать ответ"}
                  <ChevronDown
                    className={open ? "rotate-180" : ""}
                    aria-hidden="true"
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="answer-reveal mt-4 space-y-3">
                {[...content.answers]
                  .sort((first, second) => first.id.localeCompare(second.id))
                  .map((answer) => (
                    <div key={answer.id} className="answer-panel">
                      <div
                        className="answer-content document-content prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: answer.content }}
                      />
                    </div>
                  ))}
              </CollapsibleContent>
            </div>
          </div>
        </Collapsible>
      )}
    </div>
  );
}

export default function ContentDisplay({
  lab,
  questionIds,
}: ContentDisplayProps) {
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});
  const [order, setOrder] = useState<OrderMode>("ordered");
  const [randomOrder, setRandomOrder] = useState<string[]>([]);

  if (questionIds.length === 0) {
    return (
      <section className="content-empty-state" role="status">
        <AlertCircle aria-hidden="true" />
        <div>
          <h2>Материалы не найдены</h2>
          <p>Для выбранной лабораторной работы пока нет вопросов.</p>
        </div>
      </section>
    );
  }

  const orderedQuestionIds = [...questionIds].sort((first, second) =>
    first.localeCompare(second),
  );
  const displayedQuestionIds =
    order === "reverse"
      ? [...orderedQuestionIds].reverse()
      : order === "random"
        ? randomOrder
        : orderedQuestionIds;
  const allAnswersOpen = questionIds.every(
    (questionId) => openStates[questionId],
  );

  function setQuestionOrder(nextOrder: OrderMode) {
    setOrder(nextOrder);

    if (nextOrder === "random") {
      setRandomOrder(shuffleQuestionIds(questionIds));
    }
  }

  function toggleAllAnswers() {
    setOpenStates(
      Object.fromEntries(
        questionIds.map((questionId) => [questionId, !allAnswersOpen]),
      ),
    );
  }

  return (
    <>
      <section
        className="lab-content-controls"
        aria-label="Управление вопросами"
      >
        <div className="question-order">
          <span className="control-label">Порядок вопросов</span>
          <div
            className="control-group"
            role="group"
            aria-label="Порядок вопросов"
          >
            <Button
              type="button"
              variant={order === "ordered" ? "secondary" : "outline"}
              size="sm"
              className="control-button"
              onClick={() => setQuestionOrder("ordered")}
              aria-pressed={order === "ordered"}
            >
              <ListOrdered aria-hidden="true" />
              По порядку
            </Button>
            <Button
              type="button"
              variant={order === "reverse" ? "secondary" : "outline"}
              size="sm"
              className="control-button"
              onClick={() => setQuestionOrder("reverse")}
              aria-pressed={order === "reverse"}
            >
              <ListOrdered className="rotate-180" aria-hidden="true" />В
              обратном
            </Button>
            <Button
              type="button"
              variant={order === "random" ? "secondary" : "outline"}
              size="sm"
              className="control-button"
              onClick={() => setQuestionOrder("random")}
              aria-pressed={order === "random"}
            >
              <Shuffle aria-hidden="true" />
              Случайно
            </Button>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="control-button all-answers-toggle"
          onClick={toggleAllAnswers}
        >
          {allAnswersOpen ? (
            <ChevronsUp aria-hidden="true" />
          ) : (
            <ChevronsDown aria-hidden="true" />
          )}
          {allAnswersOpen ? "Свернуть все" : "Развернуть все"}
        </Button>
      </section>

      <div className="content-results mt-5 space-y-5">
        {displayedQuestionIds.map((questionId) => (
          <QuestionCard
            key={questionId}
            lab={lab}
            questionId={questionId}
            open={Boolean(openStates[questionId])}
            onOpenChange={(open) =>
              setOpenStates((previous) => ({
                ...previous,
                [questionId]: open,
              }))
            }
          />
        ))}
      </div>
    </>
  );
}
