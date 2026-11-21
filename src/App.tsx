import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { usePitchDetector } from "./audio/usePitchDetector";
import { Fretboard } from "./components/Fretboard";
import { ListenControl } from "./components/ListenControl";
import { LiveNote } from "./components/LiveNote";
import { NoteGroup } from "./components/NoteGroup";
import { ScaleResults } from "./components/ScaleResults";
import { isListed, matchKey, type ScaleMatch } from "./music/match";
import type { PitchClass } from "./music/notes";

export default function App() {
	const { status, error, reading, start, stop } = usePitchDetector();
	const [group, setGroup] = useState<ReadonlySet<PitchClass>>(new Set());
	const [selected, setSelected] = useState<ScaleMatch | null>(null);

	// Hide the fretboard while the selected scale isn't in the results.
	const shownScale =
		selected && isListed(selected.notes, group) ? selected : null;
	const closeFretboard = useCallback(() => setSelected(null), []);
	// Clicking the selected scale again closes it.
	const selectScale = useCallback(
		(match: ScaleMatch) =>
			setSelected((prev) =>
				prev && matchKey(prev) === matchKey(match) ? null : match,
			),
		[],
	);

	const inGroup = reading !== null && group.has(reading.pitchClass);
	const canAdd = reading !== null && !inGroup;

	const addCurrent = () => {
		if (!canAdd) return;
		setGroup((prev) => new Set(prev).add(reading.pitchClass));
	};

	const toggle = useCallback((pc: PitchClass) => {
		setGroup((prev) => {
			const next = new Set(prev);
			if (!next.delete(pc)) next.add(pc);
			return next;
		});
	}, []);

	const clear = useCallback(() => setGroup(new Set()), []);

	// Space adds the current note, unless focus is on a control that uses Space itself.
	const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
		if (event.code !== "Space") return;
		if (
			event.target instanceof HTMLElement &&
			event.target.closest("button, input")
		) {
			return;
		}
		event.preventDefault();
		addCurrent();
	});

	useEffect(() => {
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	return (
		<main>
			<header className="app-header">
				<div>
					<h1>modus</h1>
					<p className="tagline">
						Play a few notes. Find the scales they belong to.
					</p>
				</div>
				<ListenControl
					status={status}
					error={error}
					onStart={start}
					onStop={stop}
				/>
			</header>
			<div className="layout">
				<div className="controls">
					<LiveNote
						reading={reading}
						listening={status === "listening"}
						canAdd={canAdd}
						inGroup={inGroup}
						onAdd={addCurrent}
					/>
					<NoteGroup group={group} onToggle={toggle} onClear={clear} />
				</div>
				<div className="study">
					{shownScale && (
						<Fretboard
							match={shownScale}
							group={group}
							onClose={closeFretboard}
						/>
					)}
					<ScaleResults
						group={group}
						selectedKey={shownScale && matchKey(shownScale)}
						onSelect={selectScale}
					/>
				</div>
			</div>
		</main>
	);
}
