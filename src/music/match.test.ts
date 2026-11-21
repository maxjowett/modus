import { describe, expect, it } from "vitest";
import { findCompatibleScales } from "./match";
import {
	ALL_PITCH_CLASSES,
	OCTAVE,
	type PitchClassName,
	pitchClassFromName,
	pitchClassName,
} from "./notes";
import { FAMILY_ORDER, isParentScale, SCALES } from "./scales";

function groupOf(...names: PitchClassName[]) {
	return new Set(names.map(pitchClassFromName));
}

function matchNames(...names: PitchClassName[]): string[] {
	return findCompatibleScales(groupOf(...names)).flatMap(({ matches }) =>
		matches.map((m) => `${pitchClassName(m.root)} ${m.scale.id}`),
	);
}

describe("findCompatibleScales", () => {
	it("C major triad fits C, F and G major but not E♭ major", () => {
		const result = matchNames("C", "E", "G");
		expect(result).toContain("C ionian");
		expect(result).toContain("F ionian");
		expect(result).toContain("G ionian");
		expect(result).not.toContain("D# ionian");
	});

	it("shows only the parent scale, not its other modes", () => {
		const result = findCompatibleScales(groupOf("C", "E", "G")).flatMap(
			({ matches }) => matches,
		);
		expect(result.every((m) => isParentScale(m.scale))).toBe(true);
		expect(matchNames("C", "E", "G")).not.toContain("A aeolian");
	});

	it("diminished triad fits diminished scales but not C major", () => {
		const result = matchNames("C", "D#", "F#");
		expect(result).toContain("C diminished-wh");
		expect(result).not.toContain("C ionian");
	});

	it("E major triad fits E major but not G major (E minor's parent)", () => {
		const result = matchNames("E", "G#", "B");
		expect(result).toContain("E ionian");
		expect(result).not.toContain("G ionian");
	});

	it("returns nothing for an empty group", () => {
		expect(findCompatibleScales(new Set())).toEqual([]);
	});

	it("returns nothing for a single note", () => {
		expect(findCompatibleScales(groupOf("C"))).toEqual([]);
	});

	it("starts matching at two notes", () => {
		expect(matchNames("C", "G")).toContain("C ionian");
	});

	it("returns nothing for all 12 notes", () => {
		expect(findCompatibleScales(new Set(ALL_PITCH_CLASSES))).toEqual([]);
	});

	it("groups by family in display order", () => {
		const families = findCompatibleScales(groupOf("C", "E")).map(
			(f) => f.family,
		);
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
