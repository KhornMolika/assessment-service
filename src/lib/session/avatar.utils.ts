export function getAvatarVariant(_seed?: string) {
  void _seed;
  // 'beam' generates cute, friendly smiling faces which generally look the prettiest for participants!
  return "beam" as const;
}

export function getAvatarColors(seed: string) {
  const palettes = [
    ["#1B4332", "#2D6A4F", "#40916C", "#74C69D", "#D8F3DC"],
    ["#277DA1", "#4CC9F0", "#90E0EF", "#FFD166", "#FFF1C8"],
    ["#F94144", "#F3722C", "#F8961E", "#F9C74F", "#FFE6A7"],
    ["#5A189A", "#7B2CBF", "#9D4EDD", "#C77DFF", "#E0AAFF"],
  ] as const;
  const hash = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
  return [...palettes[hash % palettes.length]];
}
