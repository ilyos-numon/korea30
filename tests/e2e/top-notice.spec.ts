import { expect, test, type Page } from '@playwright/test';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const EXIF = 'tests/e2e/fixtures/photo-exif.jpg';

/** 진입 애니메이션이 끝난 뒤 캡처한다 (고정 sleep 아님) */
async function settle(page: Page): Promise<void> {
  await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime ?? 0)).map((a) => a.finished.catch(() => undefined))));
}

// 사진 저장일 2026-10-27, EXIF 촬영일 2026-10-20 → 만료일 2028-10-20
async function savePhoto(page: Page): Promise<void> {
  await seedLang(page, 'vi');
  await page.clock.setFixedTime(new Date('2026-10-27T10:00:00'));
  await page.goto('/#/work');
  await expect(page.getByTestId('screen-work')).toBeVisible();
  await page.getByTestId('photo-camera').setInputFiles(EXIF);
  await expect(page.getByTestId('photo-item')).toHaveCount(1);
}

// 사진을 지워도 백업 알림 조건(기록 있음)이 남도록 근무 기록 1건을 둔다
async function addShift(page: Page): Promise<void> {
  await page.getByTestId('work-shift-date').fill('2026-10-05');
  await page.getByTestId('work-shift-start').fill('09:00');
  await page.getByTestId('work-shift-end').fill('18:00');
  await page.getByTestId('work-shift-break').fill('60');
  await page.getByTestId('work-shift-add').click();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
}

async function gotoQuestAt(page: Page, iso: string): Promise<void> {
  await page.clock.setFixedTime(new Date(iso));
  await page.goto('/#/');
  await page.reload();
  await expect(page.getByTestId('screen-quest')).toBeVisible();
}

async function fireInstallPrompt(page: Page): Promise<void> {
  await page.evaluate(() => {
    const ev = new Event('beforeinstallprompt', { cancelable: true }) as Event & { prompt: () => Promise<void> };
    ev.prompt = () => Promise.resolve();
    window.dispatchEvent(ev);
  });
}

test('only the expired-photo notice shows, then backup reminder, then install hint', async ({ page }) => {
  await savePhoto(page);
  await addShift(page);
  await gotoQuestAt(page, '2028-10-21T10:00:00');
  await fireInstallPrompt(page);

  // 1. 만료 사진 안내만
  await expect(page.getByTestId('expired-photos-prompt')).toBeVisible();
  await expect(page.getByTestId('backup-reminder')).toHaveCount(0);
  await expect(page.getByTestId('install-hint')).toHaveCount(0);
  await settle(page);
  await page.screenshot({ path: `${SHOT_DIR}/top-notice-priority-vi.png`, fullPage: true });

  // 2. 삭제 후 백업 알림만
  await page.getByTestId('expired-photos-delete').click();
  await expect(page.getByTestId('photo-purged')).toHaveAttribute('data-count', '1');
  await expect(page.getByTestId('expired-photos-prompt')).toHaveCount(0);
  await expect(page.getByTestId('backup-reminder')).toBeVisible();
  await expect(page.getByTestId('install-hint')).toHaveCount(0);

  // 3. 백업 알림 닫기 → 홈 화면 추가 권유
  await page.getByTestId('backup-reminder-close').click();
  await expect(page.getByTestId('backup-reminder')).toHaveCount(0);
  await expect(page.getByTestId('install-hint')).toBeVisible();
  await expect(page.getByTestId('install-hint')).toHaveAttribute('data-mode', 'prompt');
  await expect(page.getByTestId('expired-photos-prompt')).toHaveCount(0);
});

test('no expired photo and recent backup: only the install hint shows', async ({ page }) => {
  await savePhoto(page);
  await page.goto('/#/tools');
  await expect(page.getByTestId('backup-section')).toBeVisible();
  await Promise.all([page.waitForEvent('download'), page.getByTestId('backup-export').click()]);
  await expect(page.getByTestId('backup-done')).toBeVisible();

  await gotoQuestAt(page, '2027-01-10T10:00:00');
  await fireInstallPrompt(page);
  await expect(page.getByTestId('install-hint')).toBeVisible();
  await expect(page.getByTestId('expired-photos-prompt')).toHaveCount(0);
  await expect(page.getByTestId('backup-reminder')).toHaveCount(0);
});
