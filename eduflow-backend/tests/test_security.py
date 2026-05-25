from jose import jwt
from datetime import datetime, timedelta

from app.core.config import SECRET_KEY, ALGORITHM



def test_invalid_token(test_client):

    response = test_client.get(
        "/courses/",
        headers={
            "Authorization": "Bearer invalidtoken123"
        }
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid token"


def test_missing_token(test_client):

    response = test_client.get("/courses/")

    assert response.status_code == 401

def test_expired_token(test_client):

    expired_token = jwt.encode(
        {
            "user_id": 1,
            "exp": datetime.utcnow() - timedelta(minutes=5)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    response = test_client.get(
        "/courses/",
        headers={
            "Authorization": f"Bearer {expired_token}"
        }
    )

    assert response.status_code == 401