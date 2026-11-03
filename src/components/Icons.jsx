// Linijske ikonice (24x24, stroke = currentColor) - bez dodatnih paketa.
const PATHS = {
  wifi: (
    <>
      <path d="M2 8.8a15 15 0 0 1 20 0" />
      <path d="M5 12.4a10.5 10.5 0 0 1 14 0" />
      <path d="M8.5 15.9a5.5 5.5 0 0 1 7 0" />
      <circle cx="12" cy="19.2" r="1" fill="currentColor" />
    </>
  ),
  ac: (
    <>
      <path d="M12 2v20M4.2 6.5l15.6 11M19.8 6.5 4.2 17.5" />
      <path d="m9.5 3.5 2.5 2 2.5-2M9.5 20.5l2.5-2 2.5 2" />
    </>
  ),
  tv: (
    <>
      <rect x="2.5" y="5" width="19" height="12.5" rx="2.5" />
      <path d="M8 21h8M12 17.5V21" />
    </>
  ),
  dishwasher: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
      <path d="M4 7.5h16M7.5 5h1M10.5 5h1" />
      <path d="M7.5 12.5h9M7.5 17h9M9.5 12.5v4.5M12 12.5v4.5M14.5 12.5v4.5" />
    </>
  ),
  park: (
    <>
      <path d="M12 15.5c-3.6 0-6-2.3-6-5.3 0-2.3 1.4-3.8 3-4.3C9.6 3.9 10.7 2.5 12 2.5s2.4 1.4 3 3.4c1.6.5 3 2 3 4.3 0 3-2.4 5.3-6 5.3Z" />
      <path d="M12 21.5v-10M9.5 12.5l2.5 2.5 2.5-2.5M3 21.5h18" />
    </>
  ),
  elevator: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
      <path d="m9 9 3-3 3 3M9 15l3 3 3-3" />
    </>
  ),
  washer: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
      <circle cx="12" cy="13.5" r="4.5" />
      <path d="M7.5 6h1M11 6h1M9.5 14.5c1.2-1 2.6 1 4 0" />
    </>
  ),
  parking: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M9.5 17V7.5h3.25a2.75 2.75 0 0 1 0 5.5H9.5" />
    </>
  ),
};

export default function Icon({ name, className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

const CHEVRON_ROTATION = { right: 0, down: 90, left: 180, up: 270 };

/** Jedinstvena strelica na celom sajtu: tanak chevron ">". */
export function Chevron({ direction = "right", className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ transform: `rotate(${CHEVRON_ROTATION[direction]}deg)` }}
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

const UI_PATHS = {
  close: <path d="M6 6l12 12M18 6 6 18" />,
  zoomIn: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4M11 8.5v5M8.5 11h5" />
    </>
  ),
  zoomOut: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4M8.5 11h5" />
    </>
  ),
};

export function UiIcon({ name, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {UI_PATHS[name]}
    </svg>
  );
}
