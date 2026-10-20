const SHELL =
  'M70 150C70 92 130 64 300 64s230 28 230 86v38c0 58-58 96-134 96h-34c-24 0-30-26-62-26s-38 26-62 26h-34C128 284 70 246 70 188z';
const LENS =
  'M104 152C104 118 150 98 300 98s196 20 196 54v32c0 40-44 66-102 66h-30c-20 0-26-20-64-20s-44 20-64 20h-30c-58 0-102-26-102-66z';
const TEMPLE_LEFT = 'M70 150L22 138v66l48-16';
const TEMPLE_RIGHT = 'M530 150l48-12v66l-48-16';
const HIGHLIGHT = 'M140 130C210 112 390 112 460 130';

export function VisorSketch() {
  return (
    <svg className="sf-art sf-sketch" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid meet" focusable="false">
      <g className="sf-sketch-guides">
        <rect x="22" y="64" width="556" height="220" />
        <path d="M300 40V320M0 174H600" />
        <path d="M22 308H578M22 300v16M578 300v16M300 300v16" />
        <circle cx="300" cy="174" r="128" />
      </g>
      <g className="sf-sketch-lines">
        <path d={SHELL} />
        <path d={LENS} />
        <path d={TEMPLE_LEFT} />
        <path d={TEMPLE_RIGHT} />
        <path d={HIGHLIGHT} />
        <circle cx="214" cy="176" r="30" />
        <circle cx="214" cy="176" r="18" />
        <circle cx="386" cy="176" r="30" />
        <circle cx="386" cy="176" r="18" />
        <circle cx="300" cy="80" r="5" />
        <circle cx="232" cy="84" r="3" />
        <circle cx="368" cy="84" r="3" />
      </g>
    </svg>
  );
}

export function VisorSolid() {
  return (
    <svg className="sf-art sf-solid" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid meet" focusable="false">
      <defs>
        <linearGradient id="sf-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1f6f8" />
          <stop offset="0.45" stopColor="#9fb1ba" />
          <stop offset="1" stopColor="#2b3a42" />
        </linearGradient>
        <linearGradient id="sf-lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#04141d" />
          <stop offset="0.55" stopColor="#0a4560" />
          <stop offset="1" stopColor="#1d2a6e" />
        </linearGradient>
        <linearGradient id="sf-temple" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5b6c75" />
          <stop offset="1" stopColor="#1a2328" />
        </linearGradient>
        <linearGradient id="sf-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="sf-eye">
          <stop offset="0" stopColor="#5fe0b8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#5fe0b8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={TEMPLE_LEFT} fill="url(#sf-temple)" />
      <path d={TEMPLE_RIGHT} fill="url(#sf-temple)" />
      <path d={SHELL} fill="url(#sf-shell)" />
      <path d={LENS} fill="url(#sf-lens)" />
      <path d={LENS} fill="url(#sf-sheen)" opacity="0.55" />
      <circle cx="214" cy="176" r="46" fill="url(#sf-eye)" />
      <circle cx="386" cy="176" r="46" fill="url(#sf-eye)" />
      <g fill="none" stroke="#5fe0b8" strokeWidth="1.6">
        <circle cx="214" cy="176" r="30" />
        <circle cx="214" cy="176" r="18" />
        <circle cx="386" cy="176" r="30" />
        <circle cx="386" cy="176" r="18" />
      </g>
      <path d={HIGHLIGHT} fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
      <circle cx="300" cy="80" r="5" fill="#e4f59a" />
      <circle cx="232" cy="84" r="3" fill="#8a5cff" />
      <circle cx="368" cy="84" r="3" fill="#8a5cff" />
    </svg>
  );
}
