import type { FeaturePacks } from '../../i18n/feature';
import { en } from './en';
import { ko } from './ko';
import { ru } from './ru';
import { th } from './th';
import type { DeadlineStrings } from './types';
import { uz } from './uz';
import { vi } from './vi';
import { zh } from './zh';

export type { DeadlineStrings } from './types';

export const DEADLINE_PACKS: FeaturePacks<DeadlineStrings> = { ko, en, zh, vi, th, uz, ru };
