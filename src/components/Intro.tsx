import { useCallback, useEffect, useRef, useState, type JSX, type KeyboardEvent } from 'react';
import { useFeatureStrings } from '../i18n/feature';
import { UI_PACKS } from '../ui/i18n';
import { Icon } from './Icon';
import { prefersReducedMotion } from './motion';
import { vars } from './text';
import './intro.css';

const SLIDES = 4;

/** 1번 그림: 30개의 점이 차례로 차오르고 가운데 D+N 이 1 → 30 으로 센다 */
function RingArt(props: { active: boolean }): JSX.Element {
  const [n, setN] = useState(1);
  useEffect(() => {
    if (!props.active) return;
    if (prefersReducedMotion()) {
      setN(30);
      return;
    }
    setN(1);
    const start = performance.now() + 250;
    let raf = 0;
    const tick = (t: number): void => {
      const k = Math.min(30, Math.max(1, Math.floor((t - start) / 45) + 1));
      setN(k);
      if (k < 30) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [props.active]);
  const dots = Array.from({ length: 30 }, (_, i) => {
    const a = (i / 30) * Math.PI * 2 - Math.PI / 2;
    return { x: 140 + Math.cos(a) * 112, y: 140 + Math.sin(a) * 112 };
  });
  return (
    <div className="art art-ring" aria-hidden="true">
      <svg viewBox="0 0 280 280" width="100%" height="100%">
        <circle cx="140" cy="140" r="112" className="ring-track" />
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={i === 0 ? 8 : 6} className={i === 0 ? 'ring-dot ring-dot-first' : 'ring-dot'} style={vars({ '--i': i })} />
        ))}
      </svg>
      <div className="ring-center">
        <span className="ring-d num">{`D+${n}`}</span>
        <span className="ring-check">
          <Icon name="check" size={18} strokeWidth={2.6} />
        </span>
      </div>
    </div>
  );
}

/** 2번 그림: 신청서 칸 번호가 차례로 뜨고, 큰 글씨 카드가 옆에서 들어온다 */
function FormArt(): JSX.Element {
  return (
    <div className="art art-form" aria-hidden="true">
      <div className="art-paper">
        {[1, 2, 3, 4, 5].map((c, i) => (
          <div key={c} className={i === 1 ? 'paper-row paper-row-on' : 'paper-row'} style={vars({ '--i': i })}>
            <span className="paper-no">{c}</span>
            <span className="paper-line" />
          </div>
        ))}
      </div>
      <div className="art-bubble">
        <span className="bubble-ko" lang="ko">
          안녕하세요
        </span>
        <span className="bubble-sound">
          <Icon name="volume" size={18} />
        </span>
      </div>
    </div>
  );
}

/** 3번 그림: 한 주 근무 막대가 자라고, 명세서 줄에 확인 표시가 붙는다 */
function PayArt(): JSX.Element {
  const bars = [52, 70, 64, 88, 76, 38, 18];
  return (
    <div className="art art-pay" aria-hidden="true">
      <div className="art-chart">
        <span className="chart-head">
          <Icon name="clock" size={16} />
        </span>
        <div className="chart-bars">
          {bars.map((h, i) => (
            <span key={i} className="chart-bar" style={vars({ '--h': `${h}%`, '--i': i })} />
          ))}
        </div>
      </div>
      <div className="art-receipt">
        {['ok', 'ok', 'warn'].map((s, i) => (
          <div key={i} className="receipt-row" style={vars({ '--i': i })}>
            <span className="receipt-line" />
            <span className={`receipt-mark receipt-mark-${s}`}>
              <Icon name={s === 'ok' ? 'check' : 'alert'} size={14} strokeWidth={2.4} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 4번 그림: 달력의 한 날이 깜빡이고 종이 흔들린다, 휴대폰 안에 자물쇠 방패 */
function SafeArt(): JSX.Element {
  return (
    <div className="art art-safe" aria-hidden="true">
      <div className="art-cal">
        <div className="cal-head">
          <Icon name="calendar" size={16} />
          <span className="cal-bell">
            <Icon name="bell" size={16} />
          </span>
        </div>
        <div className="cal-grid">
          {Array.from({ length: 21 }, (_, i) => (
            <span key={i} className={i === 12 ? 'cal-day cal-day-on' : 'cal-day'} />
          ))}
        </div>
      </div>
      <div className="art-phone">
        <span className="phone-guard">
          <Icon name="guardCheck" size={40} strokeWidth={1.6} />
        </span>
        <span className="phone-spark phone-spark-1">
          <Icon name="sparkle" size={14} />
        </span>
        <span className="phone-spark phone-spark-2">
          <Icon name="sparkle" size={10} />
        </span>
      </div>
    </div>
  );
}

/** 언어 선택 직후 한 번 보이는 소개 페이지. 4장 슬라이드(가로로 넘김) + 건너뛰기 + 시작하기 */
export function Intro(props: { onDone: () => void }): JSX.Element {
  const { onDone } = props;
  const { t } = useFeatureStrings(UI_PACKS);
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const leaving = useRef(false);
  /** 버튼으로 넘길 때의 목표 장. 부드러운 스크롤 도중의 중간 위치로 active 가 되돌아가지 않게 한다 */
  const target = useRef<number | null>(null);
  const targetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slides = [
    { title: t.intro1Title, body: t.intro1Body, tone: 'blue', art: (a: boolean) => <RingArt active={a} /> },
    { title: t.intro2Title, body: t.intro2Body, tone: 'sun', art: () => <FormArt /> },
    { title: t.intro3Title, body: t.intro3Body, tone: 'jade', art: () => <PayArt /> },
    { title: t.intro4Title, body: t.intro4Body, tone: 'ink', art: () => <SafeArt /> },
  ];

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = (): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = el.clientWidth || 1;
        const idx = Math.max(0, Math.min(SLIDES - 1, Math.round(el.scrollLeft / w)));
        if (target.current !== null) {
          if (idx !== target.current) return;
          target.current = null;
        }
        setActive(idx);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      if (targetTimer.current) clearTimeout(targetTimer.current);
    };
  }, []);

  const go = useCallback((i: number): void => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(SLIDES - 1, i));
    target.current = next;
    if (targetTimer.current) clearTimeout(targetTimer.current);
    // 손가락으로 중간에 멈추는 경우를 위해 일정 시간 뒤에는 다시 스크롤 위치를 따른다
    targetTimer.current = setTimeout(() => {
      target.current = null;
    }, 900);
    el.scrollTo({ left: next * el.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    setActive(next);
  }, []);

  const finish = useCallback((): void => {
    if (leaving.current) return;
    leaving.current = true;
    const el = rootRef.current;
    if (el && typeof el.animate === 'function' && !prefersReducedMotion()) {
      const anim = el.animate(
        [
          { opacity: 1, transform: 'none' },
          { opacity: 0, transform: 'scale(1.02)' },
        ],
        { duration: 220, easing: 'ease-in', fill: 'forwards' },
      );
      anim.onfinish = () => onDone();
      anim.oncancel = () => onDone();
      return;
    }
    onDone();
  }, [onDone]);

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowRight') go(active + 1);
    if (e.key === 'ArrowLeft') go(active - 1);
  };

  const last = active === SLIDES - 1;

  return (
    <main ref={rootRef} data-testid="intro" className="intro" onKeyDown={onKey}>
      <div className="intro-top">
        <span className="app-brand intro-brand">
          Korea<b>30</b>
        </span>
        <button type="button" data-testid="intro-skip" className="btn btn-ghost btn-sm intro-skip" onClick={finish}>
          {t.introSkip}
        </button>
      </div>
      <div className="intro-progress" role="progressbar" aria-valuemin={1} aria-valuemax={SLIDES} aria-valuenow={active + 1} aria-label={t.introStepAria(active + 1, SLIDES)}>
        {slides.map((_, i) => (
          <span key={i} className="intro-seg" data-on={i <= active ? 'true' : undefined} />
        ))}
      </div>
      <div ref={trackRef} className="intro-track" tabIndex={-1}>
        {slides.map((s, i) => (
          <section
            key={i}
            className={`intro-slide intro-tone-${s.tone}`}
            data-testid={`intro-slide-${i + 1}`}
            data-active={i === active ? 'true' : 'false'}
            aria-hidden={i === active ? undefined : true}
            aria-label={t.introStepAria(i + 1, SLIDES)}
          >
            <div className="intro-art">
              <span className="intro-blob" />
              {s.art(i === active)}
            </div>
            <div className="intro-copy">
              <h1 className="intro-title">{s.title}</h1>
              <p className="intro-body">{s.body}</p>
            </div>
          </section>
        ))}
      </div>
      <div className="intro-actions">
        {last ? (
          <button type="button" data-testid="intro-start" className="btn btn-primary btn-lg btn-block intro-cta" onClick={finish}>
            {t.introStart}
            <Icon name="arrowRight" size={20} />
          </button>
        ) : (
          <button type="button" data-testid="intro-next" className="btn btn-primary btn-lg btn-block intro-cta" onClick={() => go(active + 1)}>
            {t.introNext}
            <Icon name="chevronRight" size={20} />
          </button>
        )}
      </div>
    </main>
  );
}
