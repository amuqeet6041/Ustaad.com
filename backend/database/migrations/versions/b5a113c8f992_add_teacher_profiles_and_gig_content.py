"""add teacher_profiles and expand gigs marketplace content

Revision ID: b5a113c8f992
Revises: ee8062f39a9f
Create Date: 2026-09-18 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'b5a113c8f992'
down_revision: Union[str, None] = 'ee8062f39a9f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- 1. teacher_profiles (one-to-one with users.id) ---
    op.create_table(
        'teacher_profiles',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('education', sa.String(), nullable=True),
        sa.Column('languages', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column(
            'teaching_mode',
            sa.Enum(
                'online', 'in_person', 'both', name='teachingmode',
            ),
            nullable=False,
            server_default=sa.text("'online'::teachingmode"),
        ),
        sa.Column('hourly_rate', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_teacher_profiles_user_id_users'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', name='uq_teacher_profiles_user_id'),
    )
    op.create_index(
        op.f('ix_teacher_profiles_user_id'), 'teacher_profiles', ['user_id'], unique=False
    )

    # --- 2. Expand gigs with marketplace content columns ---
    gigcategory = sa.Enum(
        'stem', 'programming', 'languages', 'test_prep', 'commerce_business',
        'arts_humanities', name='gigcategory',
    )
    gigcategory.create(op.get_bind(), checkfirst=True)

    op.add_column('gigs', sa.Column('slug', sa.String(), nullable=True))
    op.add_column(
        'gigs',
        sa.Column(
            'category',
            sa.Enum(
                'stem', 'programming', 'languages', 'test_prep', 'commerce_business',
                'arts_humanities', name='gigcategory', create_type=False,
            ),
            nullable=True,
        ),
    )
    op.add_column('gigs', sa.Column('subject', sa.String(), nullable=True))
    op.add_column('gigs', sa.Column('overview', sa.Text(), nullable=True))
    op.add_column(
        'gigs',
        sa.Column('learning_outcomes', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column(
        'gigs',
        sa.Column('syllabus', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column(
        'gigs',
        sa.Column('prerequisites', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column(
        'gigs',
        sa.Column('faqs', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.create_unique_constraint('uq_gigs_slug', 'gigs', ['slug'])
    op.create_index(op.f('ix_gigs_slug'), 'gigs', ['slug'], unique=False)


def downgrade() -> None:
    # --- 2. Revert gigs content columns ---
    op.drop_index(op.f('ix_gigs_slug'), table_name='gigs')
    op.drop_constraint('uq_gigs_slug', 'gigs', type_='unique')
    op.drop_column('gigs', 'faqs')
    op.drop_column('gigs', 'prerequisites')
    op.drop_column('gigs', 'syllabus')
    op.drop_column('gigs', 'learning_outcomes')
    op.drop_column('gigs', 'overview')
    op.drop_column('gigs', 'subject')
    op.drop_column('gigs', 'category')
    op.drop_column('gigs', 'slug')
    sa.Enum(name='gigcategory').drop(op.get_bind(), checkfirst=True)

    # --- 1. Revert teacher_profiles ---
    op.drop_index(op.f('ix_teacher_profiles_user_id'), table_name='teacher_profiles')
    op.drop_table('teacher_profiles')
    sa.Enum(name='teachingmode').drop(op.get_bind(), checkfirst=True)