import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import "./RegisterPage.css";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (resp.ok) {
        localStorage.setItem('user', JSON.stringify({ email }));
        navigate("/dashboard");
      } else {
        setMsg(data.detail || data.msg);
      }
    } catch (err) {
      setMsg("Error al conectar");
    }
  };

  return (
    <div className="register-bg">
      <div className="register-card">
        <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Volver</button>
        <div className="register-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="#7B61FF" />
            <path d="M20 27c3.314 0 6-2.686 6-6v-7a6 6 0 1 0-12 0v7c0 3.314 2.686 6 6 6Z" fill="#fff"/>
            <path d="M13 21v1a7 7 0 0 0 14 0v-1" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M20 27v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 31h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="register-title">Crear Cuenta</h2>
        <p className="register-subtitle">Regístrate para usar ExposIA</p>
        <form className="register-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              placeholder="ana@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" className="btn-register">Registrarse</button>
        </form>
        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
        <div className="register-login">
          ¿Ya tienes cuenta?
          <Link to="/login" className="register-link">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

