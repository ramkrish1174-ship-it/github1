import uuid


def test_login_invalid_credentials(test_client):

    response = test_client.post(
        "/auth/login",
        json={
            "email": "wrong@gmail.com",
            "password": "wrongpass"
        }
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_register_user(test_client):

    email = f"{uuid.uuid4()}@gmail.com"

    response = test_client.post(
        "/auth/register",
        json={
            "name": "Test User",
            "email": email,
            "password": "Ram.8778",
            "role": "student"
        }
    )

    assert response.status_code == 200
    assert response.json()["message"] == "User registered successfully"