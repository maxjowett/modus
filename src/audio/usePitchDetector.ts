import { PitchDetector } from "pitchy";
import { useCallback, useEffect, useRef, useState } from "react";
import { centsOff, type PitchClass } from "../music/notes";

export interface PitchReading {
	/** Rounded to 0.1 Hz, the precision shown on screen. */
	frequency: number;
	pitchClass: PitchClass;
	cents: number;
}

/** A failed start returns to "idle" and sets `error`. */
export type ListenStatus = "idle" | "starting" | "listening";

const FFT_SIZE = 4096; // ~85 ms at 48 kHz: several periods of low E (82 Hz)
const MIN_CLARITY = 0.9;
const MIN_RMS = 0.01; // pitchy returns [0, 0] for quieter input
const MIN_HZ = 70;
const MAX_HZ = 1400;
const STABLE_FRAMES = 6;

function describeError(err: unknown): string {
	if (err instanceof DOMException) {
		if (err.name === "NotAllowedError") return "Microphone access was denied.";
		if (err.name === "NotFoundError") return "No microphone was found.";
	}
	return err instanceof Error ? err.message : "Could not start the microphone.";
}

export function usePitchDetector() {
	const [status, setStatus] = useState<ListenStatus>("idle");
	const [error, setError] = useState<string | null>(null);
	const [reading, setReading] = useState<PitchReading | null>(null);

	const teardownRef = useRef<(() => void) | null>(null);

	const stop = useCallback(() => {
		teardownRef.current?.();
		teardownRef.current = null;
		setReading(null);
		setStatus("idle");
	}, []);

	const start = useCallback(async () => {
		if (teardownRef.current) return;
		setStatus("starting");
		setError(null);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
					autoGainControl: false,
				},
			});
			const context = new AudioContext();
			const source = context.createMediaStreamSource(stream);
			const analyser = context.createAnalyser();
			analyser.fftSize = FFT_SIZE;
			source.connect(analyser);

			const buffer = new Float32Array(analyser.fftSize);
			const detector = PitchDetector.forFloat32Array(analyser.fftSize);
			detector.minVolumeAbsolute = MIN_RMS;

			let frame = 0;
			let candidate: PitchClass | null = null;
			let candidateFrames = 0;
			let shown: PitchReading | null = null;

			const tick = () => {
				frame = requestAnimationFrame(tick);
				analyser.getFloatTimeDomainData(buffer);
				const [hz, clarity] = detector.findPitch(buffer, context.sampleRate);
				if (clarity < MIN_CLARITY || hz < MIN_HZ || hz > MAX_HZ) {
					candidate = null;
					candidateFrames = 0;
					return;
				}

				const { pitchClass, cents } = centsOff(hz);
				candidateFrames = pitchClass === candidate ? candidateFrames + 1 : 1;
				candidate = pitchClass;
				if (candidateFrames < STABLE_FRAMES) return;

				// Only re-render when something on screen would change.
				const frequency = Math.round(hz * 10) / 10;
				if (
					shown?.pitchClass === pitchClass &&
					shown.cents === cents &&
					shown.frequency === frequency
				) {
					return;
				}
				shown = { frequency, pitchClass, cents };
				setReading(shown);
			};
			frame = requestAnimationFrame(tick);

			teardownRef.current = () => {
				cancelAnimationFrame(frame);
				source.disconnect();
				for (const track of stream.getTracks()) track.stop();
				void context.close();
			};
			setStatus("listening");
		} catch (err) {
			setError(describeError(err));
			setStatus("idle");
		}
	}, []);

	useEffect(() => () => teardownRef.current?.(), []);

	return { status, error, reading, start, stop };
}
