# BD Rail Matrix — Public Web POC

This is a Vercel-ready public web prototype based on the existing BD Rail Matrix 1.1.7 data/UI patterns.

## Structure
- `index.html` — public Matrix UI
- `app.js` — station/train/date UI and matrix rendering
- `stations.js` — station master from Matrix 1.1.7
- `train-data.js` — canonical train master from Matrix 1.1.7
- `api/matrix.js` — server-side RailMatrix fetch + initialData parser

## Deploy
Import this folder/repository into Vercel. The `/api/matrix` function is same-origin and the browser does not call the upstream RailMatrix host directly.

## Important
This is a technical POC. Before public distribution, verify upstream RailMatrix usage/permission, CORS/upstream behavior, rate limits, and acceptable traffic patterns.
