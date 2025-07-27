import React, { useContext, useEffect, useState } from "react";
import { PracticeContext } from "../PracticeContext";
import { API_BASE } from "../api";
import jsPDF from "jspdf";

export default function AnalysisCompleted({ externalAnalysis = null }) {
  const { analysis, setAnalysis, audioBlob } = useContext(PracticeContext);
  const [loading, setLoading] = useState(false);
  const mergedAnalysis = externalAnalysis || analysis;

  useEffect(() => {
    async function fetchAnalysis() {
      if (!externalAnalysis && !analysis && audioBlob) {
        setLoading(true);
        const formData = new FormData();
        formData.append("audio", audioBlob, "grabacion.webm");
        try {
          const resp = await fetch(`${API_BASE}/evaluation/analyze`, {
            method: "POST",
            body: formData,
          });
          const result = await resp.json();
          setAnalysis(result);
        } catch (err) {
          console.error("Error analizando audio", err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchAnalysis();
  }, [externalAnalysis, analysis, audioBlob, setAnalysis]);

  // TODO: persist analysis results to the backend when available

  const handleNewPractice = async () => {
    if (audioBlob && mergedAnalysis) {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'grabacion.webm');
      const analysisBlob = new Blob([JSON.stringify(mergedAnalysis)], { type: 'application/json' });
      formData.append('analysis', analysisBlob, 'analysis.json');
      try {
        await fetch(`${API_BASE}/practice/save-session`, {
          method: 'POST',
          body: formData,
        });
      } catch (err) {
        console.error('Error saving session', err);
      }
    }
    window.location.href = '/dashboard';
  };

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte de Análisis", 10, 10);
    doc.setFontSize(12);
    const jsonString = JSON.stringify(mergedAnalysis, null, 2);
    const lines = doc.splitTextToSize(jsonString, 180);
    doc.text(lines, 10, 20);
    doc.save("analysis_report.pdf");
  };

  if (loading || (!mergedAnalysis && audioBlob && !externalAnalysis)) {
    return (
      <div className="ac2-bg" style={{ padding: 40, color: '#fff' }}>
        <h3>Cargando análisis...</h3>
      </div>
    );
  }

  if (!mergedAnalysis) {
    return (
      <div className="ac2-bg" style={{ padding: 40 }}>
        <h3>No hay análisis disponible.</h3>
      </div>
    );
  }
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const clarityValue = Math.min(10, Math.max(1, Math.round(mergedAnalysis.clarity)));
  const score = (() => {
    const clarity = clamp((clarityValue - 7) / 3, 0, 1);
    const speed = 1 - clamp(Math.abs(mergedAnalysis.speed_wpm - 130) / 40, 0, 1);
    const pauses = 1 - clamp(Math.abs(mergedAnalysis.pauses - 4) / 4, 0, 1);
    return Math.round(((clarity + speed + pauses) / 3) * 100) / 10;
  })();
  const scoreLabel = score >= 8 ? "Excelente" : score >= 6 ? "Bueno" : "Regular";

  const ideal = {
    clarity: { min: 7.0, max: 10.0 },
    speed_wpm: { min: 110, max: 150 },
    pauses: { min: 2, max: 6 },
    volume: { min: 4, max: 7 },
    mean_pitch: { min: 140, max: 210 },
  };

  const recommendations = [];
  if (mergedAnalysis.speed_wpm < ideal.speed_wpm.min || mergedAnalysis.speed_wpm > ideal.speed_wpm.max) {
    recommendations.push({ type: "warning", text: "Velocidad: ajusta tu ritmo para mejorar la comprensión" });
  }
  if (clarityValue >= ideal.clarity.min && clarityValue <= ideal.clarity.max) {
    recommendations.push({ type: "good", text: "Claridad: excelente pronunciación" });
  }
  if (mergedAnalysis.pauses < ideal.pauses.min || mergedAnalysis.pauses > ideal.pauses.max) {
    recommendations.push({ type: "info", text: "Pausas: usa pausas estratégicas para enfatizar" });
  }
  if (mergedAnalysis.volume < ideal.volume.min || mergedAnalysis.volume > ideal.volume.max) {
    recommendations.push({ type: "warning", text: "Volumen: ajusta la proyección de tu voz" });
  }
  if (mergedAnalysis.mean_pitch && (mergedAnalysis.mean_pitch < ideal.mean_pitch.min || mergedAnalysis.mean_pitch > ideal.mean_pitch.max)) {
    recommendations.push({ type: "info", text: "Pitch: procura mantener una entonación agradable" });
  }

  const durationMin = (mergedAnalysis.duration_sec / 60).toFixed(2);

  return (
    <>
      <style>{`
      body, html, #root {
        background: #ddeaff;
        font-family: 'Inter', Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .analysis-container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: flex-start;
        width: 100vw;
        padding: 36px 0 0 0;
        gap: 32px;
      }
      .left-panel {
        flex: 2;
        min-width: 500px;
        margin-right: 16px;
      }
      .right-panel {
        flex: 1;
        min-width: 320px;
        max-width: 350px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .breadcrumbs {
        color: #a6b0c3;
        font-size: 14px;
        margin-bottom: 8px;
      }
      .main-title {
        font-size: 27px;
        font-weight: 700;
        color: #222941;
        margin-bottom: 2px;
      }
      .subtitle {
        font-size: 15px;
        color: #6d7a90;
        margin-bottom: 18px;
      }
      .card {
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 3px 18px 0 rgba(60,72,100,0.06);
        padding: 26px 30px 30px 30px;
        margin-bottom: 22px;
      }
      .score-row {
        display: flex;
        align-items: flex-end;
        gap: 22px;
      }
      .score-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #5f6bfa 75%, #7aeae1 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: #fff;
        font-weight: 700;
        font-size: 32px;
        margin-bottom: 2px;
        position: relative;
      }
      .score-label {
        font-size: 15px;
        font-weight: 600;
        color: #1fc47c;
        margin-top: 4px;
      }
      .score-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-left: 5px;
        font-size: 16px;
      }
      .score-detail-label {
        color: #8ca1c5;
        font-size: 14px;
        margin-right: 8px;
      }
      .score-value-green { color: #16c487; font-weight: 700;}
      .score-value-orange { color: #f59e44; font-weight: 700;}
      .score-value-blue { color: #4a6cf7; font-weight: 700;}
      .score-value-black { color: #23283c; font-weight: 700;}
      .score-value-gray { color: #92a6bc; font-weight: 700;}
      .score-value-red { color: #ff4747; font-weight: 700;}
      .score-value { margin-left: 3px; }
      .slide-detail-title {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 10px;
        color: #26315b;
      }
      .slide-details-list {
        margin-top: 10px;
        margin-bottom: 0;
        padding: 0;
        list-style: none;
      }
      .slide-detail {
        border-bottom: 1px solid #e6ecf8;
        padding: 8px 0;
        display: flex;
        flex-direction: column;
      }
      .slide-detail:last-child {
        border-bottom: none;
      }
      .slide-header-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 2px;
      }
      .slide-name {
        font-weight: 600;
        font-size: 14px;
        color: #1a2446;
      }
      .slide-times {
        font-size: 12px;
        color: #96aac9;
        font-weight: 500;
      }
      .slide-metrics-row {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        margin-bottom: 2px;
      }
      .slide-clarity { color: #17bc7b; font-weight: 700;}
      .slide-velocity { color: #2d80f7; font-weight: 700;}
      .slide-velocity-warning { color: #ff9900; font-weight: 700;}
      .slide-comment {
        color: #6e7e9b;
        font-size: 14px;
        margin-bottom: 0;
      }
      .slide-fail {
        color: #e55353;
        margin-left: 6px;
      }
      .side-card {
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 3px 16px 0 rgba(60,72,100,0.07);
        padding: 19px 18px 15px 18px;
        margin-bottom: 4px;
      }
      .sidebar-title {
        font-size: 16px;
        font-weight: 700;
        color: #3a415c;
        margin-bottom: 13px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .ai-recommendation {
        font-size: 15px;
        padding: 8px 13px 7px 13px;
        border-radius: 10px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 9px;
      }
      .ai-recommendation.warning {
        background: #fff2e0;
        color: #ea9437;
        border-left: 4px solid #ffaf45;
      }
      .ai-recommendation.good {
        background: #ebfbee;
        color: #18b77e;
        border-left: 4px solid #32e099;
      }
      .ai-recommendation.info {
        background: #edf0ff;
        color: #5264e5;
        border-left: 4px solid #92a6fb;
      }
      .sidebar-graph-card {
        background: #f7fafd;
        border: 1.2px dashed #dde5f1;
        color: #bac6dc;
        border-radius: 13px;
        min-height: 85px;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 18px;
        margin-top: 3px;
      }
      .sidebar-compare {
        background: #f7fafd;
        border-radius: 13px;
        padding: 17px 15px 13px 15px;
        font-size: 15px;
        color: #6e7e9b;
        margin-bottom: 12px;
      }
      .compare-list {
        list-style: none;
        padding-left: 0;
        margin-bottom: 10px;
      }
      .compare-ideal-label {
        font-size: 14px;
        color: #8ba6d6;
      }
      .compare-ideal-green { color: #16c487; }
      .compare-ideal-blue { color: #4a6cf7; }
      .compare-ideal-orange { color: #f59e44; }
      .your-result {
        font-size: 15px;
        margin-bottom: 0;
        background: #eef2fe;
        border-radius: 7px;
        padding: 8px 9px;
        color: #495bb2;
        margin-top: 8px;
      }
      .actions-row {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }
      .btn-export {
        flex: 1;
        background: #eef2fe;
        color: #6272c4;
        font-size: 16px;
        font-weight: 600;
        padding: 11px 0;
        border: none;
        border-radius: 9px;
        cursor: pointer;
        transition: background .17s;
        margin-bottom: 0;
      }
      .btn-export:hover {
        background: #d3e0ff;
      }
      .btn-new {
        flex: 1;
        background: #686ef7;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        padding: 11px 0;
        border: none;
        border-radius: 9px;
        cursor: pointer;
        margin-bottom: 0;
        transition: background .17s;
      }
      .btn-new:hover {
        background: #4456db;
      }
      @media (max-width: 1100px) {
        .analysis-container {
          flex-direction: column;
          align-items: stretch;
        }
        .left-panel, .right-panel {
          margin: 0;
          max-width: 100vw;
        }
      }
      `}</style>

      <button className="back-btn" onClick={() => window.history.back()} style={{ margin: '20px' }}>← Volver</button>

      <div className="analysis-container">
        <div className="left-panel">
          <div className="breadcrumbs">Dashboard &gt; Análisis de IA</div>
          <div className="main-title">Análisis Completado</div>
          <div className="subtitle">Duración: {durationMin} min</div>
          <div className="card">
            <div className="score-row">
              <div style={{textAlign:'center'}}>
                <div className="score-circle">
                  {score}
                  <div className="score-label">{scoreLabel}</div>
                </div>
              </div>
              <div className="score-details">
                <div>
                  <span className="score-detail-label">Claridad:</span>
                  <span className="score-value score-value-green">{clarityValue}</span>
                  <span className="score-value score-value-gray">/10</span>
                </div>
                <div>
                  <span className="score-detail-label">Velocidad:</span>
                  <span className="score-value score-value-orange">{mergedAnalysis.speed_wpm}</span>
                  <span className="score-value score-value-gray">ppm</span>
                </div>
                <div>
                  <span className="score-detail-label">Pausas:</span>
                  <span className="score-value score-value-green">{mergedAnalysis.pauses}</span>
                  <span className="score-value score-value-gray">pausas</span>
                </div>
                <div>
                  <span className="score-detail-label">Volumen:</span>
                  <span className="score-value score-value-blue">{mergedAnalysis.volume}</span>
                  <span className="score-value score-value-gray">/10</span>
                </div>
                <div>
                  <span className="score-detail-label">Pitch medio:</span>
                  <span className="score-value score-value-blue">{mergedAnalysis.mean_pitch ? mergedAnalysis.mean_pitch.toFixed(1) : '-'}</span>
                  <span className="score-value score-value-gray">Hz</span>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="slide-detail-title">Transcripción</div>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 15 }}>{mergedAnalysis.transcript}</div>
          </div>
          {mergedAnalysis.slide_details && (
            <div className="card">
              <div className="slide-detail-title">Análisis por Slide</div>
              <ul className="slide-details-list">
                {mergedAnalysis.slide_details.map((s) => (
                  <li key={s.slide_number} className="slide-detail">
                    <div className="slide-header-row">
                      <span className="slide-name">Slide {s.slide_number}</span>
                      <span className="slide-times">{s.duration_sec}s</span>
                    </div>
                    <div className="slide-metrics-row">
                      <span className="slide-clarity">{s.clarity}/10</span>
                      <span className="slide-velocity">{s.speed_wpm}ppm</span>
                      <span className="slide-velocity-warning">{s.pauses} pausas</span>
                      {s.fail && (
                        <span className="slide-fail" title="Falla detectada">⚠</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {mergedAnalysis.fail_slides && mergedAnalysis.fail_slides.length > 0 && (
            <div className="card">
              <div className="slide-detail-title">Slides con fallas</div>
              <div>{mergedAnalysis.fail_slides.join(', ')}</div>
            </div>
          )}
        </div>
        <div className="right-panel">
          <div className="side-card">
            <div className="sidebar-title">🧠 Recomendaciones de IA</div>
            {recommendations.map((r,i) => (
              <div key={i} className={`ai-recommendation ${r.type}`}>{r.text}</div>
            ))}
          </div>
          <div className="side-card sidebar-compare">
            <ul className="compare-list">
              <li>
                <span className="compare-ideal-label">Claridad ideal:</span>{' '}
                <span className="compare-ideal-green">{ideal.clarity.min} - {ideal.clarity.max}</span>
              </li>
              <li>
                <span className="compare-ideal-label">Velocidad ideal:</span>{' '}
                <span className="compare-ideal-orange">{ideal.speed_wpm.min} - {ideal.speed_wpm.max} ppm</span>
              </li>
          <li>
            <span className="compare-ideal-label">Pausas ideales:</span>{' '}
            <span className="compare-ideal-blue">{ideal.pauses.min} - {ideal.pauses.max} pausas</span>
          </li>
          <li>
            <span className="compare-ideal-label">Volumen ideal:</span>{' '}
            <span className="compare-ideal-blue">{ideal.volume.min} - {ideal.volume.max}/10</span>
          </li>
          <li>
            <span className="compare-ideal-label">Pitch ideal:</span>{' '}
            <span className="compare-ideal-blue">{ideal.mean_pitch.min} - {ideal.mean_pitch.max} Hz</span>
          </li>
        </ul>
        <div className="your-result">
         <div><b>Tus Resultados:</b></div>
         <div>• Claridad: {clarityValue}</div>
         <div>• Velocidad: {mergedAnalysis.speed_wpm} ppm</div>
         <div>• Pausas: {mergedAnalysis.pauses}</div>
          <div>• Volumen: {mergedAnalysis.volume}/10</div>
         <div>• Pitch: {mergedAnalysis.mean_pitch ? mergedAnalysis.mean_pitch.toFixed(1) : '-'} Hz</div>
        </div>
      </div>
          <div className="actions-row">
            <button className="btn-export" onClick={handleExport}>Exportar Reporte</button>
            {!externalAnalysis && (
              <button className="btn-new" onClick={handleNewPractice}>Nueva Práctica</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
