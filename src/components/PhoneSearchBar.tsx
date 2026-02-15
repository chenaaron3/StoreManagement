import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchUserByPhone } from "@/data/mockData"

interface PhoneSearchBarProps {
  onMatch: (memberId: string) => void
}

export function PhoneSearchBar({ onMatch }: PhoneSearchBarProps) {
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [noMatch, setNoMatch] = useState(false)

  const handleSearch = async () => {
    const trimmed = phone.trim()
    if (!trimmed) return
    setNoMatch(false)
    setLoading(true)
    try {
      const user = await fetchUserByPhone(trimmed)
      if (user) {
        onMatch(user.memberId)
        setPhone("")
      } else {
        setNoMatch(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="tel"
          placeholder="Search by phone number (e.g. 090-1234-5678)"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            setNoMatch(false)
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </Button>
      </div>
      {noMatch && (
        <p className="text-muted-foreground text-sm">No customer found.</p>
      )}
    </div>
  )
}
