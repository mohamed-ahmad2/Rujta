// src/features/orders/hooks/useOrders.js
import { useState, useEffect } from "react";
import {
    getAllOrders,
    getOrderById,
    getOrderDetails,
    getUserOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    acceptOrder,
    processOrder,
    outForDelivery,
    markAsDelivered,
    cancelByUser,
    cancelByPharmacy,
} from "../api/ordersApi";

export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllOrders();
            setOrders(res.data);
        } catch (err) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getOrderById(id);
            setSelectedOrder(res.data);
        } catch (err) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetails = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getOrderDetails(id);
            setDetails(res.data);
        } catch (err) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getUserOrders();
            setOrders(res.data);
        } catch (err) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const create = async (data) => {
    setLoading(true);
    setError(null);
    try {
        const res = await createOrder(data);
        await fetchUserOrders();
        return res.data;
    } catch (err) {
        setError(err.response?.data || err.message);
        return null;
    } finally {
        setLoading(false);
    }
};


    const update = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            await updateOrder(id, data);
            await fetchAll();
        } catch (err) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteOrder(id);
            setOrders((prev) => prev.filter((o) => o.id !== id));
        } catch (err) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    // status actions
    const runAction = async (actionFn, id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await actionFn(id);
            await fetchAll();
            return res.data;
        } catch (err) {
            setError(err.response?.data || err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        orders,
        selectedOrder,
        details,
        loading,
        error,

        fetchAll,
        fetchById,
        fetchDetails,
        fetchUserOrders,

        create,
        update,
        remove,

        accept: (id) => runAction(acceptOrder, id),
        process: (id) => runAction(processOrder, id),
        outForDelivery: (id) => runAction(outForDelivery, id),
        deliver: (id) => runAction(markAsDelivered, id),
        cancelByUser: (id) => runAction(cancelByUser, id),
        cancelByPharmacy: (id) => runAction(cancelByPharmacy, id),
    };
};
