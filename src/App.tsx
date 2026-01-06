import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionExpiryModal } from "@/components/modals/SessionExpiryModal";
import { ScrollToTop } from "@/components/ScrollToTop";

// Layout components
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Pages
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { BlogPage } from "@/pages/BlogPage";
import { SuccessStoriesPage } from "@/pages/SuccessStoriesPage";
import BrandingPage from "@/pages/BrandingPage";
import Pricing from "@/pages/Pricing";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/jobs/JobDetail";
import SchoolSignupPage from "@/pages/schools/SignupPage";
import { SchoolDashboardPage } from "@/pages/schools/DashboardPage";
import SchoolDashboard from "@/pages/schools/SchoolDashboard";

// Teacher pages
import { TeacherJobsPage } from "@/pages/teachers/JobsPage";
import { TeacherProfilePage } from "@/pages/teachers/ProfilePage";
import { TeacherPrivacyPage } from "@/pages/teachers/PrivacyPage";
import TeacherDashboard from "@/pages/teachers/DashboardPage";
import { ResourcesPage } from "@/pages/teachers/ResourcesPage";
import { CareerGuidancePage } from "@/pages/teachers/CareerGuidancePage";

// School pages
import { PostJobPage } from "@/pages/schools/PostJobPage";
import { BrowseTeachersPage } from "@/pages/schools/BrowseTeachersPage";
import { PremiumListingsPage } from "@/pages/schools/PremiumListingsPage";
import { AiMatchingPage } from "@/pages/schools/AiMatchingPage";
import { SchoolProfilePage } from "@/pages/schools/ProfilePage";
import { SubscriptionPage } from "@/pages/schools/SubscriptionPage";

// AI Services
import { AiServicesPage } from "@/pages/AiServicesPage";

// Legal pages
import { PrivacyPolicyPage } from "@/pages/legal/PrivacyPolicyPage";
import { TermsOfServicePage } from "@/pages/legal/TermsOfServicePage";
import { CookiePolicyPage } from "@/pages/legal/CookiePolicyPage";

// Auth pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignUpPage } from "@/pages/auth/SignUpPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";

// Error pages
import { NotFoundPage } from "@/pages/NotFoundPage";

// Messaging
import { MessagesPage } from "@/pages/MessagesPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.4,
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { showLogoutModal, setShowLogoutModal } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />

      {/* Session expiry modal */}
      <SessionExpiryModal />
    </div>
  );
};

function AppContent() {
  return (
    <AuthProvider>
      <Layout>
        <ScrollToTop />
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/branding" element={<BrandingPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/ai-services" element={<AiServicesPage />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
                      <Route path="/resources" element={<ResourcesPage />} />
          <Route
            path="/resources/career-guidance"
            element={<CareerGuidancePage />}
          />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/schools/signup" element={<SchoolSignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected School routes */}
          <Route
            path="/school/dashboard"
            element={
              <ProtectedRoute allowedUserTypes={["SCHOOL"]}>
                <SchoolDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schools/dashboard"
            element={
              <ProtectedRoute allowedUserTypes={["SCHOOL"]}>
                <SchoolDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schools/post-job"
            element={
              <ProtectedRoute allowedUserTypes={["SCHOOL"]}>
                <PostJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schools/browse-teachers"
            element={
              <ProtectedRoute allowedUserTypes={["SCHOOL"]}>
                <BrowseTeachersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schools/premium"
            element={
              <ProtectedRoute allowedUserTypes={["SCHOOL"]}>
                <PremiumListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schools/ai-matching"
            element={
              <ProtectedRoute allowedUserTypes={["SCHOOL"]}>
                <AiMatchingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schools/profile"
            element={
              <ProtectedRoute allowedUserTypes={["SCHOOL"]}>
                <SchoolProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schools/subscription"
            element={
              <ProtectedRoute allowedUserTypes={["SCHOOL"]}>
                <SubscriptionPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Teacher routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedUserTypes={["TEACHER"]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers/jobs"
            element={
              <ProtectedRoute allowedUserTypes={["TEACHER"]}>
                <TeacherJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers/profile"
            element={
              <ProtectedRoute allowedUserTypes={["TEACHER"]}>
                <TeacherProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers/dashboard"
            element={
              <ProtectedRoute allowedUserTypes={["TEACHER"]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers/privacy"
            element={
              <ProtectedRoute allowedUserTypes={["TEACHER"]}>
                <TeacherPrivacyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers/messages"
            element={
              <ProtectedRoute allowedUserTypes={["TEACHER"]}>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers/resources"
            element={
              <ProtectedRoute allowedUserTypes={["TEACHER"]}>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers/career-guidance"
            element={
              <ProtectedRoute allowedUserTypes={["TEACHER"]}>
                <CareerGuidancePage />
              </ProtectedRoute>
            }
          />

          {/* Messages route - redirects based on user type */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute allowedUserTypes={["SCHOOL", "TEACHER"]}>
                <MessagesPage />
              </ProtectedRoute>
            }
          />

          {/* Legal routes */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />

      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#363636",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            padding: "16px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
