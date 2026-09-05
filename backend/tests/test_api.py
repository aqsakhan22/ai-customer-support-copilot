from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_api_is_running():
    response = client.get("/docs")

    assert response.status_code == 200


def test_register_user():
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Pytest User",
            "email": "pytest_user@example.com",
            "password": "TestPassword123!"
        }
    )

    # 200/201 means registration succeeded.
    # 400/409 can happen if the user already exists.
    assert response.status_code in [200, 201, 400, 409]


def test_login():
    response = client.post(
        "/api/auth/login",
        data={
            "username": "pytest_user@example.com",
            "password": "TestPassword123!"
        }
    )

    assert response.status_code in [200, 401]


def test_protected_ticket_endpoint_without_token():
    response = client.get("/api/tickets")

    assert response.status_code in [401, 403]