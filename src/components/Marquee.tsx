import React from 'react';

interface MarqueeProps {
  items: string[];
  variant: 'minimal' | 'dark';
}

// Desvanecido en los dos bordes: el texto se disuelve al entrar y al salir en
// vez de cortarse en seco contra el borde de la banda.
const fadeEdges = 'linear-gradient(to right, transparent 0%, #000 20%, #000 80%, transparent 100%)';

export default function Marquee({ items, variant }: MarqueeProps) {
  const doubled = [...items, ...items];
  const duration = variant === 'minimal' ? 26 : 24;
  const wrapper: React.CSSProperties = {
    overflow: 'hidden',
    // Banda fluida: en laptops (viewport bajo) se comprime para que el hero
    // siga cerrando dentro del viewport; en monitores grandes mantiene 34px.
    padding: 'clamp(12px, 2.6vh, 34px) 0',
    WebkitMaskImage: fadeEdges,
    maskImage: fadeEdges,
  };

  if (variant === 'minimal') {
    return (
      <div style={wrapper}>
        <div
          style={{
            display: 'flex',
            width: 'max-content',
            whiteSpace: 'nowrap',
            animation: `marqueeX ${duration}s linear 0.5s infinite`,
          }}
        >
          {doubled.map((item, i) => (
            <React.Fragment key={i}>
              <span
                style={{
                  fontSize: 'clamp(15px, 2.4vh, 22px)',
                  fontWeight: 800,
                  color: 'var(--mq-text)',
                  fontFamily: '"Space Mono", monospace',
                  padding: '0 28px',
                }}
              >
                {item}
              </span>
              <span
                style={{
                  fontSize: 'clamp(15px, 2.4vh, 22px)',
                  fontWeight: 800,
                  color: 'var(--mq-sep)',
                  fontFamily: '"Space Mono", monospace',
                  userSelect: 'none',
                }}
              >
                /
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={wrapper}>
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          whiteSpace: 'nowrap',
          animation: `marqueeX ${duration}s linear 0.5s infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <React.Fragment key={i}>
            <span
              style={{
                fontSize: 'clamp(14px, 2vh, 18px)',
                fontWeight: 500,
                color: '#cfcfda',
                fontFamily: '"JetBrains Mono", monospace',
                padding: '0 24px',
              }}
            >
              {item}
            </span>
            <span
              style={{
                fontSize: 'clamp(14px, 2vh, 18px)',
                fontWeight: 500,
                color: '#8b5cff',
                fontFamily: '"JetBrains Mono", monospace',
                userSelect: 'none',
              }}
            >
              ◆
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
