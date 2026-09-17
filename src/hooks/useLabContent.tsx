import { useEffect, useState } from "react";

interface LabIndexResponse {
  questionIds: string[];
}

export function useLabContent(selectedLab: string) {
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [loadedLab, setLoadedLab] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedLab) return;

    const controller = new AbortController();

    async function fetchIndex() {
      setQuestionIds([]);
      setLoadedLab("");
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/lab-content?lab=${selectedLab}&view=index`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Ошибка получения списка вопросов");
        }

        const data: LabIndexResponse = await response.json();
        setQuestionIds(data.questionIds);
        setLoadedLab(selectedLab);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Error fetching lab index:", error);
        setError("Ошибка загрузки материалов");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchIndex();

    return () => controller.abort();
  }, [selectedLab]);

  return {
    questionIds,
    loadedLab,
    hasLoadedIndex: loadedLab === selectedLab,
    isLoading,
    error,
  };
}
