import type { PitchReading } from "../audio/usePitchDetector";
import { pitchClassName } from "../music/notes";

interface Props {
	reading: PitchReading | null;
	listening: boolean;
	canAdd: boolean;
	inGroup: boolean;
	onAdd: () => void;
}

function describe(reading: PitchReading | null, listening: boolean): string {
	if (reading) {
		const sign = reading.cents > 0 ? "+" : "";
		return `${reading.frequency.toFixed(1)} Hz · ${sign}${reading.cents} cents`;
	}
	return listening ? "Play a note…" : "Start listening to detect notes";
}

export function LiveNote({
	reading,
	listening,
	canAdd,
	inGroup,
	onAdd,
}: Props) {
	return (
		<section className="live-note" aria-live="polite">
			<div className="note-name">
				{reading ? pitchClassName(reading.pitchClass) : "–"}
			</div>
			<div className="meter" aria-hidden="true">
				<div className="meter-center" />
				{reading && (
					<div
						className="meter-needle"
						style={{ left: `${50 + reading.cents}%` }}
					/>
				)}
			</div>
			<p className="note-detail">{describe(reading, listening)}</p>
			<button type="button" onClick={onAdd} disabled={!canAdd}>
				{inGroup ? "Already in group" : "Add to group"} <kbd>Space</kbd>
			</button>
		</section>
	);
}
