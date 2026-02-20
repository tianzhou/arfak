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
        points="0,400 0,240 40,220 80,195 120,170 160,145 200,130 240,155 280,170 320,185 360,200 400,210 450,225 500,215 550,230 600,220 650,240 700,235 750,250 800,245 850,260 900,270 940,285 960,300 960,400"
        fill="url(#dither-sparse)"
        opacity="0.6"
      />

      {/* Mid mountains - 25% Bayer dither */}
      <polygon
        points="0,400 0,280 40,265 80,250 120,240 160,255 200,245 240,260 280,250 320,265 360,275 400,270 450,280 500,275 550,285 600,275 650,285 700,280 750,290 800,285 850,295 900,300 940,310 960,315 960,400"
        fill="url(#dither-light)"
        opacity="0.5"
      />

      {/* Near hills - 50% checkerboard dither */}
      <polygon
        points="0,400 0,330 50,340 100,335 160,345 220,340 280,348 340,342 400,350 460,345 520,350 580,348 640,352 700,348 760,352 820,350 880,355 940,352 960,350 960,400"
        fill="url(#dither-medium)"
        opacity="0.4"
      />

      {/* Arfak flora — tree ferns and rhododendron bushes */}
      <g opacity="0.45" stroke="var(--foreground)" fill="none" strokeWidth="2">
        {/* Tree fern — left */}
        <g transform="translate(80,335)">
          <line x1="0" y1="0" x2="0" y2="-40" />
          <line x1="0" y1="-40" x2="-14" y2="-28" />
          <line x1="0" y1="-40" x2="-12" y2="-22" />
          <line x1="0" y1="-40" x2="-8" y2="-18" />
          <line x1="0" y1="-40" x2="14" y2="-28" />
          <line x1="0" y1="-40" x2="12" y2="-22" />
          <line x1="0" y1="-40" x2="8" y2="-18" />
        </g>
        {/* Tree fern — center-right */}
        <g transform="translate(680,348)">
          <line x1="0" y1="0" x2="0" y2="-32" />
          <line x1="0" y1="-32" x2="-12" y2="-22" />
          <line x1="0" y1="-32" x2="-9" y2="-16" />
          <line x1="0" y1="-32" x2="12" y2="-22" />
          <line x1="0" y1="-32" x2="9" y2="-16" />
        </g>
        {/* Tree fern — far right */}
        <g transform="translate(900,355)">
          <line x1="0" y1="0" x2="0" y2="-35" />
          <line x1="0" y1="-35" x2="-13" y2="-24" />
          <line x1="0" y1="-35" x2="-10" y2="-18" />
          <line x1="0" y1="-35" x2="13" y2="-24" />
          <line x1="0" y1="-35" x2="10" y2="-18" />
          <line x1="0" y1="-35" x2="-6" y2="-14" />
          <line x1="0" y1="-35" x2="6" y2="-14" />
        </g>
      </g>
      <g opacity="0.35">
        {/* Rhododendron bush — left */}
        <polygon
          points="160,345 150,332 145,318 152,308 164,302 176,308 183,318 178,332 168,345"
          fill="url(#dither-medium)"
        />
        {/* Rhododendron bush — center */}
        <polygon
          points="430,350 422,340 418,328 424,320 434,316 444,320 450,328 446,340 438,350"
          fill="url(#dither-medium)"
        />
        {/* Rhododendron bush — right */}
        <polygon
          points="790,352 784,344 780,334 786,326 794,322 802,326 808,334 804,344 798,352"
          fill="url(#dither-light)"
        />
      </g>

      {/* Static birds */}
      <g
        stroke="var(--foreground)"
        fill="none"
        strokeWidth="2"
        opacity="0.4"
      >
        <g transform="translate(180,150)">
          <line x1="0" y1="0" x2="-8" y2="-6" />
          <line x1="0" y1="0" x2="8" y2="-6" />
        </g>
        <g transform="translate(520,120)">
          <line x1="0" y1="0" x2="-7" y2="-5" />
          <line x1="0" y1="0" x2="7" y2="-5" />
        </g>
        <g transform="translate(760,160)">
          <line x1="0" y1="0" x2="-6" y2="-5" />
          <line x1="0" y1="0" x2="6" y2="-5" />
        </g>
      </g>

    </svg>
  );
}
