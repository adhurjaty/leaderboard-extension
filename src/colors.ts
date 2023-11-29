export interface Color {
  red: number;
  green: number;
  blue: number;
}

export const SOLID_WIN_COLOR = {
  red: 1,
  green: 229 / 255,
  blue: 153 / 255,
} as const;

export const TIME_WIN_COLOR = {
  red: 201 / 255,
  green: 218 / 255,
  blue: 248 / 255,
} as const;

export const GUESS_WIN_COLOR = {
  red: 234 / 255,
  green: 209 / 255,
  blue: 220 / 255,
} as const;

export const convertToCssColor = (color: Color) => {
  return `${color.red * 255} ${color.green * 255} ${color.blue * 255}`
}
