"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface QuestionContent {
  question: string;
  problem?: string;
  answers: {
    id: string;
    content: string;
  }[];
}

interface ContentDisplayProps {
  content: { [key: string]: QuestionContent };
}

export default function ContentDisplay({ content }: ContentDisplayProps) {
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({});

  if (!content || Object.keys(content).length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="mb-4 h-4 w-4" />
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription>Увы, ничего не нашлось!</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-4 space-y-8">
      {Object.entries(content)
        .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
        .map(([questionId, questionContent]) => (
          <Collapsible
            key={questionId}
            className="border rounded-lg p-6 shadow-xs"
            open={openStates[questionId]}
            onOpenChange={(open) =>
              setOpenStates((prev) => ({ ...prev, [questionId]: open }))
            }
          >
            <div className="contentBlock mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Вопрос {String(+questionId)}
              </h3>
              {questionContent.problem && (
                <div className="mb-4 p-4 bg-gray-40 rounded-lg w-fit">
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: questionContent.problem || "",
                    }}
                  />
                </div>
              )}
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: questionContent.question || "",
                }}
              />
            </div>

            <div className="pl-6 border-l-2">
              <div className="flex items-center space-x-2">
                <CollapsibleTrigger asChild>
                  <Button className="text-md" variant="outline" size="default">
                    Показать ответ
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-4 space-y-4">
                {questionContent.answers
                  .sort((a, b) => a.id.localeCompare(b.id))
                  .map((answer) => (
                    <div
                      key={answer.id}
                      className="p-4 bg-gray-50 dark:bg-gray-200 dark:text-black rounded"
                    >
                      <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: answer.content || "",
                        }}
                      />
                    </div>
                  ))}
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
    </div>
  );
}
