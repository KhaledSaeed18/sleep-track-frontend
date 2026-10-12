import { ImageResponse } from 'next/og';
import { MoonMark } from '../../brand-image';

export const dynamic = 'force-static';

export function GET() {
  return new ImageResponse(<MoonMark size={192} />, { width: 192, height: 192 });
}
