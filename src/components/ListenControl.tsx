import type { ListenStatus } from "../audio/usePitchDetector";

interface Props {
	status: ListenStatus;
	error: string | null;
	onStart: () => void;
	onStop: () => void;
}

const LABEL: Record<ListenStatus, string> = {
	idle: "Start listening",
	starting: "Opening the mic…",
	listening: "Listening",
};

export function ListenControl({ status, error, onStart, onStop }: Props) {
	const listening = status === "listening";
	return (
		<div className="listen">
			<button
				type="button"
				className={listening ? "primary is-listening" : "primary"}
				onClick={listening ? onStop : onStart}
				disabled={status === "starting"}
				aria-label={listening ? "Stop listening" : undefined}
			>
				<span className="listen-dot" aria-hidden="true" />
				{LABEL[status]}
			</button>
			{error && <p className="error">{error}</p>}
		</div>
	);
}
