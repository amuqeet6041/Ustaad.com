from workers.celery_app import celery_app

@celery_app.task
def expire_stale_proposals():
    """Auto-close proposals with no activity for N days. See docs §10."""
    raise NotImplementedError

@celery_app.task
def send_notification_email(user_id: str, event_type: str):
    raise NotImplementedError
