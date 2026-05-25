from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)

    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("users.id"))

    submission_text = Column(Text, nullable=True)

    file_url = Column(String(500), nullable=True)

    status = Column(String(50), default="submitted")
    # submitted | graded | late

    grade = Column(Integer, nullable=True)

    feedback = Column(Text, nullable=True)

    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    graded_at = Column(DateTime(timezone=True), nullable=True)

    assignment = relationship(
        "Assignment",
        back_populates="submissions"
    )