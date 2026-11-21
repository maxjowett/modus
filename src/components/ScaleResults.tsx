import { memo, useMemo, useState } from "react";
import {
	findCompatibleScales,
	MIN_GROUP_SIZE,
	matchKey,
	NEAR_MISS_FROM,
	noteNameIn,
	type ScaleMatch,
} from "../music/match";
import type { PitchClass } from "../music/notes";
import type { ScaleFamily } from "../music/scales";
import { NoteName } from "./NoteName";

interface Props {
	group: ReadonlySet<PitchClass>;
	selectedKey: string | null;
	onSelect: (match: ScaleMatch) => void;
}

const isExact = (m: ScaleMatch) => m.missing.length === 0;
const plural = (n: number, word: string) =>
	`${n} ${word}${n === 1 ? "" : "es"}`;

export const ScaleResults = memo(function ScaleResults({
	group,
	selectedKey,
	onSelect,
}: Props) {
	const families = useMemo(
		() =>
			findCompatibleScales(group).map(({ family, matches }) => ({
				family,
				exact: matches.filter(isExact),
				close: matches.filter((m) => !isExact(m)),
			})),
		[group],
	);
	// Families whose close matches you've chosen to see.
	const [opened, setOpened] = useState<ReadonlySet<ScaleFamily>>(new Set());
	const toggle = (family: ScaleFamily) =>
		setOpened((prev) => {
			const next = new Set(prev);
			if (!next.delete(family)) next.add(family);
			return next;
		});

	const exactCount = families.reduce((n, f) => n + f.exact.length, 0);
	const closeCount = families.reduce((n, f) => n + f.close.length, 0);
	const notesNeeded = MIN_GROUP_SIZE - group.size;
	const showFit = group.size >= NEAR_MISS_FROM;

	const row = (match: ScaleMatch) => (
		<MatchRow
			key={matchKey(match)}
			match={match}
			group={group}
			showFit={showFit}
			selected={matchKey(match) === selectedKey}
			onSelect={onSelect}
		/>
	);

	return (
		<section className="results">
			<h2>
				Compatible scales
				{notesNeeded <= 0 && (
					<span className="count">
						{exactCount} {showFit && "exact"}
						{closeCount > 0 && ` · ${closeCount} close`}
					</span>
				)}
			</h2>
			{notesNeeded > 0 ? (
				<p className="muted">
					{group.size === 0
						? `Add at least ${MIN_GROUP_SIZE} notes to see which keys, scales and modes fit.`
						: `Add ${notesNeeded} more ${notesNeeded === 1 ? "note" : "notes"} to see which keys, scales and modes fit.`}
				</p>
			) : (
				exactCount + closeCount === 0 && (
					<p className="muted">No scale contains all of these notes.</p>
				)
			)}
			{families.map(({ family, exact, close }) => {
				// Close matches stay folded away unless opened, or one is selected.
				const showClose =
					opened.has(family) || close.some((m) => matchKey(m) === selectedKey);
				return (
					<div key={family}>
						<h3>{family}</h3>
						{exact.length > 0 ? (
							<ul>{exact.map(row)}</ul>
						) : (
							<p className="muted no-exact">No exact fits.</p>
						)}
						{close.length > 0 && showClose && (
							<ul className="close-matches">{close.map(row)}</ul>
						)}
						{close.length > 0 && (
							<button
								type="button"
								className="quiet more"
								aria-expanded={showClose}
								onClick={() => toggle(family)}
							>
								{showClose
									? "Hide close matches"
									: `Show ${plural(close.length, "close match")}`}
							</button>
						)}
					</div>
				);
			})}
		</section>
	);
});

interface RowProps {
	match: ScaleMatch;
	group: ReadonlySet<PitchClass>;
	showFit: boolean;
	selected: boolean;
	onSelect: (match: ScaleMatch) => void;
}

function MatchRow({ match, group, showFit, selected, onSelect }: RowProps) {
	const inScale = group.size - match.missing.length;
	return (
		<li>
			<button
				type="button"
				className="match"
				aria-pressed={selected}
				onClick={() => onSelect(match)}
			>
				<span className="match-head">
					<span className="match-name">
						<NoteName name={match.spelled.root} /> {match.scale.name}
					</span>
					{showFit && (
						<span
							className="match-fit"
							title={`${inScale} of your ${group.size} notes are in this scale`}
						>
							<span className="fit-bar" aria-hidden="true">
								<span
									className={match.fit === 1 ? "full" : undefined}
									style={{ width: `${match.fit * 100}%` }}
								/>
							</span>
							{Math.round(match.fit * 100)}% match
						</span>
					)}
				</span>
				<span className="match-notes">
					{match.notes.map((pc, i) => (
						<span key={pc} className={group.has(pc) ? "hit" : undefined}>
							{match.spelled.notes[i]}
						</span>
					))}
				</span>
				{match.missing.length > 0 && (
					<span className="match-missing">
						not in scale:{" "}
						{match.missing.map((pc) => noteNameIn(match, pc)).join(" ")}
					</span>
				)}
			</button>
		</li>
	);
}
