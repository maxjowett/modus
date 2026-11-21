import { toPitchClass } from "./notes";

/** Display order of the scale families. */
export const FAMILY_ORDER = [
	"Major modes",
	"Pentatonic & blues",
	"Harmonic minor",
	"Melodic minor",
	"Symmetric",
	"Other",
] as const;

export type ScaleFamily = (typeof FAMILY_ORDER)[number];

export interface Scale {
	id: string;
	name: string;
	family: ScaleFamily;
	/** Semitones above the root, ascending, starting at 0. */
	intervals: number[];
}

/** Every rotation of a 7-note parent scale, named in order. */
function modesOf(
	parent: number[],
	family: ScaleFamily,
	names: [id: string, name: string][],
): Scale[] {
	return names.map(([id, name], degree) => {
		const offset = parent[degree];
		const intervals = parent
			.map((step) => toPitchClass(step - offset))
			.sort((a, b) => a - b);
		return { id, name, family, intervals };
	});
}

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11];
const MELODIC_MINOR = [0, 2, 3, 5, 7, 9, 11];

export const SCALES: Scale[] = [
	...modesOf(MAJOR, "Major modes", [
		["ionian", "Major (Ionian)"],
		["dorian", "Dorian"],
		["phrygian", "Phrygian"],
		["lydian", "Lydian"],
		["mixolydian", "Mixolydian"],
		["aeolian", "Natural minor (Aeolian)"],
		["locrian", "Locrian"],
	]),
	{
		id: "major-pentatonic",
		name: "Major pentatonic",
		family: "Pentatonic & blues",
		intervals: [0, 2, 4, 7, 9],
	},
	{
		id: "minor-pentatonic",
		name: "Minor pentatonic",
		family: "Pentatonic & blues",
		intervals: [0, 3, 5, 7, 10],
	},
	{
		id: "major-blues",
		name: "Major blues",
		family: "Pentatonic & blues",
		intervals: [0, 2, 3, 4, 7, 9],
	},
	{
		id: "minor-blues",
		name: "Minor blues",
		family: "Pentatonic & blues",
		intervals: [0, 3, 5, 6, 7, 10],
	},
	...modesOf(HARMONIC_MINOR, "Harmonic minor", [
		["harmonic-minor", "Harmonic minor"],
		["locrian-nat6", "Locrian ♮6"],
		["ionian-sharp5", "Ionian ♯5"],
		["dorian-sharp4", "Dorian ♯4"],
		["phrygian-dominant", "Phrygian dominant"],
		["lydian-sharp2", "Lydian ♯2"],
		["super-locrian-bb7", "Super Locrian ♭♭7"],
	]),
	...modesOf(MELODIC_MINOR, "Melodic minor", [
		["melodic-minor", "Melodic minor"],
		["dorian-b2", "Dorian ♭2"],
		["lydian-augmented", "Lydian augmented"],
		["lydian-dominant", "Lydian dominant"],
		["mixolydian-b6", "Mixolydian ♭6"],
		["locrian-nat2", "Locrian ♮2"],
		["altered", "Altered (Super Locrian)"],
	]),
	{
		id: "whole-tone",
		name: "Whole tone",
		family: "Symmetric",
		intervals: [0, 2, 4, 6, 8, 10],
	},
	{
		id: "diminished-hw",
		name: "Diminished (half-whole)",
		family: "Symmetric",
		intervals: [0, 1, 3, 4, 6, 7, 9, 10],
	},
	{
		id: "diminished-wh",
		name: "Diminished (whole-half)",
		family: "Symmetric",
		intervals: [0, 2, 3, 5, 6, 8, 9, 11],
	},
	{
		id: "double-harmonic",
		name: "Double harmonic",
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
	},
	{ id: "in", name: "In", family: "Other", intervals: [0, 1, 5, 7, 8] },
	{ id: "yo", name: "Yo", family: "Other", intervals: [0, 2, 5, 7, 9] },
	{
		id: "bebop-dominant",
		name: "Bebop dominant",
		family: "Other",
		intervals: [0, 2, 4, 5, 7, 9, 10, 11],
	},
];
