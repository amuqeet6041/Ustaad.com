"""add google_event_id to sessions

Revision ID: 8f3c5a9d4b21
Revises: e9a1ff5a7c17
Create Date: 2026-09-18 15:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f3c5a9d4b21'
down_revision: Union[str, None] = 'e9a1ff5a7c17'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Google Calendar event IDs are opaque strings (not UUIDs); see models/session.py.
    op.add_column(
        'sessions',
        sa.Column('google_event_id', sa.String(length=1024), nullable=True),
    )
    op.create_index(
        op.f('ix_sessions_google_event_id'),
        'sessions',
        ['google_event_id'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_sessions_google_event_id'), table_name='sessions')
    op.drop_column('sessions', 'google_event_id')