/**
 * API Registry - Central export for all APIs.
 * Only AI-powered features use server-side APIs.
 * Data operations use client-side localStorage persistence.
 */

import GenerateTaskDescription from "./ai/generate-description.js";

const apis = {
  GenerateTaskDescription,
} as const;

export default apis;

/** Type for useApi inference - exported for client type-only imports */
export type ApiRegistry = typeof apis;
