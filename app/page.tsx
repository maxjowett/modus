"use client";

import { useState } from "react";
import { MODES, MODE_MAP } from "./static/modes";

export default function Home() {
  const [selectedModeIndex, setSelectedModeIndex] = useState(0);

  const handleModeSwitch = (direction: "next" | "previous") => {
    if (direction === "next") {
      if (selectedModeIndex < MODES.length - 1) {
        setSelectedModeIndex(selectedModeIndex + 1);
      } else {
        setSelectedModeIndex(0);
      }
    } else {
      if (selectedModeIndex > 0) {
        setSelectedModeIndex(selectedModeIndex - 1);
      } else {
        setSelectedModeIndex(MODES.length - 1);
      }
    }
  };

  return (
    <div className="flex h-screen">
      <div className="max-w-6xl m-auto">
        <div className="grid grid-col-1 col-2">
          <div className="text-center">
            <h1 className="title-header text-7xl">
              {MODES[selectedModeIndex].name}
            </h1>
          </div>
          <div>
            <div>
              <h1 className="text-9xl description">{MODE_MAP[selectedModeIndex + 1]}</h1>
            </div>
            <h1 className="description text-1xl text-center">
              {MODES[selectedModeIndex].description}
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-2 mt-24">
          <div>
            <button
              className="button ml-16"
              onClick={() => handleModeSwitch("previous")}
            >
              Previous
            </button>
          </div>
          <div className="text-right mr-16">
            <button className="button" onClick={() => handleModeSwitch("next")}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
