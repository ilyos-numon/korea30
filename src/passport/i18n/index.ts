import type { FeaturePacks } from '../../i18n/feature';
import { en } from './en';
import { ko } from './ko';
import { ru } from './ru';
import { th } from './th';
import type { PassportStrings } from './types';
import { uz } from './uz';
import { vi } from './vi';
import { zh } from './zh';

export type { PassportStrings } from './types';

export const PASSPORT_PACKS: FeaturePacks<PassportStrings> = { ko, en, zh, vi, th, uz, ru };
