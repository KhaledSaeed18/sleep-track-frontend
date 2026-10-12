import { ImageResponse } from 'next/og';
import { MoonMark } from '../../brand-image';

export const dynamic = 'force-static';

export function GET() {
  return new ImageResponse(<MoonMark size={512} />, { width: 512, height: 512 });
}
