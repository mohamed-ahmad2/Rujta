// src/features/customerOrders/hook/useCustomerOrders.js
import { useState, useCallback } from "react";
import {
  createCustomerOrder,
  checkCustomerByPhone,
} from "../api/customerOrdersApi";

export const useCustomerOrders = () => {
  const [result, setResult] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Check customer existence by phone number
   */
  const checkCustomer = useCallback(async (phoneNumber) => {
    setLoading(true);
    setError(null);

    try {
      const res = await checkCustomerByPhone(phoneNumber);
      setCustomer(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create customer order
   */
  const createOrder = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const res = await createCustomerOrder(data);
      setResult(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    // state
    customer,
    result,
    loading,
    error,

    // actions
    checkCustomer,
    createOrder,
  };
};
