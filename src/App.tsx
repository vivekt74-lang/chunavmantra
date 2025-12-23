// src/App.tsx - UPDATED
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ConstituencyPage from "./pages/ConstituencyPage";
import NotFound from "./pages/NotFound";
import BoothDetailsPage from './pages/BoothDetailsPage';
import BoothAnalysisPage from "./pages/BoothAnalysisPage";
import StatePage from "./pages/StatePages"; // You'll need to create this
import BoothComparisonPage from "@/pages/BoothComparisonPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/constituency/:id" element={<ConstituencyPage />} />
            <Route path="/states" element={<DashboardPage />} />
            <Route path="/state/:id" element={<StatePage />} /> {/* Add state route */}
            <Route path="/about" element={<HomePage />} />
            <Route path="/booth/:id" element={<BoothDetailsPage />} />
            <Route path="/constituency/:id/booth-analysis" element={<BoothAnalysisPage />} />
            <Route path="/constituency/:id/compare-booths" element={<BoothComparisonPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;