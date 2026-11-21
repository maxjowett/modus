import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { usePitchDetector } from "./audio/usePitchDetector";
import { ListenControl } from "./components/ListenControl";
import { LiveNote } from "./components/LiveNote";
import { NoteGroup } from "./components/NoteGroup";
import { ScaleResults } from "./components/ScaleResults";
import type { PitchClass } from "./music/notes";

export default function App() {
	const { status, error, reading, start, stop } = usePitchDetector();
	const [group, setGroup] = useState<ReadonlySet<PitchClass>>(new Set());

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
				<h1>modus</h1>
				<ListenControl
					status={status}
					error={error}
					onStart={start}
					onStop={stop}
				/>
			</header>
			<LiveNote
				reading={reading}
				listening={status === "listening"}
				canAdd={canAdd}
				inGroup={inGroup}
				onAdd={addCurrent}
			/>
			<NoteGroup group={group} onToggle={toggle} onClear={clear} />
			<ScaleResults group={group} />
		</main>
	);
}
