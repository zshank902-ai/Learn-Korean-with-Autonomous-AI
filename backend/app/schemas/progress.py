from typing import Optional

from pydantic import BaseModel


class ModuleCompleteRequest(BaseModel):
    topik_level: int
    module_id: str


class ModuleCompleteResponse(BaseModel):
    completed: bool
    next_unlocked: Optional[str]
    level_complete: bool
    xp_awarded: int
