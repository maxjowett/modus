import type { PitchReading } from "../audio/usePitchDetector";
import { noteLabel } from "../music/notes";

interface Props {
	reading: PitchReading | null;
	listening: boolean;
	canAdd: boolean;
	inGroup: boolean;
	onAdd: () => void;
}

/** Within this many cents of the note counts as in tune on the meter. */
const IN_TUNE_CENTS = 5;

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
			<p className="eyebrow">Hearing</p>
			<div className={reading ? "note-name" : "note-name is-empty"}>
				{reading ? noteLabel(reading.pitchClass) : "—"}
			</div>
			<div className="meter" aria-hidden="true">
				<span className="meter-flat">♭</span>
				<div className="meter-track">
					<div className="meter-center" />
					{reading && (
						<div
							className={
								Math.abs(reading.cents) <= IN_TUNE_CENTS
									? "meter-needle in-tune"
									: "meter-needle"
							}
							style={{ left: `${50 + reading.cents}%` }}
						/>
					)}
				</div>
				<span className="meter-sharp">♯</span>
			</div>
			<p className="note-detail">{describe(reading, listening)}</p>
			<button type="button" onClick={onAdd} disabled={!canAdd}>
				{inGroup ? "Already in group" : "Add to group"} <kbd>Space</kbd>
			</button>
		</section>
	);
}
