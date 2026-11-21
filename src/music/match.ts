import { ALL_PITCH_CLASSES, type PitchClass, toPitchClass } from "./notes";
import {
	FAMILY_ORDER,
	isParentScale,
	SCALES,
	type Scale,
	type ScaleFamily,
} from "./scales";

export interface ScaleMatch {
	root: PitchClass;
	scale: Scale;
	/** The scale's pitch classes, in scale order starting from the root. */
	notes: PitchClass[];
	/** How many scale notes are not in the group. */
	extraNotes: number;
}

/** Stable identity for a match, e.g. "ionian-0" for C major. */
export function matchKey({ scale, root }: Pick<ScaleMatch, "scale" | "root">) {
	return `${scale.id}-${root}`;
}

/** Whether every note in the group is in the match's scale. */
export function matchFits(
	match: ScaleMatch,
	group: ReadonlySet<PitchClass>,
): boolean {
	return [...group].every((pc) => match.notes.includes(pc));
}

export interface FamilyMatches {
	family: ScaleFamily;
	matches: ScaleMatch[];
}

/** One bit per pitch class, so "group ⊆ scale" is a single AND. */
function toMask(pitchClasses: Iterable<PitchClass>): number {
	let mask = 0;
	for (const pc of pitchClasses) mask |= 1 << pc;
	return mask;
}

/** Every parent scale on every root, built once at module load. */
const CANDIDATES = SCALES.filter(isParentScale).flatMap((scale) =>
	ALL_PITCH_CLASSES.map((root) => {
		const notes = scale.intervals.map((i) => toPitchClass(root + i));
		return { root, scale, notes, mask: toMask(notes) };
	}),
);

/** Fewer notes than this fit too many scales to be useful, so none are shown. */
export const MIN_GROUP_SIZE = 2;

/**
 * Every root × scale that contains all notes in the group, grouped by family
 * (in FAMILY_ORDER) and sorted tightest fit first within each family.
 * Families with no matches are left out; a group smaller than MIN_GROUP_SIZE
 * matches nothing.
 */
export function findCompatibleScales(
	group: ReadonlySet<PitchClass>,
): FamilyMatches[] {
	if (group.size < MIN_GROUP_SIZE) return [];

	const groupMask = toMask(group);
	const byFamily = new Map<ScaleFamily, ScaleMatch[]>();
	for (const { mask, ...candidate } of CANDIDATES) {
		if ((mask & groupMask) !== groupMask) continue;
		const match = {
			...candidate,
			extraNotes: candidate.notes.length - group.size,
		};
		const list = byFamily.get(candidate.scale.family);
		if (list) list.push(match);
		else byFamily.set(candidate.scale.family, [match]);
	}

	return FAMILY_ORDER.flatMap((family) => {
		const matches = byFamily.get(family);
		if (!matches) return [];
		matches.sort((a, b) => a.extraNotes - b.extraNotes || a.root - b.root);
		return [{ family, matches }];
	});
}
