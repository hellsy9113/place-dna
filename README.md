# PlaceDNA Verification

## Backend checks

For an existing database, apply the enrichment migration once before deploying
the updated backend:

```bash
psql "$DATABASE_URL" -f infra/db/init/002_add_place_card_enrichment.sql
```

```bash
cd fastapi
source .venv/bin/activate
pytest
```

```bash
curl -i "http://localhost:8000/api/place-dna?lat=28.6129&lon=77.2295&radius_m=500"
```

```bash
curl -i "http://localhost:8000/api/place-dna?lat=-75&lon=20&radius_m=500"
```

Expected invalid result:

```txt
HTTP/1.1 422
```

```bash
cd fastapi
PREWARM_DRY_RUN=true \
PREWARM_RANDOM_COUNT=3 \
PREWARM_BATCH_SIZE=5 \
python -m app.jobs.prewarm_place_cards
```

```bash
cd fastapi
PREWARM_DRY_RUN=false \
PREWARM_RANDOM_COUNT=2 \
PREWARM_BATCH_SIZE=4 \
PREWARM_SLEEP_SECONDS=1 \
LANDMARK_LOOKUP_TIMEOUT_SECONDS=5 \
LANDMARK_LOOKUP_CONNECT_TIMEOUT_SECONDS=3 \
LANDMARK_LOOKUP_READ_TIMEOUT_SECONDS=5 \
PREWARM_USE_EXTERNAL_LANDMARK_LOOKUP=true \
PRODUCTION_USE_EXTERNAL_LANDMARK_LOOKUP=false \
python -m app.jobs.prewarm_place_cards
```

## Frontend checks

```bash
cd nextjs
npm run lint
npm run build
```
