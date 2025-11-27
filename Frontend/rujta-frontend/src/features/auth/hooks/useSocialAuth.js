import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export const useSocialAuth = (googleClientId, facebookAppId) => {
  const { handleSocialLogin } = useAuth();

  const [googleAuth, setGoogleAuth] = useState(null);
  const [fbLoaded, setFbLoaded] = useState(false);

  // Google SDK
  useEffect(() => {
    if (!window.gapi) return;
    window.gapi.load("auth2", () => {
      const auth2 = window.gapi.auth2.init({
        client_id: googleClientId,
      });
      setGoogleAuth(auth2);
    });
  }, [googleClientId]);

  // Facebook SDK
  useEffect(() => {
    if (window.FB) {
      setFbLoaded(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: true,
        version: "v16.0",
      });
      setFbLoaded(true);
    };

    ((d, s, id) => {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, [facebookAppId]);

  const loginWithGoogle = async () => {
    if (!googleAuth) return console.error("Google SDK not loaded");
    try {
      const googleUser = await googleAuth.signIn();
      const idToken = googleUser.getAuthResponse().id_token;
      await handleSocialLogin({ idToken });
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  const loginWithFacebook = () => {
    if (!fbLoaded || !window.FB) return console.error("Facebook SDK not loaded");
    window.FB.login(
      async (response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          await handleSocialLogin({ accessToken });
        } else {
          console.error("Facebook login cancelled or failed");
        }
      },
      { scope: "email" }
    );
  };

  return { loginWithGoogle, loginWithFacebook, googleAuth, fbLoaded };
};
