import { memo, useMemo } from "react";
import { findCompatibleScales } from "../music/match";
import { type PitchClass, pitchClassName } from "../music/notes";

interface Props {
	group: ReadonlySet<PitchClass>;
}

export const ScaleResults = memo(function ScaleResults({ group }: Props) {
	const families = useMemo(() => findCompatibleScales(group), [group]);
	const count = families.reduce((sum, f) => sum + f.matches.length, 0);

	return (
		<section className="results">
			<h2>
				Compatible scales
				{group.size > 0 && <span className="count">{count}</span>}
			</h2>
			{group.size === 0 ? (
				<p className="muted">
					Add notes to the group to see which keys, scales and modes fit.
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
						{matches.map(({ root, scale, notes }) => (
							<li key={`${scale.id}-${root}`} className="match">
								<span className="match-name">
									{pitchClassName(root)} {scale.name}
								</span>
								<span className="match-notes">
									{notes.map((pc) => (
										<span
											key={pc}
											className={group.has(pc) ? "hit" : undefined}
										>
											{pitchClassName(pc)}
										</span>
									))}
								</span>
							</li>
						))}
					</ul>
				</div>
			))}
		</section>
	);
});
