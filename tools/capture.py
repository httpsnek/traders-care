"""Снимки и метрики для аудита лендинга.

python3 tools/capture.py            # traderscare: все языки, десктоп/мобайл, обе темы
python3 tools/capture.py rivals     # конкуренты: десктоп + мобайл, тёмная
"""
import json, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "docs/research/screens"
OUT.mkdir(parents=True, exist_ok=True)

VIEWPORTS = {
    "desktop": dict(viewport={"width": 1440, "height": 900}, device_scale_factor=1),
    "mobile": dict(viewport={"width": 390, "height": 844}, device_scale_factor=2,
                   is_mobile=True, has_touch=True,
                   user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"),
}

METRICS_JS = """() => new Promise(done => {
  let lcp = 0, cls = 0;
  new PerformanceObserver(l => { for (const e of l.getEntries()) lcp = e.startTime }).observe({type: 'largest-contentful-paint', buffered: true});
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value }).observe({type: 'layout-shift', buffered: true});
  setTimeout(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    const by = t => res.filter(r => r.initiatorType === t).reduce((a, r) => a + (r.transferSize || 0), 0);
    done({
      ttfb: Math.round(nav.responseStart), fcp: fcp && Math.round(fcp.startTime), lcp: Math.round(lcp),
      cls: +cls.toFixed(3), load: Math.round(nav.loadEventEnd),
      htmlKB: Math.round(nav.transferSize / 1024), jsKB: Math.round(by('script') / 1024),
      cssKB: Math.round((by('link') + by('css')) / 1024), fontKB: Math.round(res.filter(r => /woff2?|ttf|otf/.test(r.name)).reduce((a, r) => a + r.transferSize, 0) / 1024),
      imgKB: Math.round(res.filter(r => r.initiatorType === 'img' || /\\.(png|jpe?g|webp|avif|gif)/.test(r.name)).reduce((a, r) => a + r.transferSize, 0) / 1024),
      requests: res.length + 1,
      totalKB: Math.round((nav.transferSize + res.reduce((a, r) => a + (r.transferSize || 0), 0)) / 1024),
      pageHeight: document.documentElement.scrollHeight,
      hScroll: document.documentElement.scrollWidth > innerWidth,
    });
  }, 2500);
})"""


def settle(page):
    """Прокрутить до конца, чтобы сработали ленивые картинки и анимации появления."""
    h = page.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < h:
        y += 500
        page.mouse.wheel(0, 500)
        time.sleep(0.12)
        h = page.evaluate("document.documentElement.scrollHeight")
        if y > 30000:
            break
    time.sleep(0.8)
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(0.5)


def shoot(browser, url, name, vp, scheme, full=True, metrics=False, extra=None):
    ctx = browser.new_context(color_scheme=scheme, locale="ru-RU", **VIEWPORTS[vp])
    page = ctx.new_page()
    page.goto(url, wait_until="networkidle", timeout=60000)
    data = page.evaluate(METRICS_JS) if metrics else None
    page.screenshot(path=str(OUT / f"{name}_{vp}_{scheme}_fold.png"))
    if full:
        settle(page)
        page.screenshot(path=str(OUT / f"{name}_{vp}_{scheme}_full.png"), full_page=True)
    if extra:
        extra(page)
    ctx.close()
    return data


def open_mobile_menu(name):
    def run(page):
        btn = page.locator("header button[aria-label], header button").last
        try:
            btn.click(timeout=3000)
            time.sleep(0.7)
            page.screenshot(path=str(OUT / f"{name}_mobile_menu.png"))
        except Exception as e:
            print("menu:", e)
    return run


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "tc"
    results = {}
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome", headless=True)
        if mode == "tc":
            for lang, path in [("ru", "/ru"), ("en", "/"), ("uk", "/uk")]:
                url = "https://traderscare.io" + path
                for vp in VIEWPORTS:
                    for scheme in ["dark", "light"]:
                        key = f"tc-{lang}_{vp}_{scheme}"
                        extra = open_mobile_menu(f"tc-{lang}") if (vp == "mobile" and scheme == "dark") else None
                        results[key] = shoot(b, url, f"tc-{lang}", vp, scheme, metrics=True, extra=extra)
                        print(key, results[key])
            for sub in ["tools", "prop-firms", "faq", "login", "register"]:
                results[f"tc-ru-{sub}"] = shoot(b, f"https://traderscare.io/ru/{sub}", f"tc-ru-{sub}", "desktop", "dark", metrics=True)
                print(sub, results[f"tc-ru-{sub}"])
        else:
            rivals = {
                "scope360": "https://scope360.io/",
                "tradezella": "https://www.tradezella.com/",
                "tradersync": "https://tradersync.com/",
                "edgewonk": "https://edgewonk.com/",
            }
            for name, url in rivals.items():
                for vp in VIEWPORTS:
                    try:
                        results[f"{name}_{vp}"] = shoot(b, url, name, vp, "dark", metrics=True)
                        print(name, vp, results[f"{name}_{vp}"])
                    except Exception as e:
                        print(name, vp, "FAIL", e)
        b.close()
    (OUT / f"metrics_{mode}.json").write_text(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
