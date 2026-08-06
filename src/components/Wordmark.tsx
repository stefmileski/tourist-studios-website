'use client'

interface WordmarkProps {
  color?: string
  width?: number
  stacked?: boolean
}

export default function Wordmark({ color = 'currentColor', width = 200, stacked = true }: WordmarkProps) {
  if (stacked) {
    const h = width * (216 / 560)
    return (
      <svg width={width} height={h} viewBox="0 0 560 216" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Tourist Studios">
        <defs>
          <g id="wm-T"><path fill={color} d="M 0 0 H 80 V 22 H 51 V 100 H 29 V 22 H 0 Z" /></g>
          <g id="wm-O"><path fill={color} fillRule="evenodd" d="M 10 0 H 80 L 90 10 V 90 L 80 100 H 10 L 0 90 V 10 Z M 28 22 H 62 L 68 28 V 72 L 62 78 H 28 L 22 72 V 28 Z" /></g>
          <g id="wm-U"><path fill={color} d="M 0 10 L 10 0 H 22 V 78 Q 22 88 32 88 H 56 Q 66 88 66 78 V 0 H 78 L 88 10 V 88 Q 88 100 78 100 H 10 Q 0 100 0 88 Z" /></g>
          <g id="wm-R"><path fill={color} fillRule="evenodd" d="M 0 0 H 66 C 80 0 90 10 90 22 C 90 34 80 44 66 44 H 32 L 22 54 L 90 100 H 51 L 22 80 V 100 H 0 Z M 22 12 H 54 C 64 12 68 16 68 22 C 68 28 64 32 54 32 H 22 Z" /></g>
          <g id="wm-I"><path fill={color} d="M 0 0 H 30 V 100 H 0 Z" /></g>
          <g id="wm-S"><path fill={color} d="M 0 0 H 70 L 80 10 V 22 H 22 V 39 H 80 V 100 H 10 L 0 90 V 78 H 58 V 61 H 0 V 0 Z" /></g>
          <g id="wm-D"><path fill={color} fillRule="evenodd" d="M 0 0 H 60 C 78 0 88 10 88 26 V 74 C 88 90 78 100 60 100 H 0 Z M 22 12 H 54 C 64 12 66 18 66 26 V 74 C 66 82 64 88 54 88 H 22 Z" /></g>
        </defs>
        {/* TOURIST */}
        <use href="#wm-T" x="0"   y="0" />
        <use href="#wm-O" x="84"  y="0" />
        <use href="#wm-U" x="178" y="0" />
        <use href="#wm-R" x="270" y="0" />
        <use href="#wm-I" x="362" y="0" />
        <use href="#wm-S" x="396" y="0" />
        <use href="#wm-T" x="480" y="0" />
        {/* STUDIOS */}
        <use href="#wm-S" x="0"   y="116" />
        <use href="#wm-T" x="84"  y="116" />
        <use href="#wm-U" x="168" y="116" />
        <use href="#wm-D" x="260" y="116" />
        <use href="#wm-I" x="352" y="116" />
        <use href="#wm-O" x="386" y="116" />
        <use href="#wm-S" x="480" y="116" />
      </svg>
    )
  }

  // Single line
  const h = width * (100 / 1126)
  return (
    <svg width={width} height={h} viewBox="0 0 1126 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Tourist Studios">
      <defs>
        <g id="wml-T"><path fill={color} d="M 0 0 H 80 V 22 H 51 V 100 H 29 V 22 H 0 Z" /></g>
        <g id="wml-O"><path fill={color} fillRule="evenodd" d="M 10 0 H 80 L 90 10 V 90 L 80 100 H 10 L 0 90 V 10 Z M 28 22 H 62 L 68 28 V 72 L 62 78 H 28 L 22 72 V 28 Z" /></g>
        <g id="wml-U"><path fill={color} d="M 0 10 L 10 0 H 22 V 78 Q 22 88 32 88 H 56 Q 66 88 66 78 V 0 H 78 L 88 10 V 88 Q 88 100 78 100 H 10 Q 0 100 0 88 Z" /></g>
        <g id="wml-R"><path fill={color} fillRule="evenodd" d="M 0 0 H 66 C 80 0 90 10 90 22 C 90 34 80 44 66 44 H 32 L 22 54 L 90 100 H 51 L 22 80 V 100 H 0 Z M 22 12 H 54 C 64 12 68 16 68 22 C 68 28 64 32 54 32 H 22 Z" /></g>
        <g id="wml-I"><path fill={color} d="M 0 0 H 30 V 100 H 0 Z" /></g>
        <g id="wml-S"><path fill={color} d="M 0 0 H 70 L 80 10 V 22 H 22 V 39 H 80 V 100 H 10 L 0 90 V 78 H 58 V 61 H 0 V 0 Z" /></g>
        <g id="wml-D"><path fill={color} fillRule="evenodd" d="M 0 0 H 60 C 78 0 88 10 88 26 V 74 C 88 90 78 100 60 100 H 0 Z M 22 12 H 54 C 64 12 66 18 66 26 V 74 C 66 82 64 88 54 88 H 22 Z" /></g>
      </defs>
      <use href="#wml-T" x="0"    y="0" />
      <use href="#wml-O" x="84"   y="0" />
      <use href="#wml-U" x="178"  y="0" />
      <use href="#wml-R" x="270"  y="0" />
      <use href="#wml-I" x="362"  y="0" />
      <use href="#wml-S" x="396"  y="0" />
      <use href="#wml-T" x="480"  y="0" />
      <use href="#wml-S" x="566"  y="0" />
      <use href="#wml-T" x="650"  y="0" />
      <use href="#wml-U" x="734"  y="0" />
      <use href="#wml-D" x="826"  y="0" />
      <use href="#wml-I" x="918"  y="0" />
      <use href="#wml-O" x="952"  y="0" />
      <use href="#wml-S" x="1046" y="0" />
    </svg>
  )
}
