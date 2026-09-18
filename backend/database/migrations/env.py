import os
from logging.config import fileConfig

from dotenv import load_dotenv
from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Load DATABASE_URL from backend/.env
from pathlib import Path  # noqa: E402

basedir = Path(__file__).resolve().parents[2]
load_dotenv(basedir / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in .env")

# Set the connection URL at runtime so credentials are never hardcoded.
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import the project's metadata and models so autogenerate detects them.
from database.base import Base  # noqa: E402
import models.user  # noqa: E402  (registers the User model on Base.metadata)
import models.classroom  # noqa: E402  (registers the Classroom model on Base.metadata)
import models.session  # noqa: E402  (registers the Session model on Base.metadata)
import models.google_calendar_credential  # noqa: E402  (registers the GoogleCalendarCredential model on Base.metadata)
import models.gig  # noqa: E402  (registers the Gig model on Base.metadata)
import models.teacher_profile  # noqa: E402  (registers the TeacherProfile model on Base.metadata)
import models.gig_package  # noqa: E402  (registers the GigPackage model on Base.metadata)
import models.enrollment  # noqa: E402  (registers the Enrollment model on Base.metadata)

# gigs.teacher_id references `users.id` (teachers are User rows with
# role="teacher"); there is no separate `teachers` table.

target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()