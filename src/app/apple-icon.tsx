import { ImageResponse } from 'next/og';
import { MoonMark } from './brand-image';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(<MoonMark size={180} />, size);
}
