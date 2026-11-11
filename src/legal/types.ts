export type VerifyStatus = 'verified' | 'unverified';
export type LegalUnit = 'won' | 'won/hour' | 'ppm' | 'days' | 'months' | 'hours' | 'minutes' | 'time' | 'workers' | 'years';
export interface LegalSource { law: string; article: string; url: string; checkedOn: string | null }
export interface LegalValue<T extends number | string = number> {
  id: LegalId; value: T; unit: LegalUnit; labelKo: string; source: LegalSource; status: VerifyStatus; note?: string;
}
export type WageLawId = 'minWageHourly2026' | 'overtimePremiumPpm' | 'nightPremiumPpm' | 'holidayPremiumWithin8Ppm'
  | 'holidayPremiumOver8Ppm' | 'dailyRegularMinutes' | 'weeklyRegularMinutes' | 'nightStart' | 'nightEnd'
  | 'premiumMinWorkers' | 'wageClaimYears';
export type StayLawId = 'arcRegistrationDays' | 'addressChangeReportDays' | 'extensionOpensMonthsBefore'
  | 'jobChangeApplyMonths' | 'arcLateFineMaxWon' | 'addressLateFineMaxWon' | 'overstayNote';
export type LegalId = WageLawId | StayLawId;
