from pydantic import BaseModel, Field


class User(BaseModel):
    user_id: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    is_premium: bool = Field(default=False, description="有料会員フラグ")
