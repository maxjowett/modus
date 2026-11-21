import { memo, useMemo } from "react";
import {
	findCompatibleScales,
	MIN_GROUP_SIZE,
	matchKey,
	NEAR_MISS_FROM,
	noteNameIn,
	type ScaleMatch,
} from "../music/match";
import type { PitchClass } from "../music/notes";
import { NoteName } from "./NoteName";

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
	const showPercent = group.size >= NEAR_MISS_FROM;

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
										<span className="match-head">
											<span className="match-name">
												<NoteName name={match.spelled.root} />{" "}
												{match.scale.name}
											</span>
											{showPercent && (
												<span
													className="match-percent"
													title={`${group.size - match.missing.length} of your ${group.size} notes are in this scale`}
												>
													{Math.round(match.fit * 100)}% match
												</span>
											)}
										</span>
										<span className="match-notes">
											{match.notes.map((pc, i) => (
												<span
													key={pc}
													className={group.has(pc) ? "hit" : undefined}
												>
													{match.spelled.notes[i]}
												</span>
											))}
										</span>
										{match.missing.length > 0 && (
											<span className="match-missing">
												not in scale:{" "}
												{match.missing
													.map((pc) => noteNameIn(match, pc))
													.join(" ")}
											</span>
										)}
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
