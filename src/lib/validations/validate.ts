import { NextRequest } from "next/server";
import { z, ZodSchema } from "zod";
import { ValidationError } from "@/lib/errors/app-error";

export async function validateBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Invalid request body payload", error.errors);
    }
    throw new ValidationError("Invalid JSON in request body");
  }
}

export function validateQuery<T>(req: NextRequest, schema: ZodSchema<T>): T {
  try {
    const { searchParams } = new URL(req.url);
    const queryObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });
    return schema.parse(queryObj);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Invalid URL query parameters", error.errors);
    }
    throw error;
  }
}
