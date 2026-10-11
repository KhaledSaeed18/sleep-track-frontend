import type { Metadata } from 'next';
import { TagsView } from '@/features/tags/components/tags-view';

export const metadata: Metadata = { title: 'Tags' };

export default function Page() {
  return <TagsView />;
}
