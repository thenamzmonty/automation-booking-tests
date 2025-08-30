// tests/booking.spec.ts
import { test, expect } from '@playwright/test';

// Helpers to format dynamic dates
function pad(n: number) { return String(n).padStart(2, '0'); }
function fmt(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

test('Room booking flow (dynamic dates: tomorrow + 1 night)', async ({ page }) => {
  // Compute dynamic dates: tomorrow -> tomorrow+1
  const today = new Date();
  const checkinDate = new Date(today); checkinDate.setDate(today.getDate() + 1);
  const checkoutDate = new Date(today); checkoutDate.setDate(today.getDate() + 2);
  const checkin = fmt(checkinDate);
  const checkout = fmt(checkoutDate);
  const expectedDatesText = `${checkin} - ${checkout}`;

  // 1) Open site
  await page.goto('https://automationintesting.online/');

  // 2) Click hero "Book Now"
  await page.locator('a.btn.btn-primary.btn-lg[href="#booking"]', { hasText: 'Book Now' }).click();

  // 3) Choose a room & click its "Book now" WITH the dynamic dates in href
  await page
    .locator(`a.btn.btn-primary[href*="checkin=${checkin}"][href*="checkout=${checkout}"]`, { hasText: /book now/i })
    .first()
    .click();

  // 4) Reservation page checks
  await expect(page).toHaveURL(/\/reservation/);
  await expect(page.locator('h1.fw-bold.mb-2')).toHaveText('Single Room');
  await expect(page.locator('div.rbc-calendar')).toBeVisible();

  // 5) Price Summary check
  const summaryRow = page.locator('div.d-flex.justify-content-between.mb-2').first();
  const leftSpan = summaryRow.locator('span').nth(0);
  const rightSpan = summaryRow.locator('span').nth(1);

  const leftText = (await leftSpan.innerText()).trim();   // e.g. "£100 x 1 nights"
  const rightText = (await rightSpan.innerText()).trim(); // e.g. "£100"

  await expect(leftSpan).toHaveText(/^£\d+\s*x\s*1\s*nights$/i);

  const m = leftText.match(/^£(\d+)\s*x\s*(\d+)\s*nights$/i);
  expect(m, `Unexpected summary left text: "${leftText}"`).not.toBeNull();
  const nightly = Number(m![1]);
  const nights = Number(m![2]);

  const totalMatch = rightText.match(/^£(\d+)$/);
  expect(totalMatch, `Unexpected summary right text: "${rightText}"`).not.toBeNull();
  const displayedTotal = Number(totalMatch![1]);
  expect(displayedTotal).toBe(nightly * nights);

  // 6) Click "Reserve Now" (button that reveals form)
  await page.locator('#doReservation.btn.btn-primary.w-100.mb-3', { hasText: /reserve now/i }).click();

  // 7) Validation: submit empty to trigger errors
  await page.locator('button.btn.btn-primary.w-100.mb-3', { hasText: /reserve now/i }).click();

  const expectedErrors = [
    'size must be between 3 and 18',
    'size must be between 11 and 21',
    'Firstname should not be blank',
    'Lastname should not be blank',
    'must not be empty',
    'size must be between 3 and 30',
    'must not be empty',
  ];
  for (const msg of expectedErrors) {
    await expect(page.locator(`li:has-text("${msg}")`)).toBeVisible();
  }

  // Fill form with valid data
  await page.locator('input.form-control.room-firstname[placeholder="Firstname"][name="firstname"]').fill('John');
  await page.locator('input.form-control.room-lastname[placeholder="Lastname"][name="lastname"]').fill('Doe');
  await page.locator('input.form-control.room-email[placeholder="Email"][name="email"]').fill('john.doe+test@example.com');
  await page.locator('input.form-control.room-phone[placeholder="Phone"][name="phone"]').fill('01234567890');

  // Submit again
  await page.locator('button.btn.btn-primary.w-100.mb-3', { hasText: /reserve now/i }).click();

  // 8) Booking confirmed section
  await expect(page.locator('h2.card-title.fs-4.fw-bold.mb-3')).toHaveText('Booking Confirmed');

  // 9) Confirm displayed dates match dynamic checkin/checkout
  await expect(page.locator('strong', { hasText: expectedDatesText })).toBeVisible();
});
