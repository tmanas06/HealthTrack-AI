"use client";

import { useState, useCallback } from "react";
import { PredictResponse } from "@/types/api";
import { predict } from "@/lib/api";

export type AssessmentState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: PredictResponse; symptoms: string[] }
  | { status: "error"; message: string };

export function useAssessment() {
  const [state, setState] = useState<AssessmentState>({ status: "idle" });

  const submit = useCallback(async (symptoms: string[]) => {
    setState({ status: "loading" });
    try {
      const data = await predict({ symptoms });
      setState({ status: "success", data, symptoms });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setState({ status: "error", message });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
