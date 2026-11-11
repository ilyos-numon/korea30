import type { WorkProfile } from '../storage/db';
import type { WageCalcResult } from './calc';
import type { PayslipCompare } from './compare';

export interface ComplaintDraft {
  workerName: string;
  workerBirth: string;
  workerPhone: string;
  workerAddress: string;
  companyName: string;
  employerName: string;
  employerAddress: string;
  employerPhone: string;
  startDate: string | null;
  endDate: string | null;
  unpaidEstimate: number;
  statementKo: string;
}

function won(n: number): string {
  return n.toLocaleString('ko-KR');
}

function yearMonthKo(ym: string): string {
  const [y, m] = ym.split('-');
  return `${y}년 ${Number(m)}월`;
}

/** 명세서가 계산보다 적은 달(status 'lower')의 미지급 추정액 합계. 허용 오차 안(match)은 넣지 않는다 */
export function totalUnpaidEstimate(compares: readonly PayslipCompare[]): number {
  return compares.reduce((sum, c) => (c.status === 'lower' ? sum + c.unpaidEstimate : sum), 0);
}

function periodKo(p: WorkProfile, months: readonly WageCalcResult[]): string {
  if (p.startDate || p.endDate) return `${p.startDate ?? ''} ~ ${p.endDate ?? '현재'}`;
  const yms = months.map((m) => m.yearMonth).sort();
  if (yms.length === 0) return '';
  const first = yms[0];
  const last = yms[yms.length - 1];
  return first === last ? yearMonthKo(first) : `${yearMonthKo(first)} ~ ${yearMonthKo(last)}`;
}

/** "…기간 근무 기록으로 계산한 금액과 명세서 금액의 차액 ○○원을 확인해 주시기 바랍니다." 형태, 판단 문구 없음 */
export function defaultStatementKo(
  p: WorkProfile,
  months: readonly WageCalcResult[],
  compares: readonly PayslipCompare[],
): string {
  const company = p.companyName.trim() || '사업장';
  const period = periodKo(p, months);
  const periodPart = period ? `${period} 기간` : '근무 기간';
  const lines: string[] = [`저는 ${company}에서 일했습니다.`];

  const total = totalUnpaidEstimate(compares);
  if (total > 0) {
    lines.push(
      `${periodPart} 근무 기록으로 계산한 금액과 명세서 금액의 차액 ${won(total)}원을 확인해 주시기 바랍니다.`,
    );
    const lower = compares
      .filter((c) => c.status === 'lower')
      .slice()
      .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
    for (const c of lower) {
      lines.push(
        `- ${yearMonthKo(c.yearMonth)}: 근무 기록 계산 ${won(c.expectedGross)}원, 명세서 ${won(c.reportedTaxable)}원, 차액 ${won(c.unpaidEstimate)}원`,
      );
    }
  } else {
    lines.push(`${periodPart} 근무 기록으로 계산한 금액과 명세서 금액을 확인해 주시기 바랍니다.`);
  }
  lines.push('출퇴근 기록과 월별 계산표를 함께 붙입니다.');
  return lines.join('\n');
}

export function toComplaintDraft(
  p: WorkProfile,
  compares: readonly PayslipCompare[],
  statementKo: string,
): ComplaintDraft {
  return {
    workerName: p.workerName,
    workerBirth: p.workerBirth,
    workerPhone: p.workerPhone,
    workerAddress: p.workerAddress,
    companyName: p.companyName,
    employerName: p.employerName,
    employerAddress: p.employerAddress,
    employerPhone: p.employerPhone,
    startDate: p.startDate,
    endDate: p.endDate,
    unpaidEstimate: totalUnpaidEstimate(compares),
    statementKo,
  };
}
