import { describe, expect, it } from "vitest";
import { findCompatibleScales } from "./match";
import {
	ALL_PITCH_CLASSES,
	OCTAVE,
	type PitchClassName,
	pitchClassFromName,
	pitchClassName,
} from "./notes";
import { FAMILY_ORDER, SCALES } from "./scales";

function groupOf(...names: PitchClassName[]) {
	return new Set(names.map(pitchClassFromName));
}

function matchNames(...names: PitchClassName[]): string[] {
	return findCompatibleScales(groupOf(...names)).flatMap(({ matches }) =>
		matches.map((m) => `${pitchClassName(m.root)} ${m.scale.id}`),
	);
}

describe("findCompatibleScales", () => {
	it("C major triad fits C major and A minor", () => {
		const result = matchNames("C", "E", "G");
		expect(result).toContain("C ionian");
		expect(result).toContain("A aeolian");
		expect(result).not.toContain("C aeolian");
	});

	it("diminished triad fits diminished scales but not C major", () => {
		const result = matchNames("C", "D#", "F#");
		expect(result).toContain("C diminished-wh");
		expect(result).not.toContain("C ionian");
	});

	it("E major triad fits E major and C# minor but not E minor", () => {
		const result = matchNames("E", "G#", "B");
		expect(result).toContain("E ionian");
		expect(result).toContain("C# aeolian");
		expect(result).not.toContain("E aeolian");
	});

	it("returns nothing for an empty group", () => {
		expect(findCompatibleScales(new Set())).toEqual([]);
	});

	it("returns nothing for all 12 notes", () => {
		expect(findCompatibleScales(new Set(ALL_PITCH_CLASSES))).toEqual([]);
	});

	it("groups by family in display order", () => {
		const families = findCompatibleScales(groupOf("C")).map((f) => f.family);
		expect(families).toEqual([...FAMILY_ORDER]);
	});

	it("sorts tighter fits first within each family", () => {
		for (const { matches } of findCompatibleScales(groupOf("C", "E", "G"))) {
			for (let i = 1; i < matches.length; i++) {
				expect(matches[i].extraNotes).toBeGreaterThanOrEqual(
					matches[i - 1].extraNotes,
				);
			}
		}
	});
});

describe("SCALES", () => {
	it.each(SCALES.map((s) => [s.id, s.intervals]))(
		"%s intervals are valid",
		(_, intervals) => {
			expect(intervals[0]).toBe(0);
			for (let i = 1; i < intervals.length; i++) {
				expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
				expect(intervals[i]).toBeLessThan(OCTAVE);
			}
		},
	);

	it("has unique ids", () => {
		const ids = SCALES.map((s) => s.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});
