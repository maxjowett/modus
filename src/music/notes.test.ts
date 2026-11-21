import { describe, expect, it } from "vitest";
import {
	centsOff,
	frequencyToMidi,
	pitchClassName,
	toPitchClass,
} from "./notes";

describe("notes", () => {
	it("maps A4 = 440 Hz to MIDI 69 / A", () => {
		expect(frequencyToMidi(440)).toBeCloseTo(69);
		expect(pitchClassName(centsOff(440).pitchClass)).toBe("A");
		expect(centsOff(440).cents).toBe(0);
	});

	it("detects the guitar's low E", () => {
		expect(pitchClassName(centsOff(82.41).pitchClass)).toBe("E");
	});

	it("reports sharp and flat in cents", () => {
		expect(centsOff(445).cents).toBeGreaterThan(0);
		expect(centsOff(435).cents).toBeLessThan(0);
	});

	it("wraps semitones into pitch classes, including negatives", () => {
		expect(toPitchClass(60)).toBe(0);
		expect(toPitchClass(71)).toBe(11);
		expect(toPitchClass(-1)).toBe(11);
	});
});
