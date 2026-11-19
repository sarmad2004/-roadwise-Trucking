import React from "./react-global.js";

const paths = {
  route: (
    <>
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8.5 6h5a4 4 0 0 1 0 8h-3a3 3 0 0 0 0 6H13" />
    </>
  ),
  compare: (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="8" cy="7" r="2.5" fill="currentColor" />
      <circle cx="16" cy="17" r="2.5" fill="currentColor" />
    </>
  ),
  pin: (
    <>
      <path d="M19.5 10c0 5.2-7.5 11.5-7.5 11.5S4.5 15.2 4.5 10a7.5 7.5 0 0 1 15 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  origin: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
    </>
  ),
  swap: (
    <>
      <path d="M8 19V5m-4 4 4-4 4 4M16 5v14m-4-4 4 4 4-4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 10.5h17M8 3v4M16 3v4" />
    </>
  ),
  weight: (
    <>
      <path d="M5 8.5h14l2 12H3l2-12Z" />
      <circle cx="12" cy="6" r="2.5" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 10 5-10 5L2 8l10-5Zm-9 10 9 4.5 9-4.5m-18 5L12 22l9-4.5" />
    </>
  ),
  wind: (
    <>
      <path d="M2 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M2 16h6a3 3 0 1 1-3 3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5v6l4 2.5" />
    </>
  ),
  road: (
    <>
      <path d="M8 3 3 21m13-18 5 18M12 4v3m0 3v4m0 4v3" />
    </>
  ),
  fuel: (
    <>
      <path d="M3 21V4h10v17M2 21h12M3 10h10m0 3h2c1.5 0 2 1 2 2.5v2.2a2 2 0 0 0 4 0V9l-3.5-4M19 7v4h2" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-3 5-5 3 3-5 5-3Z" />
    </>
  ),
  focus: (
    <>
      <path d="M4 9V4h5m6 0h5v5m0 6v5h-5M9 20H4v-5" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <path d="M8 5v14m8-14v14" strokeWidth="4" />
    </>
  ),
  shield: (
    <>
      <path d="m12 2.5 8 3.5v5.5c0 5-4 8.4-8 10-4-1.6-8-5-8-10V6l8-3.5Z" />
      <path d="m8.5 11.5 2.4 2.4 4.8-5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10.5v6M12 7v.1" />
    </>
  ),
  chevron: <path d="m7 10 5 5 5-5" />,
  map: (
    <>
      <path d="M3 5 9 3l6 3 6-2v15l-6 2-6-3-6 2V5Zm6-2v15m6-12v15" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  cross: <path d="m6 6 12 12M18 6 6 18" />,
  truck: (
    <>
      <path d="M2 5h13v12H2V5Zm13 5h4l3 4v3h-7" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
};
export function Icon({ name, size = 18, ...rest }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
export function Logo() {
  return (
    <svg
      aria-hidden="true"
      className="logo"
      width="36"
      height="36"
      viewBox="0 0 36 36"
    >
      <rect width="36" height="36" rx="9" fill="#b9f599" />
      <path
        d="M7 27 15.7 8h4.6l-8.7 19Zm10.7 0 2.1-4.7h7.7l2.1 4.7ZM21 19.4l2.5-5.5 2.5 5.5Z"
        fill="#173e34"
      />
    </svg>
  );
}
