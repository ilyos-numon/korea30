import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { BigCard } from './BigCard';
import { LangContext, langValue } from '../i18n/LangContext';
import { PACKS } from '../i18n/packs';

describe('BigCard', () => {
  it('renders dialog with korean text and close button, hides speak on server', () => {
    const html = renderToString(
      <BigCard ko="외국인등록을 하러 왔어요" vi="Tôi đến để đăng ký người nước ngoài" onClose={() => {}} />,
    );
    expect(html).toContain('data-testid="big-card"');
    expect(html).toContain('class="bigcard"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Thẻ chữ lớn"');
    expect(html).toContain(
      `<p data-testid="big-card-ko" class="bigcard-ko" lang="ko">외국인등록을 하러 왔어요</p>`,
    );
    expect(html).toContain(
      `<p data-testid="big-card-vi" class="bigcard-vi">Tôi đến để đăng ký người nước ngoài</p>`,
    );
    expect(html).toContain('data-testid="big-card-close"');
    expect(html).toContain('Đưa màn hình này cho nhân viên · 이 화면을 직원에게 보여주세요');
    expect(html).not.toContain('big-card-speak');
    expect(html).not.toContain('big-card-pron');
  });

  it('renders pronunciation when viPron is given', () => {
    const html = renderToString(
      <BigCard ko="안녕하세요" vi="Xin chào" viPron="an-nyoong-ha-sê-yô" onClose={() => {}} />,
    );
    expect(html).toContain(
      `<p data-testid="big-card-pron" class="bigcard-pron">an-nyoong-ha-sê-yô</p>`,
    );
  });
});

describe('BigCard (lang)', () => {
  it('renders selected-language fixed text under th provider', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('th')}>
        <BigCard ko="안녕하세요" vi="สวัสดีครับ" onClose={() => {}} />
      </LangContext.Provider>,
    );
    expect(html).toContain(PACKS.th.ui.close);
    expect(html).toContain(`${PACKS.th.ui.bigCardShow} · 이 화면을 직원에게 보여주세요`);
    expect(html).not.toContain('Đóng');
  });
});
