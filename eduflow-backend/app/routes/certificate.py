from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from fastapi import Query
from jose import jwt
import os
from dotenv import load_dotenv
load_dotenv()
from app.utils.notification_helper import create_notification
SECRET_KEY = os.getenv("SECRET_KEY")
import qrcode
import base64

from io import BytesIO

from app.routes.deps import get_db, get_current_user

from app.models.certificate import Certificate
from app.models.course import Course
from app.models.user import User

router = APIRouter(
    prefix="/certificates",
    tags=["Certificates"]
)




@router.get("/download/{certificate_id}", response_class=HTMLResponse)
def download_certificate(
    certificate_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=["HS256"]
    )

    user_id = payload.get("user_id")

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    certificate = db.query(Certificate).filter(
        Certificate.id == certificate_id,
        Certificate.user_id == user.id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )

    course = db.query(Course).filter(
        Course.id == certificate.course_id
    ).first()

    instructor = db.query(User).filter(
        User.id == course.owner_id
    ).first()

    verification_link = (
        f"http://127.0.0.1:8000/certificates/verify/"
        f"{certificate.certificate_code}"
    )

    # QR CODE

    qr = qrcode.make(verification_link)

    buffer = BytesIO()

    qr.save(buffer, format="PNG")

    qr_base64 = base64.b64encode(
        buffer.getvalue()
    ).decode()

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Certificate</title>

        <style>

            body {{
                margin: 0;
                padding: 40px;
                background: #eef2ff;
                font-family: Arial;
            }}

            .certificate {{
                max-width: 1100px;
                margin: auto;
                background: white;
                border-radius: 24px;
                overflow: hidden;
                border: 12px solid #2563eb;
                box-shadow: 0 25px 60px rgba(0,0,0,0.15);
            }}

            .top {{
                height: 18px;
                background: linear-gradient(
                    90deg,
                    #2563eb,
                    #7c3aed
                );
            }}

            .content {{
                padding: 70px;
                text-align: center;
            }}

            .logo {{
                font-size: 42px;
                font-weight: 800;
                color: #2563eb;
            }}

            .title {{
                font-size: 52px;
                font-weight: 700;
                margin-top: 30px;
                color: #111827;
            }}

            .subtitle {{
                margin-top: 25px;
                color: #6b7280;
                font-size: 22px;
            }}

            .student {{
                margin-top: 30px;
                font-size: 48px;
                font-weight: bold;
                color: #7c3aed;
            }}

            .course {{
                margin-top: 30px;
                font-size: 36px;
                font-weight: 700;
                color: #111827;
            }}

            .bottom {{
                margin-top: 70px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 30px;
            }}

            .signature {{
                text-align: left;
            }}

            .line {{
                width: 240px;
                border-top: 2px solid black;
                margin-bottom: 10px;
            }}

            .qr img {{
                width: 130px;
                height: 130px;
            }}

            .info {{
                text-align: right;
                color: #555;
            }}

            .footer {{
                margin-top: 40px;
                color: #777;
                font-size: 14px;
            }}

        </style>
    </head>

    <body>

        <div class="certificate">

            <div class="top"></div>

            <div class="content">
                    <button onclick="window.print()" class="print-btn">
                Download Certificate
            </button>

                <div class="logo">
                    EduFlow LMS
                </div>

                <div class="title">
                    Certificate of Completion
                </div>

                <div class="subtitle">
                    This certificate is awarded to
                </div>

                <div class="student">
                    {user.name}
                </div>

                <div class="subtitle">
                    for successfully completing the course
                </div>

                <div class="course">
                    {course.title}
                </div>

                <div class="bottom">

                    <div class="signature">

                        <div class="line"></div>

                        <strong>
                            {instructor.name}
                        </strong>

                        <div>
                            Instructor
                        </div>

                    </div>

                    <div class="qr">

                        <img src="data:image/png;base64,{qr_base64}" />

                        <div>
                            Scan to verify
                        </div>

                    </div>

                    <div class="info">

                        <div>
                            Certificate ID
                        </div>

                        <strong>
                            {certificate.certificate_code}
                        </strong>

                        <br><br>

                        <div>
                            Issued Date
                        </div>

                        <strong>
                            {certificate.issued_at.strftime('%d %B %Y')}
                        </strong>

                    </div>

                </div>

                <div class="footer">
                    Verified by EduFlow LMS
                </div>

            </div>

        </div>

    </body>
    </html>
    """

    return html

@router.get("/my")
def my_certificates(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    certificates = db.query(Certificate).filter(
        Certificate.user_id == user.id
    ).all()

    result = []

    for cert in certificates:

        course = db.query(Course).filter(
            Course.id == cert.course_id
        ).first()

        result.append({
            "id": cert.id,
            "course_title": course.title,
            "certificate_code": cert.certificate_code,
            "issued_at": cert.issued_at
        })

    return result



@router.get("/verify/{certificate_code}")
def verify_certificate(
    certificate_code: str,
    db: Session = Depends(get_db)
):

    certificate = db.query(Certificate).filter(
        Certificate.certificate_code == certificate_code
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Invalid certificate"
        )

    user = db.query(User).filter(
        User.id == certificate.user_id
    ).first()

    course = db.query(Course).filter(
        Course.id == certificate.course_id
    ).first()

    return {
        "valid": True,
        "student": user.name,
        "course": course.title,
        "certificate_code": certificate.certificate_code,
        "issued_at": certificate.issued_at
    }