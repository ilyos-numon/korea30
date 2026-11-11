import type { WorklogStrings } from './types';

/** null, если не число */
function toNum(v: number | string): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

const cnt = (v: number | string): string => String(toNum(v) ?? (String(v) || '-'));

const won = (v: number | string): string => {
  const n = toNum(v);
  return n === null ? `${String(v) || '-'} вон` : `${n.toLocaleString('ru-RU')} вон`;
};

const hoursMinutes = (v: number | string): string => {
  const n = toNum(v);
  if (n === null) return `${String(v) || '-'} мин`;
  const h = Math.floor(Math.abs(n) / 60);
  const m = Math.abs(n) % 60;
  return `${n < 0 ? '-' : ''}${h} ч ${m} мин`;
};

export const ru: WorklogStrings = {
  title: 'Учёт работы',
  intro: 'Запишите время прихода и ухода — мы оценим зарплату за этот месяц. Введённые данные хранятся только на этом устройстве.',
  month: 'Выберите месяц',
  shiftHeading: 'Добавить смену',
  shiftDate: 'Дата',
  shiftStart: 'Время прихода',
  shiftEnd: 'Время ухода',
  shiftBreak: 'Перерыв (минуты)',
  shiftHoliday: 'Я работал(а) в выходной',
  shiftMemo: 'Заметка',
  shiftOvernightHint: 'Если время ухода раньше времени прихода, считаем, что смена закончилась на следующий день.',
  shiftAdd: 'Добавить запись',
  errBadDate: 'Проверьте дату.',
  errBadTime: 'Проверьте время.',
  errZeroLength: 'Время прихода и ухода совпадает.',
  errTooLong: 'Одна смена длиннее 16 часов. Проверьте время.',
  errBreakTooLong: 'Перерыв длиннее смены.',
  errBadBreak: 'Введите перерыв целым числом минут (0 или больше).',
  errFuture: 'Нельзя записать дату позже сегодняшней.',
  listHeading: 'Смены за этот месяц',
  empty: 'В этом месяце записей пока нет. Добавьте время прихода и ухода выше.',
  breakMinutes: (v) => `Перерыв ${toNum(v) ?? (String(v) || '-')} мин`,
  holidayTag: 'Выходной',
  delete: 'Удалить',
  profileHeading: 'Почасовая оплата и место работы',
  wage: 'Почасовая оплата (вон)',
  wageHint: 'Укажите почасовую оплату из трудового договора или расчётного листка.',
  size: (v) => `На месте работы ${cnt(v)} и больше работников`,
  sizeYes: (v) => `${cnt(v)} и больше`,
  sizeNo: (v) => `Меньше ${cnt(v)}`,
  sizeUnknown: 'Не знаю',
  weekStart: 'Начало недели',
  weekStartMon: 'Понедельник',
  weekStartSun: 'Воскресенье',
  detailsHeading: 'Данные о вас и работодателе (для черновика жалобы)',
  detailsHint: 'Можно оставить пустым — расчёт всё равно работает. Используется только в черновике жалобы.',
  workerName: 'Имя',
  workerBirth: 'Дата рождения',
  workerPhone: 'Телефон',
  workerAddress: 'Адрес',
  companyName: 'Название места работы',
  employerName: 'Руководитель (представитель)',
  employerAddress: 'Адрес места работы',
  employerPhone: 'Телефон места работы',
  startDate: 'Дата начала работы',
  endDate: 'Дата увольнения',
  profileSave: 'Сохранить',
  profileSaved: 'Сохранено.',
  errWage: 'Вводите почасовую оплату только цифрами.',
  totalsHeading: 'Расчёт за этот месяц',
  totalWorked: 'Всего отработано',
  totalRegular: 'Установленное рабочее время',
  totalOvertime: 'Сверхурочная работа',
  totalNight: 'Ночная работа',
  totalHoliday: 'Работа в выходной',
  basePay: 'Основная оплата',
  premiumPay: 'Доплаты',
  expectedGross: 'Ожидаемая зарплата (до налогов)',
  hoursMinutes,
  won,
  wageMissing: 'Сохраните почасовую оплату, чтобы увидеть суммы.',
  minWageWarning: (v) => `Введённая почасовая оплата ниже минимальной зарплаты этого года (${won(v)}). Проверьте.`,
  noteSmallWorkplaceNoPremium: (v) =>
    `Для мест работы, где меньше ${cnt(v)} работников, доплаты за сверхурочную, ночную работу и работу в выходной не включены в расчёт.`,
  noteWorkplaceSizeUnknown: (v) =>
    `Число работников неизвестно, поэтому доплаты включены в расчёт. Если работников меньше ${cnt(v)}, сумма может отличаться.`,
  noteBelowMinWage: 'Почасовая оплата ниже минимальной зарплаты. Проверьте.',
  noteWeeklyHolidayPayNotIncluded: 'Оплата еженедельного выходного в этот расчёт не входит.',
  compareHeading: 'Сравнить с расчётным листком',
  compareHint: 'Введите суммы из расчётного листка за этот месяц — покажем разницу с расчётом.',
  compareEarnings: 'Начисления',
  compareDeductions: 'Удержания',
  compareRun: 'Сравнить',
  errRequired: 'Введите число (если нет — 0)',
  errNotNumber: 'Только цифры',
  errTooLarge: 'Не больше 100 млн вон',
  compareExpected: 'Расчёт по учёту работы',
  compareReported: 'Облагаемые начисления в листке',
  compareDiff: 'Разница с расчётом',
  statusMatch: 'Почти совпадает с расчётом.',
  statusLower: 'В расчётном листке меньше, чем по расчёту. Проверьте.',
  statusHigher: 'В расчётном листке больше, чем по расчёту.',
  unpaidEstimate: 'Предполагаемая невыплаченная сумма',
  deductionMismatch: (v) => `Удержаний, которые отличаются от расчёта: ${toNum(v) ?? (String(v) || '-')}. Проверьте.`,
  ask1350: 'Если нужна оценка, обратитесь по номеру 1350 (консультационный центр Министерства труда и занятости).',
  statementHeading: 'Текст жалобы (черновик)',
  statementHint: 'Попадёт в PDF на корейском языке. Можно исправить самому.',
  statementReset: 'Вернуть предложенный текст',
  pdf: 'Создать PDF с доказательствами',
  pdfHint: 'Один файл: учёт прихода и ухода, расчёт по месяцам, сравнение с расчётным листком и черновик жалобы. Создаётся только на этом устройстве.',
  pdfBusy: 'Создаём PDF…',
  pdfErrorEmpty: 'Нет записей о работе, поэтому PDF создать нельзя.',
  pdfErrorLibrary: 'Не удалось создать PDF. Попробуйте позже.',
  wipe: 'Удалить весь учёт работы',
  wipeAsk: 'Удалить все смены, почасовую оплату и данные о месте работы, сохранённые на этом устройстве?',
  wipeConfirm: 'Удалить всё',
  wipeCancel: 'Отмена',
  wiped: 'Весь учёт работы удалён.',
};
