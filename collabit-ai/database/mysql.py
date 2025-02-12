import pymysql
from config.settings import MYSQL_HOST, MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD

class MySQL:
    @staticmethod
    def get_connection():
        """Get MySQL connection"""
        return pymysql.connect(
            host=MYSQL_HOST,
            database=MYSQL_DB,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            cursorclass=pymysql.cursors.DictCursor
        )

    @staticmethod
    def get_project_user_code(code):
        """Get project user code from MySQL"""
        try:
            connection = MySQL.get_connection()
            cursor = connection.cursor()

            query = "SELECT user_code FROM project_info WHERE code = %s"
            cursor.execute(query, (int(code),))
            result = cursor.fetchone()

            cursor.close()
            connection.close()

            return result['user_code'] if result else None
        except Exception as e:
            print(f"MySQL Error: {str(e)}")
            raise