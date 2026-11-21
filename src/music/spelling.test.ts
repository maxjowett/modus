import { describe, expect, it } from "vitest";
import {
	ALL_PITCH_CLASSES,
	type PitchClassName,
	pitchClassFromName,
	toPitchClass,
} from "./notes";
import { SCALES } from "./scales";
import { spellNote, spellScale } from "./spelling";

const scale = (id: string) => {
	const found = SCALES.find((s) => s.id === id);
	if (!found) throw new Error(id);
	return found;
};
const spell = (root: PitchClassName, id: string) =>
	spellScale(pitchClassFromName(root), scale(id));

/** Pitch class of a spelled name like "B♭" or "F𝄪". */
function pcOf(name: string): number {
	const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[name[0]] ?? NaN;
	const shift = { "": 0, "♯": 1, "♭": -1, "𝄪": 2, "𝄫": -2 }[name.slice(1)];
	return toPitchClass(base + (shift ?? NaN));
}

describe("spellScale", () => {
	it("spells F major with B♭, not A♯", () => {
		expect(spell("F", "ionian").notes).toEqual([
			"F",
			"G",
			"A",
			"B♭",
			"C",
			"D",
			"E",
		]);
	});

	it("picks the root spelling with fewer accidentals", () => {
		expect(spell("A#", "ionian").root).toBe("B♭");
		expect(spell("C#", "ionian").root).toBe("D♭");
		expect(spell("G#", "ionian").root).toBe("A♭");
		expect(spell("D#", "harmonic-minor").root).toBe("E♭");
	});

	it("prefers sharps when both spellings are equally busy", () => {
		expect(spell("F#", "ionian").root).toBe("F♯");
	});

	it("keeps sharp keys sharp", () => {
		expect(spell("E", "ionian").notes).toEqual([
			"E",
			"F♯",
			"G♯",
			"A",
			"B",
			"C♯",
			"D♯",
		]);
	});

	it("spells the blue notes of a blues scale as flats", () => {
		expect(spell("C", "major-blues").notes).toEqual([
			"C",
			"D",
			"E♭",
			"E",
			"G",
			"A",
		]);
		expect(spell("A", "minor-blues").notes).toEqual([
			"A",
			"C",
			"D",
			"E♭",
			"E",
			"G",
		]);
	});

	it("names every note of every scale on every root correctly", () => {
		for (const s of SCALES) {
			for (const root of ALL_PITCH_CLASSES) {
				const { notes } = spellScale(root, s);
				expect(notes.map(pcOf)).toEqual(
					s.intervals.map((i) => toPitchClass(root + i)),
				);
			}
		}
	});

	it("uses each letter once in key-based scales", () => {
		const keyFamilies = ["Major", "Harmonic minor", "Melodic minor"];
		for (const s of SCALES.filter((s) => keyFamilies.includes(s.family))) {
			for (const root of ALL_PITCH_CLASSES) {
				const letters = spellScale(root, s).notes.map((n) => n[0]);
				expect(new Set(letters).size).toBe(7);
			}
		}
	});
});

describe("practical spelling outside key-based scales", () => {
	it("spells F minor blues with B, not C♭", () => {
		expect(spell("F", "minor-blues").notes).toEqual([
			"F",
			"A♭",
			"B♭",
			"B",
			"C",
			"E♭",
		]);
	});

	it("names the root as its nearest major or minor key does", () => {
		expect(spell("A#", "minor-blues").root).toBe("B♭");
		expect(spell("C#", "major-blues").root).toBe("D♭");
		expect(spell("C#", "minor-pentatonic").root).toBe("C♯");
	});

	it("never uses C♭, F♭, E♯, B♯ or double accidentals", () => {
		const awkward = /^(C♭|F♭|E♯|B♯)$|𝄪|𝄫/;
		const keyFamilies = ["Major", "Harmonic minor", "Melodic minor"];
		for (const s of SCALES.filter((s) => !keyFamilies.includes(s.family))) {
			for (const root of ALL_PITCH_CLASSES) {
				const odd = spellScale(root, s).notes.filter((n) => awkward.test(n));
				expect(odd, `${s.id} on ${root}`).toEqual([]);
			}
		}
	});

	it("keeps strict theory spelling in key-based scales", () => {
		expect(spell("F#", "ionian").notes).toContain("E♯");
		expect(spell("G#", "harmonic-minor").notes).toContain("F𝄪");
	});
});

describe("spellNote", () => {
	it("names black keys with sharps or flats", () => {
		expect(spellNote(pitchClassFromName("A#"), true)).toBe("B♭");
		expect(spellNote(pitchClassFromName("A#"), false)).toBe("A♯");
		expect(spellNote(pitchClassFromName("E"), true)).toBe("E");
	});
});
