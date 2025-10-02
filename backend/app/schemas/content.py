from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class DependsData(BaseModel):
    table: Any
    user_id: str
    is_premium: bool = False  # 有料会員フラグ（存在しない / false なら無料）


class ContentType(str, Enum):
    movie = "movie"
    book = "book"
    blog = "blog"


class watchlistData(BaseModel):
    contentId: str = Field(..., min_length=1)
    type: ContentType
    title: str = Field(..., min_length=1)
    userId: Optional[str] = None
    link: Optional[str] = None
    status: str = Field(..., min_length=1)


class RegisterContentData(BaseModel):
    contentId: str = Field(..., min_length=1)
    type: ContentType
    title: str = Field(..., min_length=1)
    date: str
    type_date: Optional[str] = None
    year: Optional[int] = None
    notes: Optional[str] = None
    userId: Optional[str] = None
    link: Optional[str] = None
    status: Optional[str] = None


class ContentData(RegisterContentData):
    rank: Optional[int] = None


class ContentItem(BaseModel):
    contentId: str
    title: str
    year: int
