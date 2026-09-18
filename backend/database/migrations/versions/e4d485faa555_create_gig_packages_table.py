"""create gig_packages table

Revision ID: e4d485faa555
Revises: b5a113c8f992
Create Date: 2026-09-18 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'e4d485faa555'
down_revision: Union[str, None] = 'b5a113c8f992'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'gig_packages',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('gig_id', sa.UUID(), nullable=False),
        sa.Column(
            'tier',
            sa.Enum('basic', 'standard', 'premium', name='gigpackagetier'),
            nullable=False,
        ),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Integer(), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('sessions_count', sa.Integer(), nullable=True),
        sa.Column('delivery_days', sa.Integer(), nullable=True),
        sa.Column('features', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['gig_id'], ['gigs.id'], name='fk_gig_packages_gig_id_gigs'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('gig_id', 'tier', name='uq_gig_packages_gig_id_tier'),
    )
    op.create_index(
        op.f('ix_gig_packages_gig_id'), 'gig_packages', ['gig_id'], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_gig_packages_gig_id'), table_name='gig_packages')
    op.drop_table('gig_packages')
    sa.Enum(name='gigpackagetier').drop(op.get_bind(), checkfirst=True)