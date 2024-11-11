from datetime import datetime

def extract_year_from_date(date: str) -> int:
    """
    文字列の日付から年度部分を抽出して整数で返す

    Args:
        date_str (str): 'YYYY-MM-DD' 形式の日付文字列

    Returns:
        int: 年度部分の整数値
    """
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d")
        return date_obj.year
    except ValueError:
        print(f"Invalid date format for: {date}")
        return None
