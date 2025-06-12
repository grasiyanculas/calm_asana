
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ToggleAuth from './components/ToggleAuth';
import UserQuestionnaire from './components/UserQuestionnaire';
import PoseSuggestions from './components/PoseSuggestions';
import PracticeGuide from './components/PracticeGuide';
import UserReport from './components/UserReport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<ToggleAuth />} />
        <Route path="/questionnaire" element={<UserQuestionnaire />} />
        <Route path="/poses" element={<PoseSuggestions />} />
        <Route path="/practice-guide" element={<PracticeGuide />} />
        <Route path="/report" element={<UserReport />} />
      </Routes>
    </Router>
  );
}

export default App;