import { memo } from "react";
import { noteLabel, PITCH_CLASSES, type PitchClass } from "../music/notes";

interface Props {
	group: ReadonlySet<PitchClass>;
	onToggle: (pc: PitchClass) => void;
	onClear: () => void;
}

export const NoteGroup = memo(function NoteGroup({
	group,
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
				{PITCH_CLASSES.map((name, pc) => (
					<button
						key={name}
						type="button"
						aria-pressed={group.has(pc)}
						onClick={() => onToggle(pc)}
					>
						{noteLabel(pc)}
					</button>
				))}
			</fieldset>

			<div className="picked">
				{group.size === 0 ? (
					<p className="muted">
						Nothing yet. Add the notes you play, or tap them in above.
					</p>
				) : (
					<ul className="chips">
						{PITCH_CLASSES.map(
							(name, pc) =>
								group.has(pc) && (
									<li key={name} className="chip">
										{noteLabel(pc)}
										<button
											type="button"
											aria-label={`Remove ${noteLabel(pc)}`}
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
