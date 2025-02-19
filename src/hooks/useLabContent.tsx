import { useState, useEffect } from "react";

const LAB_ITEMS = Array.from({ length: 20 }, (_, i) => i + 1);

const EXAM_CONFIGS = {
  exam1: {
    title: "ОТС",
    labs: [1, 2, 3, 4, 6, 8, 11, 14],
  },
  exam2: {
    title: "Все лабы",
    labs: [1, 2, 3, 4, 6, 8, 11, 14, 26, 28],
  },
  exam3: {
    title: "Абсолютно всё",
    labs: LAB_ITEMS,
  },
} as const;

interface QuestionContent {
  question: string;
  problem?: string;
  answers: {
    id: string;
    content: string;
  }[];
}

export function useLabContent(selectedLab: string) {
  const [content, setContent] = useState<{ [key: string]: QuestionContent }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      if (!selectedLab) return;

      setIsLoading(true);
      setError(null);

      try {
        if (selectedLab.startsWith("exam")) {
          const examConfig =
            EXAM_CONFIGS[selectedLab as keyof typeof EXAM_CONFIGS];
          const allContent: { [key: string]: QuestionContent } = {};

          for (const labNumber of examConfig.labs) {
            const response = await fetch(`/api/lab-content?lab=${labNumber}`);
            if (!response.ok) {
              throw new Error(`Ошибка получения лабораторной ${labNumber}`);
            }
            const labContent = await response.json();

            Object.entries(labContent).forEach(
              ([questionNum, questionContent]) => {
                allContent[`${labNumber}-${questionNum}`] = questionContent;
              },
            );
          }

          setContent(allContent);
        } else {
          const response = await fetch(`/api/lab-content?lab=${selectedLab}`);
          if (!response.ok) {
            throw new Error("Ошибка получения контента");
          }
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error("Error fetching lab content:", error);
        setError("Ошибка загрузки контента");
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [selectedLab]);

  return { content, isLoading, error };
}
