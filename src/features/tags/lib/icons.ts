import {
  Beer,
  BookOpen,
  Brain,
  Briefcase,
  Coffee,
  Dumbbell,
  Flower2,
  Footprints,
  Heart,
  Laptop,
  Leaf,
  Moon,
  Music,
  Pill,
  Plane,
  Smartphone,
  Snowflake,
  Sofa,
  Sun,
  Tag,
  Thermometer,
  Utensils,
  Wine,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/** Curated icon set offered for tags. Keys are lucide icon names as stored by the API. */
export const TAG_ICONS: Record<string, LucideIcon> = {
  coffee: Coffee,
  wine: Wine,
  beer: Beer,
  dumbbell: Dumbbell,
  footprints: Footprints,
  utensils: Utensils,
  brain: Brain,
  zap: Zap,
  smartphone: Smartphone,
  laptop: Laptop,
  sofa: Sofa,
  moon: Moon,
  plane: Plane,
  pill: Pill,
  'book-open': BookOpen,
  'flower-2': Flower2,
  leaf: Leaf,
  heart: Heart,
  music: Music,
  briefcase: Briefcase,
  thermometer: Thermometer,
  snowflake: Snowflake,
  sun: Sun,
  tag: Tag,
};

const ALIASES: Record<string, string> = {
  'utensils-crossed': 'utensils',
  bed: 'sofa',
  'bed-double': 'sofa',
  book: 'book-open',
  flower: 'flower-2',
  'glass-water': 'wine',
  activity: 'dumbbell',
  monitor: 'laptop',
  'cloud-moon': 'moon',
};

export function tagIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Tag;
  return TAG_ICONS[name] ?? TAG_ICONS[ALIASES[name] ?? ''] ?? Tag;
}

export const TAG_COLORS = [
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#a855f7',
  '#6366f1',
  '#3b82f6',
  '#06b6d4',
  '#14b8a6',
  '#22c55e',
  '#84cc16',
  '#64748b',
  '#f97316',
] as const;
