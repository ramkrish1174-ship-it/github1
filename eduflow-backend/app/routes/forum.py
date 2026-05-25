from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.routes.deps import get_db, get_current_user

from app.models.forum_post import ForumPost
from app.models.forum_reply import ForumReply
from app.models.forum_vote import ForumVote

from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User

from app.schemas.forum_schema import (
    ForumPostCreate,
    ForumReplyCreate,
    ForumPostResponse,
    ForumReplyResponse
)
from fastapi import Request
from fastapi_cache.decorator import cache
from app.core.limiter import limiter
from app.utils.notification_helper import create_notification
router = APIRouter(
    prefix="/forum",
    tags=["Forum"]
)


@router.post(
    "/{course_id}",
    response_model=ForumPostResponse
)
def create_post(
    course_id: int,
    data: ForumPostCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if user.role != "instructor":

        enrolled = db.query(Enrollment).filter(
            Enrollment.user_id == user.id,
            Enrollment.course_id == course_id
        ).first()

        if not enrolled:
            raise HTTPException(
                status_code=403,
                detail="Not enrolled"
            )

    post = ForumPost(
        course_id=course_id,
        user_id=user.id,
        title=data.title,
        content=data.content
    )

    db.add(post)

    db.commit()

    db.refresh(post)

    return post




@router.get("/course/{course_id}")
@cache(expire=120)
@limiter.limit("20/minute")
def get_course_posts(
    request:Request,
    course_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    posts = db.query(ForumPost).filter(
        ForumPost.course_id == course_id
    ).order_by(
        ForumPost.is_resolved.asc(),
        ForumPost.upvotes.desc(),
        ForumPost.created_at.desc()
    )

    result = []

    for post in posts:

        author = db.query(User).filter(
            User.id == post.user_id
        ).first()

        replies_count = db.query(ForumReply).filter(
            ForumReply.post_id == post.id
        ).count()

        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "author": author.name,
            "author_role": author.role,
            "is_resolved": post.is_resolved,
            "upvotes": post.upvotes,
            "replies_count": replies_count,
            "created_at": post.created_at
        })

    return result


@router.post(
    "/reply/{post_id}",
    response_model=ForumReplyResponse
)
def add_reply(
    post_id: int,
    data: ForumReplyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    post = db.query(ForumPost).filter(
        ForumPost.id == post_id
    ).first()

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    reply = ForumReply(
        post_id=post_id,
        user_id=user.id,
        content=data.content
    )

    db.add(reply)

    db.commit()

    db.refresh(reply)
    if post.user_id != user.id:

        create_notification(
            db=db,
            user_id=post.user_id,
            title="New Forum Reply",
            message=f"{user.name} replied to your discussion"
        )

    return reply




@router.get("/replies/{post_id}")
@cache(expire=120)
@limiter.limit("20/minute")
def get_replies(
    request:Request,
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    replies = db.query(ForumReply).filter(
        ForumReply.post_id == post_id
    ).order_by(
        ForumReply.created_at.asc()
    ).all()

    result = []

    for reply in replies:

        author = db.query(User).filter(
            User.id == reply.user_id
        ).first()

        result.append({
            "id": reply.id,
            "content": reply.content,
            "author": author.name,
            "author_role": author.role,
            "created_at": reply.created_at
        })

    return result



@router.post("/upvote/{post_id}")
def upvote_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    post = db.query(ForumPost).filter(
        ForumPost.id == post_id
    ).first()

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    existing_vote = db.query(ForumVote).filter(
        ForumVote.post_id == post_id,
        ForumVote.user_id == user.id
    ).first()

    if existing_vote:
        raise HTTPException(
            status_code=400,
            detail="Already upvoted"
        )

    vote = ForumVote(
        post_id=post_id,
        user_id=user.id
    )

    db.add(vote)

    post.upvotes += 1

    db.commit()

    return {
        "message": "Post upvoted"
    }



@router.put("/resolve/{post_id}")
def resolve_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    post = db.query(ForumPost).filter(
        ForumPost.id == post_id
    ).first()

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    course = db.query(Course).filter(
        Course.id == post.course_id
    ).first()

    if course.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Only instructor can resolve"
        )

    post.is_resolved = True
    instructor_reply = db.query(ForumReply).filter(
        ForumReply.post_id == post_id,
        ForumReply.user_id == user.id
    ).first()

    if not instructor_reply:
        raise HTTPException(
            status_code=400,
            detail="Reply before resolving the question"
        )

    db.commit()

    return {
        "message": "Question resolved"
    }