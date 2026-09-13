from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine

from app.models.user import User
from app.models.ticket import Ticket
from app.models.ai_analysis import AIAnalysis
from app.models.ai_source import AISource

from app.api.tickets import router as ticket_router
from app.api.auth import router as auth_router
from app.api.ai import router as ai_router
from app.api.knowledge import router as knowledge_router

from app.api import customers
from app.api import ticket_messages
from app.api import analytics


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Customer Support Copilot API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-customer-support-copilot-tan.vercel.app",
        "https://ai-customer-support-copilot-sandy.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





app.include_router(ticket_router)
app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(knowledge_router)
app.include_router(customers.router)
app.include_router(ticket_messages.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {
        "message": "AI Customer Support Copilot API"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "message": "Backend is working"
    }