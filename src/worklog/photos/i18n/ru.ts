import type { PhotoStrings } from './types';

/** '-', если значения нет или оно пустое (пустую строку не возвращает) */
const s = (v: unknown): string => {
  if (v === undefined || v === null) return '-';
  if (typeof v === 'number' && !Number.isFinite(v)) return '-';
  return String(v).trim() || '-';
};

/** Форма слова по числу: 1 месяц, 3 месяца, 12 месяцев. Неизвестное значение — форма many */
const plural = (n: unknown, one: string, few: string, many: string): string => {
  const x = Number(n);
  if (!Number.isInteger(x)) return many;
  const a = Math.abs(x) % 100;
  const b = a % 10;
  if (a >= 11 && a <= 14) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
};

export const ru: PhotoStrings = {
  heading: 'Фото работы',
  intro: 'Сохраняйте на этом устройстве фото, которые показывают вашу работу (экран терминала учёта времени, график смен и т. п.), с датой.',
  privacyNote: 'Фото хранятся только на этом устройстве. Геоданные и другие сведения о снимке удаляются перед сохранением.',
  dateLabel: 'Дата работы',
  shiftLabel: 'Привязать к смене',
  shiftNone: 'Не привязывать',
  shiftOption: (date, start, end) => `${s(date)} ${s(start)}–${s(end)}`,
  memoLabel: 'Заметка',
  camera: 'Снять камерой',
  pick: 'Выбрать фото',
  saving: 'Сохраняем…',
  saved: 'Сохранено',
  errorNotImage: 'Можно сохранить только файлы изображений.',
  errorTooLarge: (mb) => `Фото слишком большое. Выберите фото не больше ${s(mb)} МБ.`,
  errorDecode: 'Не удалось открыть это фото. Выберите другое.',
  errorQuota: 'На устройстве не хватает места. Попробуйте удалить старые фото.',
  errorUnknown: 'Не удалось сохранить. Попробуйте ещё раз.',
  empty: 'За этот месяц фото нет.',
  takenOn: (date) => `Снято ${s(date)}`,
  takenOnSaved: (date) => `Сохранено ${s(date)} (дата съёмки неизвестна)`,
  expiresOn: (date) => `Хранится до ${s(date)}`,
  expiringSoon: (days) => `Срок хранения закончится через ${s(days)} ${plural(days, 'день', 'дня', 'дней')}`,
  linkedShift: (label) => `Привязанная смена: ${s(label)}`,
  open: 'Открыть крупно',
  close: 'Закрыть',
  delete: 'Удалить',
  deleteAsk: 'Удалить это фото? Удалённое фото нельзя вернуть.',
  deleteConfirm: 'Удалить',
  deleteCancel: 'Отмена',
  expiryEditLabel: 'Изменить дату окончания хранения',
  expirySave: 'Сохранить дату',
  expiryErrorFormat: 'Введите дату в формате YYYY-MM-DD.',
  expiryErrorNotFuture: 'Выберите дату позже сегодняшней.',
  expiryCustomNote: 'Эту дату вы задали сами. Она не изменится, даже если поменять срок хранения.',
  retentionHeading: 'Срок хранения фото',
  retentionLabel: 'Срок хранения (месяцы)',
  retentionHint:
    'Это настройка приложения, а не срок, установленный законом. Когда срок закончится, приложение спросит, удалить ли фото. Чтобы хранить дольше, увеличьте срок. Доказательства, связанные с заработной платой, могут понадобиться дольше, поэтому увеличьте срок хранения или сохраните их отдельно в PDF с доказательствами.',
  retentionSave: 'Сохранить срок хранения',
  retentionSaved: (changed) => `Сохранено. Дата окончания хранения пересчитана для ${s(changed)} фото.`,
  retentionError: (min, max) => `Введите число от ${s(min)} до ${s(max)} месяцев.`,
  retentionApplyAsk: (n) => `После этого изменения срок хранения ${s(n)} фото закончится сразу. Приложение спросит, удалить ли их. Изменить?`,
  retentionApplyConfirm: 'Изменить',
  retentionApplyCancel: 'Отмена',
  purged: (n) => `Удалено фото с истёкшим сроком хранения: ${s(n)}.`,
  months: (n) => `${s(n)} ${plural(n, 'месяц', 'месяца', 'месяцев')}`,
  wipeIncludesPhotos: '«Удалить всё» удаляет и сохранённые фото.',
};
