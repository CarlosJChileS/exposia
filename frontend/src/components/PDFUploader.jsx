import React from "react";
import { API_BASE } from "../api";

function PDFUploader({ onSlidesReady }) {
  const fileInputRef = React.useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    const resp = await fetch(`${API_BASE}/presentations/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await resp.json();

    const presentation = {
      name: file.name,
      size: file.size,
      pages: data.slides ? data.slides.length : 0,
      uploadedAt: Date.now(),
    };
    // TODO: send "presentation" to the backend once persistence is implemented

    onSlidesReady(data.slides || []);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        className="examine-btn"
        style={{ margin: "auto" }}
      >
        Seleccionar archivo PDF
      </button>
      <div style={{ color: "#aaa", marginTop: 8 }}>Sube tu PDF de la presentación</div>
    </div>
  );
}

export default PDFUploader;
