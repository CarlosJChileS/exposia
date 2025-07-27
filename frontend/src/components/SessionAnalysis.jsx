import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import AnalysisCompleted from "./AnalysisCompleted";

export default function SessionAnalysis() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const resp = await fetch(`${API_BASE}/practice/sessions/${sessionId}`);
        if (resp.ok) {
          const data = await resp.json();
          setAnalysis(data.session?.analysis || null);
        }
      } catch (err) {
        console.error("Failed to load session", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="history-bg" style={{padding:40}}>
        <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Volver</button>
        <h3>Cargando...</h3>
      </div>
    );
  }
  if (!analysis) {
    return (
      <div className="history-bg" style={{padding:40}}>
        <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Volver</button>
        <h3>Análisis no encontrado.</h3>
      </div>
    );
  }

  // Reuse AnalysisCompleted presentation component by temporarily
  // injecting analysis via context-like props.
  return (
    <>
      <button className="back-btn" onClick={() => navigate(-1)} style={{ margin: 20 }}>← Volver</button>
      <AnalysisCompleted externalAnalysis={analysis} />
    </>
  );
}
