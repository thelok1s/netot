import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lab = searchParams.get("lab");

  if (!lab) {
    return NextResponse.json(
      { error: "Lab parameter is required" },
      { status: 400 },
    );
  }

  try {
    const labPath = path.join(process.cwd(), "public", "data", `Q${lab}`);
    const files = await fs.readdir(labPath);

    const contentMap: {
      [key: string]: {
        question: string;
        problem?: string;
        answers: { id: string; content: string }[];
      };
    } = {};

    for (const file of files) {
      if (file.endsWith(".html") || file.endsWith(".txt")) {
        const filePath = path.join(labPath, file);
        let content = await fs.readFile(filePath, "utf8");
        const fileBaseName = path.basename(file, path.extname(file));

        if (file.endsWith(".html")) {
          content = processHtmlContent(content, lab, fileBaseName);
        }

        if (file.startsWith("Q")) {
          const questionNum = file.match(/Q\d+(\d{2})/)?.[1];
          if (questionNum) {
            if (!contentMap[questionNum]) {
              contentMap[questionNum] = { question: "", answers: [] };
            }
            contentMap[questionNum].question = content;
          }
        } else if (file.startsWith("P")) {
          const problemNum = file.match(/P\d+(\d{2})/)?.[1];
          if (problemNum) {
            if (!contentMap[problemNum]) {
              contentMap[problemNum] = { question: "", answers: [] };
            }
            contentMap[problemNum].problem = content;
          }
        } else if (file.startsWith("A")) {
          const match = file.match(/A\d+(\d{2})(\d{2})/);
          if (match) {
            const [, questionNum, answerNum] = match;
            if (!contentMap[questionNum]) {
              contentMap[questionNum] = { question: "", answers: [] };
            }
            contentMap[questionNum].answers.push({
              id: answerNum,
              content: file.endsWith(".txt")
                ? `<pre>${content}</pre>`
                : content,
            });
          }
        }
      }
    }

    return NextResponse.json(contentMap);
  } catch (error) {
    console.error("Error reading lab content:", error);
    return NextResponse.json(
      { error: "Failed to load content" },
      { status: 500 },
    );
  }
}
