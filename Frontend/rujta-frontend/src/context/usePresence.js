import { useContext } from "react";
import { PresenceContext } from "./PresenceContext";  // Adjust path if needed

export const usePresence = () => {
  return useContext(PresenceContext);
};