import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.core.deps import get_db
from app.db.base import Base

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DB_URL, echo=False)
TestSession = async_sessionmaker(engine, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session() -> AsyncSession:
    async with TestSession() as session:
        yield session


@pytest.fixture
async def client(db_session):
    async def override_db():
        yield db_session

    app.dependency_overrides[get_db] = override_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def auth_headers(client):
    """Register and login a test parent user."""
    await client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "Test123!",
        "full_name": "Test User",
        "role": "parent",
    })
    resp = await client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "Test123!",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def admin_headers(client):
    """Register and login a test admin user."""
    await client.post("/api/v1/auth/register", json={
        "email": "admin_test@example.com",
        "password": "Admin123!",
        "full_name": "Test Admin",
        "role": "admin",
    })
    resp = await client.post("/api/v1/auth/login", json={
        "email": "admin_test@example.com",
        "password": "Admin123!",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
