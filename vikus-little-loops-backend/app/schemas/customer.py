from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr


class CustomerRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str | None = None


class CustomerLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token (JWT) from Google Identity Services


class CustomerToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CustomerProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    phone: str | None = None
    avatar_url: str | None = None


class CustomerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
