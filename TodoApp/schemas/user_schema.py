from pydantic import BaseModel

class UserCreate(BaseModel):
    email : str
    username:str
    first_name : str
    last_name : str
    password: str
    role : str
    phone_number:str