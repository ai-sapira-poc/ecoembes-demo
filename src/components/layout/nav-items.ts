import { LayoutDashboard, FileSearch, GitCompare, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  /** Full label — used in the desktop sidebar. */
  label: string;
  /** Short label — used in the mobile bottom tab bar where space is tight. */
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  /** When true, the route must match exactly to be active (Dashboard root). */
  exact: boolean;
}

/** Single source of truth for primary platform navigation. */
export const navItems: NavItem[] = [
  { label: "Dashboard", shortLabel: "Inicio", href: "/plataforma", icon: LayoutDashboard, exact: true },
  { label: "Auditoría", shortLabel: "Auditoría", href: "/plataforma/auditoria", icon: FileSearch, exact: false },
  { label: "Control BPO", shortLabel: "Control", href: "/plataforma/control", icon: GitCompare, exact: false },
  { label: "Revisión", shortLabel: "Revisión", href: "/plataforma/revision", icon: UserCheck, exact: false },
];

/** Whether `pathname` should mark `item` as the active route. */
export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}
