"use client";

import { useState } from "react";
import { MODES } from "./static/modes";

export default function Home() {
  const [selectedModeIndex, setSelectedModeIndex] = useState(0);

  return (
    <main>
      <div className="max-w-6xl m-auto">
        <h1 className="text-3xl">{MODES[selectedModeIndex].name}</h1>
        <h1 className="text-1xl">{MODES[selectedModeIndex].description}</h1>
        <p></p>
      </div>
    </main>
  );
}
