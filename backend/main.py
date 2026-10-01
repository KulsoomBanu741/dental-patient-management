from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import client
from routes.patients import router as patients_router
from routes.case_sheets import router as case_sheets_router
from routes.summaries import router as summaries_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://dental-patient-management-nu.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(patients_router)
app.include_router(case_sheets_router)
app.include_router(summaries_router)

@app.get("/")
def root():
    return {"message": "Dental Patient Management API is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/health/db")
def database_health():
    client.admin.command("ping")
    return {"status": "ok", "database": "connected"}