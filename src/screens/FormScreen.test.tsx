import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PROGRESS_KEY, type ProgressStorage } from '../quest/progress';
import { FormScreen } from './FormScreen';
import { LangContext, langValue } from '../i18n/LangContext';

function memoryStorage(initial?: string): ProgressStorage {
  const map = new Map<string, string>();
  if (initial !== undefined) map.set(PROGRESS_KEY, initial);
  return {
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

function tag(html: string, el: string, testId: string): string {
  const m = html.match(new RegExp(`<${el}[^>]*data-testid="${testId}"[^>]*>`));
  return m ? m[0] : '';
}

describe('FormScreen', () => {
  it('renders 13 numbered fields with guide for field 1 by default', () => {
    const html = renderToString(<FormScreen storage={memoryStorage()} />);
    expect(html).toContain('data-testid="screen-form"');
    expect(html).toContain('data-testid="form-sheet"');
    for (let no = 1; no <= 13; no++) {
      expect(html).toContain(`data-testid="form-field-${no}"`);
    }
    expect(html).not.toContain('data-testid="form-field-14"');
    expect(html).toMatch(/data-testid="form-guide-no"[^>]*>①</);
    expect(html).toContain('data-testid="form-ask-officer"');
    expect(tag(html, 'button', 'form-prev')).toContain('disabled');
    expect(tag(html, 'button', 'form-next')).not.toContain('disabled');
    expect(tag(html, 'button', 'form-field-1')).toContain('aria-pressed="true"');
    expect(tag(html, 'button', 'form-field-2')).toContain('aria-pressed="false"');
  });

  it('shows the sample note and back link', () => {
    const html = renderToString(<FormScreen storage={memoryStorage()} />);
    expect(html).toContain('data-testid="form-sample-note"');
    expect(html).toContain('Đây là mẫu giả lập.');
    expect(tag(html, 'a', 'form-back-quest')).toContain('href="#/"');
    expect(html).toContain('data-testid="form-submitted"');
    expect(html).not.toContain('data-testid="form-submitted-msg"');
    expect(html).not.toContain('data-testid="form-quest-done"');
  });

  it('initialNo=13 shows ⑬ with next disabled and no officer note', () => {
    const html = renderToString(<FormScreen storage={memoryStorage()} initialNo={13} />);
    expect(html).toMatch(/data-testid="form-guide-no"[^>]*>⑬</);
    expect(tag(html, 'button', 'form-next')).toContain('disabled');
    expect(tag(html, 'button', 'form-prev')).not.toContain('disabled');
    expect(html).not.toContain('data-testid="form-ask-officer"');
    expect(html).toContain('13 / 13');
  });

  it('initialNo=9 shows the address guide and example', () => {
    const html = renderToString(<FormScreen storage={memoryStorage()} initialNo={9} />);
    expect(html).toMatch(/data-testid="form-guide-no"[^>]*>⑨</);
    expect(tag(html, 'p', 'form-guide-label') || tag(html, 'h2', 'form-guide-label')).not.toBe('');
    expect(html).toContain('체류지');
    expect(html).toContain('data-testid="form-guide-example"');
    expect(html).toContain('Ví dụ · 예</span>');
    expect(html).toContain('<span class="form-example-value">○○시 ○○구 ○○로 12, 301호</span>');
  });

  it('contains no judgement words', () => {
    for (let no = 1; no <= 13; no++) {
      const html = renderToString(<FormScreen storage={memoryStorage()} initialNo={no} />);
      expect(html).not.toMatch(/틀렸|잘못|위반|불법/);
    }
  });

  it('zh provider renders Chinese UI with Korean kept and China example', () => {
    const zh = langValue('zh');
    const html = renderToString(
      <LangContext.Provider value={zh}>
        <FormScreen storage={memoryStorage()} initialNo={6} />
      </LangContext.Provider>,
    );
    expect(html).toContain(zh.ui.formTitle);
    expect(html).toContain(zh.ui.formSampleNote);
    expect(html).toContain(`${zh.ui.formExample} · 예</span>`);
    expect(html).toContain('<span class="form-example-value">CHINA</span>');
    expect(html).toContain('외국인등록 신청서');
    expect(html).toContain('가상 샘플 양식이에요.');
    expect(html).toContain('중국이라고 영문으로 써요.');
    expect(html).not.toMatch(/Ví dụ|Đơn đăng ký|Đây là mẫu|Về nhiệm vụ|Đã nộp|VIETNAM/);
  });
});
