import {
  Home,
  User,
  Settings,
  UserCog,
  SlidersHorizontal,
  ShieldCheck,
  Package,
  LayoutDashboard,
  FileText,
  BarChart,
  Circle,
  type LucideIcon,
} from 'lucide-react'

export const iconMap: Record<string, LucideIcon> = {
  // Material Icons → Lucide
  home: Home,
  person: User,
  settings: Settings,
  manage_accounts: UserCog,
  tune: SlidersHorizontal,
  verified_user: ShieldCheck,
  inventory: Package,
  dashboard: LayoutDashboard,
  description: FileText,
  bar_chart: BarChart,
}

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Circle
}
