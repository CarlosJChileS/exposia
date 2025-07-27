import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PracticeProvider } from "./PracticeContext";
import PracticeModule from "./components/PracticeModule";
import WelcomePage from "./components/WelcomePage";
import LoginExposIA from "./components/LoginExposIA";
import RegisterPage from "./components/RegisterPage";
import Dashboard from "./components/Dashboard";
import UploadPresentation from "./components/UploadPresentation";
import SlidesGenerated from "./components/SlidesGenerated";
import SlidesPreview from "./components/SlidesPreview";
import AnalysisCompleted from "./components/AnalysisCompleted";
import SessionAnalysis from "./components/SessionAnalysis";
import PracticeHistory from "./components/PracticeHistory";
import "./index.css";

function App() {
  return (
    <PracticeProvider>
      <Router>
        <div style={{ background: "#ddeaff", minHeight: "100vh" }}>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginExposIA />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPresentation />} />
            <Route path="/slides" element={<SlidesGenerated />} />
            <Route path="/slides/preview" element={<SlidesPreview />} />
            <Route path="/practice-module" element={<PracticeModule />} />
            <Route path="/analysis-completed" element={<AnalysisCompleted />} />
            <Route path="/analysis/:sessionId" element={<SessionAnalysis />} />
            <Route path="/history" element={<PracticeHistory />} />
          </Routes>
        </div>
      </Router>
    </PracticeProvider>
  );
}

export default App;
