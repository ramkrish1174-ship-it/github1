from pydantic import BaseModel

class ModuleCreate(BaseModel):
    title: str
    order: int = 0

class ModuleResponse(BaseModel):
    id: int
    title: str
    order: int

    class Config:
        from_attributes = True