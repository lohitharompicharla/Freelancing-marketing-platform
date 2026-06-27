import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import OverviewPage from "./pages/OverviewPage";
import MarketplacePage from "./pages/MarketplacePage";
import DashboardPage from "./pages/DashboardPage";
import LearningPage from "./pages/LearningPage";
import InternshipsPage from "./pages/InternshipsPage";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import VerifyCertificatePage from "./pages/VerifyCertificatePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CertificationsPage from "./pages/CertificationsPage";
import CertificationDetailPage from "./pages/CertificationDetailPage";
import LearningListingPage from "./pages/LearningListingPage";
import LearningDetailPage from "./pages/LearningDetailPage";

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/internships" element={<InternshipsPage />} />
        {/* <Route path="/internships/:id" element={<InternshipDetailPage />} /> */}
        <Route path="/certifications" element={<CertificationsPage />} />
        <Route path="/certifications/:id" element={<CertificationDetailPage />} />
        <Route path="/learning" element={<LearningListingPage />} />
        <Route path="/learning/:id" element={<LearningDetailPage />} />
        {/* <Route path="/applications" element={<ApplicationsPage />} /> */}
        <Route path="/verify/:id" element={<VerifyCertificatePage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning"
          element={
            <ProtectedRoute>
              <LearningPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
