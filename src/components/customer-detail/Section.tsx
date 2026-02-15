interface SectionProps {
  title: string
  children: React.ReactNode
}

export function Section({ title, children }: SectionProps) {
  return (
    <section>
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="mt-2">{children}</div>
    </section>
  )
}
