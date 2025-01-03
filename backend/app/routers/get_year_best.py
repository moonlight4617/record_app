# from fastapi import APIRouter, HTTPException, Depends, Request
# from typing import List
# import traceback
# from app.services.content_service import get_year_best_service
# from app.services.user_service import get_user_id
# from app.schemas.content import ContentData
# from app.services.depends_service import get_content_table_and_user_id

# router = APIRouter(prefix="/content")

# # TODO:不要そうであれば後ほど削除
# @router.get("/best/year={year}", tags=["content"])
# async def get_year_best(year: int, user_id: str = Depends(get_user_id))\
#  -> List[dict]:
#     try:
#         content_items = [ContentData(**item) for item\
#           in get_year_best_service(user_id, year)]
#         return content_items

#     except Exception as e:
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail="Internal Server Error")
