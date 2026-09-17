import os
from celery import Celery

celery_app = Celery(
    "ustaad",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
)

# Scheduled jobs (see docs §37): proposal expiration, daily analytics rollups.
celery_app.conf.beat_schedule = {
    "expire-stale-proposals": {
        "task": "workers.tasks.expire_stale_proposals",
        "schedule": 3600.0,  # hourly
    },
}
