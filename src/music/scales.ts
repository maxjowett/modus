import { toPitchClass } from "./notes";

/** Display order of the scale families. */
export const FAMILY_ORDER = [
	"Major",
	"Pentatonic & blues",
	"Harmonic minor",
	"Melodic minor",
	"Symmetric",
	"Other",
] as const;

export type ScaleFamily = (typeof FAMILY_ORDER)[number];

export interface Scale {
	id: string;
	/** As a musician would write it after the root: "C major", "D Dorian". */
	name: string;
	/** Another common name, shown as a subtitle: "Ionian" for major. */
	altName?: string;
	family: ScaleFamily;
	/** Semitones above the root, ascending, starting at 0. */
	intervals: number[];
	/**
	 * For a mode of a 7-note parent scale, its position (1 = the parent
	 * itself). Modes share their parent's notes, so only mode 1 is matched.
	 */
	mode?: number;
	/**
	 * Which scale degree (1–7) each interval is, used to pick note letters:
	 * degree 3 of C is some kind of E. Defaults to 1–7 for 7-note scales,
	 * so required for every other size. Two intervals can share a degree,
	 * like the ♭3 and 3 of a major blues scale.
	 */
	degrees?: number[];
}

/** Every rotation of a 7-note parent scale, named in order. */
function modesOf(
	parent: number[],
	family: ScaleFamily,
	names: [id: string, name: string, altName?: string][],
): Scale[] {
	return names.map(([id, name, altName], degree) => {
		const offset = parent[degree];
		const intervals = parent
			.map((step) => toPitchClass(step - offset))
			.sort((a, b) => a - b);
		return { id, name, altName, family, intervals, mode: degree + 1 };
	});
}

/** A scale that identifies its own note set: anything except modes 2–7. */
export function isParentScale(scale: Scale): boolean {
	return scale.mode === undefined || scale.mode === 1;
}

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11];
const MELODIC_MINOR = [0, 2, 3, 5, 7, 9, 11];

export const SCALES: Scale[] = [
	...modesOf(MAJOR, "Major", [
		["ionian", "major", "Ionian"],
		["dorian", "Dorian"],
		["phrygian", "Phrygian"],
		["lydian", "Lydian"],
		["mixolydian", "Mixolydian"],
		["aeolian", "natural minor", "Aeolian"],
		["locrian", "Locrian"],
	]),
	{
		id: "major-pentatonic",
		name: "major pentatonic",
		family: "Pentatonic & blues",
		intervals: [0, 2, 4, 7, 9],
		degrees: [1, 2, 3, 5, 6],
	},
	{
		id: "minor-pentatonic",
		name: "minor pentatonic",
		family: "Pentatonic & blues",
		intervals: [0, 3, 5, 7, 10],
		degrees: [1, 3, 4, 5, 7],
	},
	{
		id: "major-blues",
		name: "major blues",
		family: "Pentatonic & blues",
		intervals: [0, 2, 3, 4, 7, 9],
		degrees: [1, 2, 3, 3, 5, 6],
	},
	{
		id: "minor-blues",
		name: "minor blues",
		family: "Pentatonic & blues",
		intervals: [0, 3, 5, 6, 7, 10],
		degrees: [1, 3, 4, 5, 5, 7],
	},
	...modesOf(HARMONIC_MINOR, "Harmonic minor", [
		["harmonic-minor", "harmonic minor"],
		["locrian-nat6", "Locrian ♮6"],
		["ionian-sharp5", "Ionian ♯5"],
		["dorian-sharp4", "Dorian ♯4"],
		["phrygian-dominant", "Phrygian dominant"],
		["lydian-sharp2", "Lydian ♯2"],
		["super-locrian-bb7", "Super Locrian ♭♭7"],
	]),
	...modesOf(MELODIC_MINOR, "Melodic minor", [
		["melodic-minor", "melodic minor"],
		["dorian-b2", "Dorian ♭2"],
		["lydian-augmented", "Lydian augmented"],
		["lydian-dominant", "Lydian dominant"],
		["mixolydian-b6", "Mixolydian ♭6"],
		["locrian-nat2", "Locrian ♮2"],
		["altered", "altered", "Super Locrian"],
	]),
	{
		id: "whole-tone",
		name: "whole tone",
		family: "Symmetric",
		intervals: [0, 2, 4, 6, 8, 10],
		degrees: [1, 2, 3, 4, 5, 7],
	},
	{
		id: "diminished-hw",
		name: "half-whole diminished",
		family: "Symmetric",
		intervals: [0, 1, 3, 4, 6, 7, 9, 10],
		degrees: [1, 2, 3, 3, 4, 5, 6, 7],
	},
	{
		id: "diminished-wh",
		name: "whole-half diminished",
		family: "Symmetric",
		intervals: [0, 2, 3, 5, 6, 8, 9, 11],
		degrees: [1, 2, 3, 4, 5, 6, 6, 7],
	},
	{
		id: "double-harmonic",
		name: "double harmonic",
		family: "Other",
		intervals: [0, 1, 4, 5, 7, 8, 11],
	},
	{
		id: "hungarian-minor",
		name: "Hungarian minor",
		family: "Other",
		intervals: [0, 2, 3, 6, 7, 8, 11],
	},
	{
		id: "neapolitan-major",
		name: "Neapolitan major",
		family: "Other",
		intervals: [0, 1, 3, 5, 7, 9, 11],
	},
	{
		id: "neapolitan-minor",
		name: "Neapolitan minor",
		family: "Other",
		intervals: [0, 1, 3, 5, 7, 8, 11],
	},
	{
		id: "hirajoshi",
		name: "Hirajoshi",
		family: "Other",
		intervals: [0, 2, 3, 7, 8],
		degrees: [1, 2, 3, 5, 6],
	},
	{
		id: "in",
		name: "In",
		family: "Other",
		intervals: [0, 1, 5, 7, 8],
		degrees: [1, 2, 4, 5, 6],
	},
	{
		id: "yo",
		name: "Yo",
		family: "Other",
		intervals: [0, 2, 5, 7, 9],
		degrees: [1, 2, 4, 5, 6],
	},
	{
		id: "bebop-dominant",
		name: "bebop dominant",
		family: "Other",
		intervals: [0, 2, 4, 5, 7, 9, 10, 11],
		degrees: [1, 2, 3, 4, 5, 6, 7, 7],
	},
];
