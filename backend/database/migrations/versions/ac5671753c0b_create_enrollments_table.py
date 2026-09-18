"""create_enrollments_table

Revision ID: ac5671753c0b
Revises: e4d485faa555
Create Date: 2026-09-18 23:16:30.040031

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'ac5671753c0b'
down_revision: Union[str, None] = 'e4d485faa555'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'enrollments',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('teacher_id', sa.UUID(), nullable=False),
        sa.Column('gig_id', sa.UUID(), nullable=False),
        sa.Column('package_id', sa.UUID(), nullable=True),
        sa.Column('price', sa.Integer(), nullable=False),
        sa.Column(
            'status',
            sa.Enum('pending', 'confirmed', 'cancelled', 'completed', name='enrollmentstatus'),
            nullable=False,
        ),
        sa.Column('classroom_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], name='fk_enrollments_student_id_users'),
        sa.ForeignKeyConstraint(['teacher_id'], ['users.id'], name='fk_enrollments_teacher_id_users'),
        sa.ForeignKeyConstraint(['gig_id'], ['gigs.id'], name='fk_enrollments_gig_id_gigs'),
        sa.ForeignKeyConstraint(['package_id'], ['gig_packages.id'], name='fk_enrollments_package_id_gig_packages'),
        sa.ForeignKeyConstraint(['classroom_id'], ['classrooms.id'], name='fk_enrollments_classroom_id_classrooms'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_enrollments_student_id'), 'enrollments', ['student_id'], unique=False
    )
    op.create_index(
        op.f('ix_enrollments_teacher_id'), 'enrollments', ['teacher_id'], unique=False
    )
    op.create_index(
        op.f('ix_enrollments_gig_id'), 'enrollments', ['gig_id'], unique=False
    )
    op.create_index(
        op.f('ix_enrollments_package_id'), 'enrollments', ['package_id'], unique=False
    )
    op.create_index(
        op.f('ix_enrollments_classroom_id'), 'enrollments', ['classroom_id'], unique=False
    )
    # Race-condition safety: a student can hold at most one pending/confirmed
    # enrollment per (gig, package) at a time.
    op.create_index(
        'uq_enrollments_active_student_gig_package',
        'enrollments',
        ['student_id', 'gig_id', 'package_id'],
        unique=True,
        postgresql_where=sa.text("status IN ('pending', 'confirmed')"),
    )


def downgrade() -> None:
    op.drop_index(
        'uq_enrollments_active_student_gig_package', table_name='enrollments'
    )
    op.drop_index(op.f('ix_enrollments_classroom_id'), table_name='enrollments')
    op.drop_index(op.f('ix_enrollments_package_id'), table_name='enrollments')
    op.drop_index(op.f('ix_enrollments_gig_id'), table_name='enrollments')
    op.drop_index(op.f('ix_enrollments_teacher_id'), table_name='enrollments')
    op.drop_index(op.f('ix_enrollments_student_id'), table_name='enrollments')
    op.drop_table('enrollments')
    sa.Enum(name='enrollmentstatus').drop(op.get_bind(), checkfirst=True)
