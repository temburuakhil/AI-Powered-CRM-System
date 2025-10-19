import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPortal from "./pages/AdminPortal";
import EGovernance from "./pages/EGovernance";
import Training from "./pages/Training";
import Schemes from "./pages/Schemes";
import Scholarships from "./pages/Scholarships";
import RegistrationDetails from "./pages/RegistrationDetails";
import Transcripts from "./pages/Transcripts";
import Feedback from "./pages/Feedback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminPortal />} />
        <Route path="/e-governance" element={<EGovernance />} />
        <Route path="/training" element={<Training />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/scholarships" element={<Scholarships />} />
        <Route path="/registration-details" element={<RegistrationDetails />} />
        <Route path="/scholarship-registration-details" element={<RegistrationDetails />} />
        <Route path="/transcripts" element={<Transcripts />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
