import pytest

CHILD_PAYLOAD = {
    "full_name": "Test Child",
    "nickname": "Testy",
    "age": 8,
    "gender": "Male",
    "diagnosis_summary": "ASD Level 1",
    "communication_level": "functional_verbal",
    "asd_support_level": "level_1",
}


@pytest.mark.asyncio
async def test_create_child_profile(client, auth_headers):
    resp = await client.post("/api/v1/children/", json=CHILD_PAYLOAD, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["full_name"] == "Test Child"
    assert data["nickname"] == "Testy"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_list_children(client, auth_headers):
    await client.post("/api/v1/children/", json=CHILD_PAYLOAD, headers=auth_headers)
    resp = await client.get("/api/v1/children/", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


@pytest.mark.asyncio
async def test_get_child_profile(client, auth_headers):
    create_resp = await client.post("/api/v1/children/", json=CHILD_PAYLOAD, headers=auth_headers)
    child_id = create_resp.json()["id"]
    resp = await client.get(f"/api/v1/children/{child_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == child_id


@pytest.mark.asyncio
async def test_update_child_profile(client, auth_headers):
    create_resp = await client.post("/api/v1/children/", json=CHILD_PAYLOAD, headers=auth_headers)
    child_id = create_resp.json()["id"]
    resp = await client.patch(
        f"/api/v1/children/{child_id}",
        json={"nickname": "Updated Nickname"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["nickname"] == "Updated Nickname"


@pytest.mark.asyncio
async def test_cannot_access_other_users_child(client, db_session):
    """A parent cannot access another parent's child profile."""
    # Register two different parents
    async def register_and_login(email):
        from httpx import AsyncClient, ASGITransport
        from app.main import app
        from app.core.deps import get_db
        import httpx
        return email

    # Create child as parent1
    resp1 = await client.post("/api/v1/auth/register", json={
        "email": "parent1@test.com", "password": "Pass123!", "full_name": "Parent 1", "role": "parent"
    })
    token1 = resp1.json()["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    resp2 = await client.post("/api/v1/auth/register", json={
        "email": "parent2@test.com", "password": "Pass123!", "full_name": "Parent 2", "role": "parent"
    })
    token2 = resp2.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    child_resp = await client.post("/api/v1/children/", json=CHILD_PAYLOAD, headers=headers1)
    child_id = child_resp.json()["id"]

    # Parent 2 should not access parent 1's child
    resp = await client.get(f"/api/v1/children/{child_id}", headers=headers2)
    assert resp.status_code == 403
