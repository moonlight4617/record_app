from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class User(BaseModel):
    user_id: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
