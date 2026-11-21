import { memo } from "react";
import { PITCH_CLASSES, type PitchClass } from "../music/notes";

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
				<h2>Group</h2>
				<button type="button" onClick={onClear} disabled={group.size === 0}>
					Clear
				</button>
			</header>

			{group.size === 0 ? (
				<p className="muted">
					No notes yet. Add notes you play, or pick them below.
				</p>
			) : (
				<ul className="chips">
					{PITCH_CLASSES.map(
						(name, pc) =>
							group.has(pc) && (
								<li key={name} className="chip">
									{name}
									<button
										type="button"
										aria-label={`Remove ${name}`}
										onClick={() => onToggle(pc)}
									>
										×
									</button>
								</li>
							),
					)}
				</ul>
			)}

			<fieldset className="manual" aria-label="Toggle notes manually">
				{PITCH_CLASSES.map((name, pc) => (
					<button
						key={name}
						type="button"
						aria-pressed={group.has(pc)}
						onClick={() => onToggle(pc)}
					>
						{name}
					</button>
				))}
			</fieldset>
		</section>
	);
});
