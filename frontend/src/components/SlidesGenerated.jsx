import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PracticeContext } from "../PracticeContext";
import "./SlidesGenerated.css";

const SlidesGenerated = () => {
  const { slides, slideDurations } = useContext(PracticeContext);
  const navigate = useNavigate();
  const totalTime = slideDurations.reduce((a, b) => a + b, 0);

  if (!slides.length) {
    return (
      <div className="slides-bg" style={{ color: '#333', padding: 40 }}>
        No hay slides cargados.
      </div>
    );
  }

  return (
    <div className="slides-bg">
      <div className="slides-container">
        {/* Header */}
        <div className="slides-header">
          <button className="back-btn" onClick={() => navigate(-1)}>← Volver</button>
          <div>
            <h1 className="slides-title">Slides Generados</h1>
            <div className="slides-sub">
              ia.pdf • 8 páginas convertidas a slides
            </div>
          </div>
          <div className="slides-actions">
            <Link to="/slides/preview" className="preview-btn">
              <span role="img" aria-label="ojo">👁️</span> Vista Previa
            </Link>
            <Link to="/practice-module" className="start-btn">
              <span role="img" aria-label="play">▶</span> Iniciar Práctica
            </Link>
          </div>
        </div>

        <div className="slides-content">
          {/* Slides */}
          <section className="slides-main">
            <div className="slides-main-header">
              <span>Slides de la Presentación</span>
              <button className="grid-btn">
                <span role="img" aria-label="grid">🔲</span>
              </button>
            </div>
            <div className="slides-list">
              {slides.map((slide, i) => (
                <div className="slide-card" key={i}>
                  <img src={slide.image} alt={`slide ${i+1}`} style={{ width: '100%' }} />
                  <div className="slide-footer">
                    <span className="slide-num">Slide {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Panel lateral */}
          <aside className="slides-sidebar">
            <div className="info-panel">
              <div className="info-title">Información de la Presentación</div>
              <div className="info-row">
                <span className="info-label">Slides cargados:</span>
                <span className="info-value">{slides.length}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Tiempo total:</span>
                <span className="info-value">{totalTime} s</span>
              </div>
            </div>

            <div className="practice-config">
              <div className="config-title">Configuración de Práctica</div>
              <div className="config-row config-row-flex">
                <label>Avance automático</label>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
              <Link to="/practice-module" className="big-practice-btn">
                <span role="img" aria-label="play">▶</span> Comenzar Práctica
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SlidesGenerated;
