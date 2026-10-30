# Physics-Inspired Visual AI — IJCV Special Issue

Active design: **v2-warm**. Branch: **codex/style-warm**.

## Three independent styles

- `main`: v1 Mint (production GitHub Pages).
- `codex/style-warm`: v2 Warm.
- `codex/style-blue`: v3 Blue.

Each branch is a complete static site rooted at `index.html`, with its own local CSS, JavaScript, fonts and images. Relative URLs support both a domain root and a project subpath. No sibling folder is required. Footer style links open source branches, not live alternate deployments.

## Preview and validate

```sh
python3 scripts/check_assets.py
python3 -m http.server 8767 --bind 127.0.0.1
```

Open http://127.0.0.1:8767/. For GitHub Pages select `main` and `/ (root)` in repository Settings → Pages. Pushing other branches preserves those designs without changing the main site.

## Maintenance

Edit `index.html` for page content and `assets/style.css` for this design. Shared styles and interactions live in `assets/si/`. Content/source records are in `data/`; these are reference records and do not automatically regenerate HTML. Portrait provenance is recorded in `data/image-sources.json`. Motion is optional and respects reduced-motion preferences. Internal proposal/correspondence files are excluded.

Project homepage: https://ijcv-pivai.github.io/

Repository: https://github.com/IJCV-PIVAI/ijcv-pivai.github.io
