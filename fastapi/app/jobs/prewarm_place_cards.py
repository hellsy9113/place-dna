import logging
from dataclasses import asdict

from app.services.prewarm_service import run_prewarm_batch

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    result = run_prewarm_batch()
    logger.info("Finished prewarm job with summary: %s", asdict(result))


if __name__ == "__main__":
    main()
