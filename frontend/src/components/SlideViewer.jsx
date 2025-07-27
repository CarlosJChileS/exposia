import React from "react";

function SlideViewer({ slides, current, onPrev, onNext }) {
  const slide = slides[current];
  return (
    <div className="card" style={{ textAlign: "center", background: "#ddeaff" }}>
      <img
        src={slide.image}
        alt={`Página ${slide.number}`}
        className="slide-img"
        style={{
          maxWidth: "90vw",
          maxHeight: "80vh",
          width: "100%",
          borderRadius: 10,
          margin: "auto",
          background: "#fff",
          boxShadow: "0 4px 14px #1114",
          marginBottom: 18,
          objectFit: "contain",
        }}
      />
      <div style={{ color: "#000", display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        <button onClick={onPrev} disabled={current === 0}>&lt; Anterior</button>
        <span style={{ fontSize: "1.13em", fontWeight: 600 }}>
          Página {slide.number} de {slides.length}
        </span>
        <button onClick={onNext} disabled={current === slides.length - 1}>Siguiente &gt;</button>
      </div>
    </div>
  );
}
export default SlideViewer;
