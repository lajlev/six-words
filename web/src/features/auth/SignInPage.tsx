import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthFlow } from "./AuthFlow";
import { useAuth } from "./useAuth";

export default function SignInPage() {
  const { user, needsHandle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !needsHandle) navigate("/", { replace: true });
  }, [user, needsHandle, navigate]);

  return (
    <div className="compose-page">
      <div className="compose-top">
        <span className="compose-word" style={{ fontSize: 22, color: "#fff" }}>
          Six Words, One Feeling
        </span>
      </div>
      <AuthFlow onDone={() => navigate("/", { replace: true })} />
    </div>
  );
}
