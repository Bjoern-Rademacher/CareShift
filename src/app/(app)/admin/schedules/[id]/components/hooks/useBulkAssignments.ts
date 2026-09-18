"use client";

import { useState } from "react";

import {
  autofillScheduleRequest,
  clearScheduleAssignmentsRequest,
} from "@/app/(app)/admin/schedules/[id]/helpers/scheduleRequests";

import type { ScheduleMutations } from "@/app/(app)/admin/schedules/[id]/components/hooks/useScheduleMutations";

import type { AutofillResult } from "@/types/autofill";
import type { UUID } from "@/types/common";

type UseBulkAssignmentsInput = {
  periodId: UUID;
  canEdit: boolean;
  assignedCount: number;
  mutations: ScheduleMutations;
  onAssignmentsChanged: () => void;
};

export function useBulkAssignments({
  periodId,
  canEdit,
  assignedCount,
  mutations,
  onAssignmentsChanged,
}: UseBulkAssignmentsInput) {
  const [autofillResult, setAutofillResult] = useState<AutofillResult | null>(
    null,
  );

  const [isClearAssignmentsModalOpen, setIsClearAssignmentsModalOpen] =
    useState(false);

  const [clearAssignmentsError, setClearAssignmentsError] = useState<
    string | null
  >(null);

  const [systemError, setSystemError] = useState<string | null>(null);

  const isAutofilling = mutations.isActive("AUTOFILL");

  const isClearingAssignments = mutations.isActive("CLEAR_ASSIGNMENTS");

  function clearAutofillResult() {
    setAutofillResult(null);
  }

  function clearSystemError() {
    setSystemError(null);
  }

  function clearClearAssignmentsError() {
    setClearAssignmentsError(null);
  }

  async function handleAutofill() {
    if (!canEdit || !mutations.start("AUTOFILL")) {
      return;
    }

    setAutofillResult(null);
    setSystemError(null);

    try {
      const result = await autofillScheduleRequest(
        periodId,
        "BALANCE_WORKLOAD",
      );

      setAutofillResult(result);

      if (result.assignedCount > 0) {
        onAssignmentsChanged();
      }

      mutations.refresh();
    } catch (error) {
      setSystemError(
        error instanceof Error ? error.message : "Autofill failed.",
      );
    } finally {
      mutations.finish("AUTOFILL");
    }
  }

  function handleOpenClearAssignmentsModal() {
    if (!canEdit || mutations.mutationRunning || assignedCount === 0) {
      return;
    }

    setClearAssignmentsError(null);
    setIsClearAssignmentsModalOpen(true);
  }

  function handleCloseClearAssignmentsModal() {
    if (isClearingAssignments) {
      return;
    }

    setClearAssignmentsError(null);
    setIsClearAssignmentsModalOpen(false);
  }

  async function handleClearAssignments() {
    if (
      !canEdit ||
      assignedCount === 0 ||
      !mutations.start("CLEAR_ASSIGNMENTS")
    ) {
      return;
    }

    setClearAssignmentsError(null);

    try {
      const result = await clearScheduleAssignmentsRequest(periodId);

      if (!result.ok) {
        setClearAssignmentsError(result.error.message);
        return;
      }

      onAssignmentsChanged();
      setAutofillResult(null);
      setIsClearAssignmentsModalOpen(false);

      mutations.refresh();
    } catch (error) {
      setClearAssignmentsError(
        error instanceof Error
          ? error.message
          : "Could not clear schedule assignments.",
      );
    } finally {
      mutations.finish("CLEAR_ASSIGNMENTS");
    }
  }

  return {
    autofillResult,
    systemError,

    isAutofilling,
    isClearingAssignments,

    isClearAssignmentsModalOpen,
    clearAssignmentsError,

    handleAutofill,
    handleOpenClearAssignmentsModal,
    handleCloseClearAssignmentsModal,
    handleClearAssignments,

    clearAutofillResult,
    clearSystemError,
    clearClearAssignmentsError,
  };
}
