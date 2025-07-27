import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PracticeContext } from "../PracticeContext";
import SlideViewer from "./SlideViewer";
import AudioRecorder from "./AudioRecorder";
import "./PracticeModule.css";

export default function PracticeModule() {
  const { slides, setAnalysis } = useContext(PracticeContext);
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [time, setTime] = useState(0);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    let id;
    if (recording) {
      id = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(id);
  }, [recording]);

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => setCurrent(c => Math.min(slides.length - 1, c + 1));

  const formatTime = (t) => {
    const m = String(Math.floor(t / 60)).padStart(2, "0");
    const s = String(t % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnalysis = (result) => {
    setAnalysis(result);
    navigate("/analysis-completed");
  };

  if (!slides.length) {
    return (
      <div className="practice-bg" style={{ color: "#333", padding: 40 }}>
        No hay slides cargados.
      </div>
    );
  }

  return (
    <div className="practice-bg">
      <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>
        ← Volver
      </button>
      <div className="practice-header">
        <h2>Práctica en curso</h2>
        <div className="practice-info">
          <div>
            Página {current + 1} de {slides.length}
          </div>
          <div className="timer">{formatTime(time)}</div>
        </div>
      </div>

      <div className="recorder-container">
        <AudioRecorder
          onAnalysis={handleAnalysis}
          onRecordStart={() => setRecording(true)}
          onRecordStop={() => setRecording(false)}
        />
      </div>

      <SlideViewer slides={slides} current={current} onPrev={prev} onNext={next} />
    </div>
  );
}
