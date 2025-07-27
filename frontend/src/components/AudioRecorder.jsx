import React, { useRef, useState, useContext, useEffect } from "react";
import { PracticeContext } from "../PracticeContext";
import { API_BASE } from "../api";

const AudioRecorder = ({ onAnalysis, onRecordStart, onRecordStop }) => {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const { setAudioBlob, audioBlob } = useContext(PracticeContext);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    let id;
    if (isUploading) {
      setProgress(1);
      id = setInterval(() => {
        setProgress(p => (p < 99 ? p + 1 : p));
      }, 100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(id);
  }, [isUploading]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks.current = [];
      // Record using a lower bitrate to reduce file size
    mediaRecorderRef.current = new window.MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
      audioBitsPerSecond: 64000,
    });
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((track) => track.stop());
    };
    mediaRecorderRef.current.start();
    setRecording(true);
    onRecordStart && onRecordStart();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      onRecordStop && onRecordStop();
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "grabacion.webm");
    try {
      const resp = await fetch(`${API_BASE}/evaluation/analyze`, {
        method: "POST",
        body: formData,
      });
      const result = await resp.json();
      onAnalysis && onAnalysis(result);
    } catch (error) {
      alert("Error al subir el audio");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card" style={{ background: "#ddeaff" }}>
      <h2 style={{ color: "#000" }}>Grabar tu exposición</h2>
      <button onClick={recording ? stopRecording : startRecording} style={{ marginBottom: 10 }}>
        {recording ? "Detener grabación" : "Iniciar grabación"}
      </button>
      {audioUrl && (
        <div>
          <audio controls src={audioUrl} />
          <div style={{ marginTop: 10 }}>
            <button onClick={uploadAudio} disabled={isUploading}>
              {isUploading ? `Subiendo... ${progress}%` : "Subir y analizar"}
            </button>
            <button onClick={resetRecording} style={{ marginLeft: 10, background: "#b3c7ff" }}>
              Borrar audio
            </button>
            {isUploading && (
              <div style={{ marginTop: 6 }}>
                Espere unos minutos por favor, se está analizando...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
