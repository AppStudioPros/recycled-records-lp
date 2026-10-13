export default function VinylStamp() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="stamp"
      aria-label="Buy, sell, listen. Boulder, Colorado. 33⅓ RPM"
      role="img"
    >
      <defs>
        {/* Top arc — centered in black vinyl ring (midpoint r=72) */}
        <path id="top-arc" d="M 28 100 A 72 72 0 0 1 172 100" fill="none" />
        {/* Bottom arc — centered in black vinyl ring */}
        <path id="bot-arc" d="M 28 100 A 72 72 0 0 0 172 100" fill="none" />

        <radialGradient id="vinyl-shine" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#2c2c2c" />
          <stop offset="100%" stopColor="#090909" />
        </radialGradient>
        <radialGradient id="label-g" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#d46038" />
          <stop offset="100%" stopColor="#9e3215" />
        </radialGradient>
      </defs>

      {/* ── Vinyl body ───────────────────── */}
      <circle cx="100" cy="100" r="98" fill="#090909" />
      <circle cx="100" cy="100" r="97" fill="url(#vinyl-shine)" />
      <circle cx="100" cy="100" r="97" fill="none" stroke="#2a2a2a" strokeWidth="1.2" />

      {/* Groove rings */}
      {[91, 84, 77, 70, 63, 56, 50].map(r => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#181818" strokeWidth="0.7" />
      ))}

      {/* ── Center label ─────────────────── */}
      <circle cx="100" cy="100" r="47" fill="#111" stroke="#1e1e1e" strokeWidth="1" />
      <circle cx="100" cy="100" r="44" fill="url(#label-g)" />
      <circle cx="100" cy="100" r="13" fill="#6e2010" />
      <circle cx="100" cy="100" r="11" fill="#4a1508" />
      <circle cx="100" cy="100" r="5.5" fill="#050505" />

      {/* ── BUY · SELL · LISTEN top arc ──── */}
      <text
        fontSize="14"
        fill="white"
        fontFamily="Georgia,'Times New Roman',serif"
        letterSpacing="4"
        fontWeight="700"
      >
        <textPath href="#top-arc" startOffset="50%" textAnchor="middle">
          BUY · SELL · LISTEN
        </textPath>
      </text>

      {/* ── BOULDER, CO bottom arc ────────── */}
      <text
        fontSize="13"
        fill="white"
        fontFamily="Georgia,'Times New Roman',serif"
        letterSpacing="3.5"
        fontWeight="700"
      >
        <textPath href="#bot-arc" startOffset="50%" textAnchor="middle">
          BOULDER, CO
        </textPath>
      </text>

      {/* ── Label center text ─────────────── */}
      <text
        x="100"
        y="99"
        textAnchor="middle"
        fill="white"
        fontSize="26"
        fontFamily="Georgia,'Times New Roman',serif"
        fontWeight="800"
        opacity="0.95"
      >
        33⅓
      </text>
      <text
        x="100"
        y="118"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontFamily="Georgia,serif"
        letterSpacing="4"
        opacity="0.8"
      >
        RPM
      </text>
    </svg>
  )
}
