"""create sessions table

Revision ID: 24d8fd1e1e15
Revises: 6d598ad6e873
Create Date: 2026-09-18 11:23:46.199900

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '24d8fd1e1e15'
down_revision: Union[str, None] = '6d598ad6e873'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('classroom_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('scheduled_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('scheduled_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            'session_type',
            sa.Enum('online', 'in_person', name='sessiontype'),
            nullable=False,
            server_default=sa.text("'online'::sessiontype"),
        ),
        sa.Column(
            'status',
            sa.Enum('scheduled', 'completed', 'cancelled', name='sessionstatus'),
            nullable=False,
            server_default=sa.text("'scheduled'::sessionstatus"),
        ),
        # Storage for the future Google Meet integration. Never generated here.
        sa.Column('meeting_url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.CheckConstraint('scheduled_end > scheduled_start', name='ck_sessions_end_after_start'),
        sa.ForeignKeyConstraint(['classroom_id'], ['classrooms.id'], name='fk_sessions_classroom_id_classrooms'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_sessions_classroom_id'), 'sessions', ['classroom_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_sessions_classroom_id'), table_name='sessions')
    op.drop_table('sessions')
    sa.Enum(name='sessiontype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='sessionstatus').drop(op.get_bind(), checkfirst=True)
