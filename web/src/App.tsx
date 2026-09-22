import { Suspense, lazy, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import { SignInSheet } from "./features/auth/SignInSheet";
import { completeEmailLinkSignInIfPresent } from "./features/auth/emailLink";
import FeedPage from "./features/feed/FeedPage";

const ComposePage = lazy(() => import("./features/compose/ComposePage"));
const ProfilePage = lazy(() => import("./features/profile/ProfilePage"));
const SignInPage = lazy(() => import("./features/auth/SignInPage"));

export default function App() {
  useEffect(() => {
    void completeEmailLinkSignInIfPresent();
  }, []);

  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/f/:family" element={<FeedPage />} />
          <Route path="/en" element={<FeedPage />} />
          <Route path="/en/f/:family" element={<FeedPage />} />
          <Route path="/da" element={<FeedPage />} />
          <Route path="/da/f/:family" element={<FeedPage />} />
          <Route path="/s/:storyId" element={<FeedPage />} />
          <Route path="/new" element={<ComposePage />} />
          <Route path="/u/:handle" element={<ProfilePage />} />
          <Route path="/signin" element={<SignInPage />} />
        </Routes>
      </Suspense>
      <SignInSheet />
    </ToastProvider>
  );
}
