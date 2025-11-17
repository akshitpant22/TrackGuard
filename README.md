<!-- HEADER -->

<h1 align="center">⚖️ Crime Record & Criminal Tracking System (CRCTS)</h1>

<p align="center">
  <img src="https://img.shields.io/badge/CRIME%20RECORD%20TRACKING%20SYSTEM-DJANGO%20%7C%20REACT-blueviolet?style=for-the-badge&logo=django" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/Django-5.0%2B-44B78B?style=for-the-badge&logo=django" />
  <img src="https://img.shields.io/badge/React-18%2B-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/PostgreSQL-15%2B-336791?style=for-the-badge&logo=postgresql" />
</p>

> 🕵️‍♀️ **A robust, scalable, and secure full-stack system for managing criminal records — integrating Police, Court, and Admin roles seamlessly.**

---

## 🌟 Overview

The **Crime Record & Criminal Tracking System (CRCTS)** is a centralized digital crime management platform designed to:

* Digitize and centralize **criminal data**
* Streamline collaboration between **Police, Courts, and Administrators**
* Enhance accountability, traceability, and security through role-based access

---

## 🧩 Tech Stack

| Layer                 | Technology                          |
| :-------------------- | :---------------------------------- |
| 💻 **Frontend**       | React.js + Tailwind CSS             |
| ⚙️ **Backend**        | Django + Django REST Framework      |
| 🗄️ **Database**      | PostgreSQL                          |
| 🔐 **Authentication** | JSON Web Tokens (JWT via SimpleJWT) |
| 🤖 **Automation**     | `auto_setup.py`, `start_project.py` |

---

## 🧠 Core Features

### 👮 Police Module

* Manage **FIRs**, **criminal records**, and **case entries**
* Read-only access to courts and other stations
* Full CRUD on their jurisdiction’s data

### ⚖️ Court Module

* Manage **case hearings, outcomes, and judgments**
* Read-only access to linked FIR and criminal data
* Restricted modification rights based on assignment

### 👑 Admin Module

* Manage all user roles and access levels
* Full CRUD rights across all entities
* System-wide statistics dashboard with live updates

### 📊 Analytics Dashboard

* Real-time overview of:

  * 👤 Total Criminals
  * 📜 Total FIRs
  * ⚖️ Total Cases
  * 🏢 Police Stations
  * 🏛️ Courts
* Auto-fetched from backend via REST APIs

### 🔒 Role-Based Authentication

* JWT-based authentication with dynamic redirect:

  * 👑 **Admin** → `/admin`
  * 👮 **Police** → `/police`
  * ⚖️ **Court** → `/court`

---

## 🏗️ Project Structure

```bash
CRCTS/
│
├── crcts-frontend/        # React Frontend
│   ├── src/
│   └── package.json
│
├── crimeapp/              # Django App (Backend)
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
│
├── data/                  # CSV Files for Initial Data
│   ├── criminals.csv
│   ├── firs.csv
│   ├── case_records.csv
│   └── ...
│
├── create_tables.sql      # SQL schema for unmanaged models
├── auto_setup.py          # Automates full DB + Data setup
├── start_project.py       # Universal launcher (Win/macOS/Linux)
├── manage.py
└── requirements.txt
```

---

## ⚙️ Installation Guide

### 🧩 Prerequisites

Make sure you have:

* 🐍 Python ≥ 3.10
* 🐘 PostgreSQL ≥ 15
* 🟩 Node.js (LTS recommended)
* 🧰 Git

---

### 🪶 Step 1 — Clone Repository

```bash
git clone https://github.com/yourusername/CRCTS.git
cd CRCTS
```

### 🪶 Step 2 — Create & Activate Virtual Environment

```bash
python -m venv venv
```

> 💡 **If activation fails (Windows PowerShell)**:
>
> ```bash
> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

Then:

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

---

### 🪶 Step 3 — Install Python Dependencies

```bash
pip install -r requirements.txt
```

---

### 🪶 Step 4 — Auto Setup the Project

```bash
python auto_setup.py
```

✅ Creates PostgreSQL database `crime_db`
✅ Runs all migrations
✅ Executes SQL schema
✅ Imports CSVs automatically
✅ Creates users for all roles

---

### 🪶 Step 5 — Start the Full Application

```bash
python start_project.py
```

✅ **Backend:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
✅ **Frontend:** [http://localhost:3000](http://localhost:3000)

Two terminals will open automatically — one for Django and one for React.

---


## 🧭 Usage

1. Navigate to **[http://localhost:3000](http://localhost:3000)**
2. Login using role credentials
3. Explore the interactive dashboards
4. Perform CRUD operations as per role permissions
5. Logout securely once done

---

## ⚒️ Common Commands

| Task                  | Command                                |
| :-------------------- | :------------------------------------- |
| Run Backend only      | `python manage.py runserver`           |
| Run Frontend only     | `npm start` (inside `crcts-frontend/`) |
| Reset Database        | `python auto_setup.py`                 |
| Create Admin Manually | `python manage.py createsuperuser`     |

---




