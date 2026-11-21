import { memo } from "react";
import {
	FRET_COUNT,
	fretPositions,
	INLAY_FRETS,
	STANDARD_TUNING,
} from "../music/guitar";
import type { ScaleMatch } from "../music/match";
import { type PitchClass, pitchClassName } from "../music/notes";

interface Props {
	match: ScaleMatch;
	group: ReadonlySet<PitchClass>;
	onClose: () => void;
}

// SVG layout, in viewBox units.
const FRET_WIDTH = 56;
const STRING_GAP = 30;
const OPEN_WIDTH = 40; // space left of the nut for open-string notes
const PAD_X = 12;
const PAD_TOP = 18;
const NUMBERS_HEIGHT = 26; // fret numbers under the neck
const DOT_RADIUS = 11.5;

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
	const title = `${pitchClassName(match.root)} ${match.scale.name}`;
	const positions = fretPositions(match.notes);

	return (
		<section className="fretboard">
			<header>
				<h2>{title}</h2>
				<button type="button" onClick={onClose} aria-label="Close fretboard">
					×
				</button>
			</header>

			<div className="fretboard-scroll">
				<svg
					viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
					role="img"
					aria-labelledby="fretboard-title"
				>
					<title id="fretboard-title">
						{`${title} on a guitar neck, frets 0 to ${FRET_COUNT}`}
					</title>

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
							y1={PAD_TOP}
							y2={PAD_TOP + NECK_HEIGHT}
						/>
					))}
					<line
						className="fb-nut"
						x1={NUT_X}
						x2={NUT_X}
						y1={PAD_TOP - 1}
						y2={PAD_TOP + NECK_HEIGHT + 1}
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

					{positions.map(({ string, fret, pitchClass }) => {
						const kind =
							pitchClass === match.root
								? "root"
								: group.has(pitchClass)
									? "played"
									: "scale";
						return (
							<g key={`${string}-${fret}`} className={`fb-note fb-${kind}`}>
								<circle cx={fretX(fret)} cy={stringY(string)} r={DOT_RADIUS} />
								<text x={fretX(fret)} y={stringY(string) + 4}>
									{pitchClassName(pitchClass)}
								</text>
							</g>
						);
					})}
				</svg>
			</div>

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
			</ul>
		</section>
	);
});
