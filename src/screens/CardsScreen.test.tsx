import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CardsScreen } from './CardsScreen';
import { LangContext, langValue } from '../i18n/LangContext';

describe('CardsScreen', () => {
  it('renders three groups with cards and no big card by default', () => {
    const html = renderToString(<CardsScreen />);
    expect(html).toContain('data-testid="screen-cards"');
    expect(html).toContain('Thẻ nói tiếng Hàn');
    const groups = ['counter', 'daily', 'quest'].map((c) => html.indexOf(`data-testid="cards-group-${c}"`));
    for (const i of groups) expect(i).toBeGreaterThan(-1);
    expect(groups[0]).toBeLessThan(groups[1]);
    expect(groups[1]).toBeLessThan(groups[2]);
    expect(html).toContain('data-testid="card-b1"');
    expect(html).toContain('data-testid="card-q30"');
    expect(html.match(/data-testid="card-[^"]+"/g)).toHaveLength(42);
    expect(html).not.toContain('data-testid="big-card"');
  });

  it('opens the big card for initialOpenId', () => {
    const html = renderToString(<CardsScreen initialOpenId="b4" />);
    expect(html).toContain('data-testid="big-card"');
    expect(html).toMatch(/data-testid="big-card-ko"[^>]*>베트남어 통역이 가능한가요\?</);
  });

  it('ignores an unknown initialOpenId', () => {
    const html = renderToString(<CardsScreen initialOpenId="zz" />);
    expect(html).not.toContain('data-testid="big-card"');
  });

  it('renders in zh with the Chinese interpreter phrase', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('zh')}>
        <CardsScreen initialOpenId="b4" />
      </LangContext.Provider>,
    );
    expect(html).toContain('韩语说话卡');
    expect(html).not.toContain('카드를 누르면 크게 보여줘요');
    expect(html).toContain('중국어 통역이 가능한가요?');
    expect(html).not.toContain('Thẻ nói tiếng Hàn');
    expect(html).not.toContain('베트남어 통역이 가능한가요?');
    expect(html.match(/data-testid="card-[^"]+"/g)).toHaveLength(42);
  });
});
