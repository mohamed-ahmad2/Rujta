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
      const firebaseUser = result.user;

      if (!firebaseUser) throw new Error("No user returned from Firebase");

      const IdToken = await firebaseUser.getIdToken(true);

      const res = await handleGoogleLogin(IdToken);
      if (!res) throw new Error("Failed to get tokens from backend");

      window.location.href = "/user";

      return {
        firebaseUser: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        },
        backendData: res,
      };
    } catch (error) {
      console.error("Firebase social login failed:", error);
      throw error;
    }
  };

  return { googleFirebaseLogin };
};
