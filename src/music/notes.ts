export const PITCH_CLASSES = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B",
] as const;

export type PitchClassName = (typeof PITCH_CLASSES)[number];

/** 0 (C) – 11 (B). Use `toPitchClass` to normalise any semitone number. */
export type PitchClass = number;

export const OCTAVE = PITCH_CLASSES.length;

export const ALL_PITCH_CLASSES: PitchClass[] = PITCH_CLASSES.map((_, pc) => pc);

/** Wraps any whole number of semitones (including negatives) into 0–11. */
export function toPitchClass(semitones: number): PitchClass {
	return ((semitones % OCTAVE) + OCTAVE) % OCTAVE;
}

export function pitchClassName(pc: PitchClass): PitchClassName {
	return PITCH_CLASSES[pc];
}

export function pitchClassFromName(name: PitchClassName): PitchClass {
	return PITCH_CLASSES.indexOf(name);
}

const A4_FREQUENCY = 440;
const A4_MIDI = 69;

/** Fractional MIDI note number for a frequency. */
export function frequencyToMidi(hz: number): number {
	return A4_MIDI + OCTAVE * Math.log2(hz / A4_FREQUENCY);
}

/** Nearest pitch class to a frequency and how far off it is, in cents (−50…+50). */
export function centsOff(hz: number): {
	pitchClass: PitchClass;
	cents: number;
} {
	const midi = frequencyToMidi(hz);
	const nearest = Math.round(midi);
	return {
		pitchClass: toPitchClass(nearest),
		cents: Math.round((midi - nearest) * 100),
	};
}
