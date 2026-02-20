export function DitheredLandscape() {
  return (
    <svg
      viewBox="0 0 960 400"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
    >
      <defs>
        <pattern
          id="dither-sparse"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="0" width="1" height="1" fill="var(--foreground)" />
          <rect x="2" y="2" width="1" height="1" fill="var(--foreground)" />
        </pattern>
        <pattern
          id="dither-light"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="0" width="1" height="1" fill="var(--foreground)" />
          <rect x="2" y="0" width="1" height="1" fill="var(--foreground)" />
          <rect x="1" y="2" width="1" height="1" fill="var(--foreground)" />
          <rect x="3" y="2" width="1" height="1" fill="var(--foreground)" />
        </pattern>
        <pattern
          id="dither-medium"
          width="2"
          height="2"
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="0" width="1" height="1" fill="var(--foreground)" />
          <rect x="1" y="1" width="1" height="1" fill="var(--foreground)" />
        </pattern>
      </defs>

      {/* Far mountains - sparse 12.5% Bayer dither */}
      <polygon
        points="0,400 0,310 50,290 100,260 130,275 170,240 200,255 240,220 280,200 310,185 340,200 380,175 420,155 460,130 490,150 520,165 550,150 580,170 620,185 660,170 700,195 730,215 760,200 790,225 830,245 870,230 900,260 940,285 960,300 960,400"
        fill="url(#dither-sparse)"
        opacity="0.6"
      />

      {/* Mid mountains - 25% Bayer dither */}
      <polygon
        points="0,400 0,340 40,320 90,295 130,310 170,280 220,295 260,270 310,255 350,270 390,250 430,265 470,245 510,260 550,245 590,265 630,250 670,265 710,255 750,275 790,260 830,280 870,270 910,295 960,315 960,400"
        fill="url(#dither-light)"
        opacity="0.5"
      />

      {/* Near hills - 50% checkerboard dither */}
      <polygon
        points="0,400 0,360 50,345 100,355 160,338 220,350 280,340 340,355 400,335 460,350 520,340 580,355 640,340 700,350 760,338 820,350 880,342 940,355 960,350 960,400"
        fill="url(#dither-medium)"
        opacity="0.4"
      />

      {/* Birds */}
      <g
        className="birds"
        stroke="var(--foreground)"
        fill="none"
        strokeWidth="2"
        opacity="0.3"
      >
        <g className="bird" transform="translate(200,75)">
          <line className="wing-l" x1="0" y1="0" x2="-6" y2="-5" />
          <line className="wing-r" x1="0" y1="0" x2="6" y2="-5" />
        </g>
        <g className="bird" transform="translate(380,48)">
          <line className="wing-l" x1="0" y1="0" x2="-5" y2="-4" />
          <line className="wing-r" x1="0" y1="0" x2="5" y2="-4" />
        </g>
        <g className="bird" transform="translate(555,82)">
          <line className="wing-l" x1="0" y1="0" x2="-7" y2="-5" />
          <line className="wing-r" x1="0" y1="0" x2="7" y2="-5" />
        </g>
        <g className="bird" transform="translate(700,42)">
          <line className="wing-l" x1="0" y1="0" x2="-5" y2="-4" />
          <line className="wing-r" x1="0" y1="0" x2="5" y2="-4" />
        </g>
        <g className="bird" transform="translate(840,92)">
          <line className="wing-l" x1="0" y1="0" x2="-4" y2="-3" />
          <line className="wing-r" x1="0" y1="0" x2="4" y2="-3" />
        </g>
      </g>
    </svg>
  );
}
