from app.crud.content_crud import add_content, get_years, get_year_contents
from app.schemas.content import ContentData
from app.utils import extract_year_from_date

async def create_content_service(content_data: ContentData, user_id: str):
    if content_data.date:
        content_data.year = extract_year_from_date(content_data.date)

    content_data.userId = user_id
    add_content(content_data)

async def get_years_service(userId: str):
    return get_years(userId)

def get_year_contents_service(user_id: str, year: int) -> list[dict]:
    return get_year_contents(user_id, year)

# def retrieve_content_service(content_id: str):
#     return get_content(content_id)
