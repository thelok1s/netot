import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { IoLogoGithub } from "react-icons/io5";
import logoLight from "../images/logo-light.svg";
import logoDark from "../images/logo-dark.svg";

interface QuestionContent {
  question: string;
  problem?: string;
  answers: {
    id: string;
    content: string;
  }[];
}

const items = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

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
    labs: items,
  },
};

interface DisclaimerModalProps {
  isDisclaimerAccepted: boolean;
  setIsDisclaimerAccepted: (value: boolean) => void;
}

export function DisclaimerModal({
  isDisclaimerAccepted,
  setIsDisclaimerAccepted,
}: DisclaimerModalProps) {
  const handleAccept = () => {
    localStorage.setItem("disclaimerAccepted", "true");
    setIsDisclaimerAccepted(true);
  };

  return (
    <AlertDialog open={!isDisclaimerAccepted} onOpenChange={() => {}}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Отказ от ответственности</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Все представленные материалы предназначены исключительно для
              образовательных целей. Содержимое сайта не имеет никакого
              отношения к СПбГУТ, его кафедре электроники (Э) или другим
              подразделениям, а также к виртуальной лаборатории Сальникова А. П.
              Да и вообще, все материалы (включая графические) являются
              выдумкой, сгенерированной с использованием ИИ. Любые совпадения с
              реальными материалами случайны.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAccept}>Ладно</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function Page() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const logo = theme === "dark" ? logoLight : logoDark;
  const [selectedLab, setSelectedLab] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<{ [key: string]: QuestionContent }>(
    {},
  );
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("disclaimerAccepted") === "true";
    }
    return false;
  });

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleLabSelect = async (value: string) => {
    setSelectedLab(value);
    setIsLoading(true);
    setError(null);

    try {
      if (value.startsWith("exam")) {
        const examConfig = EXAM_CONFIGS[value as keyof typeof EXAM_CONFIGS];
        const allContent: { [key: string]: QuestionContent } = {};

        for (const labNumber of examConfig.labs) {
          const response = await fetch(`/api/lab-content?lab=${labNumber}`);
          if (!response.ok) {
            throw new Error(
              `Ошибка получения лабораторной ${labNumber} с сервера`,
            );
          }
          const labContent: { [key: string]: QuestionContent } =
            await response.json();

          Object.entries(labContent).forEach(
            ([questionNum, questionContent]) => {
              const examQuestionId = `${labNumber}-${questionNum}`;
              allContent[examQuestionId] = questionContent;
            },
          );
        }

        setContent(allContent);
      } else {
        const response = await fetch(`/api/lab-content?lab=${value}`);
        if (!response.ok) {
          throw new Error("Ошибка получения контента");
        }
        const data: { [key: string]: QuestionContent } = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error(`Ошибка получения контента лабораторной ${error}`);
      setError("Ошибка загрузки контента");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DisclaimerModal
        isDisclaimerAccepted={isDisclaimerAccepted}
        setIsDisclaimerAccepted={setIsDisclaimerAccepted}
      />
      <div
        className={isDisclaimerAccepted ? "" : "pointer-events-none opacity-50"}
      >
        <header className="header p-3 h-14 w-dvw bg-gray-50 dark:bg-gray-900 shadow-md flex items-center justify-center transition-colors">
          <a
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-full"
          >
            <Image className="h-full" src={logo} alt="Logo" />
          </a>
        </header>
        <div className="content mt-4 mainPage p-1.5 mx-auto max-w-4xl min-h-[calc(100vh-8rem)]">
          <LabSelector onSelect={handleLabSelect} />
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="mb-4 h-4 w-4" />
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : selectedLab ? (
            <ContentDisplay content={content} />
          ) : null}
        </div>
        <footer className="footer h-fit p-3 w-dvw flex items-center justify-center text-gray-400">
          <p>
            Made by lok1s{"\u00A0"}
            <a
              className="h-fit w-fit inline-flex align-middle mb-1"
              href="https://github.com/thelok1s/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoGithub className="inline-block transition-colors hover:fill-black dark:hover:fill-white h-5 w-5" />
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}

function LabSelector({ onSelect }: { onSelect: (value: string) => void }) {
  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Выбрать лабораторную" />
      </SelectTrigger>
      <SelectContent>
        {items.map((value) => (
          <SelectItem key={value} value={value.toString()}>
            {`Лаба ${value}`}
          </SelectItem>
        ))}
        <SelectItem value="exam1">ОТС-1</SelectItem>
        <SelectItem value="exam2">Все лабы</SelectItem>
        <SelectItem value="exam3">Абсолютно всё</SelectItem>
      </SelectContent>
    </Select>
  );
}

function ContentDisplay({
  content,
}: {
  content: { [key: string]: QuestionContent };
}) {
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
            className="border rounded-lg p-6 shadow-sm"
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
