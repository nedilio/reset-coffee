"use client";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";

function Confetti() {
  return <Fireworks autorun={{ speed: 3, duration: 2000 }} />;
}

export default Confetti;
