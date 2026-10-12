/** Shared markup for generated icons. Satori supports a subset of CSS, so this sticks to flexbox and shadows. */
export function MoonMark({ size }: { size: number }) {
  const moon = size * 0.56;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: '#12172f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: moon,
          height: moon,
          borderRadius: '50%',
          marginLeft: -moon * 0.35,
          marginTop: moon * 0.1,
          boxShadow: `${String(moon * 0.28)}px ${String(-moon * 0.2)}px 0 0 #8fd1d6`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: size * 0.24,
          right: size * 0.22,
          width: size * 0.08,
          height: size * 0.08,
          borderRadius: '50%',
          background: '#f3cb7f',
        }}
      />
    </div>
  );
}
