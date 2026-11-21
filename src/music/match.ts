import { ALL_PITCH_CLASSES, type PitchClass, toPitchClass } from "./notes";
import { FAMILY_ORDER, SCALES, type Scale, type ScaleFamily } from "./scales";

export interface ScaleMatch {
	root: PitchClass;
	scale: Scale;
	/** The scale's pitch classes, in scale order starting from the root. */
	notes: PitchClass[];
	/** How many scale notes are not in the group. */
	extraNotes: number;
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

/** Every scale on every root, built once at module load. */
const CANDIDATES = SCALES.flatMap((scale) =>
	ALL_PITCH_CLASSES.map((root) => {
		const notes = scale.intervals.map((i) => toPitchClass(root + i));
		return { root, scale, notes, mask: toMask(notes) };
	}),
);

/**
 * Every root × scale that contains all notes in the group, grouped by family
 * (in FAMILY_ORDER) and sorted tightest fit first within each family.
 * Families with no matches are left out; an empty group matches nothing.
 */
export function findCompatibleScales(
	group: ReadonlySet<PitchClass>,
): FamilyMatches[] {
	if (group.size === 0) return [];

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
