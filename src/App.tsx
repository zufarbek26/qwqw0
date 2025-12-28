import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Subjects from "./pages/Subjects";
import Subject from "./pages/Subject";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import MyResults from "./pages/MyResults";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import DailyChallenge from "./pages/DailyChallenge";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/subject/:subjectId" element={<Subject />} />
                <Route path="/quiz/:testId" element={<Quiz />} />
                <Route path="/result/:resultId" element={<Result />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/my-results" element={<MyResults />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/daily-challenge" element={<DailyChallenge />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
