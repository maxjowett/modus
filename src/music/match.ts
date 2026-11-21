import { ALL_PITCH_CLASSES, type PitchClass, toPitchClass } from "./notes";
import {
	FAMILY_ORDER,
	isParentScale,
	SCALES,
	type Scale,
	type ScaleFamily,
} from "./scales";
import { type SpelledScale, spellNote, spellScale } from "./spelling";

/** Fewer notes than this fit too many scales to be useful, so none are shown. */
export const MIN_GROUP_SIZE = 2;

/**
 * From this many notes, scales missing one of them are listed too, and
 * results show what share of the group each scale contains. With fewer
 * notes, a single miss would match almost every scale.
 */
export const NEAR_MISS_FROM = 3;

/** Most group notes a listed scale may leave out. */
export function allowedMisses(groupSize: number): number {
	return groupSize >= NEAR_MISS_FROM ? 1 : 0;
}

export interface ScaleMatch {
	root: PitchClass;
	scale: Scale;
	/** The scale's pitch classes, in scale order starting from the root. */
	notes: PitchClass[];
	/** Note names as the key spells them (B♭, not A♯, in F major). */
	spelled: SpelledScale;
	/** Group notes that are not in the scale. */
	missing: PitchClass[];
	/** Share of the group's notes that are in the scale, 0–1. */
	fit: number;
	/** How many scale notes are not in the group. */
	extraNotes: number;
}

export interface FamilyMatches {
	family: ScaleFamily;
	matches: ScaleMatch[];
}

/** Stable identity for a match, e.g. "ionian-0" for C major. */
export function matchKey({ scale, root }: Pick<ScaleMatch, "scale" | "root">) {
	return `${scale.id}-${root}`;
}

/** A note's name in the context of this scale, including notes outside it. */
export function noteNameIn(
	match: Pick<ScaleMatch, "notes" | "spelled">,
	pc: PitchClass,
): string {
	const i = match.notes.indexOf(pc);
	return i === -1 ? spellNote(pc, match.spelled.flats) : match.spelled.notes[i];
}

/** Group notes that are not in the scale, in pitch order. */
export function missingNotes(
	notes: readonly PitchClass[],
	group: ReadonlySet<PitchClass>,
): PitchClass[] {
	return [...group].filter((pc) => !notes.includes(pc)).sort((a, b) => a - b);
}

/** Whether a scale would be listed for this group. */
export function isListed(
	notes: readonly PitchClass[],
	group: ReadonlySet<PitchClass>,
): boolean {
	return (
		group.size >= MIN_GROUP_SIZE &&
		missingNotes(notes, group).length <= allowedMisses(group.size)
	);
}

/** One bit per pitch class, so set overlap is a single AND. */
function toMask(pitchClasses: Iterable<PitchClass>): number {
	let mask = 0;
	for (const pc of pitchClasses) mask |= 1 << pc;
	return mask;
}

function bitCount(mask: number): number {
	let count = 0;
	for (let m = mask; m; m &= m - 1) count++;
	return count;
}

/** Every parent scale on every root, built once at module load. */
const CANDIDATES = SCALES.filter(isParentScale).flatMap((scale) =>
	ALL_PITCH_CLASSES.map((root) => {
		const notes = scale.intervals.map((i) => toPitchClass(root + i));
		const spelled = spellScale(root, scale);
		return { root, scale, notes, spelled, mask: toMask(notes) };
	}),
);

/**
 * Every root × scale containing all of the group's notes, or all but
 * `allowedMisses` of them, grouped by family (in FAMILY_ORDER). Within a
 * family, best fit first, then tightest (fewest extra notes). Families with
 * no matches are left out; a group smaller than MIN_GROUP_SIZE matches nothing.
 */
export function findCompatibleScales(
	group: ReadonlySet<PitchClass>,
): FamilyMatches[] {
	if (group.size < MIN_GROUP_SIZE) return [];

	const groupMask = toMask(group);
	const maxMisses = allowedMisses(group.size);
	const byFamily = new Map<ScaleFamily, ScaleMatch[]>();
	for (const { mask, ...candidate } of CANDIDATES) {
		const inScale = bitCount(mask & groupMask);
		if (group.size - inScale > maxMisses) continue;
		const match: ScaleMatch = {
			...candidate,
			missing: missingNotes(candidate.notes, group),
			fit: inScale / group.size,
			extraNotes: candidate.notes.length - inScale,
		};
		const list = byFamily.get(candidate.scale.family);
		if (list) list.push(match);
		else byFamily.set(candidate.scale.family, [match]);
	}

	return FAMILY_ORDER.flatMap((family) => {
		const matches = byFamily.get(family);
		if (!matches) return [];
		matches.sort(
			(a, b) => b.fit - a.fit || a.extraNotes - b.extraNotes || a.root - b.root,
		);
		return [{ family, matches }];
	});
}
