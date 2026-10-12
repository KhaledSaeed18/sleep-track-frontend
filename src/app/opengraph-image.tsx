import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

export const alt = 'SleepTrack: see what your nights are telling you';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 197) % 1200,
  y: (i * 89) % 360,
  r: i % 7 === 0 ? 3 : 2,
  o: 0.25 + ((i * 37) % 50) / 100,
}));

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: 'linear-gradient(180deg, #0b0f23 0%, #171c44 70%, #2b2457 100%)',
        color: '#e6e8f5',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {STARS.map((star, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.r,
            height: star.r,
            borderRadius: 9999,
            background: '#e6e8f5',
            opacity: star.o,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 660,
          top: 200,
          width: 440,
          height: 440,
          borderRadius: 9999,
          border: '8px solid #70decc',
          borderBottomColor: 'transparent',
          borderLeftColor: '#ad9af9',
          borderRightColor: '#f3cb7f',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 1083,
          top: 403,
          width: 34,
          height: 34,
          borderRadius: 9999,
          background: '#f3cb7f',
          boxShadow: '0 0 60px 20px rgba(243,203,127,0.35)',
        }}
      />
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 34, fontWeight: 600 }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(112,222,204,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 9999,
              marginLeft: -8,
              boxShadow: '7px -5px 0 0 #8fd1d6',
            }}
          />
        </div>
        {siteConfig.name}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 600 }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2 }}>
          See what your nights are telling you.
        </div>
        <div style={{ fontSize: 28, marginTop: 24, color: 'rgba(230,232,245,0.72)' }}>
          Sleep journal, scores, insights and weekly reports.
        </div>
      </div>
    </div>,
    size,
  );
}
