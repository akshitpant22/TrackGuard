import os
import subprocess
import time
import sys
from pathlib import Path
import requests

print("=" * 80)
print("🚀 CRCTS Project Starter (Simplified)")
print("=" * 80)
print("\n")

# ---------------------------------------------------------------
# 1️⃣ Check virtual environment
# ---------------------------------------------------------------
VENV_PYTHON = Path("venv/Scripts/python.exe")
if not VENV_PYTHON.exists():
    print("❌ Virtual environment not found! Run auto_setup.py first.")
    sys.exit(1)
print(f"✅ Virtual environment found")

# ---------------------------------------------------------------
# 2️⃣ Start backend in NEW window
# ---------------------------------------------------------------
print("\n" + "=" * 80)
print("⚙️ Starting Django Backend (http://127.0.0.1:8000)")
print("=" * 80)

# Create a batch file to start backend
backend_bat = '''
@echo off
cd /d "D:\PROJECTS\Crime Record Criminal Tracking System\crcts"
echo Starting Django Backend...
venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
echo.
echo Backend stopped. Press any key to close...
pause
'''

with open("start_backend.bat", "w") as f:
    f.write(backend_bat)

# Start backend in new window
subprocess.Popen(["cmd", "/c", "start", "cmd", "/k", "start_backend.bat"], shell=True)
print("✅ Backend started in new terminal window")

# ---------------------------------------------------------------
# 3️⃣ Wait for backend
# ---------------------------------------------------------------
print("\n⏳ Waiting for backend to be ready...")
backend_ready = False

for i in range(30):  # 30 second timeout
    try:
        response = requests.get("http://127.0.0.1:8000/", timeout=2)
        if response.status_code in [200, 301, 302, 404]:
            print(f"✅ Backend READY after {i+1} seconds!")
            backend_ready = True
            break
    except:
        pass
    time.sleep(1)

if not backend_ready:
    print("❌ Backend not ready after 30 seconds")
    print("💡 Please check the backend terminal for errors")
    sys.exit(1)

# ---------------------------------------------------------------
# 4️⃣ Start frontend in NEW window
# ---------------------------------------------------------------
print("\n" + "=" * 80)
print("🌐 Starting React Frontend (http://localhost:3000)")
print("=" * 80)

frontend_path = Path("crcts-frontend")
if not frontend_path.exists():
    print("❌ Frontend folder 'crcts-frontend' not found!")
    sys.exit(1)

# Create a batch file to start frontend
frontend_bat = '''
@echo off
cd /d "D:\PROJECTS\Crime Record Criminal Tracking System\crcts\crcts-frontend"
echo Starting React Frontend...
npm start
'''

with open("start_frontend.bat", "w") as f:
    f.write(frontend_bat)

# Start frontend in new window
subprocess.Popen(["cmd", "/c", "start", "cmd", "/k", "start_frontend.bat"], shell=True)
print("✅ Frontend started in new terminal window")

# ---------------------------------------------------------------
# 5️⃣ Wait for frontend
# ---------------------------------------------------------------
print("\n⏳ Waiting for frontend to be ready...")
frontend_ready = False

for i in range(30):  # 30 second timeout
    try:
        response = requests.get("http://localhost:3000", timeout=2)
        if response.status_code == 200:
            print(f"✅ Frontend READY after {i+1} seconds!")
            frontend_ready = True
            break
    except:
        pass
    time.sleep(1)

# ---------------------------------------------------------------
# 6️⃣ Final message
# ---------------------------------------------------------------
print("\n" + "=" * 80)
print("🎉 CRCTS System STARTED!")
print("=" * 80)
print("\n📍 URLs:")
print("   🔗 Backend: http://127.0.0.1:8000")
print("   🔗 Frontend: http://localhost:3000")
print("\n👤 Login Credentials:")
print("   🛠️  Admin: admin / admin123")
print("   👮 Police: police1 / police123") 
print("   ⚖️ Court: court1 / court123")
print("\n💡 IMPORTANT:")
print("   • Wait for both terminals to show 'ready' messages")
print("   • Then open: http://localhost:3000")
print("   • If login fails, wait 30 more seconds and refresh")
print("\n🛑 To stop: Close both terminal windows")
print("=" * 80)
# Cleanup batch files
try:
    time.sleep(5)  # Wait a bit before cleanup
    os.remove("start_backend.bat")
    os.remove("start_frontend.bat")
except:
    pass