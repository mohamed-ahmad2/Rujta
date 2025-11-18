import React from "react";
import { GoogleLogin } from "@react-oauth/google";

function GoogleLoginButton() {
  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse.credential) return;

    const response = await fetch("https://localhost:5001/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ IdToken: credentialResponse.credential }),
    });

    const data = await response.json();
    if (data?.jwt) {
      localStorage.setItem("token", data.jwt); // Store JWT
      console.log("Logged in with Google:", data);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleLogin}
      onError={() => console.log("Google login failed")}
    />
  );
}

export default GoogleLoginButton;
