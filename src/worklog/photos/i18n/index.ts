import type { FeaturePacks } from '../../../i18n/feature';
import { en } from './en';
import { ko } from './ko';
import { ru } from './ru';
import { th } from './th';
import type { PhotoStrings } from './types';
import { uz } from './uz';
import { vi } from './vi';
import { zh } from './zh';

export type { PhotoStrings } from './types';

export const PHOTO_PACKS: FeaturePacks<PhotoStrings> = { ko, en, zh, vi, th, uz, ru };
