import uuid


def test_create_course_without_token(test_client):

    response = test_client.post(
        "/courses/",
        json={
            "title": "Python Course",
            "description": "Learn Python",
            "category": "Programming",
            "price": 999,
            "level": "Beginner"
        }
    )

    assert response.status_code == 401


def test_student_cannot_create_course(test_client):

    email = f"{uuid.uuid4()}@gmail.com"

    # register student
    test_client.post(
        "/auth/register",
        json={
            "name": "Student User",
            "email": email,
            "password": "Ram.8778",
            "role": "student"
        }
    )

    # login student
    login_response = test_client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "Ram.8778"
        }
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = test_client.post(
        "/courses/",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "title": "Python Course",
            "description": "Learn Python",
            "category": "Programming",
            "price": 999,
            "level": "Beginner"
        }
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Only instructors can create courses"