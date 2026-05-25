from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.routes.deps import get_db, get_current_user

from app.models.badge import Badge
from app.models.user import User

router = APIRouter(
    prefix="/badges",
    tags=["Badges"]
)

@router.get("/my")
def get_my_badges(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    badges = db.query(Badge).filter(
        Badge.user_id == user.id
    ).all()

    return badges