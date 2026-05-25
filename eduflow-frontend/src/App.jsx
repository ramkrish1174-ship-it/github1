import { BrowserRouter, Routes, Route } from "react-router-dom";

/* NORMAL IMPORTS */
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Profile from "./pages/Profile";
import CourseBuilder from "./pages/CourseBuilder";
import CoursePlayer from "./pages/CoursePlayer";
import QuizResults from "./pages/QuizResults";
import Certificates from "./pages/Certificates";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentHistory from "./pages/PaymentHistory";
import Subscriptions from "./pages/Subscriptions";
import Notifications from "./pages/Notifications";
import ForumPage from "./pages/ForumPage";
import Wishlist from "./pages/Wishlist";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import SubscriptionSuccess from "./pages/SubscriptionSuccess";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/builder/:courseId" element={<CourseBuilder />} />
        <Route path="/course/:id" element={<CoursePlayer />} />
        <Route path="/quiz-results" element={<QuizResults />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/payments" element={<PaymentHistory />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/forum/:courseId" element={<ForumPage />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/subscription-success" element={<SubscriptionSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
