"""create classrooms table

Revision ID: 6d598ad6e873
Revises: 1847fceead30
Create Date: 2026-09-18 10:51:05.129820

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6d598ad6e873'
down_revision: Union[str, None] = '1847fceead30'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'classrooms',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('teacher_id', sa.UUID(), nullable=False),
        # gig_id intentionally has NO foreign key: the `gigs` table is not
        # migrated yet (gigs.teacher_id -> teachers, and `teachers` does not
        # exist). The FK is added in a follow-up migration once Gig is ready.
        sa.Column('gig_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column(
            'status',
            sa.Enum('active', 'completed', 'cancelled', name='classroomstatus'),
            nullable=False,
            server_default=sa.text("'active'::classroomstatus"),
        ),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.CheckConstraint('student_id <> teacher_id', name='ck_classrooms_student_not_teacher'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], name='fk_classrooms_student_id_users'),
        sa.ForeignKeyConstraint(['teacher_id'], ['users.id'], name='fk_classrooms_teacher_id_users'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_classrooms_gig_id'), 'classrooms', ['gig_id'], unique=False)
    op.create_index(op.f('ix_classrooms_student_id'), 'classrooms', ['student_id'], unique=False)
    op.create_index(op.f('ix_classrooms_teacher_id'), 'classrooms', ['teacher_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_classrooms_teacher_id'), table_name='classrooms')
    op.drop_index(op.f('ix_classrooms_student_id'), table_name='classrooms')
    op.drop_index(op.f('ix_classrooms_gig_id'), table_name='classrooms')
    op.drop_table('classrooms')
    sa.Enum(name='classroomstatus').drop(op.get_bind(), checkfirst=True)
