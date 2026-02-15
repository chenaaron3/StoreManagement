import { useCallback, useEffect, useState } from "react"
import { getInitialNotes } from "@/data/mockData"

const STORAGE_PREFIX = "member-notes:"

function getStorageKey(memberId: string): string {
  return `${STORAGE_PREFIX}${memberId}`
}

export function getMemberNotes(memberId: string): string {
  if (typeof window === "undefined") return getInitialNotes(memberId)
  try {
    const stored = window.localStorage.getItem(getStorageKey(memberId)) ?? ""
    if (stored) return stored
    return getInitialNotes(memberId)
  } catch {
    return getInitialNotes(memberId)
  }
}

export function setMemberNotes(memberId: string, notes: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(getStorageKey(memberId), notes)
  } catch {
    // ignore
  }
}

export function useMemberNotes(memberId: string | null): {
  notes: string
  setNotes: (value: string) => void
  saveNotes: (value: string) => void
  isDirty: boolean
} {
  const initial = memberId ? getMemberNotes(memberId) : ""
  const [notes, setNotesState] = useState<string>(initial)
  const [lastSavedNotes, setLastSavedNotes] = useState<string>(initial)

  useEffect(() => {
    const next = memberId ? getMemberNotes(memberId) : ""
    setNotesState(next)
    setLastSavedNotes(next)
  }, [memberId])

  const setNotes = useCallback(
    (value: string) => {
      setNotesState(value)
      if (memberId) setMemberNotes(memberId, value)
    },
    [memberId]
  )

  const saveNotes = useCallback(
    (value: string) => {
      setNotesState(value)
      if (memberId) setMemberNotes(memberId, value)
      setLastSavedNotes(value)
    },
    [memberId]
  )

  const isDirty = notes !== lastSavedNotes

  return { notes, setNotes, saveNotes, isDirty }
}
