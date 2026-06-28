# Word Finder — CLAUDE.md

## What this is

A browser-based word-list app hosted at:

- https://johnkerl.org/word-finder
- https://johnkerl.github.io/word-finder

Features: Random, Jabber (n-gram splicing), Pattern (glob/regex lookup), Anagram, and Bee (NYT
Spelling Bee helper) modes.

## Dev workflow

Start the local dev server:

```
npx http-server ~/pub_http_internet -o -p 9999
```

Then open http://localhost:9999/word-finder/ (or whatever path matches).

No build step: this is plain HTML + JavaScript. Edit and reload.

## Key files

- `index.html` — main app (production)
- `staging.html` — staging/in-progress version
- `jsbee.js` — Bee mode logic
- `ngrams.js` — n-gram / Jabber mode logic
- `sliver-*.js` — vendored Sliver JS library (from github.com/johnkerl/sliver)

## Word lists

- `enable1.txt`, `popular.txt` — from github.com/dolph/dictionary
- `words-2K.txt` through `words-40K.txt` — frequency-ranked lists; `-cumulative` variants include all smaller lists
- `usual-suspects.txt` — hand-curated NYT Spelling Bee words
- `words-200-swadesh.txt` — Swadesh list (~200 core English words)
- `finnegans-words.txt` — corpus from Finnegans Wake
- Non-English: `bahasa-indonesia.txt`, `french.txt`, `german.txt`, `greek.txt`, `italian.txt`, `latin.txt`, `russian.txt`, `spanish.txt`

## Observability

- Google Analytics (gtag `G-BZ8T9K9XYD`) is also in `index.html`
- Grafana Faro SDK is a dependency in `package.json` (may be wired into staging or in progress)

## Repo

https://github.com/johnkerl/word-finder
