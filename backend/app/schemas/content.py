from pydantic import BaseModel
from typing import Optional
from enum import Enum

class ContentType(str, Enum):
    movie = "movie"
    book = "book"
    blog = "blog"

class ContentData(BaseModel):
    contentId: str
    type: ContentType
    title: str
    date: str
    notes: Optional[str] = None
    link: Optional[str] = None
    userId: str
