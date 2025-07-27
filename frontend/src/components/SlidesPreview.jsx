import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PracticeContext } from "../PracticeContext";
import SlideViewer from "./SlideViewer";
import "./SlidesGenerated.css";

export default function SlidesPreview() {
  const { slides } = useContext(PracticeContext);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  if (!slides.length) {
    return (
      <div className="preview-bg" style={{ padding: 40, color: '#000' }}>
        No hay slides cargados.
      </div>
    );
  }

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => setCurrent(c => Math.min(slides.length - 1, c + 1));

  return (
    <div className="preview-bg">
      <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Volver
      </button>
      <SlideViewer slides={slides} current={current} onPrev={prev} onNext={next} />
    </div>
  );
}
