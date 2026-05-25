from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.db.base import Base
from app.routes import auth, users
from app.routes import courses
from app.routes import enrollments
from app.routes import module, lesson
from app.routes import progress
from app.routes import quiz
from app.routes import assignments
from app.routes import certificate
# from app.routes import certificate
from app.routes import badge
from app.routes import payment
from app.routes import subscriptions
from app.routes import coupons
from app.routes import reviews
from app.routes import live_classes
from app.routes import notifications
from app.routes import forum
from app.routes import wishlist
from app.routes import analytics
from app.routes import admin
from app.models.email_log import EmailLog
from app.routes import email
from fastapi.middleware.gzip import GZipMiddleware


from slowapi.middleware import SlowAPIMiddleware
from contextlib import asynccontextmanager
from app.core.cache import init_cache
from app.core.limiter import limiter
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_cache()
    yield

app = FastAPI(lifespan=lifespan)


app.state.limiter = limiter

app.add_middleware(SlowAPIMiddleware)
# CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    GZipMiddleware,
    minimum_size=1000
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(enrollments.router)
app.include_router(module.router)
app.include_router(lesson.router)
app.include_router(progress.router)
app.include_router(quiz.router)
app.include_router(assignments.router)
app.include_router(certificate.router)
# app.include_router(certificate.router)
app.include_router(badge.router)
app.include_router(payment.router)
app.include_router(subscriptions.router)
app.include_router(coupons.router)
app.include_router(reviews.router)
app.include_router(live_classes.router)
app.include_router(notifications.router)
app.include_router(forum.router)
app.include_router(wishlist.router)
app.include_router(analytics.router)
app.include_router(admin.router)
app.include_router(email.router)
@app.get("/")
def root():
    return {"message": "EduFlow Backend Running"}