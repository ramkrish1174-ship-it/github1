"""Create phone number for user

Revision ID: 983c0173a494
Revises: 
Create Date: 2026-05-03 18:36:54.978444

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '983c0173a494'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users',sa.Column('phone_number',sa.String(),nullable=True))


def downgrade() -> None:
    op.drop_column('users','phone_number')
