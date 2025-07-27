import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PracticeContext } from "../PracticeContext";
import { API_BASE } from "../api";
import PDFUploader from "./PDFUploader";
import "./UploadPresentation.css";

const UploadPresentation = () => {
  const { setSlides, setSlideDurations } = useContext(PracticeContext);
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/presentations`)
      .then((r) => r.json())
      .then((d) => setRecent(d.presentations || []))
      .catch(() => {});
  }, []);

  const handleSlides = (slides) => {
    setSlides(slides);
    const durations = slides.map((s) => {
      const words = s.text ? s.text.trim().split(/\s+/).length : 0;
      return Math.max(5, Math.ceil(words / 2));
    });
    setSlideDurations(durations);
    navigate("/slides");
  };

  const processRecent = (id) => {
    fetch(`${API_BASE}/presentations/${id}/slides`)
      .then((r) => r.json())
      .then((d) => {
        const slides = d.slides || [];
        handleSlides(slides);
      })
      .catch(() => {});
  };

  const deleteRecent = (id) => {
    if (!window.confirm('¿Eliminar presentación?')) return;
    fetch(`${API_BASE}/presentations/${id}`, { method: 'DELETE' })
      .then(() => {
        setRecent((cur) => cur.filter((p) => p.id !== id));
      })
      .catch(() => {});
  };

  return (
    <div className="upload-bg">
      <div className="upload-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Dashboard</span> <span className="arrow">›</span> <b>Subir Presentación</b>
        </div>

        {/* Título */}
        <h1 className="upload-title">Subir Nueva Presentación</h1>
        <div className="upload-desc">
          Sube tu archivo PDF para generar slides automáticamente
        </div>

        {/* Zona de subida */}
        <div className="upload-card">
          <div className="drop-zone">
            <div className="drop-zone-inner">
              <PDFUploader onSlidesReady={handleSlides} />
            </div>
          </div>
          <div className="file-requirements">
            <div className="file-requirements-title">Requisitos del archivo:</div>
            <ul>
              <li>
                <span className="check-green">✔️</span> Formato: PDF únicamente
              </li>
              <li>
                <span className="check-green">✔️</span> Tamaño máximo: 10 MB
              </li>
              <li>
                <span className="check-green">✔️</span> Contenido: Texto legible
              </li>
            </ul>
          </div>
        </div>

        {/* Archivos recientes */}
        <div className="recent-files-box">
          <div className="recent-files-title">Archivos Recientes</div>
          {recent.length ? (
            recent.map((f) => (
              <div key={f.id} className="recent-file-card">
                <div className="file-info-row">
                  <div className="recent-file-icon">📄</div>
                  <div>
                    <div className="recent-file-name">{f.title}</div>
                    <div className="recent-file-meta">
                      {new Date(f.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button className="process-btn" onClick={() => processRecent(f.id)}>
                  ▶ Procesar
                </button>
                <button className="dots-btn" onClick={() => deleteRecent(f.id)}>⋯</button>
              </div>
            ))
          ) : (
            <div className="no-data">No hay archivos recientes.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPresentation;
