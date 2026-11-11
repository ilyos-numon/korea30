import type { FeaturePacks } from '../../i18n/feature';
import { en } from './en';
import { ko } from './ko';
import { ru } from './ru';
import { th } from './th';
import type { UiKitStrings } from './types';
import { uz } from './uz';
import { vi } from './vi';
import { zh } from './zh';

export type { UiKitStrings } from './types';

export const UI_PACKS: FeaturePacks<UiKitStrings> = { ko, en, zh, vi, th, uz, ru };
