// src/context/useOrdersContext.js
import { useContext } from "react";
import { OrdersContext } from "./OrdersContext";

export const useOrdersContext = () => {
  return useContext(OrdersContext);
};