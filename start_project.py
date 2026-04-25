import os
import subprocess
import sys
import platform
import time
from pathlib import Path

print("=" * 60)
print("  CRCTS Project Starter")
print("=" * 60)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "crcts-frontend")

if platform.system() == "Windows":
    VENV_PYTHON = os.path.join(BASE_DIR, "venv", "Scripts", "python.exe")
    NPM_CMD = "npm.cmd"
else:
    VENV_PYTHON = os.path.join(BASE_DIR, "venv", "bin", "python")
    NPM_CMD = "npm"

if not os.path.exists(VENV_PYTHON):
    print("ERROR: Virtual environment not found. Run 'python auto_setup.py' first.")
    sys.exit(1)

print("Starting Django backend (http://127.0.0.1:8000)...")
backend_process = subprocess.Popen(
    [VENV_PYTHON, "manage.py", "runserver", "127.0.0.1:8000"],
    cwd=BASE_DIR
)

time.sleep(2)

print("\nStarting React frontend (http://localhost:3000)...")
if not os.path.exists(FRONTEND_DIR):
    print("ERROR: Frontend folder 'crcts-frontend' not found.")
    backend_process.terminate()
    sys.exit(1)

frontend_process = subprocess.Popen(
    [NPM_CMD, "start"],
    cwd=FRONTEND_DIR
)

print("\n" + "=" * 60)
print("  CRCTS System Started Successfully")
print("=" * 60)
print("\n  URLs:")
print("    Backend:  http://127.0.0.1:8000")
print("    Frontend: http://localhost:3000")
print("\n  Login Credentials:")
print("    Admin:   admin / admin123")
print("    Police:  police1 / police123")
print("    Court:   court1 / court123")
print("\n  Press CTRL+C in this terminal to stop both servers.")
print("=" * 60 + "\n")

try:
    backend_process.wait()
    frontend_process.wait()
except KeyboardInterrupt:
    print("\nShutting down servers...")
    backend_process.terminate()
    frontend_process.terminate()
    print("Stopped.")