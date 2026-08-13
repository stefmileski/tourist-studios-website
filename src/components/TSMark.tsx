'use client'

// TS monogram — the T and S letterforms from the Tourist Studios wordmark,
// used as a compact loading mark.
export default function TSMark({
  color = 'var(--crimson)',
  width = 44,
}: {
  color?: string
  width?: number
}) {
  const h = width * (100 / 174)
  return (
    <svg
      width={width}
      height={h}
      viewBox="0 0 174 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Loading"
    >
      <path fill={color} d="M 0 0 H 80 V 22 H 51 V 100 H 29 V 22 H 0 Z" />
      <path
        fill={color}
        transform="translate(94 0)"
        d="M 0 0 H 70 L 80 10 V 22 H 22 V 39 H 80 V 100 H 10 L 0 90 V 78 H 58 V 61 H 0 V 0 Z"
      />
    </svg>
  )
}
