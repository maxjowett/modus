import type { ListenStatus } from "../audio/usePitchDetector";

interface Props {
	status: ListenStatus;
	error: string | null;
	onStart: () => void;
	onStop: () => void;
}

const LABEL: Record<ListenStatus, string> = {
	idle: "Start listening",
	starting: "Starting…",
	listening: "Stop listening",
};

export function ListenControl({ status, error, onStart, onStop }: Props) {
	return (
		<div>
			<button
				type="button"
				className="primary"
				onClick={status === "listening" ? onStop : onStart}
				disabled={status === "starting"}
			>
				{LABEL[status]}
			</button>
			{error && <p className="error">{error}</p>}
		</div>
	);
}
