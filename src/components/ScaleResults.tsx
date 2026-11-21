import { memo, useMemo } from "react";
import {
	findCompatibleScales,
	MIN_GROUP_SIZE,
	matchKey,
	type ScaleMatch,
} from "../music/match";
import { type PitchClass, pitchClassName } from "../music/notes";

interface Props {
	group: ReadonlySet<PitchClass>;
	selectedKey: string | null;
	onSelect: (match: ScaleMatch) => void;
}

export const ScaleResults = memo(function ScaleResults({
	group,
	selectedKey,
	onSelect,
}: Props) {
	const families = useMemo(() => findCompatibleScales(group), [group]);
	const count = families.reduce((sum, f) => sum + f.matches.length, 0);
	const notesNeeded = MIN_GROUP_SIZE - group.size;

	return (
		<section className="results">
			<h2>
				Compatible scales
				{notesNeeded <= 0 && <span className="count">{count}</span>}
			</h2>
			{notesNeeded > 0 ? (
				<p className="muted">
					{group.size === 0
						? `Add at least ${MIN_GROUP_SIZE} notes to see which keys, scales and modes fit.`
						: `Add ${notesNeeded} more ${notesNeeded === 1 ? "note" : "notes"} to see which keys, scales and modes fit.`}
				</p>
			) : (
				count === 0 && (
					<p className="muted">No scale contains all of these notes.</p>
				)
			)}
			{families.map(({ family, matches }) => (
				<div key={family}>
					<h3>{family}</h3>
					<ul>
						{matches.map((match) => {
							const key = matchKey(match);
							return (
								<li key={key}>
									<button
										type="button"
										className="match"
										aria-pressed={key === selectedKey}
										onClick={() => onSelect(match)}
									>
										<span className="match-name">
											{pitchClassName(match.root)} {match.scale.name}
										</span>
										<span className="match-notes">
											{match.notes.map((pc) => (
												<span
													key={pc}
													className={group.has(pc) ? "hit" : undefined}
												>
													{pitchClassName(pc)}
												</span>
											))}
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</section>
	);
});
