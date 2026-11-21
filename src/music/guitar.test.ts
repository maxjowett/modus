import { describe, expect, it } from "vitest";
import { FRET_COUNT, fretPositions, STANDARD_TUNING } from "./guitar";
import { ALL_PITCH_CLASSES, pitchClassFromName, pitchClassName } from "./notes";

describe("fretPositions", () => {
	it("tunes the open strings to E B G D A E", () => {
		const open = fretPositions(ALL_PITCH_CLASSES).filter((p) => p.fret === 0);
		expect(open.map((p) => pitchClassName(p.pitchClass))).toEqual([
			"E",
			"B",
			"G",
			"D",
			"A",
			"E",
		]);
	});

	it("finds every A between the nut and fret 15", () => {
		const a = fretPositions([pitchClassFromName("A")]);
		expect(a.map(({ string, fret }) => [string, fret])).toEqual([
			[0, 5],
			[1, 10],
			[2, 2],
			[2, 14],
			[3, 7],
			[4, 0],
			[4, 12],
			[5, 5],
		]);
	});

	it("gives every pitch class once per octave on each string", () => {
		const all = fretPositions(ALL_PITCH_CLASSES);
		expect(all).toHaveLength(STANDARD_TUNING.length * (FRET_COUNT + 1));
	});

	it("returns nothing for an empty set", () => {
		expect(fretPositions([])).toEqual([]);
	});
});
