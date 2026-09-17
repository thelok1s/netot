import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CONTENT_CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

type QuestionContent = {
  question: string;
  problem?: string;
  answers: { id: string; content: string }[];
};

type LabContent = Record<string, QuestionContent>;

function processHtmlContent(
  content: string,
  labNumber: string,
  fileBaseName: string,
): string {
  content = content.replace(
    /(src=["'])(.*?)(["'])/g,
    (match, prefix, imgPath, suffix) => {
      if (imgPath.startsWith("http") || imgPath.startsWith("/")) return match;
      const cleanImgPath = imgPath.replace(`${fileBaseName}_files/`, "");
      const absolutePath = `/data/Q${labNumber}/${fileBaseName}_files/${cleanImgPath}`;
      return `${prefix}${absolutePath}${suffix}`;
    },
  );

  return content
    .replace(/<!--\[if gte mso.*?\[endif]-->/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
}

function isContentFile(file: string) {
  return file.endsWith(".html") || file.endsWith(".txt");
}

function getQuestionId(file: string) {
  if (file.startsWith("A")) {
    return file.match(/^A\d+(\d{2})\d{2}\.(?:html|txt)$/)?.[1];
  }

  return file.match(/^[QP]\d+(\d{2})\.(?:html|txt)$/)?.[1];
}

function getQuestionIds(files: string[]) {
  return [
    ...new Set(
      files
        .filter(isContentFile)
        .map(getQuestionId)
        .filter((questionId): questionId is string => Boolean(questionId)),
    ),
  ].sort((first, second) => first.localeCompare(second));
}

async function getLabContent(
  labPath: string,
  lab: string,
  files: string[],
  questionId?: string,
) {
  const contentFiles = files.filter(
    (file) =>
      isContentFile(file) &&
      (!questionId || getQuestionId(file) === questionId),
  );
  const fileContents = await Promise.all(
    contentFiles.map(async (file) => {
      const filePath = path.join(labPath, file);
      let content = await fs.readFile(filePath, "utf8");
      const fileBaseName = path.basename(file, path.extname(file));

      if (file.endsWith(".html")) {
        content = processHtmlContent(content, lab, fileBaseName);
      }

      return { file, content };
    }),
  );

  const contentMap: LabContent = {};

  for (const { file, content } of fileContents) {
    const currentQuestionId = getQuestionId(file);

    if (!currentQuestionId) continue;

    if (!contentMap[currentQuestionId]) {
      contentMap[currentQuestionId] = { question: "", answers: [] };
    }

    if (file.startsWith("Q")) {
      contentMap[currentQuestionId].question = content;
    } else if (file.startsWith("P")) {
      contentMap[currentQuestionId].problem = content;
    } else if (file.startsWith("A")) {
      const answerId = file.match(/^A\d+\d{2}(\d{2})\.(?:html|txt)$/)?.[1];

      if (answerId) {
        contentMap[currentQuestionId].answers.push({
          id: answerId,
          content: file.endsWith(".txt") ? `<pre>${content}</pre>` : content,
        });
      }
    }
  }

  return contentMap;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lab = searchParams.get("lab");
  const view = searchParams.get("view");
  const questionId = searchParams.get("question");

  if (!lab || !/^\d{1,2}$/.test(lab)) {
    return NextResponse.json(
      { error: "Lab parameter must be a number" },
      { status: 400 },
    );
  }

  if (view && view !== "index") {
    return NextResponse.json({ error: "Unsupported view" }, { status: 400 });
  }

  if (questionId && !/^\d{2}$/.test(questionId)) {
    return NextResponse.json(
      { error: "Question parameter must be a two-digit number" },
      { status: 400 },
    );
  }

  try {
    const labPath = path.join(process.cwd(), "public", "data", `Q${lab}`);
    const files = await fs.readdir(labPath);

    if (view === "index") {
      return NextResponse.json(
        { questionIds: getQuestionIds(files) },
        { headers: { "Cache-Control": CONTENT_CACHE_CONTROL } },
      );
    }

    const contentMap = await getLabContent(
      labPath,
      lab,
      files,
      questionId ?? undefined,
    );

    if (questionId) {
      const question = contentMap[questionId];

      if (!question) {
        return NextResponse.json(
          { error: "Question not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(question, {
        headers: { "Cache-Control": CONTENT_CACHE_CONTROL },
      });
    }

    return NextResponse.json(contentMap, {
      headers: { "Cache-Control": CONTENT_CACHE_CONTROL },
    });
  } catch (error) {
    console.error("Error reading lab content:", error);
    return NextResponse.json(
      { error: "Failed to load content" },
      { status: 500 },
    );
  }
}
