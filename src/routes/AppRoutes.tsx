import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import DiscoveryChatPage from "../components/chat/DiscoveryChat";

// Lazy-loaded modules (helps performance)
const Home = lazy(() => import("../Home"));
const Explore = lazy(() => import("../modules/explore/Explore"));
const Deploy = lazy(() => import("../modules/deploy/Deploy"));
const IAM = lazy(() => import("../modules/iam/IAM"));
const COM = lazy(() => import("../modules/com/COM"));
const RM = lazy(() => import("../modules/rm/RM"));
const Logs = lazy(() => import("../modules/logs/Logs"));
const CI = lazy(() => import("../modules/ci/CI"));
const Admin = lazy(() => import("../modules/admin/Admin"));
const Studio = lazy(() => import("../modules/studio/Studio"));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/discovery" element={<DiscoveryChatPage />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/deploy" element={<Deploy />} />
      <Route path="/iam" element={<IAM />} />
      <Route path="/com" element={<COM />} />
      <Route path="/rm" element={<RM />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/ci" element={<CI />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/studio" element={<Studio />} />

      {/* Default route */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
