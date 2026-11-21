/**
 * A note name like "B♭" with its accidental in its own span. The serif has no
 * ♯/♭ glyphs, and the fallback font's are loosely spaced, so CSS tightens them.
 */
export function NoteName({ name }: { name: string }) {
	const accidental = name.slice(1);
	if (!accidental) return name;
	const flat = accidental.includes("♭") || accidental.includes("𝄫");
	return (
		<>
			{name[0]}
			<span className={flat ? "acc flat" : "acc"}>{accidental}</span>
		</>
	);
}
