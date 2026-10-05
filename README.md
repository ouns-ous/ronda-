# Ronda — روندا

Open `index.html` directly, or run `python -m http.server 8000` inside this folder and visit http://localhost:8000/.

Two players: you against the computer. Card artwork is included in `assets/cards/`. No build or dependencies; this folder is self-contained.

Match ranks to capture, including consecutive higher ranks (7 → 10 → 11 → 12). Missa and immediate matching captures score one point each; the final play has no missa bonus. No immediate matching bonus across a new deal. The last capturing player receives remaining table cards. Captures above 20 score one point each. First to 41 wins; dealer alternates each round.

Ronda and tringa announcements are automatic, resolved immediately on each three-card deal: strongest combination takes all declaration points; equal pairs split points. This is a simplified announcement variant, without bluffing or delayed declaration scoring. Four-player teams and dealer last-card obligations are not included.

Rules reference: https://www.pagat.com/fishing/ronda.html

Run engine verification with `node engine.test.js` inside this folder.
