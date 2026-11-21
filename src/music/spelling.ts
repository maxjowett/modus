import { OCTAVE, type PitchClass, toPitchClass } from "./notes";
import type { Scale, ScaleFamily } from "./scales";

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

/** What the speller needs to know about a scale. */
type Spellable = Pick<Scale, "id" | "intervals" | "degrees">;

/** 1–7 for a 7-note scale; otherwise the scale's own degree table. */
function degreesOf(scale: Spellable): number[] {
	if (scale.degrees) return scale.degrees;
	if (scale.intervals.length === 7) return [1, 2, 3, 4, 5, 6, 7];
	throw new Error(`Scale "${scale.id}" needs a degrees table to be spelled`);
}

function spellFrom(
	rootSpelling: Spelling,
	scale: Spellable,
): Spelling[] | null {
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

/** One letter per degree, from whichever root spelling needs fewer accidentals. Ties go to sharps. */
function strictSpelling(root: PitchClass, scale: Spellable): Spelling[] {
	let best: Spelling[] | null = null;
	for (const candidate of rootSpellings(root)) {
		const notes = spellFrom(candidate, scale);
		if (notes && (!best || cost(notes) < cost(best))) best = notes;
	}
	if (!best) throw new Error(`Cannot spell ${scale.id} on ${root}`);
	return best;
}

/**
 * Families spelled strictly, one letter per degree, as theory spells keys:
 * F♯ major has E♯ and G♯ harmonic minor has F𝄪, as any chart would show.
 * Everything else is spelled practically (see spellScale).
 */
const STRICT_FAMILIES: ReadonlySet<ScaleFamily> = new Set([
	"Major",
	"Harmonic minor",
	"Melodic minor",
]);

const MAJOR_KEY: Spellable = {
	id: "major-key",
	intervals: [0, 2, 4, 5, 7, 9, 11],
};
const MINOR_KEY: Spellable = {
	id: "minor-key",
	intervals: [0, 2, 3, 5, 7, 8, 10],
};

/** Minor if the scale has a minor third and no major third, else major. */
function referenceKey(scale: Spellable): Spellable {
	const { intervals } = scale;
	return intervals.includes(3) && !intervals.includes(4)
		? MINOR_KEY
		: MAJOR_KEY;
}

/** Names that are right on paper but read oddly outside a strict key. */
const AWKWARD = new Set(["C♭", "F♭", "E♯", "B♯"]);

export interface SpelledScale {
	root: string;
	/** One name per scale note, in scale order. */
	notes: string[];
	/** Whether the spelling leans on flats, for naming notes outside the scale. */
	flats: boolean;
}

/**
 * Names a scale's notes the way a musician would.
 *
 * Key-based scales (major, harmonic and melodic minor) are spelled strictly:
 * each degree gets its own letter, so F major has B♭, not A♯, and a black-key
 * root takes whichever spelling needs fewer accidentals (B♭ major, D♭ major).
 *
 * Other scales are spelled practically: the root is named as its nearest
 * major or minor key names it (B♭ minor blues, not A♯), notes follow their
 * degrees where that reads naturally, and anything awkward (C♭, F♭, E♯, B♯,
 * double sharps and flats) becomes its plain name: F minor blues has B, not C♭.
 */
export function spellScale(
	root: PitchClass,
	scale: Spellable & Pick<Scale, "family">,
): SpelledScale {
	if (STRICT_FAMILIES.has(scale.family)) {
		const notes = strictSpelling(root, scale);
		return {
			root: format(notes[0]),
			notes: notes.map(format),
			flats: notes.some((n) => n.accidental < 0),
		};
	}

	const key = strictSpelling(root, referenceKey(scale));
	const flats = key.some((n) => n.accidental < 0);
	const byDegree = spellFrom(key[0], scale);
	if (!byDegree) throw new Error(`Cannot spell ${scale.id} on ${root}`);
	const notes = byDegree.map((note, i) => {
		const name = format(note);
		if (Math.abs(note.accidental) < 2 && !AWKWARD.has(name)) return name;
		return spellNote(toPitchClass(root + scale.intervals[i]), flats);
	});
	return { root: notes[0], notes, flats };
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
