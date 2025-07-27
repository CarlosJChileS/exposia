import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import "./Dashboard.css";

const Dashboard = () => {
  // Cargar el usuario almacenado tras iniciar sesión
  const stored = localStorage.getItem('user');
  const email = stored ? JSON.parse(stored).email : 'invitado@exposia.com';
  const avatar = email ? email.charAt(0).toUpperCase() : 'U';

  const [presentations, setPresentations] = useState([]);
  const [practices, setPractices] = useState([]);
  const [stats, setStats] = useState({ total: 0, avg: 0, best: 0 });
  const [coverImage, setCoverImage] = useState(null);
  const current = presentations[0] || null;
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const presResp = await fetch(`${API_BASE}/presentations`);
        if (presResp.ok) {
          const data = await presResp.json();
          setPresentations(data.presentations || []);
        }
        const pracResp = await fetch(`${API_BASE}/practice/sessions?limit=3`);
        if (pracResp.ok) {
          const data = await pracResp.json();
          const scores = [];
          const sessions = (data.sessions || []).map((s) => {
            const a = s.analysis || {};
            const clarity = Math.min(10, Math.max(1, Math.round(a.clarity || 0)));
            const clamp = (v, mi, ma) => Math.min(Math.max(v, mi), ma);
            const score = (() => {
              const c = clamp((clarity - 7) / 3, 0, 1);
              const sp = 1 - clamp(Math.abs((a.speed_wpm || 0) - 130) / 40, 0, 1);
              const pa = 1 - clamp(Math.abs((a.pauses || 0) - 4) / 4, 0, 1);
              return Math.round(((c + sp + pa) / 3) * 100) / 10;
            })();
            scores.push(score);
            return { ...s, score };
          });
          setPractices(sessions);
          if (sessions.length) {
            const total = sessions.length;
            const avg = scores.reduce((a, b) => a + b, 0) / total;
            const best = Math.max(...scores);
            setStats({ total, avg: Math.round(avg * 10) / 10, best });
          }
        }
      } catch (err) {
        // ignore errors
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function loadCover() {
      if (!current) {
        setCoverImage(null);
        return;
      }
      if (current.cover_url) {
        setCoverImage(current.cover_url);
        return;
      }
      try {
        const resp = await fetch(`${API_BASE}/presentations/${current.id}/slides`);
        if (resp.ok) {
          const data = await resp.json();
          const first = data.slides && data.slides[0];
          if (first && first.image) {
            setCoverImage(first.image);
          }
        }
      } catch (err) {
        // ignore errors
      }
    }
    loadCover();
  }, [current]);

  return (
    <div className="dashboard-bg">
      <div className="dashboard">
        <button className="back-btn" onClick={() => navigate(-1)} style={{ margin: '16px' }}>← Volver</button>
        {/* Header */}
        <header className="dashboard-header">
          <div className="logo">
            <span className="logo-icon">🎤</span>
            <div>
              <div className="logo-title">ExposIA</div>
              <div className="logo-desc">Sistema de Oratoria con IA</div>
            </div>
          </div>
          <div className="user-info">
            <div className="user-avatar">{avatar}</div>
            <div>
              <div className="user-name">{email.split('@')[0]}</div>
              <div className="user-email">{email}</div>
            </div>
            <button className="settings-btn">⚙️</button>
          </div>
        </header>

        <main className="dashboard-main">
          {/* Inicio Rápido */}
          <section className="quick-start">
            <div className="quick-title">Inicio Rápido</div>
            <ol className="quick-steps">
              <li className="active">
                <span>1</span> Subir PDF <small>Carga tu presentación</small>
              </li>
              <li>
                <span>2</span> Ver Slides <small>Revisa las páginas generadas</small>
              </li>
              <li>
                <span>3</span> Practicar <small>Graba tu presentación</small>
              </li>
              <li>
                <span>4</span> Recibir Feedback <small>Análisis automático con IA</small>
              </li>
            </ol>
            <Link to="/upload" className="primary-btn">Subir Nueva Presentación</Link>
          </section>

          {/* Presentación Actual */}
          <section className="current-presentation">
            <div className="presentation-title">Presentación Actual</div>
            {current ? (
              <div className="presentation-box">
                <div className="presentation-header">
                  <div className="file-icon">📄</div>
                  <div>
                    <div className="file-title">{current.title}</div>
                    <div className="file-tags">
                      <span className="processed">Procesado</span>
                    </div>
                  </div>
                </div>
                {coverImage ? (
                  <img src={coverImage} alt="Portada" className="cover-image" />
                ) : null}
              </div>
            ) : (
              <div className="no-data">No hay presentaciones cargadas.</div>
            )}
          </section>

          {/* Archivos Recientes */}
          <section className="recent-files">
            <div className="recent-title">Archivos Recientes</div>
            {presentations.length ? (
              presentations.map((p, idx) => (
                <div key={idx} className="file-card">
                  <div className="file-icon-sm">📄</div>
                  <div>
                    <div className="file-name">{p.title}</div>
                    <div className="file-meta">
                      {new Date(p.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No hay archivos recientes.</div>
            )}
          </section>

          {/* Últimas Prácticas */}
          <section className="latest-practices">
            <div className="latest-title">Últimas Prácticas</div>
              {practices.length ? (
                practices.map((p, idx) => (
                  <Link key={p.id} to={`/analysis/${p.id}`} className="practice-card green">
                    <span className="score">{p.score}</span>
                    <div>
                      <div className="practice-name">Práctica {idx + 1}</div>
                      <div className="practice-time">
                        {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="no-data">No hay prácticas registradas.</div>
              )}
              {practices.length ? (
              <Link to="/history" className="history-btn">Ver todo el historial →</Link>
            ) : null}
          </section>

          {/* Estadísticas Rápidas */}
          <section className="quick-stats">
            <div className="stats-title">Estadísticas Rápidas</div>
            <div className="stats-list">
              <div>
                <span className="stat-label">Prácticas totales:</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div>
                <span className="stat-label">Promedio general:</span>
                <span className="stat-value green">{stats.avg}/10</span>
              </div>
              <div>
                <span className="stat-label">Mejor puntuación:</span>
                <span className="stat-value orange">{stats.best}/10</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
