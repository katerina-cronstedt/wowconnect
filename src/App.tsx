import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import PublicLayout from "./components/PublicLayout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CityPage from "./pages/CityPage";
import OneGoalPage from "./pages/OneGoalPage";
import OneGoalCandidatesPage from "./pages/OneGoalCandidatesPage";
import OneGoalMentorsPage from "./pages/OneGoalMentorsPage";
import EngagePage from "./pages/EngagePage";
import GalaPage from "./pages/GalaPage";
import JoinPage from "./pages/JoinPage";
import ContactPage from "./pages/ContactPage";
import RsvpPage from "./pages/RsvpPage";
import NotFound from "./pages/NotFound";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import MembersPage from "./pages/admin/MembersPage";
import MemberProfilePage from "./pages/admin/MemberProfilePage";
import EventsPage from "./pages/admin/EventsPage";
import EventDetailPage from "./pages/admin/EventDetailPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsPage from "./pages/admin/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/om-oss" element={<AboutPage />} />
              <Route path="/stader/:slug" element={<CityPage />} />
              <Route path="/onegoal" element={<OneGoalPage />} />
              <Route path="/onegoal/kandidater" element={<OneGoalCandidatesPage />} />
              <Route path="/onegoal/mentorer" element={<OneGoalMentorsPage />} />
              <Route path="/engagera-dig" element={<EngagePage />} />
              <Route path="/wow-galan" element={<GalaPage />} />
              <Route path="/join" element={<JoinPage />} />
              <Route path="/kontakt" element={<ContactPage />} />
            </Route>

            {/* RSVP (public, no layout) */}
            <Route path="/rsvp/:eventId/:token" element={<RsvpPage />} />

            {/* Admin CRM */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="members/:id" element={<MemberProfilePage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="events/:id" element={<EventDetailPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
