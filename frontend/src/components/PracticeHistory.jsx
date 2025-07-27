import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import "./PracticeHistory.css";
import "./Dashboard.css";

export default function PracticeHistory() {
  const [practices, setPractices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAll() {
      try {
        const resp = await fetch(`${API_BASE}/practice/sessions?limit=100`);
        if (resp.ok) {
          const data = await resp.json();
          setPractices(data.sessions || []);
        }
      } catch (err) {
        console.error("Failed to load sessions", err);
      }
    }
    fetchAll();
  }, []);
  return (
    <div className="history-bg">
      <div className="history-container">
        <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Volver</button>
        <div className="slides-breadcrumb">
          <Link to="/dashboard">Dashboard</Link> <span className="arrow">›</span> Historial
        </div>
        <h1 className="history-title">Historial de Prácticas</h1>
        <div className="history-list">
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
            <div className="history-empty">No hay prácticas registradas.</div>
          )}
        </div>
      </div>
    </div>
  );
}
