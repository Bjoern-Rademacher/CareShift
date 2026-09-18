"use client";

import { useState } from "react";

import { returnScheduleToDraftRequest } from "@/app/(app)/admin/schedules/[id]/helpers/scheduleRequests";

import {
  publishScheduleRequest,
  validateScheduleRequest,
} from "@/lib/api/scheduleRequests";

import type { ScheduleMutations } from "@/app/(app)/admin/schedules/[id]/components/hooks/useScheduleMutations";

import type { ApiIssue } from "@/types/api";
import type {
  SchedulePeriod,
  ScheduleValidationResult,
  scheduleValidationError,
} from "@/types/scheduling";

type UseScheduleLifecycleInput = {
  schedulePeriod: SchedulePeriod;
  mutations: ScheduleMutations;
};

const SUCCESSFUL_VALIDATION: ScheduleValidationResult = {
  noOverlaps: true,
  sufficientRest: true,
  weeklyHoursValid: true,
  rollingSevenDayHoursValid: true,
};

function isScheduleValidationError(
  issue: ApiIssue,
): issue is scheduleValidationError {
  return (
    issue.code === "MISSING_ASSIGNMENT" ||
    issue.code === "DOUBLE_ASSIGNMENT" ||
    issue.code === "INSUFFICIENT_REST" ||
    issue.code === "WEEKLY_HOURS_EXCEEDED"
  );
}

function getInitialValidationResult(
  status: SchedulePeriod["status"],
): ScheduleValidationResult | null {
  return status === "VALIDATED" || status === "PUBLISHED"
    ? SUCCESSFUL_VALIDATION
    : null;
}

export function useScheduleLifecycle({
  schedulePeriod,
  mutations,
}: UseScheduleLifecycleInput) {
  const [validationResult, setValidationResult] =
    useState<ScheduleValidationResult | null>(() =>
      getInitialValidationResult(schedulePeriod.status),
    );

  const [validationIssues, setValidationIssues] = useState<
    scheduleValidationError[]
  >([]);

  const [publishError, setPublishError] = useState<string | null>(null);

  const [systemError, setSystemError] = useState<string | null>(null);

  const [isReturnToDraftModalOpen, setIsReturnToDraftModalOpen] =
    useState(false);

  const [returnToDraftError, setReturnToDraftError] = useState<string | null>(
    null,
  );

  const isValidating = mutations.isActive("VALIDATE");

  const isPublishing = mutations.isActive("PUBLISH");

  const isReturningToDraft = mutations.isActive("RETURN_TO_DRAFT");

  function clearMessages() {
    setValidationIssues([]);
    setPublishError(null);
    setSystemError(null);
  }

  function clearValidationIssues() {
    setValidationIssues([]);
  }

  function clearPublishError() {
    setPublishError(null);
  }

  function clearSystemError() {
    setSystemError(null);
  }

  function clearReturnToDraftError() {
    setReturnToDraftError(null);
  }

  function invalidateValidation() {
    setValidationResult(null);
    clearMessages();
  }

  async function handleValidate() {
    if (!mutations.start("VALIDATE")) {
      return;
    }

    clearMessages();
    setValidationResult(null);

    try {
      const result = await validateScheduleRequest(schedulePeriod.id);

      if (!result.ok) {
        if (
          result.error.code === "SCHEDULE_VALIDATION_FAILED" &&
          result.error.issues
        ) {
          setValidationIssues(
            result.error.issues.filter(isScheduleValidationError),
          );
        } else {
          setSystemError(result.error.message);
        }

        return;
      }

      setValidationResult(SUCCESSFUL_VALIDATION);
      mutations.refresh();
    } catch (error) {
      setSystemError(
        error instanceof Error ? error.message : "Schedule validation failed.",
      );
    } finally {
      mutations.finish("VALIDATE");
    }
  }

  async function handlePublish() {
    if (!mutations.start("PUBLISH")) {
      return;
    }

    clearMessages();

    try {
      const result = await publishScheduleRequest(schedulePeriod.id);

      if (!result.ok) {
        if (
          result.error.code === "SCHEDULE_VALIDATION_FAILED" &&
          result.error.issues
        ) {
          setValidationResult(null);

          setValidationIssues(
            result.error.issues.filter(isScheduleValidationError),
          );
        } else {
          setPublishError(result.error.message);
        }

        return;
      }

      mutations.refresh();
    } catch (error) {
      setSystemError(
        error instanceof Error ? error.message : "Schedule publishing failed.",
      );
    } finally {
      mutations.finish("PUBLISH");
    }
  }

  function handleOpenReturnToDraftModal() {
    if (schedulePeriod.status === "DRAFT" || mutations.mutationRunning) {
      return;
    }

    setReturnToDraftError(null);
    setIsReturnToDraftModalOpen(true);
  }

  function handleCloseReturnToDraftModal() {
    if (isReturningToDraft) {
      return;
    }

    setReturnToDraftError(null);
    setIsReturnToDraftModalOpen(false);
  }

  async function handleReturnToDraft() {
    if (schedulePeriod.status === "DRAFT") {
      return;
    }

    if (!mutations.start("RETURN_TO_DRAFT")) {
      return;
    }

    setReturnToDraftError(null);

    try {
      const result = await returnScheduleToDraftRequest(schedulePeriod.id);

      if (!result.ok) {
        setReturnToDraftError(result.error.message);

        return;
      }

      setValidationResult(null);
      clearMessages();
      setIsReturnToDraftModalOpen(false);

      mutations.refresh();
    } catch (error) {
      setReturnToDraftError(
        error instanceof Error
          ? error.message
          : "Could not return schedule to draft.",
      );
    } finally {
      mutations.finish("RETURN_TO_DRAFT");
    }
  }

  return {
    validationResult,
    validationIssues,
    publishError,
    systemError,

    isValidating,
    isPublishing,
    isReturningToDraft,

    isReturnToDraftModalOpen,
    returnToDraftError,

    handleValidate,
    handlePublish,
    handleOpenReturnToDraftModal,
    handleCloseReturnToDraftModal,
    handleReturnToDraft,

    clearMessages,
    clearValidationIssues,
    clearPublishError,
    clearSystemError,
    clearReturnToDraftError,

    invalidateValidation,
  };
}
