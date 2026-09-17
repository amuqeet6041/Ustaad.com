"""add full_name to users

Revision ID: 1847fceead30
Revises: 1a8a6daeb49a
Create Date: 2026-09-17 16:53:30.935784

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1847fceead30'
down_revision: Union[str, None] = '1a8a6daeb49a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add with a server_default so existing rows are backfilled and the
    # NOT NULL constraint is satisfied; then remove the default so new
    # inserts are required to provide full_name explicitly.
    op.add_column(
        'users',
        sa.Column('full_name', sa.String(), nullable=False, server_default=''),
    )
    op.alter_column('users', 'full_name', server_default=None)


def downgrade() -> None:
    op.drop_column('users', 'full_name')
    # ### end Alembic commands ###
