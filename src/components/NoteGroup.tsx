import { Fragment, memo } from "react";
import { PITCH_CLASSES, type PitchClass } from "../music/notes";
import { bothNames } from "../music/spelling";
import { NoteName } from "./NoteName";

interface Props {
	group: ReadonlySet<PitchClass>;
	/** The note being detected right now, highlighted in the grid. */
	hearing: PitchClass | null;
	onToggle: (pc: PitchClass) => void;
	onClear: () => void;
}

/** "A♯/B♭" for a black key: your notes aren't tied to a key, so show both. */
function BothNames({ pc }: { pc: PitchClass }) {
	return bothNames(pc).map((name, i) => (
		<Fragment key={name}>
			{i > 0 && <span className="enh-slash">/</span>}
			<NoteName name={name} />
		</Fragment>
	));
}

export const NoteGroup = memo(function NoteGroup({
	group,
	hearing,
	onToggle,
	onClear,
}: Props) {
	return (
		<section className="note-group">
			<header>
				<h2>Your notes</h2>
				<button
					type="button"
					className="quiet"
					onClick={onClear}
					disabled={group.size === 0}
				>
					Clear
				</button>
			</header>

			{/* The buttons come first so the chips below can grow without moving them. */}
			<fieldset className="manual" aria-label="Toggle notes manually">
				{PITCH_CLASSES.map((key, pc) => {
					const names = bothNames(pc);
					return (
						<button
							key={key}
							type="button"
							aria-pressed={group.has(pc)}
							className={pc === hearing ? "is-hearing" : undefined}
							aria-label={names.join(" / ")}
							onClick={() => onToggle(pc)}
						>
							{/* Black keys stack sharp over flat. */}
							{names.map((name) => (
								<span
									key={name}
									className={names.length > 1 ? "enh-name" : undefined}
								>
									<NoteName name={name} />
								</span>
							))}
						</button>
					);
				})}
			</fieldset>

			<div className="picked">
				{group.size === 0 ? (
					<p className="muted">
						Nothing yet. Add the notes you play, or tap them in above.
					</p>
				) : (
					<ul className="chips">
						{PITCH_CLASSES.map(
							(key, pc) =>
								group.has(pc) && (
									<li key={key} className="chip">
										<BothNames pc={pc} />
										<button
											type="button"
											aria-label={`Remove ${bothNames(pc).join(" / ")}`}
											onClick={() => onToggle(pc)}
										>
											×
										</button>
									</li>
								),
						)}
					</ul>
				)}
			</div>
		</section>
	);
});
