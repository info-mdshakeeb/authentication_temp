import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),


  },

  /**
   * Client-side env vars
   * Must be prefixed with NEXT_PUBLIC_
   */
  client: {
    // NEXT_PUBLIC_SERVER_FILE_UPLOAD_URL: z.string().url(),
    // NEXT_PUBLIC_CLIENT_URL: z.string(),
    // NEXT_PUBLIC_SERVER_URL: z.string(),
  },

  /**
   * Map actual process.env vars
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    NODE_ENV: process.env.NODE_ENV,




    // Client
    // NEXT_PUBLIC_SERVER_FILE_UPLOAD_URL:
    //   process.env.NEXT_PUBLIC_SERVER_FILE_UPLOAD_URL,
    // NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL,
    // NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  },

  /**
   * Skip validation in Docker or CI builds
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Treat empty strings as undefined
   */
  emptyStringAsUndefined: true,
});
