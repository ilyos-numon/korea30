import { expect, test, type Locator, type Page } from '@playwright/test';
import { installIdbFailure, setIdbFailure } from './helpers/failStorage';
import { seedLang } from './helpers/lang';
import { MRZ_LINES } from './helpers/mrzImage';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const PLAIN = 'tests/e2e/fixtures/photo-plain.png';

// vi 문구 (src/ui/i18n/vi.ts) 와 ko 원문 (src/ui/i18n/ko.ts)
const VI_STORAGE_FULL = 'Bộ nhớ điện thoại đã đầy nên chưa lưu được. Hãy giải phóng dung lượng rồi thử lại.';
const KO_STORAGE_FULL = '휴대폰 저장 공간이 가득 차서 저장하지 못했어요. 공간을 비우고 다시 해 보세요.';
const VI_COPY_FAILED = 'Không sao chép được. Hãy nhấn giữ vào chữ để sao chép.';
const KO_COPY_FAILED = '복사하지 못했어요. 글자를 길게 눌러 복사해 보세요.';
const VI_PDF_UNREAD = 'Không đọc được ảnh nên PDF được tạo mà không có ảnh.';
const KO_PDF_UNREAD = '사진을 읽지 못해서 사진 없이 PDF를 만들었어요.';
const VI_SHIFT_DELETED = 'Đã xóa bản ghi giờ làm.';
const KO_SHIFT_DELETED = '근무 기록을 지웠어요.';
const VI_KEPT = 'Đã giữ 1 ô bạn tự sửa.';
const KO_KEPT = '직접 고친 칸 1개는 그대로 두었어요.';

async function resetDb(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase('korea30');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      }),
  );
}

async function open(page: Page, hash: string, screenId: string, now: string): Promise<void> {
  await seedLang(page, 'vi');
  await installIdbFailure(page);
  await page.clock.setFixedTime(new Date(now));
  await page.goto(hash);
  await expect(page.getByTestId(screenId)).toBeVisible();
  await resetDb(page);
  await page.reload();
  await expect(page.getByTestId(screenId)).toBeVisible();
}

async function noHorizontalScroll(page: Page): Promise<void> {
  const ok = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(ok).toBe(true);
}

/** 안내가 화면 안에 오도록 스크롤한 뒤 viewport 만 캡처 (앱이 내부 컨테이너로 스크롤한다) */
async function shoot(page: Page, note: Locator, name: string): Promise<void> {
  await note.scrollIntoViewIfNeeded();
  // 고정 헤더에 가리지 않도록 화면 가운데로
  await note.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: `${SHOT_DIR}/${name}` });
}

async function expectViKo(note: Locator, vi: string, ko: string): Promise<void> {
  await expect(note).toBeVisible();
  await expect(note).toContainText(vi);
  await expect(note.locator('span[lang="ko"]')).toHaveText(ko);
}

async function addShift(page: Page, date: string): Promise<void> {
  await page.getByTestId('work-shift-date').fill(date);
  await page.getByTestId('work-shift-start').fill('09:00');
  await page.getByTestId('work-shift-end').fill('18:00');
  await page.getByTestId('work-shift-break').fill('60');
  await page.getByTestId('work-shift-add').click();
}

test('A work: quota on add shows storage full (vi + ko)', async ({ page }) => {
  await open(page, '/#/work', 'screen-work', '2026-10-15T10:00:00');
  await setIdbFailure(page, { write: 'quota' });
  await addShift(page, '2026-10-15');
  const err = page.getByTestId('work-storage-error');
  await expect(err).toHaveAttribute('data-code', 'quota');
  await expectViKo(err, VI_STORAGE_FULL, KO_STORAGE_FULL);
  await expect(page.locator('[data-testid="work-shift-row"][data-date="2026-10-15"]')).toHaveCount(0);
  await noHorizontalScroll(page);
  await shoot(page, err, 'wire-a-work-quota.png');
});

test('A stay: quota on save shows storage full (vi + ko)', async ({ page }) => {
  await open(page, '/#/deadline', 'screen-deadline', '2026-12-25T10:00:00');
  await setIdbFailure(page, { write: 'quota' });
  await page.getByTestId('stay-entry').fill('2026-10-01');
  await page.getByTestId('stay-save').click();
  const err = page.getByTestId('stay-storage-error');
  await expect(err).toHaveAttribute('data-code', 'quota');
  await expectViKo(err, VI_STORAGE_FULL, KO_STORAGE_FULL);
  await expect(page.getByTestId('deadline-timeline')).toHaveAttribute('data-preview', 'true');
  await expect(page.getByTestId('deadline-preview-note')).toBeVisible();
  await noHorizontalScroll(page);
  await shoot(page, err, 'wire-a-stay-quota.png');
});

test('B payslip: clipboard rejected shows copy failed (vi + ko)', async ({ page }) => {
  await seedLang(page, 'vi');
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new DOMException('denied', 'NotAllowedError')) },
    });
  });
  await page.goto('/#/payslip');
  await page.getByTestId('payslip-sample-b').click();
  await expect(page.getByTestId('payslip-ask')).toBeVisible();
  const btn = page.getByTestId('payslip-copy');
  await btn.click();
  const err = page.getByTestId('payslip-copy-error');
  await expect(err).toHaveAttribute('role', 'alert');
  await expectViKo(err, VI_COPY_FAILED, KO_COPY_FAILED);
  await expect(btn).not.toHaveClass(/is-copied/);
  await noHorizontalScroll(page);
  await shoot(page, err, 'wire-b-copy-failed.png');
});

test('C work: photo read failure still makes PDF and shows unread note (vi + ko)', async ({ page }) => {
  await open(page, '/#/work', 'screen-work', '2026-10-15T10:00:00');
  await addShift(page, '2026-10-15');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await page.getByTestId('photo-pick').setInputFiles(PLAIN);
  await expect(page.getByTestId('photo-item')).toHaveCount(1);
  await setIdbFailure(page, { read: 'unknown' });
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('work-pdf').click()]);
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  const note = page.getByTestId('work-pdf-photo-note');
  await expect(note).toHaveAttribute('data-reason', 'unread');
  await expectViKo(note, VI_PDF_UNREAD, KO_PDF_UNREAD);
  await noHorizontalScroll(page);
  await shoot(page, note, 'wire-c-pdf-unread.png');
});

test('D work: delete shows undo note and undo restores the row (vi + ko)', async ({ page }) => {
  await open(page, '/#/work', 'screen-work', '2026-10-15T10:00:00');
  await addShift(page, '2026-10-15');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await page.getByTestId('work-shift-delete').click();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(0);
  const note = page.getByTestId('work-undo-note');
  await expect(note).toHaveAttribute('role', 'status');
  await expectViKo(note, VI_SHIFT_DELETED, KO_SHIFT_DELETED);
  await expect(page.getByTestId('work-undo')).toBeVisible();
  await noHorizontalScroll(page);
  await shoot(page, note, 'wire-d-undo.png');
  await page.getByTestId('work-undo').click();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await expect(page.getByTestId('work-undo-note')).toHaveCount(0);
});

test('E passport: rescan keeps the edited box and tells how many (vi + ko)', async ({ page }) => {
  await seedLang(page, 'vi');
  await page.clock.setFixedTime(new Date('2026-12-25T10:00:00'));
  await page.goto('/#/passport');
  await resetDb(page);
  await page.reload();
  await expect(page.getByTestId('screen-passport')).toBeVisible();
  await page.getByTestId('passport-mrz-text').fill(MRZ_LINES.join('\n'));
  await page.getByTestId('passport-parse').click();
  const surname = page.getByTestId('passport-field-surname');
  await expect(surname).toHaveValue(/ERIKSSON/);
  await surname.fill('KIM');
  await page.getByTestId('passport-parse').click();
  await expect(surname).toHaveValue('KIM');
  const note = page.getByTestId('passport-kept-note');
  await expect(note).toHaveAttribute('data-count', '1');
  await expect(note).toHaveAttribute('role', 'status');
  await expect(note).toContainText(VI_KEPT);
  await expect(note.locator('span[lang="ko"]')).toContainText(KO_KEPT);
  await expect(page.getByTestId('passport-use-scanned')).toBeVisible();
  await noHorizontalScroll(page);
  await shoot(page, note, 'wire-e-kept.png');
});

test('F deadline: banner appears after local midnight without reload (vi)', async ({ page }) => {
  await seedLang(page, 'vi');
  await page.clock.install({ time: new Date('2026-12-22T10:00:00') });
  await page.goto('/#/deadline');
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
  await resetDb(page);
  await page.reload();
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
  await page.getByTestId('stay-entry').fill('2026-10-01');
  await page.getByTestId('stay-save').click();
  const item = page.locator('[data-testid="deadline-item"][data-kind="arcRegistration"]');
  await expect(item).toHaveAttribute('data-level', 'soon');
  await page.goto('/#/');
  // setSystemTime 은 타이머를 재예약하지 않으므로 visibilitychange 로 자정 타이머를 다시 잡게 한다
  await page.clock.setSystemTime(new Date('2026-12-22T23:59:00'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByTestId('deadline-banner')).toHaveCount(0);
  await page.clock.runFor('02:00');
  const banner = page.getByTestId('deadline-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('thời hạn lưu trú');
  await expect(banner).toHaveAttribute('title', /[가-힣]/);
  await noHorizontalScroll(page);
  await shoot(page, banner, 'wire-f-banner-after-midnight.png');
});
