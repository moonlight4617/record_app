from app.db.dynamodb import user_table
from app.schemas.user import User


def save_user(user: User):
    try:
        user_id, email, name = user
        response = user_table.put_item(
            Item={
                "userId": user_id,  # ユーザーID（Cognitoのsub属性など）
                "email": email,  # ユーザーのメールアドレス
                "name": name,  # ユーザー名
            }
        )
        print("User saved successfully:", response)
    except Exception as e:
        print("Error saving user:", e)
