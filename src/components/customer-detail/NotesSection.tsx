import { useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Section } from "./Section"

interface NotesSectionProps {
  notes: string
  onNotesChange: (value: string) => void
  onSave: () => void
  isDirty?: boolean
}

export function NotesSection({
  notes,
  onNotesChange,
  onSave,
  isDirty = false,
}: NotesSectionProps) {
  const { t } = useTranslation()
  const [saved, setSaved] = useState(false)

  const handleSave = useCallback(() => {
    onSave()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [onSave])

  return (
    <Section title={t("customerDetail.notes")}>
      <Textarea
        placeholder={t("customerDetail.notesPlaceholder")}
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        onBlur={() => onSave()}
        className="min-h-[80px]"
      />
      <div className="mt-2 flex items-center gap-2">
        {isDirty && (
          <Button variant="default" size="sm" onClick={handleSave} className="cursor-pointer shadow-sm">
            {t("customerDetail.saveNotes")}
          </Button>
        )}
        {saved && (
          <span className="text-muted-foreground text-sm">{t("customerDetail.saved")}</span>
        )}
      </div>
    </Section>
  )
}
