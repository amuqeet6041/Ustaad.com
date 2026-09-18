"""add gig_id FK to classrooms

Revision ID: ee8062f39a9f
Revises: eedc3087c802
Create Date: 2026-09-18 16:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ee8062f39a9f'
down_revision: Union[str, None] = 'eedc3087c802'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Completes the relationship deferred in 6d598ad6e873: the `gigs` table now
    # exists, so classrooms.gig_id can reference gigs.id.
    op.create_foreign_key('fk_classrooms_gig_id_gigs', 'classrooms', 'gigs', ['gig_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_classrooms_gig_id_gigs', 'classrooms', type_='foreignkey')