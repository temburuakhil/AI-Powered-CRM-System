import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import LandingPage from "./pages/LandingPage";
import AdminPortal from "./pages/AdminPortal";
import ManagerDashboard from "./pages/ManagerDashboard";
import EGovernance from "./pages/EGovernance";
import Training from "./pages/Training";
import Schemes from "./pages/Schemes";
import Scholarships from "./pages/Scholarships";
import RegistrationDetails from "./pages/RegistrationDetails";
import Transcripts from "./pages/Transcripts";
import Feedback from "./pages/Feedback";
import CreateManager from "./pages/CreateManager";
import ManagerDetail from "./pages/ManagerDetail";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import AgentDashboard from "./pages/AgentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/e-governance" element={<EGovernance />} />
        <Route path="/training" element={<Training />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/scholarships" element={<Scholarships />} />
        <Route path="/registration-details" element={<RegistrationDetails />} />
        <Route path="/scholarship-registration-details" element={<RegistrationDetails />} />
        <Route path="/transcripts" element={<Transcripts />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/create-manager" element={<CreateManager />} />
        <Route path="/manager/:managerId" element={<ManagerDetail />} />
        <Route path="/manager/:managerId/create-project" element={<CreateProject />} />
        <Route path="/manager/:managerId/project/:projectId" element={<ProjectDetail />} />
        <Route path="/agent-dashboard" element={<AgentDashboard />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

