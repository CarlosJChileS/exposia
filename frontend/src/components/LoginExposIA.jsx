import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import "./LoginExposIA.css";

export default function LoginExposIA() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${API_BASE}/users/login`, {
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
    <div className="login-bg">
      <div className="login-card">
        <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Volver</button>
        <div className="login-icon">
          {/* Icono micrófono */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="#7B61FF" />
            <path d="M20 27c3.314 0 6-2.686 6-6v-7a6 6 0 1 0-12 0v7c0 3.314 2.686 6 6 6Z" fill="#fff"/>
            <path d="M13 21v1a7 7 0 0 0 14 0v-1" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M20 27v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 31h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="login-title">Iniciar Sesión</h2>
        <p className="login-subtitle">Accede a tu cuenta de ExposIA</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              placeholder="ana@example.com"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Contraseña
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="show-hide-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {/* Icono ojo abierto/cerrado */}
                {showPassword ? (
                  <svg width="20" height="20" fill="none">
                    <path d="M3 10c2-4 7-6 11-3 2 1 3 3 3 3" stroke="#7B61FF" strokeWidth="1.7" strokeLinecap="round"/>
                    <path d="M15.5 12c-.5.5-1.5 2-5.5 2-4 0-6-2.5-7-4s3-7 8-7c2.6 0 4.6 1.3 5.8 2.6" stroke="#7B61FF" strokeWidth="1.7" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none">
                    <path d="M1.5 10.5S5 4.5 10 4.5s8.5 6 8.5 6-3.5 6-8.5 6-8.5-6-8.5-6Z" stroke="#7B61FF" strokeWidth="1.7"/>
                    <circle cx="10" cy="10.5" r="2.5" stroke="#7B61FF" strokeWidth="1.7"/>
                  </svg>
                )}
              </button>
            </div>
          </label>
          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              Recordarme
            </label>
            <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>
          <button type="submit" className="btn-login">
            <svg width="18" height="18" fill="none" style={{marginRight: 6, verticalAlign: "middle"}}>
              <path d="M2 9h14M9 2l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Iniciar Sesión
          </button>
        </form>
        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
        <div className="login-divider">
          <span>o</span>
        </div>
        <div className="login-register">
          ¿No tienes cuenta? <Link to="/register" className="register-link">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}


