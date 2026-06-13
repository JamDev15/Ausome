import pytest


@pytest.mark.asyncio
async def test_create_behavior_log(client, auth_headers):
    # Create a child first
    child_resp = await client.post("/api/v1/children/", json={
        "full_name": "BL Test Child", "age": 7
    }, headers=auth_headers)
    child_id = child_resp.json()["id"]

    resp = await client.post("/api/v1/behavior-logs/", json={
        "child_id": child_id,
        "emotion": "calm",
        "location": "Home",
        "notes": "Playing quietly",
    }, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.json()["emotion"] == "calm"


@pytest.mark.asyncio
async def test_list_behavior_logs(client, auth_headers):
    child_resp = await client.post("/api/v1/children/", json={
        "full_name": "BL List Child", "age": 7
    }, headers=auth_headers)
    child_id = child_resp.json()["id"]

    for emotion in ["calm", "happy", "tired"]:
        await client.post("/api/v1/behavior-logs/", json={
            "child_id": child_id, "emotion": emotion
        }, headers=auth_headers)

    resp = await client.get(f"/api/v1/behavior-logs/?child_id={child_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 3


@pytest.mark.asyncio
async def test_behavior_summary(client, auth_headers):
    child_resp = await client.post("/api/v1/children/", json={
        "full_name": "Summary Child", "age": 7
    }, headers=auth_headers)
    child_id = child_resp.json()["id"]

    for emotion in ["calm", "calm", "happy", "overwhelmed"]:
        await client.post("/api/v1/behavior-logs/", json={
            "child_id": child_id, "emotion": emotion
        }, headers=auth_headers)

    resp = await client.get(
        f"/api/v1/behavior-logs/summary?child_id={child_id}",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_logs"] == 4
    assert data["most_common_emotion"] == "calm"
