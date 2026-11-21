import { memo } from "react";
import {
	FRET_COUNT,
	fretPositions,
	INLAY_FRETS,
	STANDARD_TUNING,
} from "../music/guitar";
import { missingNotes, noteNameIn, type ScaleMatch } from "../music/match";
import { noteLabel, type PitchClass } from "../music/notes";
import { NoteName } from "./NoteName";

interface Props {
	/** The selected scale, or null to show just your notes. */
	match: ScaleMatch | null;
	group: ReadonlySet<PitchClass>;
	onClose: () => void;
}

// SVG layout, in viewBox units.
const FRET_WIDTH = 56;
const STRING_GAP = 34;
const OPEN_WIDTH = 40; // space left of the nut for open-string notes
const PAD_X = 12;
const PAD_TOP = 20;
const NUMBERS_HEIGHT = 26; // fret numbers under the neck
const DOT_RADIUS = 13;
const NECK_OVERHANG = 10; // wood beyond the outer strings

const STRINGS = STANDARD_TUNING.length;
const NUT_X = PAD_X + OPEN_WIDTH;
const NECK_WIDTH = FRET_COUNT * FRET_WIDTH;
const NECK_HEIGHT = (STRINGS - 1) * STRING_GAP;
const WIDTH = NUT_X + NECK_WIDTH + PAD_X;
const HEIGHT = PAD_TOP + NECK_HEIGHT + PAD_TOP + NUMBERS_HEIGHT;

const stringY = (string: number) => PAD_TOP + string * STRING_GAP;
/** Centre of the space behind a fret; fret 0 sits left of the nut. */
const fretX = (fret: number) =>
	fret === 0 ? PAD_X + OPEN_WIDTH / 2 : NUT_X + (fret - 0.5) * FRET_WIDTH;

const FRETS = Array.from({ length: FRET_COUNT }, (_, i) => i + 1);
const STRING_INDEXES = Array.from({ length: STRINGS }, (_, i) => i);
const NECK_MID_Y = PAD_TOP + NECK_HEIGHT / 2;

export const Fretboard = memo(function Fretboard({
	match,
	group,
	onClose,
}: Props) {
	const title = match
		? `${match.spelled.root} ${match.scale.name}`
		: "On the neck";
	// Your notes that fall outside the scale are drawn too, marked as such.
	const missing = match ? missingNotes(match.notes, group) : [];
	const positions = fretPositions(match ? [...match.notes, ...missing] : group);
	const nameOf = (pc: PitchClass) =>
		match ? noteNameIn(match, pc) : noteLabel(pc);
	const kindOf = (pc: PitchClass) => {
		if (!match) return "played";
		if (missing.includes(pc)) return "outside";
		if (pc === match.root) return "root";
		return group.has(pc) ? "played" : "scale";
	};

	return (
		<section className="fretboard">
			<header>
				<h2>
					{match ? (
						<>
							<NoteName name={match.spelled.root} /> {match.scale.name}
							{match.scale.altName && (
								<span className="alt-name">{match.scale.altName}</span>
							)}
						</>
					) : (
						title
					)}
				</h2>
				{match && (
					<button type="button" onClick={onClose} aria-label="Close scale">
						×
					</button>
				)}
			</header>
			{!match && (
				<p className="muted fretboard-hint">
					{group.size === 0
						? "Play or tap in notes and they’ll appear here."
						: "Pick a scale below to see the rest of its notes."}
				</p>
			)}

			<div className="fretboard-scroll">
				<svg
					viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
					role="img"
					aria-labelledby="fretboard-title"
				>
					<title id="fretboard-title">
						{`${title} on a guitar neck, frets 0 to ${FRET_COUNT}`}
					</title>

					<rect
						className="fb-neck"
						x={NUT_X}
						y={PAD_TOP - NECK_OVERHANG}
						width={NECK_WIDTH}
						height={NECK_HEIGHT + NECK_OVERHANG * 2}
						rx={3}
					/>

					{INLAY_FRETS.map((fret) =>
						fret === 12 ? (
							<g key={fret} className="fb-inlay">
								<circle cx={fretX(fret)} cy={stringY(1.5)} r={5} />
								<circle cx={fretX(fret)} cy={stringY(3.5)} r={5} />
							</g>
						) : (
							<circle
								key={fret}
								className="fb-inlay"
								cx={fretX(fret)}
								cy={NECK_MID_Y}
								r={5}
							/>
						),
					)}

					{FRETS.map((fret) => (
						<line
							key={fret}
							className="fb-fret"
							x1={NUT_X + fret * FRET_WIDTH}
							x2={NUT_X + fret * FRET_WIDTH}
							y1={PAD_TOP - NECK_OVERHANG}
							y2={PAD_TOP + NECK_HEIGHT + NECK_OVERHANG}
						/>
					))}
					<line
						className="fb-nut"
						x1={NUT_X}
						x2={NUT_X}
						y1={PAD_TOP - NECK_OVERHANG}
						y2={PAD_TOP + NECK_HEIGHT + NECK_OVERHANG}
					/>

					{STRING_INDEXES.map((string) => (
						<line
							key={string}
							className="fb-string"
							x1={NUT_X}
							x2={NUT_X + NECK_WIDTH}
							y1={stringY(string)}
							y2={stringY(string)}
							// Low strings are thicker, like on a real neck.
							strokeWidth={1 + string * 0.35}
						/>
					))}

					{INLAY_FRETS.map((fret) => (
						<text
							key={fret}
							className="fb-number"
							x={fretX(fret)}
							y={HEIGHT - NUMBERS_HEIGHT / 2 + 4}
						>
							{fret}
						</text>
					))}

					{positions.map(({ string, fret, pitchClass }) => (
						<g
							key={`${string}-${fret}`}
							className={`fb-note fb-${kindOf(pitchClass)}`}
						>
							<circle cx={fretX(fret)} cy={stringY(string)} r={DOT_RADIUS} />
							<text x={fretX(fret)} y={stringY(string) + 4.5}>
								{nameOf(pitchClass)}
							</text>
						</g>
					))}
				</svg>
			</div>

			{match ? (
				<ul className="fretboard-legend">
					<li>
						<span className="swatch fb-root" /> Root
					</li>
					<li>
						<span className="swatch fb-played" /> In your group
					</li>
					<li>
						<span className="swatch fb-scale" /> Other scale notes
					</li>
					{missing.length > 0 && (
						<li>
							<span className="swatch fb-outside" /> Your notes outside the
							scale
						</li>
					)}
				</ul>
			) : (
				group.size > 0 && (
					<ul className="fretboard-legend">
						<li>
							<span className="swatch fb-played" /> Your notes
						</li>
					</ul>
				)
			)}
		</section>
	);
});
