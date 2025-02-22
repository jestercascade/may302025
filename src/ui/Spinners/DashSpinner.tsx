const DEFAULT_SIZE = 40;
const DEFAULT_COLOR = "currentColor";

export function DashSpinner({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <div className="animate-rotate" style={{ width: size, height: size }}>
      <svg viewBox="22 22 44 44">
        <circle
          className="animate-dash"
          cx="44"
          cy="44"
          r="20.2"
          fill="none"
          stroke={color}
          strokeWidth="3.6"
        ></circle>
      </svg>
    </div>
  );
}
