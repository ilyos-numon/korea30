import type { FeaturePacks } from '../../i18n/feature';
import { en } from './en';
import { ko } from './ko';
import { ru } from './ru';
import { th } from './th';
import type { ToolsStrings } from './types';
import { uz } from './uz';
import { vi } from './vi';
import { zh } from './zh';

export type { ToolsStrings } from './types';

export const TOOLS_PACKS: FeaturePacks<ToolsStrings> = { ko, en, zh, vi, th, uz, ru };
