import { Sheet } from "../../components/Sheet";
import { AuthFlow } from "./AuthFlow";
import { useAuth } from "./useAuth";

export function SignInSheet() {
  const { signInSheetOpen, closeSignIn, needsHandle } = useAuth();

  return (
    <Sheet open={signInSheetOpen} title={needsHandle ? "Pick a handle" : "Sign in"} onClose={closeSignIn}>
      <AuthFlow onDone={closeSignIn} />
    </Sheet>
  );
}
