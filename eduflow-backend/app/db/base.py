from sqlalchemy.orm import declarative_base

Base = declarative_base()

from app.models import user
from app.models import course
from app.models import module
from app.models import lesson
from app.models import enrollment
from app.models import progress
from app.models import quiz
from app.models import question
from app.models import quiz_attempt
from app.models import quiz_answer
from app.models import assignment
from app.models import assignment_submission
from app.models.certificate import Certificate
from app.models.badge import Badge
from app.models.payment import Payment
from app.models.subscription_plan import SubscriptionPlan
from app.models.subscription import Subscription
from app.models.coupon import Coupon
from app.models.coupon_usage import CouponUsage
from app.models.review import Review
from app.models.live_class import LiveClass
from app.models.notification import Notification
from app.models.forum_post import ForumPost
from app.models.forum_reply import ForumReply
from app.models.forum_vote import ForumVote
from app.models.wishlist import Wishlist
from app.models.password_reset_otp import PasswordResetOTP
from app.models.announcement import Announcement
from app.models.email_log import EmailLog