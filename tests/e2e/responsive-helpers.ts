import { expect, type Browser, type BrowserContext, type Page } from "@playwright/test";

export type ResponsiveViewport = {
  name: string;
  width: number;
  height: number;
  mobile?: boolean;
  touch?: boolean;
  dpr?: number;
};

export const crossEngineViewports: ResponsiveViewport[] = [
  { name: "compact-phone", width: 320, height: 568, mobile: true, touch: true, dpr: 2 },
  { name: "modern-phone", width: 390, height: 844, mobile: true, touch: true, dpr: 3 },
  { name: "large-phone", width: 430, height: 932, mobile: true, touch: true, dpr: 3 },
  { name: "phone-landscape", width: 667, height: 375, mobile: true, touch: true, dpr: 2 },
  { name: "large-phone-landscape", width: 844, height: 390, mobile: true, touch: true, dpr: 3 },
  { name: "tablet-portrait", width: 768, height: 1024, touch: true, dpr: 2 },
  { name: "tablet-air-portrait", width: 820, height: 1180, touch: true, dpr: 2 },
  { name: "tablet-landscape", width: 1024, height: 768, touch: true, dpr: 2 },
  { name: "tablet-air-landscape", width: 1180, height: 820, touch: true, dpr: 2 },
  { name: "short-laptop", width: 1280, height: 720 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "desktop", width: 1920, height: 1080 },
  { name: "large-desktop", width: 2560, height: 1440 },
  { name: "ultrawide", width: 3440, height: 1440 },
  { name: "portrait-monitor", width: 1080, height: 1920 },
  { name: "4k-desktop", width: 3840, height: 2160 },
];

export const chromiumDeviceMatrix: ResponsiveViewport[] = [
  { name: "iphone-se-legacy", width: 320, height: 568, mobile: true, touch: true, dpr: 2 },
  { name: "android-compact", width: 360, height: 640, mobile: true, touch: true, dpr: 3 },
  { name: "android-tall", width: 360, height: 800, mobile: true, touch: true, dpr: 3 },
  { name: "iphone-8", width: 375, height: 667, mobile: true, touch: true, dpr: 2 },
  { name: "iphone-14", width: 390, height: 844, mobile: true, touch: true, dpr: 3 },
  { name: "iphone-15", width: 393, height: 852, mobile: true, touch: true, dpr: 3 },
  { name: "pixel-7", width: 412, height: 915, mobile: true, touch: true, dpr: 2.625 },
  { name: "iphone-pro-max", width: 430, height: 932, mobile: true, touch: true, dpr: 3 },
  { name: "minimum-square", width: 320, height: 320, mobile: true, touch: true, dpr: 2 },
  { name: "small-phone-landscape", width: 568, height: 320, mobile: true, touch: true, dpr: 2 },
  { name: "phone-landscape", width: 667, height: 375, mobile: true, touch: true, dpr: 2 },
  { name: "large-phone-landscape", width: 844, height: 390, mobile: true, touch: true, dpr: 3 },
  { name: "max-phone-landscape", width: 932, height: 430, mobile: true, touch: true, dpr: 3 },
  { name: "small-tablet", width: 600, height: 960, touch: true, dpr: 2 },
  { name: "ipad-portrait", width: 768, height: 1024, touch: true, dpr: 2 },
  { name: "ipad-air-portrait", width: 820, height: 1180, touch: true, dpr: 2 },
  { name: "ipad-landscape", width: 1024, height: 768, touch: true, dpr: 2 },
  { name: "ipad-air-landscape", width: 1180, height: 820, touch: true, dpr: 2 },
  { name: "short-laptop", width: 1280, height: 720 },
  { name: "standard-laptop", width: 1366, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "large-desktop", width: 1920, height: 1080 },
  { name: "ultrawide", width: 2560, height: 1080 },
  { name: "high-resolution", width: 2560, height: 1440 },
  { name: "wide-ultrawide", width: 3440, height: 1440 },
  { name: "4k-desktop", width: 3840, height: 2160 },
  { name: "portrait-display", width: 1080, height: 1920 },
  { name: "portrait-monitor", width: 1440, height: 2560 },
];

export const shortLandscapeViewports = chromiumDeviceMatrix.filter(
  ({ width, height }) => width >= height && height <= 430,
);

export function widthSweep() {
  const widths = new Set<number>();
  for (let width = 320; width <= 2560; width += 16) widths.add(width);
  for (let width = 2624; width <= 3840; width += 64) widths.add(width);

  for (const boundary of [420, 560, 640, 720, 768, 899, 900, 960, 1023, 1024, 1152, 1280, 1536, 1920, 2560, 3440, 3840]) {
    widths.add(boundary - 1);
    widths.add(boundary);
    widths.add(boundary + 1);
  }

  return [...widths].sort((left, right) => left - right);
}

export function heightSweep() {
  const heights = new Set<number>();
  for (let height = 320; height <= 1200; height += 40) heights.add(height);
  for (let height = 1280; height <= 2160; height += 160) heights.add(height);

  for (const boundary of [375, 390, 430, 480, 568, 600, 699, 700, 768, 844, 900, 1024, 1180, 1440, 1920, 2160]) {
    heights.add(boundary - 1);
    heights.add(boundary);
    heights.add(boundary + 1);
  }

  return [...heights].sort((left, right) => left - right);
}

export async function openResponsivePage(
  browser: Browser,
  viewport: ResponsiveViewport,
  options: { reducedMotion?: boolean; blockExternalFonts?: boolean } = {},
) {
  const browserName = browser.browserType().name();
  const contextOptions = {
    viewport: { width: viewport.width, height: viewport.height },
    screen: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.dpr ?? 1,
    hasTouch: viewport.touch ?? false,
    reducedMotion: options.reducedMotion ? ("reduce" as const) : ("no-preference" as const),
    colorScheme: "dark" as const,
  };
  const context: BrowserContext = await browser.newContext(
    browserName === "firefox"
      ? contextOptions
      : { ...contextOptions, isMobile: viewport.mobile ?? false },
  );

  if (options.blockExternalFonts) {
    await context.route("https://api.fontshare.com/**", (route) => route.abort());
  }

  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator("main").waitFor({ state: "visible" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });

  return { context, page };
}

export async function settleLayout(page: Page) {
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
}

export async function collectLayoutIssues(page: Page) {
  return page.evaluate(() => {
    const tolerance = 2;
    const viewportWidth = document.documentElement.clientWidth;
    const issues: string[] = [];
    const selector = [
      "header nav",
      "main section",
      "main h1",
      "main h2",
      "main h3",
      "main h4",
      "main p",
      "main a",
      "main button",
      "main img",
      "main video",
      "footer",
      "footer a",
      "footer p",
      "footer span",
      "[data-project-card]",
      "[data-skill-panel]",
      "[data-achievement-node]",
      "[data-hero-affiliations]",
    ].join(",");

    if (document.documentElement.scrollWidth > viewportWidth + tolerance) {
      issues.push(
        `document scrollWidth ${document.documentElement.scrollWidth}px exceeds ${viewportWidth}px`,
      );
    }

    for (const element of document.querySelectorAll<HTMLElement>(selector)) {
      if (element.closest('[aria-hidden="true"], dialog:not([open]), [hidden]')) continue;

      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number.parseFloat(style.opacity) === 0 ||
        rect.width < 1 ||
        rect.height < 1
      ) {
        continue;
      }

      const label =
        element.getAttribute("aria-label") ||
        element.textContent?.trim().replace(/\s+/g, " ").slice(0, 72) ||
        element.tagName.toLowerCase();

      if (rect.left < -tolerance || rect.right > viewportWidth + tolerance) {
        issues.push(
          `${element.tagName.toLowerCase()} “${label}” spans ${rect.left.toFixed(1)}..${rect.right.toFixed(1)}px`,
        );
      }

      const transformedByMotion = style.transform !== "none";

      if (
        element.clientWidth > 0 &&
        element.scrollWidth > element.clientWidth + tolerance &&
        !transformedByMotion &&
        !element.closest("[data-responsive-audit-allow-overflow]")
      ) {
        issues.push(
          `${element.tagName.toLowerCase()} “${label}” clips ${element.scrollWidth - element.clientWidth}px horizontally`,
        );
      }

      let ancestor = element.parentElement;
      while (ancestor && ancestor !== document.body) {
        const ancestorStyle = getComputedStyle(ancestor);
        if (["hidden", "clip"].includes(ancestorStyle.overflowX)) {
          const ancestorRect = ancestor.getBoundingClientRect();
          if (
            rect.left < ancestorRect.left - tolerance ||
            rect.right > ancestorRect.right + tolerance
          ) {
            issues.push(
              `${element.tagName.toLowerCase()} “${label}” is clipped by ${ancestor.tagName.toLowerCase()}.${ancestor.className}`,
            );
          }
          break;
        }
        ancestor = ancestor.parentElement;
      }
    }

    return [...new Set(issues)].slice(0, 30);
  });
}

export async function expectNoLayoutIssues(page: Page, label: string) {
  const issues = await collectLayoutIssues(page);
  expect(issues, `${label}\n${issues.join("\n")}`).toEqual([]);
}

export async function visibleLocator(page: Page, role: "button" | "link", name: string) {
  const candidates = page.getByRole(role, { name, exact: true });
  for (let index = 0; index < (await candidates.count()); index += 1) {
    const candidate = candidates.nth(index);
    if (await candidate.isVisible()) return candidate;
  }
  throw new Error(`No visible ${role} named ${name}`);
}
