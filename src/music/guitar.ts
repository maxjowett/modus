import { type PitchClass, toPitchClass } from "./notes";

/** Open-string MIDI notes, high E first (the order strings appear in tab). */
export const STANDARD_TUNING = [64, 59, 55, 50, 45, 40]; // E4 B3 G3 D3 A2 E2

export const FRET_COUNT = 15;

/** Frets that carry an inlay dot on most guitars; 12 gets a double dot. */
export const INLAY_FRETS = [3, 5, 7, 9, 12, 15];

export interface FretPosition {
	/** 0 = high E. */
	string: number;
	/** 0 = open string. */
	fret: number;
	pitchClass: PitchClass;
}

/** Every string/fret position, open strings included, whose note is in `pitchClasses`. */
export function fretPositions(
	pitchClasses: Iterable<PitchClass>,
	tuning: readonly number[] = STANDARD_TUNING,
	fretCount = FRET_COUNT,
): FretPosition[] {
	const wanted = new Set(pitchClasses);
	const positions: FretPosition[] = [];
	tuning.forEach((open, string) => {
		for (let fret = 0; fret <= fretCount; fret++) {
			const pitchClass = toPitchClass(open + fret);
			if (wanted.has(pitchClass)) positions.push({ string, fret, pitchClass });
		}
	});
	return positions;
}
