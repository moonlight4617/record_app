from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class ContentType(str, Enum):
    movie = "movie"
    book = "book"
    blog = "blog"

class ContentData(BaseModel):
    contentId: str = Field(..., min_length=1)
    type: ContentType
    title: str = Field(..., min_length=1)
    date: str
    year: Optional[int] = None
    notes: Optional[str] = None
    link: Optional[str] = None
    userId: Optional[str] = None

class ContentItem(BaseModel):
    contentId: str
    title: str
    year: int
