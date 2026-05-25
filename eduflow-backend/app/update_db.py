from app.db.session import engine
from sqlalchemy import text

def publish_all_courses():
    with engine.connect() as conn:
        try:
            conn.execute(text("UPDATE courses SET status = 'published'"))
            conn.commit()
            print("All courses set to published ")
        except Exception as e:
            print("Error updating courses:", e)


if __name__ == "__main__":
    publish_all_courses()