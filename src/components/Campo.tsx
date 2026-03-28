interface CampoProps {
  label: string
  value?: string | null
  icon?: React.ReactNode
  mono?: boolean
}

export function Campo({ label, value, icon, mono }: CampoProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>
        {value || <span className="text-muted-foreground italic font-normal">No registrado</span>}
      </p>
    </div>
  )
}
