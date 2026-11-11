import type { Lang, LangPack } from '../types';
import { en } from './en';
import { ru } from './ru';
import { th } from './th';
import { uz } from './uz';
import { vi } from './vi';
import { zh } from './zh';

export const PACKS: Readonly<Record<Lang, LangPack>> = { zh, vi, en, th, uz, ru };
