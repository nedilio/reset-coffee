import { Londrina_Solid } from "next/font/google";
const londrina = Londrina_Solid({ weight: "400", subsets: ["latin"] });
const ResetTitle = () => {
  return (
    <h1 className="text-center text-balance flex flex-col">
      <span className="uppercase text-3xl leading-none">The</span>{" "}
      <span className={`text-6xl leading-[45px] ${londrina.className}`}>
        RES<span className="text-[85px] leading-[45px]">e</span>T
      </span>{" "}
      <span className="uppercase text-3xl leading-[40px]">Club</span>
    </h1>
  );
};

export default ResetTitle;
