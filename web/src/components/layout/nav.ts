import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  end?: boolean
  icon: LucideIcon
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export function flattenNavGroups(groups: NavGroup[]): NavItem[] {
  return groups.flatMap((group) => group.items)
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.end) return pathname === item.to
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function findActiveNavItem(pathname: string, groups: NavGroup[]): NavItem | undefined {
  return flattenNavGroups(groups).find((item) => isNavItemActive(pathname, item))
}
