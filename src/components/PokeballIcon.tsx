interface Props {
  size?: number;
  className?: string;
}

export function PokeballIcon({ size = 40, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top half - red */}
      <path d="M 50 5 A 45 45 0 0 1 95 50 L 65 50 A 15 15 0 0 0 35 50 L 5 50 A 45 45 0 0 1 50 5 Z" fill="hsl(0, 75%, 45%)" />
      {/* Bottom half - white */}
      <path d="M 5 50 A 45 45 0 0 0 95 50 L 65 50 A 15 15 0 0 1 35 50 L 5 50 Z" fill="hsl(0, 0%, 92%)" />
      {/* Center band */}
      <rect x="5" y="47" width="90" height="6" rx="1" fill="hsl(0, 0%, 15%)" />
      {/* Center circle outer */}
      <circle cx="50" cy="50" r="14" fill="hsl(0, 0%, 15%)" />
      {/* Center circle inner */}
      <circle cx="50" cy="50" r="10" fill="hsl(0, 0%, 92%)" />
      {/* Center button */}
      <circle cx="50" cy="50" r="6" fill="hsl(0, 0%, 80%)" stroke="hsl(0, 0%, 15%)" strokeWidth="2" />
      {/* Highlight */}
      <ellipse cx="38" cy="28" rx="12" ry="8" fill="hsl(0, 0%, 100%)" opacity="0.3" transform="rotate(-20, 38, 28)" />
      {/* Outline */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(0, 0%, 15%)" strokeWidth="4" />
    </svg>
  );
}
