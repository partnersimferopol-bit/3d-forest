"""Fetch VK market via browser network (album_1)."""
import json
import re
import sys
from pathlib import Path

URL = "https://vk.com/market-202321163?section=album_1"
OUT = Path(__file__).resolve().parent.parent / "data" / "vk-market-raw.json"
OWNER_ID = -202321163


def parse_price(text: str) -> int:
    m = re.search(r"([\d\s\u00a0]+)\s*₽", text)
    if not m:
        return 0
    return int(re.sub(r"\D", "", m.group(1)))


def main():
    from playwright.sync_api import sync_playwright

    captured = []
    items = []

    def on_response(resp):
        url = resp.url
        if "market" not in url and "execute" not in url and "catalog" not in url:
            return
        try:
            body = resp.json()
        except Exception:
            return
        captured.append({"url": url, "body": body})

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(channel="msedge", headless=True)
        except Exception:
            browser = p.chromium.launch(headless=True)

        page = browser.new_page(locale="ru-RU")
        page.on("response", on_response)
        page.goto(URL, wait_until="domcontentloaded", timeout=90000)
        page.wait_for_timeout(8000)

        # Visible product links
        links = page.locator('a[href*="/market/product/"]')
        for i in range(links.count()):
            link = links.nth(i)
            name = link.inner_text(timeout=1500).strip()
            href = link.get_attribute("href") or ""
            parent = link.locator("xpath=ancestor::*[contains(@data-testid,'grid-item')][1]")
            price = 0
            if parent.count():
                price = parse_price(parent.inner_text(timeout=1500))
            if name:
                items.append({"title": name, "price": price, "href": href})

        html = page.content()
        browser.close()

    # Extract from captured API payloads
    def walk(obj):
        if isinstance(obj, dict):
            title = obj.get("title") or obj.get("name")
            price = obj.get("price")
            if isinstance(title, str) and len(title) > 2:
                amount = 0
                if isinstance(price, dict):
                    amount = int(price.get("amount", 0) or 0) // 100 if price.get("amount") else 0
                    if not amount and price.get("text"):
                        amount = parse_price(str(price["text"]))
                elif isinstance(price, (int, float)):
                    amount = int(price) // 100 if price > 10000 else int(price)
                if amount or title:
                    items.append(
                        {
                            "title": title,
                            "price": amount,
                            "href": obj.get("url") or "",
                            "id": obj.get("id"),
                        }
                    )
            for v in obj.values():
                walk(v)
        elif isinstance(obj, list):
            for v in obj:
                walk(v)

    for cap in captured:
        walk(cap["body"])

    # Dedupe by title
    seen = set()
    unique = []
    for it in items:
        key = (it["title"].lower(), it.get("price", 0))
        if key in seen:
            continue
        seen.add(key)
        if it.get("price", 0) > 0 or len(it["title"]) > 3:
            unique.append(it)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {"owner_id": OWNER_ID, "items": unique, "api_captures": len(captured)},
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"items={len(unique)} api_captures={len(captured)} -> {OUT}")
    for it in unique:
        print(f"  {it['price']:>6} | {it['title']}")


if __name__ == "__main__":
    main()
