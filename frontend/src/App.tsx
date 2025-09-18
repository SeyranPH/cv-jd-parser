import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import CvPage from "./pages/CvPage";
import JdPage from "./pages/JdPage";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/cv" element={<CvPage />} />
        <Route path="/jd" element={<JdPage />} />
        {/* default to CV */}
        <Route path="*" element={<Navigate to="/cv" />} />
      </Routes>
    </Router>
  );
}
