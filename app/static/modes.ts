type Mode = {
  name: string;
  order: number;
  description: string;
};

export const MODES: Mode[] = [
  {
    name: "Ionian",
    order: 1,
    description:
      "A major scale pattern starting on the root. Therefore a C major scale and the C Ionian mode have the same exact set of notes: C-D-E-F-G-A-B. This means that “Ionian mode” is just a fancy way of saying “major scale.”",
  },
  {
    name: "Dorian",
    order: 2,
    description:
      "A major scale pattern starting on the 2nd degree. The Dorian mode is a cousin to the minor scale and is quite popular with guitarists — from jazz greats like Pat Martino to shredders like Kirk Hammett.",
  },
  {
    name: "Phrygian",
    order: 3,
    description:
      "A major scale pattern starting on the 3rd degree. The Phrygian mode also has a minor tonality and tends to evoke the Arabian music of Spain and North Africa.",
  },
  {
    name: "Lydian",
    order: 4,
    description:
      "A major scale pattern starting on the 4th degree. The Lydian mode is closely related to a major scale and tends to evoke a “lifting” sensation. It’s popular in inspirational film music like John Williams’ score for ET: The Extra-Terrestrial.",
  },
  {
    name: "Mixolydian",
    order: 5,
    description:
      "A major scale pattern starting on the 5th degree. Also closely related to a major scale, the Mixolydian mode is heard all over rock, blues, and fusion. Listen to the guitar solos in Steely Dan’s “Reelin’ In The Years” for some fantastic Mixolydian playing.",
  },
  {
    name: "Aeolian",
    order: 6,
    description:
      "A major scale pattern starting on the 6th degree. This is actually the same exact note pattern as a minor scale, so like the Ionian mode, saying “Aeolian mode” is just a fancy way to say “minor.”",
  },
  {
    name: "Locrian",
    order: 7,
    description:
      "A major scale pattern starting on the 7th degree. The Locrian mode is dense and thorny and rarely used. Sometimes jazz soloists use it over diminished chords, but it doesn’t sound pleasing in long passages.",
  },
];
