// src/hooks/useGoogleAuth.js
import { auth, provider } from "../../../../firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuth } from "../../../features/auth/hooks/useAuth";

export const useGoogleAuth = () => {
  const { handleSocialLogin } = useAuth(); // send ID token to backend

  const googleFirebaseLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Log ID token in console
      console.log("Firebase ID Token:", idToken); // ✅ logs token

      // Send ID token to your backend
      await handleSocialLogin({ idToken });

      return user;
    } catch (error) {
      console.error("Firebase login failed:", error);
      throw error;
    }
  };

  return { googleFirebaseLogin };
};
