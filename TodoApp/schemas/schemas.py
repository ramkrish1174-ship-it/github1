from pydantic import BaseModel, Field

class TodoCreate(BaseModel):
    
    title : str = Field(min_length=3)
    description :str = Field(min_length=3, max_length=100)
    priority :int 
    complete : bool


class TodoSchema(TodoCreate):
    id:int
    class Config:
        orm_mode = True