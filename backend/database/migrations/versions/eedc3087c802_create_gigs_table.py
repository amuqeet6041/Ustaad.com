"""create gigs table

Revision ID: eedc3087c802
Revises: 8f3c5a9d4b21
Create Date: 2026-09-18 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eedc3087c802'
down_revision: Union[str, None] = '8f3c5a9d4b21'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'gigs',
        sa.Column('id', sa.UUID(), nullable=False),
        # Teachers are User rows with role="teacher"; no separate `teachers` table.
        sa.Column('teacher_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('price', sa.Integer(), nullable=True),
        sa.Column(
            'status',
            sa.Enum(
                'draft', 'submitted', 'under_review', 'approved', 'active',
                'paused', 'rejected', 'archived', name='gigstatus',
            ),
            nullable=False,
            server_default=sa.text("'draft'::gigstatus"),
        ),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['teacher_id'], ['users.id'], name='fk_gigs_teacher_id_users'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_gigs_teacher_id'), 'gigs', ['teacher_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_gigs_teacher_id'), table_name='gigs')
    op.drop_table('gigs')
    sa.Enum(name='gigstatus').drop(op.get_bind(), checkfirst=True)