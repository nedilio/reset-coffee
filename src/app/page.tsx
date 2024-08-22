import { range } from "@/lib";
import { IconCoffee } from "@tabler/icons-react";

export default async function Home() {
  const coffees = Math.floor(Math.random() * 8) + 1;
  return (
    <div>
      <h2>The reset Club</h2>
      Total cafes: {coffees}
      <div className="grid grid-cols-2 gap-4">
        {range(8).map((coffee, i) => {
          if (i < coffees) {
            return (
              <div key={i} className="size-14 ">
                <IconCoffee stroke={1.5} size={50} />
              </div>
            );
          }
          return (
            <div key={i} className="size-14 opacity-10">
              <IconCoffee stroke={1} size={50} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
