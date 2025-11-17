import os
import psycopg2
import getpass
import time
import sys
import subprocess
import importlib


required_packages = [
    "django",
    "djangorestframework",
    "djangorestframework-simplejwt",
    "psycopg2-binary",
    "django-cors-headers"
]

for pkg in required_packages:
    try:
        importlib.import_module(pkg.split('-')[0])
    except ImportError:
        print(f"⚙️ Installing missing dependency: {pkg}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])


DB_NAME = "crime_db"
DB_USER = "postgres"
DB_PASSWORD = "POSTGRE"
DB_HOST = "localhost"
DB_PORT = "5432"

DATA_FOLDER = os.path.join(os.getcwd(), "data")
SQL_SCHEMA_FILE = os.path.join(os.getcwd(), "create_tables.sql")

CSV_FILES = {
    "criminals": "criminals.csv",
    "police_stations": "police_stations.csv",
    "firs": "firs.csv",
    "courts": "courts.csv",
    "case_records": "case_records.csv",
    "case_criminals": "case_criminals.csv"
}


def connect_postgres(dbname="postgres"):
    """Connect to PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            dbname=dbname,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.autocommit = True
        return conn
    except Exception as e:
        print(f"❌ Failed to connect to database '{dbname}': {e}")
        sys.exit(1)


def recreate_database():
    """Drop and recreate the crime_db."""
    print("🧹 Checking for old database...")
    conn = connect_postgres("postgres")
    cur = conn.cursor()

    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
    if cur.fetchone():
        print(f"⚠️ Existing database '{DB_NAME}' found. Dropping it...")
        cur.execute(f"DROP DATABASE {DB_NAME}")
        time.sleep(1)

    print(f"✅ Creating new database '{DB_NAME}'...")
    cur.execute(f"CREATE DATABASE {DB_NAME}")
    cur.close()
    conn.close()

def run_migrations():
    """Run Django migrations."""
    print("⚙️ Running Django migrations...")
    try:
        subprocess.run(
            [sys.executable, "manage.py", "migrate"],
            check=True,
            env=os.environ
        )
        print("✅ Migrations completed.")
    except subprocess.CalledProcessError as e:
        print("❌ Migration failed. Full error below:\n")
        print(e)
        sys.exit(1)



def create_tables_from_sql():
    """Execute create_tables.sql to build schema for managed=False models."""
    if not os.path.exists(SQL_SCHEMA_FILE):
        print(f"⚠️ SQL schema file not found: {SQL_SCHEMA_FILE}")
        sys.exit(1)

    print("🧱 Creating database tables from SQL schema...")

    try:
        subprocess.run(
            ["psql", "-U", DB_USER, "-d", DB_NAME, "-f", SQL_SCHEMA_FILE],
            check=True,
            env=os.environ
        )
        print("✅ Tables created successfully.")
    except subprocess.CalledProcessError as e:
        print("❌ Failed to execute create_tables.sql. Full error:")
        print(e)
        sys.exit(1)

def import_csv_data():
    """Import CSV data into tables."""
    print("\n📥 Importing data from CSV files...\n")

    conn = connect_postgres(DB_NAME)
    cur = conn.cursor()

    for table, csv_file in CSV_FILES.items():
        file_path = os.path.join(DATA_FOLDER, csv_file)
        if not os.path.exists(file_path):
            print(f"⚠️ CSV not found for table {table}: {file_path}")
            continue

        print(f"⏳ Importing {csv_file} → {table} ...")
        with open(file_path, "r", encoding="utf-8") as f:
            cur.copy_expert(f"COPY {table} FROM STDIN WITH CSV HEADER", f)
        print(f"✅ Imported data for {table}")

    conn.commit()
    cur.close()
    conn.close()

def create_users():
    """Prompt for custom usernames and passwords for each role."""
    print("\n👥 Create user accounts for Admin, Police, and Court roles\n")

    roles = [
        ("Admin", True, "admin"),
        ("Police", False, "police"),
        ("Court", False, "court")
    ]

    for display_name, is_superuser, group_name in roles:
        print(f"🧩 Create {display_name} account:")
        username = input(f"👤 Enter username for {display_name} (default: {group_name}): ").strip() or group_name
        password = input(f"🔑 Enter password for {display_name}: ").strip()

        if not username or not password:
            print(f"⚠️ Skipping {display_name} — username or password empty!")
            continue

        print(f"⚙️ Creating {display_name} user...")

        create_user_script = f"""
from django.contrib.auth.models import User, Group
# Ensure group exists
group, _ = Group.objects.get_or_create(name='{group_name}')

u, created = User.objects.get_or_create(username='{username}')
u.set_password('{password}')
u.is_staff = True
u.is_superuser = {str(is_superuser)}
u.save()
u.groups.clear()
u.groups.add(group)
print('✅ Created/updated {display_name} user:', u.username, '| Group:', group.name)
"""
        subprocess.run([sys.executable, "manage.py", "shell"], input=create_user_script.encode(), check=True)

    print("✅ All users created and assigned to correct roles!\n")


def main():
    print("🚀 CRIME RECORD TRACKING SYSTEM - AUTO SETUP\n")
    print("===========================================")
    print("This will prepare your database, run migrations, create tables, import all CSV data, and set up user accounts.\n")

    global DB_USER, DB_PASSWORD
    DB_USER = input("👤 Enter PostgreSQL username (default: postgres): ") or "postgres"
    DB_PASSWORD = getpass.getpass("🔑 Enter PostgreSQL password (default: POSTGRE): ") or "POSTGRE"

    recreate_database()
    run_migrations()
    create_tables_from_sql()
    import_csv_data()
    create_users()

    print("\n✅ Setup complete! You can now run the project using:")
    print("👉 python start_project.py\n")


if __name__ == "__main__":
    main()
