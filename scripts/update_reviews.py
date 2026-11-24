#!/usr/bin/env python3
"""Regenerate the homepage Google-review cards from data/reviews.json.

Usage:  python3 scripts/update_reviews.py [incoming.json] [--dry-run]

incoming.json (optional) is what was just read from the Google Business
Profile:
  {"total_count": 16, "average_rating": 5,
   "reviews": [{"reviewer": "Eli Kroloff", "stars": "FIVE",
                "comment": "...", "created": "2026-11-24T17:32:34Z"}]}

Rules live in data/reviews.json (exclude / pin / max_cards). Only five-star
reviews with text are ever used, and the wording is copied exactly as
written on Google; nothing is edited, shortened or paraphrased.
"""
import html, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STORE = ROOT / "data" / "reviews.json"
PAGE = ROOT / "index.html"
START, END = "<!-- REVIEWS:START", "<!-- REVIEWS:END -->"


def norm(text):
    return " ".join(text.split())


def short_name(full):
    """'IULIAN TAMPA' -> 'Iulian T.'; single names stay single ('Aron')."""
    parts = full.strip().split()
    if not parts:
        return "Google reviewer"
    fix = lambda w: w.capitalize() if (w.isupper() or w.islower()) else w
    first = fix(parts[0])
    return first if len(parts) == 1 else f"{first} {parts[-1][0].upper()}."


def is_excluded(name, exclude):
    low = name.lower()
    first = low.split()[0]
    for e in (x.lower() for x in exclude):
        if low == e or (" " not in e and first == e):
            return True
    return False


def card(r):
    return (
        '      <li class="review-card">\n'
        '        <div class="review-stars" role="img" aria-label="5 out of 5 stars">\n'
        '          <span aria-hidden="true">★★★★★</span>\n'
        '          <span class="sr-only">5 out of 5 stars</span>\n'
        '        </div>\n'
        f'        <blockquote class="review-quote">{html.escape(r["quote"], quote=False)}</blockquote>\n'
        f'        <p class="review-attr"><span class="review-name">{html.escape(r["name"], quote=False)}</span>'
        '<span class="review-source">Google review</span></p>\n'
        '      </li>\n'
    )


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    store = json.loads(STORE.read_text(encoding="utf-8"))
    seen = {norm(r["quote"]) for r in store["reviews"]}
    added, total, avg = [], None, None

    if args:
        inc = json.loads(Path(args[0]).read_text(encoding="utf-8"))
        total, avg = inc.get("total_count"), inc.get("average_rating")
        for r in inc.get("reviews", []):
            quote = (r.get("comment") or "").strip()
            if str(r.get("stars", "")).upper() not in ("FIVE", "5") or not quote:
                continue
            name = short_name(r.get("reviewer", ""))
            if is_excluded(name, store["exclude"]) or norm(quote) in seen:
                continue
            store["reviews"].append({"name": name, "quote": quote, "created": r.get("created")})
            seen.add(norm(quote))
            added.append(name)

    reviews = [r for r in store["reviews"] if not is_excluded(r["name"], store["exclude"])]
    pinned = [next((r for r in reviews if r["name"].lower() == p.lower()), None) for p in store["pin"]]
    pinned = [p for p in pinned if p]
    rest = sorted((r for r in reviews if r not in pinned), key=lambda r: r.get("created") or "", reverse=True)
    shown = (pinned + rest)[: store["max_cards"]]
    if not shown:
        sys.exit("refusing to publish: no reviews would be shown")

    page = PAGE.read_text(encoding="utf-8")
    m = re.search(re.escape(START) + r".*?-->\n(.*?)" + re.escape(END), page, re.S)
    if not m:
        sys.exit("review markers not found in index.html")
    head_end = page.index("-->", m.start()) + 4
    page = page[:head_end] + "".join(card(r) for r in shown) + "      " + page[m.end() - len(END):]

    if total:
        rating = f"{float(avg if avg is not None else 5):.1f}"
        noun = "review" if int(total) == 1 else "reviews"
        page, n = re.subn(r'(<h2 id="reviews-headline">)[^<]*<em>[^<]*</em>(</h2>)',
                          rf'\g<1>{rating} on Google. <em>{int(total)} {noun}.</em>\g<2>', page)
        if n != 1:
            sys.exit("reviews heading not found")

    print(f"added to store: {added or 'none'}")
    print("shown on page:  " + ", ".join(r["name"] for r in shown))
    if dry:
        print("(dry run, nothing written)")
        return
    STORE.write_text(json.dumps(store, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    PAGE.write_text(page, encoding="utf-8")


if __name__ == "__main__":
    main()
