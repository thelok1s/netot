import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { isFeedbackReason, type FeedbackReason } from "@/lib/feedback";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_SECONDS = 60 * 60 * 24;
const RATE_LIMIT_MAX_REQUESTS = 10;

const redisUrl =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis =
  redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

type FeedbackRequest = {
  lab?: unknown;
  questionId?: unknown;
  answerId?: unknown;
  reasons?: unknown;
  website?: unknown;
};

function noStoreJson(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return (
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function getRateLimitKey(request: Request) {
  const fingerprint = createHash("sha256")
    .update(`${redisToken}:${getClientIp(request)}`)
    .digest("hex");

  return `feedback:rate-limit:${fingerprint}`;
}

function hasAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) return true;

  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

function isValidLab(value: unknown): value is string {
  return typeof value === "string" && /^\d{1,2}$/.test(value);
}

function isValidQuestionId(value: unknown): value is string {
  return typeof value === "string" && /^\d{2}$/.test(value);
}

function isValidAnswerId(value: unknown): value is string | undefined {
  return (
    value === undefined || (typeof value === "string" && /^\d{2}$/.test(value))
  );
}

function getReasons(value: unknown): FeedbackReason[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 5) {
    return null;
  }

  if (!value.every((reason): reason is string => typeof reason === "string")) {
    return null;
  }

  const uniqueReasons = [...new Set(value)];

  if (
    uniqueReasons.length !== value.length ||
    !uniqueReasons.every(isFeedbackReason)
  ) {
    return null;
  }

  return uniqueReasons;
}

export async function POST(request: Request) {
  if (!redis) {
    console.error("Feedback storage is not configured");
    return noStoreJson({ error: "Feedback is temporarily unavailable" }, 503);
  }

  if (!hasAllowedOrigin(request)) {
    return noStoreJson({ error: "Invalid request origin" }, 403);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return noStoreJson({ error: "Expected JSON request body" }, 415);
  }

  let payload: FeedbackRequest;

  try {
    payload = (await request.json()) as FeedbackRequest;
  } catch {
    return noStoreJson({ error: "Invalid JSON request body" }, 400);
  }

  const reasons = getReasons(payload.reasons);

  if (
    !isValidLab(payload.lab) ||
    !isValidQuestionId(payload.questionId) ||
    !isValidAnswerId(payload.answerId) ||
    !reasons ||
    (payload.website !== undefined &&
      (typeof payload.website !== "string" || payload.website.length > 0))
  ) {
    return noStoreJson({ error: "Invalid feedback payload" }, 400);
  }

  try {
    const rateLimitKey = getRateLimitKey(request);
    // NX keeps a crash between INCR and EXPIRE from stranding a key without a
    // TTL, which would otherwise lock the caller out permanently.
    const [requestCount] = await redis
      .pipeline()
      .incr(rateLimitKey)
      .expire(rateLimitKey, RATE_LIMIT_WINDOW_SECONDS, "NX")
      .exec<[number, number]>();

    if (requestCount > RATE_LIMIT_MAX_REQUESTS) {
      return noStoreJson({ error: "Rate limit exceeded" }, 429);
    }

    const target = payload.answerId ? `answer-${payload.answerId}` : "question";
    const prefix = `feedback:lab-${payload.lab}:question-${payload.questionId}:${target}`;
    const counters = redis.pipeline().incr(`${prefix}:total`);

    for (const reason of reasons) {
      counters.incr(`${prefix}:reason:${reason}`);
    }

    await counters.exec();

    return noStoreJson({ ok: true });
  } catch (error) {
    console.error("Unable to store feedback", error);
    return noStoreJson({ error: "Unable to store feedback" }, 500);
  }
}
