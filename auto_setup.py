import os
import sys
import subprocess
import platform


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "crcts-frontend")
VENV_DIR = os.path.join(BASE_DIR, "venv")

if platform.system() == "Windows":
    VENV_PYTHON = os.path.join(VENV_DIR, "Scripts", "python.exe")
    VENV_PIP = os.path.join(VENV_DIR, "Scripts", "pip.exe")
else:
    VENV_PYTHON = os.path.join(VENV_DIR, "bin", "python")
    VENV_PIP = os.path.join(VENV_DIR, "bin", "pip")


def run(cmd, cwd=None, check=True):
    print(f"  > {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd or BASE_DIR)
    if check and result.returncode != 0:
        print(f"  Command failed with exit code {result.returncode}")
        sys.exit(1)
    return result


def step(msg):
    print(f"\n{'='*50}")
    print(f"  {msg}")
    print(f"{'='*50}")


def check_python():
    step("Checking Python")
    version = sys.version.split()[0]
    print(f"  Python {version} detected")
    if sys.version_info < (3, 9):
        print("  Python 3.9+ is required.")
        sys.exit(1)


def check_node():
    step("Checking Node.js")
    try:
        result = subprocess.run("node --version", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  Node {result.stdout.strip()} detected")
        else:
            raise FileNotFoundError
    except FileNotFoundError:
        print("  Node.js not found. Install it from https://nodejs.org")
        sys.exit(1)


def create_venv():
    step("Setting up Python virtual environment")
    if os.path.exists(VENV_PYTHON):
        print("  Virtual environment already exists, skipping.")
        return

    print("  Creating virtual environment...")
    run(f'"{sys.executable}" -m venv venv')
    print("  Done.")


def install_backend_deps():
    step("Installing Python dependencies")
    req_file = os.path.join(BASE_DIR, "requirements.txt")
    if not os.path.exists(req_file):
        print("  requirements.txt not found!")
        sys.exit(1)

    # Use python -m pip to avoid Device Guard blocks on pip.exe.
    run(f'"{VENV_PYTHON}" -m pip install --upgrade pip setuptools wheel')
    run(f'"{VENV_PYTHON}" -m pip install -r requirements.txt')
    print("  All Python packages installed.")


def install_frontend_deps():
    step("Installing frontend dependencies")
    if not os.path.exists(FRONTEND_DIR):
        print("  Frontend directory not found!")
        sys.exit(1)

    node_modules = os.path.join(FRONTEND_DIR, "node_modules")
    if os.path.exists(node_modules):
        print("  node_modules already exists, skipping.")
        return

    run("npm install", cwd=FRONTEND_DIR)
    print("  All npm packages installed.")


def run_migrations():
    step("Running Django migrations")
    env_file = os.path.join(BASE_DIR, ".env")
    if not os.path.exists(env_file):
        print("  WARNING: .env file not found!")
        print("  Create a .env file with DATABASE_URL and Supabase keys.")
        print("  See README.md for the required format.")
        sys.exit(1)

    run(f'"{VENV_PYTHON}" manage.py migrate')
    print("  Migrations applied.")


def check_env_files():
    step("Checking environment files")

    backend_env = os.path.join(BASE_DIR, ".env")
    frontend_env = os.path.join(FRONTEND_DIR, ".env")

    if os.path.exists(backend_env):
        print("  Backend .env found.")
    else:
        print("  Backend .env NOT found.")
        print("  Creating template .env file...")
        with open(backend_env, "w") as f:
            f.write("SECRET_KEY=your_secret_key_here\n")
            f.write("DEBUG=True\n")
            f.write("ALLOWED_HOSTS=localhost,127.0.0.1\n")
            f.write("DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_db\n")
            f.write("SUPABASE_URL=https://your-project.supabase.co\n")
            f.write("SUPABASE_ANON_KEY=your_anon_key_here\n")
            f.write("SUPABASE_BUCKET=criminal-faces\n")
        print("  Template created. Fill in your Supabase credentials before running.")

    if os.path.exists(frontend_env):
        print("  Frontend .env found.")
    else:
        print("  Frontend .env NOT found. Creating...")
        with open(frontend_env, "w") as f:
            f.write("REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api\n")
            f.write("REACT_APP_BACKEND_URL=http://127.0.0.1:8000\n")
        print("  Frontend .env created.")


def main():
    print("\n" + "=" * 50)
    print("  CRCTS Auto Setup")
    print("  Crime Records & Criminal Tracking System")
    print("=" * 50)

    check_python()
    check_node()
    check_env_files()
    create_venv()
    install_backend_deps()
    install_frontend_deps()
    run_migrations()

    print("\n" + "=" * 50)
    print("  Setup Complete!")
    print("=" * 50)
    print("\n  To start the project:")
    print("    python start_project.py")
    print("\n  Login credentials are stored in the Supabase database.")
    print("  Default accounts: admin, police1, court1")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    main()