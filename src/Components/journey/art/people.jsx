// People at work along the journey: simple, quiet figures (about 56 units tall, feet at y = 0). The director
// swings `${j}.legA` / `${j}.legB` (about the hip) to make them walk.

const HIP = -26;

export function Person({
  j,
  x = 0,
  y = 0,
  skin = "#9A6747",
  shirt = "#2F4B62",
  trousers = "#26324A",
  vest,
  helmet,
  carry,
  flip = false,
  scale = 1,
}) {
  return (
    <g
      data-j={j}
      transform={`translate(${x} ${y})${flip ? " scale(-1 1)" : ""}${scale !== 1 ? ` scale(${scale})` : ""}`}
    >
      <ellipse cy="1" rx="14" ry="3" fill="#0B1220" opacity="0.2" />
      <g data-j={j && `${j}.legB`} transform={`translate(0 ${HIP})`}>
        <rect x="-3.5" y="0" width="7" height="26" rx="3" fill={trousers} opacity="0.85" />
      </g>
      <g data-j={j && `${j}.legA`} transform={`translate(0 ${HIP})`}>
        <rect x="-3.5" y="0" width="7" height="26" rx="3" fill={trousers} />
      </g>
      <rect x="-8" y="-50" width="16" height="27" rx="6" fill={shirt} />
      {vest && <path d="M-8 -46h16v20h-16z" fill={vest} />}
      {vest && <path d="M-8 -36h16" stroke="#F4F1EA" strokeWidth="2.2" opacity="0.9" />}
      <circle cy="-57" r="7.5" fill={skin} />
      {helmet ? (
        <path d="M-8 -58a8 8 0 0 1 16 0h3v2h-19z" fill={helmet} />
      ) : (
        <path d="M-7.5 -58a7.5 7.5 0 0 1 15 -1q-7 -4 -15 1z" fill="#2A2522" />
      )}
      {carry ? (
        <>
          <rect x="1" y="-50" width="24" height="20" fill="#C9A26E" />
          <rect x="1" y="-50" width="24" height="4" fill="#B48C58" />
          <path d="M2 -40h10" stroke={shirt} strokeWidth="5" strokeLinecap="round" />
        </>
      ) : (
        <path d="M0 -46l5 18" stroke={shirt} strokeWidth="5" strokeLinecap="round" />
      )}
    </g>
  );
}
