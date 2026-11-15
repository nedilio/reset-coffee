import { cn } from "@/lib/utils";
import {
  COFFEE_GROUP_TRANSFORM,
  COFFEE_PATHS,
  COFFEE_VIEWBOX,
} from "@/lib/coffee-paths";

const CoffeeSVG = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={COFFEE_VIEWBOX.width}
      height={COFFEE_VIEWBOX.height}
      viewBox={`0 0 ${COFFEE_VIEWBOX.width} ${COFFEE_VIEWBOX.height}`}
      className={cn("text-[#3c5a41]", className)}
    >
      {/* No clipPath here: a fixed id like "a" is shared by every instance on the page,
          so re-rendering one icon broke all the others (and the clip covered the whole viewBox). */}
      <g transform={COFFEE_GROUP_TRANSFORM}>
        {COFFEE_PATHS.map(({ d, transform }) => (
          <path
            key={transform}
            d={d}
            transform={transform}
            style={{ fill: "currentColor", fillOpacity: 1, fillRule: "nonzero", stroke: "none" }}
          />
        ))}
      </g>
    </svg>
  );
};

export default CoffeeSVG;
