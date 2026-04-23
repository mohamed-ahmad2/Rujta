import { auth } from "../../../../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth } from "../../../features/auth/hooks/useAuth";

export const useGoogleAuth = () => {
  const { handleGoogleLogin } = useAuth();

  const googleFirebaseLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) throw new Error("No user returned from Firebase");

      const IdToken = await user.getIdToken(true);

      const backendTokens = await handleGoogleLogin(IdToken);
      if (!backendTokens) throw new Error("Failed to get tokens from backend");

      window.location.href = "/user";

      return {
        firebaseUser: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        backendTokens,
      };
    } catch (error) {
      console.error("Firebase social login failed:", error);
      throw error;
    }
  };

  return { googleFirebaseLogin };
};
