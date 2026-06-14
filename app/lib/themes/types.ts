/**
 * v7 theme token types.
 * Mirrors the shape of ./themes.json. Color tokens map to the
 * --color-* CSS variables and structure tokens to the --radius/
 * --shadow/--page-grad family defined per [data-theme] in globals.css.
 */

export type ThemeName = 'indigo' | 'purple' | 'bold';

export interface ThemeColorTokens {
  bg: string;
  surface: string;
  soft: string;
  tint: string;
  border: string;
  border2: string;
  ink: string;
  ink2: string;
  ink3: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  primaryMid: string;
  up: string;
  hot: string;
  warm: string;
}

export interface ThemeStructureTokens {
  radius: string;
  radiusLg: string;
  radiusXl: string;
  borderWidth: string;
  shadow: string;
  shadowCta: string;
  pageGrad: string;
}

export interface Theme {
  label: string;
  color: ThemeColorTokens;
  structure: ThemeStructureTokens;
}

export type Themes = Record<ThemeName, Theme>;
