BEGIN;

ALTER TABLE place_cards
    ADD COLUMN IF NOT EXISTS enrichment_status TEXT,
    ADD COLUMN IF NOT EXISTS enrichment_attempted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS enrichment_error TEXT;

UPDATE place_cards
SET enrichment_status = CASE
    WHEN landmark_name IS NULL
        OR BTRIM(landmark_name) = ''
        OR LOWER(landmark_name) = 'landmark enrichment pending'
        THEN 'basic'
    WHEN LOWER(landmark_name) LIKE '%no major landmark%'
        THEN 'failed_enrichment'
    ELSE 'enriched'
END
WHERE enrichment_status IS NULL;

ALTER TABLE place_cards
    ALTER COLUMN enrichment_status SET DEFAULT 'basic',
    ALTER COLUMN enrichment_status SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'place_cards_enrichment_status_check'
            AND conrelid = 'place_cards'::regclass
    ) THEN
        ALTER TABLE place_cards
            ADD CONSTRAINT place_cards_enrichment_status_check
            CHECK (enrichment_status IN ('basic', 'enriched', 'failed_enrichment'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_place_cards_created_at
ON place_cards (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_place_cards_enrichment_status
ON place_cards (enrichment_status, enrichment_attempted_at);

COMMIT;
