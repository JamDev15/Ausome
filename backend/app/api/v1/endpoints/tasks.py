from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from beanie import PydanticObjectId
from beanie.operators import Or
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.models.user import User
from app.models.task import Task, TaskStep, TaskDomain

router = APIRouter(prefix="/tasks", tags=["Task Programs"])


class TaskStepCreate(BaseModel):
    title: str
    instruction: Optional[str] = None
    position: int = 0


class TaskCreate(BaseModel):
    child_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    domain: TaskDomain = TaskDomain.CUSTOM
    token_reward: int = 1
    steps: List[TaskStepCreate] = []


@router.get("/")
async def list_tasks(
    child_id: Optional[str] = Query(None),
    include_templates: bool = Query(True),
    current_user: User = Depends(get_current_user),
):
    if child_id:
        cid = PydanticObjectId(child_id)
        if include_templates:
            tasks = await Task.find(
                Task.is_active == True,
                Or(Task.child_id == cid, Task.is_template == True),
            ).to_list()
        else:
            tasks = await Task.find(
                Task.is_active == True,
                Task.child_id == cid,
            ).to_list()
    else:
        tasks = await Task.find(
            Task.is_active == True,
            Task.is_template == True,
        ).to_list()

    return [
        {
            "id": str(t.id),
            "title": t.title,
            "description": t.description,
            "domain": t.domain,
            "token_reward": t.token_reward,
            "is_template": t.is_template,
            "steps": [
                {"id": str(idx), "title": s.title, "instruction": s.instruction, "position": s.position}
                for idx, s in enumerate(sorted(t.steps, key=lambda x: x.position))
            ],
        }
        for t in tasks
    ]


@router.post("/", status_code=201)
async def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
):
    cid = PydanticObjectId(payload.child_id) if payload.child_id else None
    steps = [
        TaskStep(title=s.title, instruction=s.instruction, position=idx)
        for idx, s in enumerate(payload.steps)
    ]
    task = Task(
        child_id=cid,
        created_by_id=current_user.id,
        title=payload.title,
        description=payload.description,
        domain=payload.domain,
        token_reward=payload.token_reward,
        steps=steps,
    )
    await task.insert()
    return {"id": str(task.id), "title": task.title}
