# 🤖 AI Customer Support Copilot

An end-to-end **Generative AI customer support application** built with
**FastAPI, React (Vite), PostgreSQL + pgvector, LangChain, Groq, and
Hugging Face embeddings**.

The application helps support teams manage customer tickets, analyze
tickets with AI, and answer customer-support questions using a
document-based **Retrieval-Augmented Generation (RAG)** pipeline.

------------------------------------------------------------------------

## ✨ Features

### 🎫 Customer Ticket Management

-   Create support tickets
-   View tickets
-   Update ticket status
-   Delete tickets
-   Ticket priority:
    -   LOW
    -   MEDIUM
    -   HIGH
    -   URGENT

### 🧠 AI Ticket Analysis

The AI analyzes a ticket and generates: - Category - Sentiment -
Priority - Summary - Suggested customer reply - AI analysis history

Supported categories include: - Billing - Technical - Account -
Delivery - Refund - Product - Subscription - Other

Supported sentiment values include: - Positive - Neutral - Frustrated -
Angry - Negative

### 📚 Knowledge Base + RAG

Support documents can be uploaded and used as the application's
knowledge base.

Current supported formats: - PDF - DOCX - TXT - CSV - Markdown (`.md`)

The RAG pipeline: 1. Reads the document 2. Splits it into chunks 3.
Generates embeddings 4. Stores embeddings in PostgreSQL using pgvector
5. Performs similarity search 6. Sends the retrieved context to Groq 7.
Generates a grounded customer-support answer 8. Returns the source
documents/pages used

The application also uses a SHA-256 file hash to prevent the same
document from being indexed more than once.

### 🔐 Authentication

-   User registration/login
-   JWT-based authentication
-   Protected API endpoints
-   Frontend stores the access token in browser `localStorage`

------------------------------------------------------------------------

# 🏗️ Architecture

``` text
                    ┌──────────────────────┐
                    │     React / Vite     │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │ HTTP / REST
                               ▼
                    ┌──────────────────────┐
                    │       FastAPI        │
                    │       Backend        │
                    └───────┬───────┬──────┘
                            │       │
              ┌─────────────┘       └──────────────┐
              ▼                                    ▼
     ┌─────────────────┐                  ┌─────────────────┐
     │   PostgreSQL    │                  │      Groq       │
     │    + pgvector   │                  │       LLM       │
     └────────┬────────┘                  └─────────────────┘
              │
              │ vector similarity search
              ▼
     ┌─────────────────┐
     │ Knowledge Base  │
     │ Document Chunks │
     └─────────────────┘
              ▲
              │
     ┌─────────────────┐
     │ Hugging Face    │
     │ Embeddings      │
     └─────────────────┘
```

------------------------------------------------------------------------

# 🛠️ Tech Stack

## Frontend

-   React.js
-   Vite
-   JavaScript
-   CSS
-   Fetch/API integration
-   Browser localStorage for JWT access token

## Backend

-   Python
-   FastAPI
-   Uvicorn
-   SQLAlchemy
-   JWT authentication
-   Pydantic
-   Passlib/Bcrypt
-   LangChain
-   LangChain Groq

## Generative AI

-   Groq API
-   Configurable Groq model
-   Structured AI ticket analysis
-   RAG-based question answering

## Embeddings

-   Hugging Face / Sentence Transformers
-   `sentence-transformers/all-MiniLM-L6-v2`

## Database

-   PostgreSQL
-   pgvector
-   SQLAlchemy

> The current RAG implementation stores embeddings directly in
> PostgreSQL with pgvector.

## Document Processing

-   PyPDF
-   python-docx/docx2txt
-   TXT loader
-   CSV loader
-   Markdown loader

------------------------------------------------------------------------

# 📁 Project Structure

Your repository should look approximately like this:

``` text
AI-Customer-Support-Copilot/
│
├── backend/
│   ├── app/
│   │   ├── config.py
│   │   ├── main.py
│   │   ├── database/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   │       ├── ai_service.py
│   │       ├── embedding_service.py
│   │       └── rag_service.py
│   │
│   ├── knowledge_base/
│   ├── requirements.txt
│   ├── .env
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── .gitignore
└── README.md
```

The exact folder names may vary depending on the repository version.

------------------------------------------------------------------------

# 💻 Local Development Requirements

Before cloning the project, install:

### Required

-   Git
-   Python 3.10+
-   Node.js 18+
-   npm
-   PostgreSQL
-   PostgreSQL `pgvector` extension

Recommended: - Python 3.11 or 3.12 - Node.js 20+

You also need a **Groq API key** and access to a Hugging Face embedding
model.

------------------------------------------------------------------------

# 1️⃣ Clone the Repository

``` bash
git clone https://github.com/YOUR_USERNAME/AI-Customer-Support-Copilot.git
cd AI-Customer-Support-Copilot
```

Replace `YOUR_USERNAME` with the actual GitHub username/repository URL.

------------------------------------------------------------------------

# 2️⃣ Set Up PostgreSQL

The project needs PostgreSQL for:

-   Users
-   Tickets
-   AI analysis history
-   Knowledge-base document chunks
-   Vector embeddings

## Option A --- Local PostgreSQL

Create a database:

``` bash
createdb customer_copilot
```

Or open PostgreSQL:

``` bash
psql postgres
```

Then:

``` sql
CREATE DATABASE customer_copilot;
```

Connect to it:

``` bash
psql customer_copilot
```

Enable pgvector:

``` sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Verify:

``` sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

You should see the `vector` extension.

### If `vector` extension is not available

Install pgvector for your operating system first.

For macOS with Homebrew, a typical setup is:

``` bash
brew install pgvector
```

Then restart/reload PostgreSQL if necessary and run:

``` sql
CREATE EXTENSION IF NOT EXISTS vector;
```

------------------------------------------------------------------------

# 3️⃣ PostgreSQL Connection String

The backend needs a PostgreSQL connection URL.

For a local PostgreSQL database:

``` env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/customer_copilot
```

If your PostgreSQL username is different, replace `postgres`.

Example:

``` env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/customer_copilot
```

Do **not** commit real passwords to GitHub.

------------------------------------------------------------------------

# ☁️ Using Neon PostgreSQL Instead

The deployed project can use **Neon PostgreSQL** instead of a local
PostgreSQL server.

Create a database on Neon and copy its connection string.

It will look similar to:

``` env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

For local development, you can either:

-   use local PostgreSQL + pgvector, or
-   connect the backend directly to your Neon database.

For a clean development environment, using a separate local database is
recommended.

------------------------------------------------------------------------

# 4️⃣ Backend Setup

Open a new terminal:

``` bash
cd backend
```

## Create a virtual environment

macOS/Linux:

``` bash
python3 -m venv venv
```

Activate it:

``` bash
source venv/bin/activate
```

Windows:

``` bash
python -m venv venv
```

Activate:

``` powershell
venv\Scripts\activate
```

------------------------------------------------------------------------

# 5️⃣ Install Backend Dependencies

``` bash
pip install --upgrade pip
pip install -r requirements.txt
```

If your project uses a Python version-specific dependency issue, use the
Python version specified by the repository's
`requirements.txt`/deployment configuration.

------------------------------------------------------------------------

# 6️⃣ Backend Environment Variables

Inside:

``` text
backend/
```

create:

``` text
.env
```

Example:

``` env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/customer_copilot

GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b

SECRET_KEY=replace_with_a_long_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

FRONTEND_URL=http://localhost:5173
```

### Important

Never commit `.env` to GitHub.

Your `.gitignore` should contain:

``` gitignore
.env
venv/
__pycache__/
*.pyc
```

------------------------------------------------------------------------

# 7️⃣ Generate a Secure Secret Key

You can generate a secret key with Python:

``` bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output into:

``` env
SECRET_KEY=your_generated_secret
```

------------------------------------------------------------------------

# 8️⃣ Start the Backend

From the `backend` directory:

``` bash
uvicorn app.main:app --reload
```

If your FastAPI entry point is different, use the module/path used by
your repository.

The backend should start at:

``` text
http://127.0.0.1:8000
```

------------------------------------------------------------------------

# 9️⃣ Open FastAPI Swagger Documentation

FastAPI automatically provides interactive API documentation.

Open:

``` text
http://127.0.0.1:8000/docs
```

Alternative:

``` text
http://127.0.0.1:8000/redoc
```

Swagger is useful for testing the backend before starting the React
frontend.

------------------------------------------------------------------------

# 🔟 Database Tables

On application startup, the backend should initialize/create the
required database tables according to the project's database
configuration.

If the repository uses migrations instead, run the project's migration
commands before using the API.

The database stores application data such as:

``` text
Users
Tickets
AI Analysis History
Knowledge Embeddings
```

The knowledge embedding records contain:

-   chunk content
-   metadata
-   source filename
-   page information where available
-   file hash
-   vector embedding

------------------------------------------------------------------------

# 1️⃣1️⃣ Add Knowledge Base Documents

The RAG system currently supports:

``` text
.pdf
.docx
.txt
.csv
.md
```

You can upload documents through the application's Knowledge Base
interface.

Example:

``` text
knowledge_base/
├── refund_policy.pdf
├── requirements.pdf
└── faq.md
```

When a document is uploaded:

``` text
Document
   ↓
Document Loader
   ↓
Text Extraction
   ↓
Chunking
   ↓
Hugging Face Embeddings
   ↓
PostgreSQL + pgvector
```

The current text splitter uses approximately:

``` text
chunk_size = 500
chunk_overlap = 50
```

------------------------------------------------------------------------

# 1️⃣2️⃣ Start the Frontend

Open another terminal.

From the project root:

``` bash
cd frontend
```

Install npm dependencies:

``` bash
npm install
```

Then start Vite:

``` bash
npm run dev
```

The frontend should be available at:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# 1️⃣3️⃣ Frontend Environment Variables

If your frontend API service uses an environment variable for the
backend URL, create:

``` text
frontend/.env
```

Example:

``` env
VITE_API_URL=http://127.0.0.1:8000
```

If the source code currently contains the API URL directly in an
API/service file, use that value instead or update the code to use
`VITE_API_URL`.

After changing a Vite `.env` file, restart:

``` bash
npm run dev
```

------------------------------------------------------------------------

# 🔄 Running the Complete Application

You normally need **three components** running:

### Terminal 1 --- PostgreSQL

Make sure PostgreSQL is running.

Example macOS Homebrew command:

``` bash
brew services start postgresql
```

Check:

``` bash
pg_isready
```

------------------------------------------------------------------------

### Terminal 2 --- FastAPI Backend

``` bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

Backend:

``` text
http://127.0.0.1:8000
```

Swagger:

``` text
http://127.0.0.1:8000/docs
```

------------------------------------------------------------------------

### Terminal 3 --- React Frontend

``` bash
cd frontend
npm install
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# 🔐 Authentication Flow

The application uses JWT authentication.

Typical flow:

``` text
Register
   ↓
Login
   ↓
FastAPI validates credentials
   ↓
JWT access token returned
   ↓
Frontend stores access token
   ↓
Protected API requests include token
   ↓
FastAPI validates JWT
   ↓
User accesses tickets / AI / knowledge base
```

The frontend currently uses browser `localStorage` for the access token.

Example key:

``` text
access_token
```

------------------------------------------------------------------------

# 🧠 AI Ticket Analysis Flow

When a user selects **Analyze Ticket**:

``` text
Customer Ticket
      ↓
FastAPI
      ↓
AI Service
      ↓
Groq LLM
      ↓
Structured Ticket Analysis
      ↓
Category
Sentiment
Priority
Summary
Suggested Reply
      ↓
PostgreSQL
      ↓
AI Analysis History
```

The AI analysis is designed to produce structured output rather than an
unstructured paragraph.

------------------------------------------------------------------------

# 📚 RAG Question Answering Flow

The customer-support assistant uses Retrieval-Augmented Generation.

``` text
User Question
      ↓
Embedding Model
      ↓
Query Vector
      ↓
PostgreSQL + pgvector
      ↓
Similarity Search
      ↓
Top Relevant Chunks
      ↓
RAG Context
      ↓
Groq LLM
      ↓
Grounded Answer
      ↓
Sources
```

The RAG prompt instructs the model to:

-   use only retrieved knowledge-base information
-   avoid inventing policies
-   preserve dates, numbers, limits, prices and conditions
-   say when information is unavailable
-   provide professional customer-support answers
-   avoid exposing internal retrieval/database details

------------------------------------------------------------------------

# 🧹 Duplicate Document Protection

Uploaded documents are hashed using SHA-256.

``` text
File
 ↓
SHA-256 hash
 ↓
Check database
 ↓
Already exists?
 ├── Yes → Reject duplicate
 └── No  → Process document
```

This prevents the same document from being indexed repeatedly.

------------------------------------------------------------------------

# 🧪 Testing the Backend

Start FastAPI:

``` bash
uvicorn app.main:app --reload
```

Open:

``` text
http://127.0.0.1:8000/docs
```

Recommended testing order:

### 1. Register

Create a user account.

### 2. Login

Login and obtain the JWT access token.

### 3. Authorize

Use the Swagger **Authorize** button if your API requires Bearer
authentication.

Use:

``` text
Bearer YOUR_ACCESS_TOKEN
```

### 4. Create a ticket

Test:

``` text
POST /tickets
```

### 5. Get tickets

Test the ticket listing endpoint.

### 6. Analyze ticket

Use the AI analysis endpoint.

### 7. Upload a knowledge-base document

Upload a PDF/DOCX/TXT/CSV/MD document.

### 8. Ask a RAG question

Ask something that exists in the uploaded documents.

------------------------------------------------------------------------

# 🐛 Common Problems

## `ModuleNotFoundError`

Example:

``` text
No module named 'langchain_community'
```

Run:

``` bash
pip install -r requirements.txt
```

Or install the missing dependency listed by the error.

------------------------------------------------------------------------

## PostgreSQL connection error

Check:

``` bash
pg_isready
```

Then verify:

``` env
DATABASE_URL=...
```

Make sure:

-   PostgreSQL is running
-   database exists
-   username is correct
-   password is correct
-   port is correct
-   pgvector is installed/enabled

------------------------------------------------------------------------

## `extension "vector" is not available`

The PostgreSQL server does not have pgvector installed.

Install pgvector for your PostgreSQL installation, then run:

``` sql
CREATE EXTENSION IF NOT EXISTS vector;
```

------------------------------------------------------------------------

## CORS error

Make sure the backend allows the frontend origin:

``` text
http://localhost:5173
```

For local development, configure FastAPI CORS appropriately.

------------------------------------------------------------------------

## Frontend cannot connect to backend

Check that FastAPI is running:

``` text
http://127.0.0.1:8000/docs
```

Then verify the frontend API URL:

``` env
VITE_API_URL=http://127.0.0.1:8000
```

Restart Vite after changing `.env`.

------------------------------------------------------------------------

## 401 Unauthorized

A `401` usually means the endpoint requires authentication.

Check:

1.  You logged in successfully.
2.  A valid JWT token was returned.
3.  The frontend stored `access_token`.
4.  The request sends:

``` text
Authorization: Bearer YOUR_TOKEN
```

Swagger can also be used to test protected endpoints.

------------------------------------------------------------------------

## bcrypt password error

If you encounter a bcrypt/passlib compatibility problem, verify the
installed versions in your backend environment and ensure passwords are
handled according to the project's authentication implementation.

Do not store plaintext passwords.

------------------------------------------------------------------------

## AI analysis fails

Check:

``` env
GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-20b
```

Also verify that:

-   the Groq API key is valid
-   the selected model is available to your account
-   the backend can access the internet
-   the ticket exists before analysis is requested

------------------------------------------------------------------------

## RAG returns no useful answer

Check:

1.  A document has actually been uploaded.
2.  The document format is supported.
3.  The document was successfully processed.
4.  Embeddings were generated.
5.  Records exist in PostgreSQL.
6.  The question is related to the uploaded document.

You can also test the RAG service directly if the repository contains a
test script.

------------------------------------------------------------------------

# 🔒 Security

Never commit these values:

``` text
GROQ_API_KEY
DATABASE_URL
SECRET_KEY
JWT secrets
Database passwords
```

Use:

``` text
.env
```

and add it to:

``` text
.gitignore
```

For production:

-   use HTTPS
-   use strong secrets
-   use production database credentials
-   configure CORS to trusted origins only
-   use secure cookie/token practices where appropriate
-   validate file uploads
-   enforce file size limits
-   avoid exposing internal errors to users

------------------------------------------------------------------------

# 🚀 Production Deployment

The application can be deployed as separate frontend/backend services.

A common architecture is:

``` text
React/Vite
    ↓
Vercel
    ↓
FastAPI API
    ↓
Render / Railway / Fly.io / other backend host
    ↓
Neon PostgreSQL + pgvector
    ↓
Groq API
```

The frontend should use the deployed backend URL instead of:

``` text
http://127.0.0.1:8000
```

Example:

``` env
VITE_API_URL=https://your-backend-domain.com
```

The backend should use the production Neon connection string:

``` env
DATABASE_URL=your_neon_connection_string
```

Do not use development secrets in production.

------------------------------------------------------------------------

# 📦 Build Frontend for Production

From:

``` bash
cd frontend
```

Install:

``` bash
npm install
```

Build:

``` bash
npm run build
```

The production files will normally be generated in:

``` text
dist/
```

Preview locally:

``` bash
npm run preview
```

------------------------------------------------------------------------

# 🧩 Environment Variable Checklist

## Backend `.env`

``` env
DATABASE_URL=
GROQ_API_KEY=
GROQ_MODEL=
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=
```

## Frontend `.env`

``` env
VITE_API_URL=
```

The exact variables required by the application are determined by the
backend configuration and frontend API service files. If a variable is
already hard-coded in your repository, replace it with an environment
variable before publishing the project.

------------------------------------------------------------------------

# ✅ First-Time Local Setup Checklist

After cloning:

``` text
[ ] Install Git
[ ] Install Python
[ ] Install Node.js
[ ] Install PostgreSQL
[ ] Install/enable pgvector
[ ] Create PostgreSQL database
[ ] Clone repository
[ ] Create backend virtual environment
[ ] Install Python dependencies
[ ] Create backend .env
[ ] Add DATABASE_URL
[ ] Add GROQ_API_KEY
[ ] Add SECRET_KEY
[ ] Start FastAPI
[ ] Open /docs
[ ] Register a user
[ ] Login
[ ] Start React/Vite
[ ] Configure frontend API URL
[ ] Upload knowledge-base document
[ ] Test RAG
[ ] Create ticket
[ ] Test AI ticket analysis
```

------------------------------------------------------------------------

# 🎯 Example End-to-End Test

### Step 1 --- Start PostgreSQL

``` bash
pg_isready
```

### Step 2 --- Start backend

``` bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Step 3 --- Start frontend

``` bash
cd frontend
npm run dev
```

### Step 4 --- Open the application

``` text
http://localhost:5173
```

### Step 5 --- Register/Login

Create an account and login.

### Step 6 --- Create a ticket

Example:

``` text
Subject:
Charged twice for my subscription

Description:
I was charged twice for my monthly subscription. Please check the duplicate payment.
```

### Step 7 --- Analyze the ticket

The AI should return information such as:

``` text
Category: Billing
Sentiment: Frustrated
Priority: ...
Summary: ...
Suggested Reply: ...
```

### Step 8 --- Upload a support document

For example:

``` text
refund_policy.pdf
```

### Step 9 --- Ask a knowledge-base question

Example:

``` text
How long does an approved refund take?
```

The RAG system retrieves relevant document chunks and generates an
answer based on those sources.

------------------------------------------------------------------------

# 📝 Notes for Contributors

When modifying the project:

-   Keep secrets outside source code.
-   Update `requirements.txt` when adding Python dependencies.
-   Update `package.json` when adding frontend dependencies.
-   Keep API contracts consistent between React and FastAPI.
-   Test protected endpoints with authentication.
-   Test document upload and RAG after changing embedding/vector code.
-   Do not commit generated databases, virtual environments, or secrets.

------------------------------------------------------------------------

# 📌 Project Highlights

This project demonstrates practical experience with:

-   Generative AI
-   LLM application development
-   RAG
-   Vector search
-   pgvector
-   PostgreSQL
-   FastAPI
-   React
-   Vite
-   LangChain
-   Groq
-   Hugging Face embeddings
-   JWT authentication
-   REST APIs
-   Document processing
-   AI structured output
-   AI ticket classification
-   Sentiment analysis
-   Automated response generation
-   Knowledge-base management
-   Full-stack AI application development

------------------------------------------------------------------------

# 👩‍💻 Author

**Aqsa Arif**

AI Engineer / Software Engineer

Built as an end-to-end Generative AI project demonstrating full-stack AI
application development.

------------------------------------------------------------------------

# ⭐ If You Like This Project

If this project helped you learn about Generative AI, RAG, FastAPI,
React, or PostgreSQL + pgvector, consider giving the repository a ⭐ on
GitHub.
