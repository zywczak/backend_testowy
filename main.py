from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS — zezwól frontowi z Cloudflare na odpytywanie API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # zmień na swój adres
    allow_methods=["*"],
    allow_headers=["*"],
)

class DomainRequest(BaseModel):
    domain_name: str

@app.post("/api/track")
def track_domain(
    payload: DomainRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    # Pobierz IP z nagłówka (Cloudflare ustawia CF-Connecting-IP)
    ip = request.headers.get("CF-Connecting-IP") or request.client.host

    entry = models.DomainEntry(
        domain_name=payload.domain_name,
        ip_address=ip
    )
    db.add(entry)
    db.commit()

    return {"status": "ok", "domain": payload.domain_name, "ip": ip}

@app.get("/api/entries")
def get_entries(db: Session = Depends(get_db)):
    return db.query(models.DomainEntry).all()