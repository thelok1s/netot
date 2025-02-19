import { useState, useEffect } from "react";

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
        const response = await fetch(`/api/lab-content?lab=${selectedLab}`);
        if (!response.ok) {
          throw new Error("Ошибка получения контента");
        }
        const data = await response.json();
        setContent(data);
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
