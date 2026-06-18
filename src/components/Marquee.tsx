import React from 'react';

interface MarqueeProps {
  items: string[];
  variant: 'minimal' | 'dark';
}

export default function Marquee({ items, variant }: MarqueeProps) {
  const doubled = [...items, ...items];
  const duration = variant === 'minimal' ? 26 : 24;

  if (variant === 'minimal') {
    return (
      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            width: 'max-content',
            whiteSpace: 'nowrap',
            animation: `marqueeX ${duration}s linear infinite`,
          }}
        >
          {doubled.map((item, i) => (
            <React.Fragment key={i}>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#0a0a0a',
                  fontFamily: '"Space Mono", monospace',
                  padding: '0 28px',
                }}
              >
                {item}
              </span>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#d4d4d4',
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
    <div style={{ overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          whiteSpace: 'nowrap',
          animation: `marqueeX ${duration}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <React.Fragment key={i}>
            <span
              style={{
                fontSize: '18px',
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
                fontSize: '18px',
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
