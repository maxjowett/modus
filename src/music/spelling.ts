import { OCTAVE, type PitchClass, toPitchClass } from "./notes";
import type { Scale } from "./scales";

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
/** Pitch class of each natural letter. */
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];

const ACCIDENTALS: Record<number, string> = {
	[-2]: "𝄫",
	[-1]: "♭",
	0: "",
	1: "♯",
	2: "𝄪",
};

interface Spelling {
	letter: number; // index into LETTERS
	accidental: number; // −2…+2
}

function format({ letter, accidental }: Spelling): string {
	return LETTERS[letter] + ACCIDENTALS[accidental];
}

/** The accidental that turns `letter` into `pc`, or null if it would take more than two. */
function accidentalFor(letter: number, pc: PitchClass): number | null {
	let diff = toPitchClass(pc - LETTER_PC[letter]);
	if (diff > OCTAVE / 2) diff -= OCTAVE;
	return Math.abs(diff) <= 2 ? diff : null;
}

/** Ways to write a root: its natural letter, or the sharp below and flat above. */
function rootSpellings(root: PitchClass): Spelling[] {
	const natural = LETTER_PC.indexOf(root);
	if (natural !== -1) return [{ letter: natural, accidental: 0 }];
	const below = LETTER_PC.indexOf(toPitchClass(root - 1));
	const above = LETTER_PC.indexOf(toPitchClass(root + 1));
	return [
		{ letter: below, accidental: 1 },
		{ letter: above, accidental: -1 },
	];
}

/** 1–7 for a 7-note scale; otherwise the scale's own degree table. */
function degreesOf(scale: Scale): number[] {
	if (scale.degrees) return scale.degrees;
	if (scale.intervals.length === 7) return [1, 2, 3, 4, 5, 6, 7];
	throw new Error(`Scale "${scale.id}" needs a degrees table to be spelled`);
}

function spellFrom(rootSpelling: Spelling, scale: Scale): Spelling[] | null {
	const root = toPitchClass(
		LETTER_PC[rootSpelling.letter] + rootSpelling.accidental,
	);
	const spelled: Spelling[] = [];
	for (const [i, degree] of degreesOf(scale).entries()) {
		const letter = (rootSpelling.letter + degree - 1) % LETTERS.length;
		const accidental = accidentalFor(
			letter,
			toPitchClass(root + scale.intervals[i]),
		);
		if (accidental === null) return null;
		spelled.push({ letter, accidental });
	}
	return spelled;
}

const cost = (notes: Spelling[]) =>
	notes.reduce((sum, n) => sum + Math.abs(n.accidental), 0);

export interface SpelledScale {
	root: string;
	/** One name per scale note, in scale order. */
	notes: string[];
	/** Whether the spelling leans on flats, for naming notes outside the scale. */
	flats: boolean;
}

/**
 * Names a scale's notes the way its key does: each degree gets its own letter
 * (so F major has B♭, not A♯), and a black-key root takes whichever spelling
 * needs fewer accidentals overall (B♭ major, not A♯ major). Ties go to sharps.
 */
export function spellScale(root: PitchClass, scale: Scale): SpelledScale {
	let best: Spelling[] | null = null;
	for (const candidate of rootSpellings(root)) {
		const notes = spellFrom(candidate, scale);
		if (notes && (!best || cost(notes) < cost(best))) best = notes;
	}
	if (!best) throw new Error(`Cannot spell ${scale.id} on ${root}`);
	return {
		root: format(best[0]),
		notes: best.map(format),
		flats: best.some((n) => n.accidental < 0),
	};
}

const SHARP_NAMES = [
	"C",
	"C♯",
	"D",
	"D♯",
	"E",
	"F",
	"F♯",
	"G",
	"G♯",
	"A",
	"A♯",
	"B",
];
const FLAT_NAMES = [
	"C",
	"D♭",
	"D",
	"E♭",
	"E",
	"F",
	"G♭",
	"G",
	"A♭",
	"A",
	"B♭",
	"B",
];

/** Every common name for a note: ["A"], or ["A♯", "B♭"] for a black key. */
export function bothNames(pc: PitchClass): string[] {
	const sharp = SHARP_NAMES[pc];
	const flat = FLAT_NAMES[pc];
	return sharp === flat ? [sharp] : [sharp, flat];
}

/** A single note's name, using flats or sharps for black keys. */
export function spellNote(pc: PitchClass, flats: boolean): string {
	return (flats ? FLAT_NAMES : SHARP_NAMES)[pc];
}
