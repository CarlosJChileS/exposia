from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

try:
    from .. import database
except ImportError:
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).resolve().parent.parent))
    import database

router = APIRouter(prefix="/users", tags=["users"])

class UserBase(BaseModel):
    email: str
    password: str


class UserRegister(UserBase):
    pass


class UserLogin(UserBase):
    pass


@router.post("/register")
def register_user(user: UserRegister):
    if database.get_user(user.email):
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    database.add_user(user.email, user.password)
    return {"msg": f"Usuario registrado: {user.email}"}


@router.post("/login")
def login_user(user: UserLogin):
    stored = database.get_user(user.email)
    if not stored or stored.get("password") != user.password:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return {"msg": f"Usuario logueado: {user.email}"}
