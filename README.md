📘 BudgetBox – Smart Budget Management App

Track expenses. Sync to cloud. Offline-first.

🚀 Overview

BudgetBox is a modern full-stack budget management application that helps users track monthly income, expenses, and remaining balance. It works offline, saves everything locally using LocalForage, and syncs securely to the cloud through a lightweight Node.js backend powered by PostgreSQL.

Designed with a clean UI, real-time updates, and reliable cloud sync, BudgetBox is built for everyday personal finance management.

✨ Features
🔹 1. Add & Manage Budget Items

Add expenses with label & amount

Update or delete items anytime

See total spend and remaining balance instantly

🔹 2. Offline-First Storage (LocalForage)

Works without internet

Saves data locally

Restores automatically on refresh or browser restart

🔹 3. Cloud Sync (Railway + PostgreSQL)

Sync budget across devices

Last-Write-Wins merge algorithm

Uses JSONB storage for flexibility

🔹 4. Clean Modern UI

Next.js + Tailwind CSS

Fully responsive

Mobile-first design

🛠️ Tech Stack
Frontend

Next.js 14 (App Router)

React + TypeScript

Tailwind CSS

LocalForage (offline DB)

Deployed on Vercel

Backend

Node.js + Express

PostgreSQL (Railway)

JSONB table for full budget object

Deployed on Railway

📂 Project Structure
BudgetBox/
│
├── backend/
│   ├── index.js
│   ├── migrations/
│   │   └── create_tables.js
│   ├── package.json
│   └── ... Express server & DB code
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── getBackend.ts
│   │   └── sync.ts
│   ├── styles/
│   ├── next.config.js
│   └── package.json
│
└── README.md

🗄️ Database Schema
Table: budgets
CREATE TABLE IF NOT EXISTS budgets (
  id text PRIMARY KEY,
  data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

Stored JSONB structure:
{
  "id": "demo-budget",
  "month": "January 2025",
  "income": 50000,
  "items": [
    { "id": "1", "label": "Rent", "amount": 12000 },
    { "id": "2", "label": "Groceries", "amount": 4000 }
  ],
  "lastEdited": 1728635500822
}

🔄 Cloud Sync Workflow

BudgetBox uses a Last-Write-Wins (LWW) algorithm.

User modifies data → saved locally via LocalForage

User clicks Sync

Client sends full budget payload to /budget/sync

Server compares timestamps

Newest version wins

Client saves server version locally (if newer)

This ensures consistent state across all devices.

🌐 API Endpoints
Method	Endpoint	Description
GET	/health	Check server status
GET	/budget?id=ID	Fetch budget
POST	/budget/sync	Push/pull with LWW merge
POST	/budget/update	Update metadata
POST	/budget/item/update	Update expense
POST	/budget/item/delete	Delete expense
🖥️ Local Development Setup
Clone the repo
git clone https://github.com/udaykiran-daggupati/BudgetBox.git
cd BudgetBox

Frontend Setup (Next.js)
cd frontend
npm install
npm run dev


Frontend runs at:

http://localhost:3000

Backend Setup (Express)
cd backend
npm install
npm run migrate   # create budgets table
npm run dev       # start backend on localhost:4000


Test health:

curl http://localhost:4000/health

🚀 Production Deployment
Frontend: Vercel

Add environment variable:

NEXT_PUBLIC_BACKEND_URL = https://your-railway-backend-url

Backend: Railway

Deploy Node.js (index.js)

Add PostgreSQL plugin

Add environment variable automatically: DATABASE_URL

📸 Screenshots
Dashboard

(Add your images here)

/public/screenshots/dashboard.png
/public/screenshots/add-item.png

🧪 Testing Sync (Manual)
$body = @{
  id='demo-budget'
  month='Nov 2025'
  income=50000
  items=@()
  lastEdited=1
} | ConvertTo-Json -Compress

Invoke-RestMethod -Uri 'https://<your-backend-url>/budget/sync' -Method Post -Body $body -ContentType 'application/json'

📌 Key Learning Highlights

This project demonstrates your ability to:

Build full-stack applications

Create offline-first architecture

Design sync algorithms (LWW)

Connect Next.js frontend to Express backend

Manage PostgreSQL JSONB storage

Deploy real-world apps with Vercel + Railway

Solve CORS, DB, and network issues

Maintain environment variables + secrets

Use this in interviews to explain your technical depth clearly.

🧑‍💻 Author

Uday Kiran
Full-Stack JavaScript Developer

🔗 GitHub: udaykiran-daggupati

⭐ Support This Project

If you like BudgetBox, please ⭐ star the repo!
