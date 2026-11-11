import type { FeaturePacks } from '../../i18n/feature';
import { en } from './en';
import { ko } from './ko';
import { ru } from './ru';
import { th } from './th';
import type { AboutStrings } from './types';
import { uz } from './uz';
import { vi } from './vi';
import { zh } from './zh';

export type { AboutStrings } from './types';

export const ABOUT_PACKS: FeaturePacks<AboutStrings> = { ko, en, zh, vi, th, uz, ru };
