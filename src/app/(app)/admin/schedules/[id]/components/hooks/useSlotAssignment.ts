"use client";

import { useEffect, useRef, useState } from "react";

import {
  assignEmployeeRequest,
  getAssignmentCandidatesRequest,
} from "@/app/(app)/admin/schedules/[id]/helpers/scheduleRequests";

import type { ScheduleMutations } from "@/app/(app)/admin/schedules/[id]/components/hooks/useScheduleMutations";

import type { EmployeeAssignmentCandidate } from "@/types/assignment";
import type { ApiIssue } from "@/types/api";
import type { UUID } from "@/types/common";
import type { ShiftSlot } from "@/types/scheduling";

type UseSlotAssignmentInput = {
  shiftSlots: ShiftSlot[];
  canEdit: boolean;
  mutations: ScheduleMutations;
  onAssignmentChanged: () => void;
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useSlotAssignment({
  shiftSlots,
  canEdit,
  mutations,
  onAssignmentChanged,
}: UseSlotAssignmentInput) {
  const candidateRequestRef = useRef<AbortController | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [selectedSlotId, setSelectedSlotId] = useState<UUID | null>(null);

  const [savingEmployeeId, setSavingEmployeeId] = useState<UUID | null>(null);

  const [candidates, setCandidates] = useState<EmployeeAssignmentCandidate[]>(
    [],
  );

  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  const [candidateLoadError, setCandidateLoadError] = useState<string | null>(
    null,
  );

  const [assignmentIssues, setAssignmentIssues] = useState<ApiIssue[]>([]);

  const [systemError, setSystemError] = useState<string | null>(null);

  const selectedSlot = shiftSlots.find((slot) => slot.id === selectedSlotId);

  // Cancel candidate loading if the component using this hook unmounts.
  useEffect(() => {
    return () => {
      candidateRequestRef.current?.abort();
    };
  }, []);

  function clearMessages() {
    setAssignmentIssues([]);
    setSystemError(null);
  }

  function clearAssignmentIssues() {
    setAssignmentIssues([]);
  }

  function clearSystemError() {
    setSystemError(null);
  }

  function resetModal() {
    candidateRequestRef.current?.abort();
    candidateRequestRef.current = null;

    setIsAssignModalOpen(false);
    setSelectedSlotId(null);
    setSavingEmployeeId(null);
    setCandidates([]);
    setIsLoadingCandidates(false);
    setCandidateLoadError(null);

    clearMessages();
  }

  function handleCloseModal() {
    if (mutations.isActive("ASSIGN")) {
      return;
    }

    resetModal();
  }

  async function handleOpenModal(slotId: UUID) {
    if (!canEdit || mutations.mutationRunning) {
      return;
    }

    // Cancel a previous candidate request before loading another slot.
    candidateRequestRef.current?.abort();

    const controller = new AbortController();

    candidateRequestRef.current = controller;

    setSelectedSlotId(slotId);
    setIsAssignModalOpen(true);
    setCandidates([]);
    setCandidateLoadError(null);
    setIsLoadingCandidates(true);

    clearMessages();

    try {
      const result = await getAssignmentCandidatesRequest(
        slotId,
        controller.signal,
      );

      // Ignore responses belonging to an outdated request.
      if (candidateRequestRef.current !== controller) {
        return;
      }

      if (!result.ok) {
        setCandidateLoadError(result.error.message);
        return;
      }

      setCandidates(result.data.candidates);
    } catch (error) {
      if (!isAbortError(error) && candidateRequestRef.current === controller) {
        setCandidateLoadError(
          error instanceof Error
            ? error.message
            : "Could not load assignment candidates.",
        );
      }
    } finally {
      if (candidateRequestRef.current === controller) {
        candidateRequestRef.current = null;
        setIsLoadingCandidates(false);
      }
    }
  }

  async function handleConfirm(employeeId: UUID) {
    if (selectedSlotId === null) {
      setAssignmentIssues([
        {
          code: "NO_SLOT_SELECTED",
          message: "No slot selected.",
        },
      ]);

      return;
    }

    if (!canEdit || !mutations.start("ASSIGN")) {
      return;
    }

    setSavingEmployeeId(employeeId);
    clearMessages();

    try {
      const result = await assignEmployeeRequest(selectedSlotId, employeeId);

      if (!result.ok) {
        if (result.error.issues) {
          setAssignmentIssues(result.error.issues);
        } else {
          setSystemError(result.error.message);
        }

        return;
      }

      onAssignmentChanged();
      resetModal();
      mutations.refresh();
    } catch (error) {
      setSystemError(
        error instanceof Error ? error.message : "Unexpected assignment error.",
      );
    } finally {
      setSavingEmployeeId(null);
      mutations.finish("ASSIGN");
    }
  }

  return {
    isAssignModalOpen,
    selectedSlot,
    savingEmployeeId,

    candidates,
    isLoadingCandidates,
    candidateLoadError,

    assignmentIssues,
    systemError,

    handleOpenModal,
    handleCloseModal,
    handleConfirm,

    clearAssignmentIssues,
    clearSystemError,
  };
}
