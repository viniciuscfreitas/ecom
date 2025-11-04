import { Prisma } from "@prisma/client";

export interface ProductUpdateData {
  name?: string;
  price?: number;
  stock?: number;
  description?: string | null;
  imageUrl?: string | null;
  category?: string | null;
}

export interface WebhookData {
  [key: string]: unknown;
}

export function isPrismaKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Error && "code" in error && typeof (error as Prisma.PrismaClientKnownRequestError).code === "string";
}

