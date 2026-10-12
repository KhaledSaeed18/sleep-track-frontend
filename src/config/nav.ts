import {
  BarChart3,
  CalendarRange,
  LayoutDashboard,
  Lightbulb,
  NotebookPen,
  Settings,
  ShieldCheck,
  Tags,
  Target,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Second key of a `g` + key navigation chord. */
  chord: string;
  adminOnly?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Your sleep',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, chord: 'd' },
      { href: '/journal', label: 'Journal', icon: NotebookPen, chord: 'j' },
      { href: '/analytics', label: 'Analytics', icon: BarChart3, chord: 'a' },
      { href: '/insights', label: 'Insights', icon: Lightbulb, chord: 'i' },
      { href: '/reports', label: 'Weekly report', icon: CalendarRange, chord: 'r' },
    ],
  },
  {
    label: 'Routine',
    items: [
      { href: '/goals', label: 'Goals', icon: Target, chord: 'o' },
      { href: '/tags', label: 'Tags', icon: Tags, chord: 't' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings, chord: 's' },
      { href: '/admin', label: 'Admin', icon: ShieldCheck, chord: 'm', adminOnly: true },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export const MOBILE_DOCK_ITEMS = ['/dashboard', '/journal', '/analytics'] as const;

export const SETTINGS_SECTIONS = [
  { href: '/settings', label: 'Profile' },
  { href: '/settings/preferences', label: 'Preferences' },
  { href: '/settings/security', label: 'Security' },
  { href: '/settings/data', label: 'Data' },
] as const;
