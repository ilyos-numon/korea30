import type { FeaturePacks } from '../../i18n/feature';
import { en } from './en';
import { ko } from './ko';
import { ru } from './ru';
import { th } from './th';
import type { WorklogStrings } from './types';
import { uz } from './uz';
import { vi } from './vi';
import { zh } from './zh';

export type { WorklogStrings } from './types';

export const WORKLOG_PACKS: FeaturePacks<WorklogStrings> = { ko, en, zh, vi, th, uz, ru };
