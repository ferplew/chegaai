
import type { SVGProps } from 'react';

export function ChegaAiLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      fill="currentColor"
      aria-label="Chega Aí Logo"
      {...props}
    >
      <text
        x="100"
        y="35"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="30"
        fontWeight="bold"
        textAnchor="middle"
        className="fill-primary group-hover:fill-primary-foreground transition-colors duration-300"
      >
        Chega
        <tspan className="fill-foreground group-hover:fill-primary-foreground transition-colors duration-300"> Aí</tspan>
      </text>
    </svg>
  );
}
