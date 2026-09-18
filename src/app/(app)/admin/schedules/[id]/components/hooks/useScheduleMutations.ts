"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type ScheduleMutation =
  | "ASSIGN"
  | "AUTOFILL"
  | "CLEAR_ASSIGNMENTS"
  | "VALIDATE"
  | "PUBLISH"
  | "RETURN_TO_DRAFT";

export function useScheduleMutations() {
  const router = useRouter();

  const [activeMutation, setActiveMutation] = useState<ScheduleMutation | null>(
    null,
  );

  const [isRefreshing, startRefreshTransition] = useTransition();

  const mutationRunning = activeMutation !== null || isRefreshing;

  function start(mutation: ScheduleMutation): boolean {
    if (mutationRunning) {
      return false;
    }

    setActiveMutation(mutation);
    return true;
  }

  function finish(mutation: ScheduleMutation) {
    setActiveMutation((currentMutation) =>
      currentMutation === mutation ? null : currentMutation,
    );
  }

  function isActive(mutation: ScheduleMutation): boolean {
    return activeMutation === mutation;
  }

  function refresh() {
    startRefreshTransition(() => {
      router.refresh();
    });
  }

  return {
    activeMutation,
    isRefreshing,
    mutationRunning,

    start,
    finish,
    isActive,
    refresh,
  };
}

export type ScheduleMutations = ReturnType<typeof useScheduleMutations>;
