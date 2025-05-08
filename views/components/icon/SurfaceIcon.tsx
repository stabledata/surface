interface SurfaceIconProps {
  className?: string;
}

export function SurfaceIcon({ className = "" }: SurfaceIconProps) {
  return (
    <svg
      viewBox="-4.466 116.828 61.577 61.138"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={80}
      height={80}
    >
      <rect
        x="166.216"
        y="102.242"
        width="155.193"
        height="166.573"
        style={{
          fill: "none",
          strokeLinejoin: "round",
          strokeWidth: "15.283px",
          stroke: "currentColor",
        }}
        rx="77.596"
        ry="77.596"
        transform="matrix(0.3396560251712799, 0, 0, 0.3146670162677765, -56.51739501953126, 88.97167205810547)"
      />
      <path
        style={{
          fill: "none",
          strokeWidth: "18.8345px",
          stroke: "currentColor",
          transformBox: "fill-box",
          transformOrigin: "50% 50%",
        }}
        d="M 166.62 185.639 C 186.639 185.382 192.877 175.819 215.3 175.819 C 243.873 175.819 250.051 184.723 270.616 184.723 C 300.248 184.723 308.107 174.724 319.324 174.695"
        transform="matrix(0.339656054974, 0, 0, 0.314667016268, -216.962484111094, -34.502720725166)"
      />
      <path
        style={{
          fill: "currentColor",
          stroke: "currentColor",
          transformBox: "fill-box",
          transformOrigin: "50% 50%",
        }}
        d="M 9.508 144.43 L 16.562 143.888 L 16.566 172.932 L 9.963 169.683 L 9.508 144.43 Z"
      />
      <path
        style={{
          fill: "currentColor",
          stroke: "currentColor",
          transformBox: "fill-box",
          transformOrigin: "50% 50%",
        }}
        d="M 22.996 145.384 L 30.198 146.246 L 29.995 173.083 L 22.996 173.083 L 22.996 145.384 Z"
      />
      <path
        style={{
          fill: "currentColor",
          stroke: "currentColor",
          transformBox: "fill-box",
          transformOrigin: "50% 50%",
        }}
        d="M 36.771 146.713 L 43.888 147.532 L 43.501 168.605 L 36.771 173.012 L 36.771 146.713 Z"
      />
    </svg>
  );
}
