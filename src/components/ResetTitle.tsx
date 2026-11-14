import { Londrina_Solid } from "next/font/google";
import { cn } from "@/lib/utils";
const londrina = Londrina_Solid({ weight: "400", subsets: ["latin"] });

// `compact` is the phone-friendly size, used where the title must not eat the screen.
const ResetTitle = ({ compact = false }: { compact?: boolean }) => {
  return (
    <h1 className="text-center text-balance flex flex-col">
      <span
        className={cn(
          "uppercase leading-none",
          compact ? "text-xl" : "text-3xl"
        )}
      >
        The
      </span>{" "}
      <span
        className={cn(
          londrina.className,
          compact ? "text-5xl leading-[34px]" : "text-6xl leading-[45px]"
        )}
      >
        RES
        <span
          className={cn(
            compact ? "text-[64px] leading-[34px]" : "text-[85px] leading-[45px]"
          )}
        >
          e
        </span>
        T
      </span>{" "}
      <span
        className={cn(
          "uppercase",
          compact ? "text-xl leading-[30px]" : "text-3xl leading-[40px]"
        )}
      >
        Club
      </span>
    </h1>
  );
};

export default ResetTitle;
