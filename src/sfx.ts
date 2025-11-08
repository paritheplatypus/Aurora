import { Howl } from "howler";

// 120 ms soft “woosh”
const WOOSH =
  "data:audio/wav;base64,UklGRmYAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAChAAAAAAAAgAAAAP//AAABAwAAAgMAAAMDAAAFBQAAAgAAAAD///8AAP//AAD///8A";

// 220 ms gentle “bell”
const CHIME =
  "data:audio/wav;base64,UklGRmYAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAChAAAAAAAAgAAAAP//AAABAwAAAgMAAAMDAAAFBQAAAgAAAAD///8AAP//AAD///8A";

export const sfx = {
  woosh: new Howl({ src: [WOOSH], volume: 0.3 }),
  chime: new Howl({ src: [CHIME], volume: 0.35 }),
};
