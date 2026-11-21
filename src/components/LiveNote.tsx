import type { PitchReading } from "../audio/usePitchDetector";
import { noteLabel } from "../music/notes";
import { NoteName } from "./NoteName";

interface Props {
	reading: PitchReading | null;
	/** Whether `reading` is being heard now, or is just the last note heard. */
	live: boolean;
	listening: boolean;
	canAdd: boolean;
	inGroup: boolean;
	onAdd: () => void;
}

/** Within this many cents of the note counts as in tune on the meter. */
const IN_TUNE_CENTS = 5;

function describe(
	reading: PitchReading | null,
	live: boolean,
	listening: boolean,
): string {
	if (reading && !live) return "Play another note, or add this one.";
	if (reading) {
		const sign = reading.cents > 0 ? "+" : "";
		return `${reading.frequency.toFixed(1)} Hz · ${sign}${reading.cents} cents`;
	}
	return listening ? "Play a note…" : "Start listening to detect notes";
}

export function LiveNote({
	reading,
	live,
	listening,
	canAdd,
	inGroup,
	onAdd,
}: Props) {
	return (
		<section className="live-note" aria-live="polite">
			<p className="eyebrow">{reading && !live ? "Last heard" : "Hearing"}</p>
			<div
				className={
					!reading
						? "note-name is-empty"
						: live
							? "note-name"
							: "note-name is-stale"
				}
			>
				{reading ? (
					// Keyed by note, so each new note replays the ease-in.
					<span key={reading.pitchClass} className="note-in">
						<NoteName name={noteLabel(reading.pitchClass)} />
					</span>
				) : (
					"—"
				)}
			</div>
			<div className="meter" aria-hidden="true">
				<span className="meter-flat">♭</span>
				<div className="meter-track">
					<div className="meter-center" />
					{reading && live && (
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
			<p className="note-detail">{describe(reading, live, listening)}</p>
			<button type="button" onClick={onAdd} disabled={!canAdd}>
				{inGroup ? "Already in group" : "Add to group"} <kbd>Space</kbd>
			</button>
		</section>
	);
}
