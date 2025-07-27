import React, { createContext, useState } from "react";

export const PracticeContext = createContext();

export const PracticeProvider = ({ children }) => {
  const [slides, setSlides] = useState([]);
  const [slideDurations, setSlideDurations] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  return (
    <PracticeContext.Provider value={{ slides, setSlides, slideDurations, setSlideDurations, analysis, setAnalysis, audioBlob, setAudioBlob }}>
      {children}
    </PracticeContext.Provider>
  );
};
