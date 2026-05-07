import React from "react";

export const LotusIcon = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g transform="translate(3, 0)">
      {/* Bottom Left Petal (Horizontal spread) */}
      <path d="M50 85C35 85 20 82 20 70C20 58 40 60 50 85Z" fill="#FF4D00" />
      <path d="M50 85C42 80 28 75 28 70C28 65 40 65 50 85Z" fill="#FF8A50" />

      {/* Bottom Right Petal (Horizontal spread) */}
      <path d="M50 85C65 85 80 82 80 70C80 58 60 60 50 85Z" fill="#FF8A50" />
      <path d="M50 85C58 80 72 75 72 70C72 65 60 65 50 85Z" fill="#FF4D00" />

      {/* Mid Left Petal (45 deg) */}
      <path d="M50 85C35 75 25 55 28 45C31 35 45 45 50 85Z" fill="#FF4D00" />
      <path d="M50 85C42 75 35 62 36 53C37 43 45 50 50 85Z" fill="#FF8A50" />

      {/* Mid Right Petal (45 deg) */}
      <path d="M50 85C65 75 75 55 72 45C69 35 55 45 50 85Z" fill="#FF8A50" />
      <path d="M50 85C58 75 65 62 64 53C63 43 55 50 50 85Z" fill="#FF4D00" />

      {/* Center Petal (Vertical) */}
      <path d="M50 85c-15-10-18-40 0-55V85Z" fill="#FF4D00" />
      <path d="M50 85c15-10 18-40 0-55V85Z" fill="#FF8A50" />
    </g>
  </svg>
);
