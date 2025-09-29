import sqlite3
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_database_connection():
    try:
        conn = sqlite3.connect('data/energy_data.db')
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        logger.info(f"Database connected successfully! Tables: {tables}")
        conn.close()
    except Exception as e:
        logger.error(f"Database connection failed: {e}")

if __name__ == "__main__":
    test_database_connection()