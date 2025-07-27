import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./WelcomePage.css";

export default function WelcomePage() {
  const navigate = useNavigate();
  return (
    <div className="welcome-bg">
      <div className="welcome-card">
        <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Volver</button>
        <div className="welcome-icon">
          {/* Ícono micrófono */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="#7B61FF" />
            <path d="M20 27c3.314 0 6-2.686 6-6v-7a6 6 0 1 0-12 0v7c0 3.314 2.686 6 6 6Z" fill="#fff"/>
            <path d="M13 21v1a7 7 0 0 0 14 0v-1" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M20 27v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 31h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="welcome-title">Bienvenido a ExposIA</h1>
        <p className="welcome-subtitle">
          Sistema educativo con IA para mejorar tus habilidades de oratoria
        </p>
        <h3 className="welcome-question">¿Qué puedes hacer con ExposIA?</h3>
        <div className="welcome-features">
          <div className="welcome-feature">
            {/* Ícono subir */}
            <svg width="28" height="28" fill="none">
              <path d="M14 19V9m0 0-4 4m4-4 4 4" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round"/>
              <rect x="4" y="21" width="20" height="2" rx="1" fill="#D8D5F4"/>
            </svg>
            <b>Sube tu PDF</b>
            <span>Convierte presentaciones en slides interactivos</span>
          </div>
          <div className="welcome-feature">
            {/* Ícono micrófono pequeño */}
            <svg width="28" height="28" fill="none">
              <circle cx="14" cy="14" r="14" fill="#D8D5F4"/>
              <path d="M14 19a4 4 0 0 0 4-4v-3a4 4 0 0 0-8 0v3a4 4 0 0 0 4 4Z" fill="#7B61FF"/>
              <path d="M10 15v1a4 4 0 0 0 8 0v-1" stroke="#7B61FF" strokeWidth="1.5"/>
              <path d="M14 19v2" stroke="#7B61FF" strokeWidth="1.5"/>
            </svg>
            <b>Practica tu oratoria</b>
            <span>Graba tu voz y navega entre slides</span>
          </div>
          <div className="welcome-feature">
            {/* Ícono cerebro/IA */}
            <svg width="28" height="28" fill="none">
              <rect width="28" height="28" rx="8" fill="#D8D5F4"/>
              <path d="M10 18c-1-1.5-1-4 2-5.5S17 14 18 16s-1 3-2 2-2 1-4 0Z" stroke="#7B61FF" strokeWidth="1.5"/>
            </svg>
            <b>Análisis con IA</b>
            <span>Recibe feedback automático y calificaciones</span>
          </div>
        </div>
        <div className="welcome-actions">
          <Link to="/login" className="btn-primary">
            <svg width="18" height="18" fill="none" style={{marginRight: 6, verticalAlign: "middle"}}>
              <path d="M2 9h14M9 2l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Iniciar Sesión
          </Link>
          <Link to="/register" className="btn-outline">Registrarse</Link>
        </div>
      </div>
    </div>
  );
}

