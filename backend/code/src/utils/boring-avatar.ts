// Port of the "beam" avatar generator from the `boring-avatars` npm package
// (MIT), rewritten without React so it can run server-side and return a
// self-contained SVG data URI instead of depending on a hosted API.

const SIZE = 80;
const ELEMENTS = 4;

const hashCode = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash &= hash;
  }
  return Math.abs(hash);
};

const getDigit = (number: number, ntn: number) =>
  Math.floor((number / Math.pow(10, ntn)) % 10);

const getBoolean = (number: number, ntn: number) => !(getDigit(number, ntn) % 2);

const getUnit = (number: number, range: number, index?: number) => {
  const value = number % range;
  if (index && getDigit(number, index) % 2 === 0) {
    return -value;
  }
  return value;
};

const getRandomColor = (number: number, colors: string[]) =>
  colors[number % colors.length];

type BeamElement = {
  color: string;
  translateX: number;
  translateY: number;
  rotate: number;
  isSquare: boolean;
};

const generateElements = (name: string, colors: string[]): BeamElement[] => {
  const numFromName = hashCode(name);
  return Array.from({ length: ELEMENTS }, (_, i) => ({
    color: getRandomColor(numFromName + i, colors),
    translateX: getUnit(numFromName * (i + 1), SIZE / 2 - (i + 17), 1),
    translateY: getUnit(numFromName * (i + 1), SIZE / 2 - (i + 17), 2),
    rotate: getUnit(numFromName * (i + 1), 360),
    isSquare: getBoolean(numFromName, 2),
  }));
};

export const generateBeamAvatarSvg = (name: string, colors: string[]): string => {
  const [bg, wrapper, spot, line] = generateElements(name, colors);
  const maskId = `beam-mask-${hashCode(name)}`;

  return `<svg viewBox="0 0 ${SIZE} ${SIZE}" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${SIZE}" height="${SIZE}"><rect width="${SIZE}" height="${SIZE}" rx="${SIZE * 2}" fill="#FFFFFF"/></mask><g mask="url(#${maskId})"><rect width="${SIZE}" height="${SIZE}" fill="${bg.color}"/><rect x="${(SIZE - 60) / 2}" y="${(SIZE - 20) / 2}" width="${SIZE}" height="${wrapper.isSquare ? SIZE : SIZE / 8}" fill="${wrapper.color}" transform="translate(${wrapper.translateX} ${wrapper.translateY}) rotate(${wrapper.rotate} ${SIZE / 2} ${SIZE / 2})"/><circle cx="${SIZE / 2}" cy="${SIZE / 2}" fill="${spot.color}" r="${SIZE / 5}" transform="translate(${spot.translateX} ${spot.translateY})"/><line x1="0" y1="${SIZE / 2}" x2="${SIZE}" y2="${SIZE / 2}" stroke-width="2" stroke="${line.color}" transform="translate(${line.translateX} ${line.translateY}) rotate(${line.rotate} ${SIZE / 2} ${SIZE / 2})"/></g></svg>`;
};

export const BORING_AVATAR_COLORS = [
  '#264653',
  '#2A9D8F',
  '#E9C46A',
  '#F4A261',
  '#E76F51',
];

export const buildBoringAvatarDataUri = (seed: string): string => {
  const svg = generateBeamAvatarSvg(seed || 'guest', BORING_AVATAR_COLORS);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
