import { createElement } from 'react';
import type { LucideProps } from 'lucide-react';
import { tagIcon } from '../lib/icons';

export function TagIcon({
  icon,
  ...props
}: Omit<LucideProps, 'name'> & { icon: string | null | undefined }) {
  return createElement(tagIcon(icon), { 'aria-hidden': true, ...props });
}
