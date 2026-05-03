// src/features/super-admin/hook/useSuperAdmin.js
import { useState, useCallback } from "react";
import {
  createPharmacy,
  getAllPharmacies,
  getPharmacyById,
  updatePharmacy,
  deletePharmacy,
  restorePharmacy,
  resetManagerPassword,
  getPharmacyTotalOrders,
  getTopPharmacies,
  getMainPharmacies,
  getBranches,
  getPharmacyTree,
  detachBranch,
  attachBranch,
} from "../api/superAdmin";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const extractErrorMessage = (err) => {
  if (!err) return "An unknown error occurred";

  if (err?.response?.data?.message) return err.response.data.message;

  if (err?.response?.data) {
    if (typeof err.response.data === "string") return err.response.data;
  }

  if (err?.response?.status) {
    const status = err.response.status;
    if (status === 400) return "Invalid pharmacy data";
    if (status === 401) return "Unauthorized: Please log in again";
    if (status === 403) return "Forbidden: You don't have permission";
    if (status === 404) return "Pharmacy not found";
    if (status === 409) return "Conflict: Resource already exists";
    if (status === 500) return "Server error: Please contact support";
    return `Request failed with status ${status}`;
  }

  if (err?.message) return err.message;

  return "Failed to load pharmacies";
};

/* ─────────────────────────────────────────────
   MAPPERS
───────────────────────────────────────────── */
const mapPharmacy = (item = {}) => {
  const id = item.id ?? item.Id ?? null;
  const totalOrders = toNumber(item.totalOrders ?? item.TotalOrders);
  const branchesCount = toNumber(item.branchesCount ?? item.BranchesCount);
  const latitude = toNumber(item.latitude ?? item.Latitude);
  const longitude = toNumber(item.longitude ?? item.Longitude);
  const isActive = item.isActive ?? item.IsActive ?? true;
  const isDeleted = item.isDeleted ?? item.IsDeleted ?? false;

  // ✅ احسب الـ parentId من كل الصيغ الممكنة
  const rawParentId =
    item.parentPharmacyId ??
    item.ParentPharmacyId ??
    item.parentPharmacyID ??
    item.ParentPharmacyID ??
    item.parentId ??
    item.ParentId ??
    item.parentPharmacy?.id ??
    item.ParentPharmacy?.Id ??
    null;

  // ✅ تأكد إنه فعلاً null/undefined مش 0 أو ""
  const hasParent =
    rawParentId !== null &&
    rawParentId !== undefined &&
    rawParentId !== 0 &&
    rawParentId !== "";

  // ✅ استخدم الـ flags اللي جاية من الباك إذا متاحة (احتياط)
  const backendIsBranch = item.isBranch ?? item.IsBranch;
  const backendIsMain = item.isMainPharmacy ?? item.IsMainPharmacy;

  let isBranch;
  if (typeof backendIsBranch === "boolean") {
    isBranch = backendIsBranch;
  } else if (typeof backendIsMain === "boolean") {
    isBranch = !backendIsMain;
  } else {
    isBranch = hasParent;
  }

  const parentId = hasParent ? rawParentId : null;
  const parentName =
    item.parentPharmacyName ??
    item.ParentPharmacyName ??
    item.parentPharmacy?.name ??
    item.ParentPharmacy?.Name ??
    null;

  return {
    id,
    displayId: `#${id ?? "-"}`,
    name: item.name ?? item.Name ?? "Unknown",
    location: item.location ?? item.Location ?? "-",
    contactNumber: item.contactNumber ?? item.ContactNumber ?? "-",
    openHours: item.openHours ?? item.OpenHours ?? "-",
    imageUrl: item.imageUrl ?? item.ImageUrl ?? null,
    latitude,
    longitude,

    managerId: item.managerId ?? item.ManagerId ?? null,
    managerName: item.managerName ?? item.ManagerName ?? "-",
    managerEmail: item.managerEmail ?? item.ManagerEmail ?? null,
    managerPhone: item.managerPhone ?? item.ManagerPhone ?? null,

    adminId: item.adminId ?? item.AdminId ?? null,
    adminName: item.adminName ?? item.AdminName ?? "-",
    adminEmail: item.adminEmail ?? item.AdminEmail ?? null,

    parentPharmacyId: parentId,
    parentPharmacyName: parentName,
    isBranch,
    isMainPharmacy: !isBranch,
    type: isBranch ? "Branch" : "Main Pharmacy",

    totalOrders,
    displayTotalOrders: `${totalOrders} Orders`,
    branchesCount,
    displayBranchesCount: `${branchesCount} Branches`,

    isActive,
    isDeleted,
    statusLabel: isDeleted ? "Deleted" : isActive ? "Active" : "Inactive",

    branches: Array.isArray(item.branches ?? item.Branches)
      ? (item.branches ?? item.Branches).map(mapPharmacy)
      : [],

    raw: item,
  };
};

const mapBranch = (item = {}) => mapPharmacy(item);

const mapTree = (node) => {
  if (!node) return null;
  const mapped = mapPharmacy(node);
  const children = node.branches ?? node.Branches ?? [];
  mapped.branches = Array.isArray(children) ? children.map(mapTree) : [];
  return mapped;
};

const mapTopStat = (item = {}) => ({
  pharmacyId: item.pharmacyId ?? item.PharmacyId ?? null,
  pharmacyName: item.pharmacyName ?? item.PharmacyName ?? "Unknown",
  totalOrders: toNumber(item.totalOrders ?? item.TotalOrders),
  totalRevenue: toNumber(item.totalRevenue ?? item.TotalRevenue),
  raw: item,
});

/* ═══════════════════════════════════════════════════
   HOOK
═══════════════════════════════════════════════════ */
export default function useSuperAdmin() {
  const [pharmacies, setPharmacies] = useState([]);
  const [mainPharmacies, setMainPharmacies] = useState([]);
  const [topPharmacies, setTopPharmacies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [tree, setTree] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ──── FETCH ──── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllPharmacies();
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setPharmacies(list.map(mapPharmacy));
      setError(null);
    } catch (err) {
      console.error("❌ fetchAll pharmacies error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = async (id) => {
    setLoading(true);
    try {
      const res = await getPharmacyById(id);
      setError(null);
      return mapPharmacy(res?.data ?? res);
    } catch (err) {
      console.error("❌ fetchById pharmacy error:", err);
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchMain = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMainPharmacies();
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setMainPharmacies(list.map(mapPharmacy));
      setError(null);
    } catch (err) {
      console.error("❌ fetchMain pharmacies error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBranches = async (parentId) => {
    setLoading(true);
    try {
      const res = await getBranches(parentId);
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      const mapped = list.map(mapBranch);
      setBranches(mapped);
      setError(null);
      return mapped;
    } catch (err) {
      console.error("❌ fetchBranches error:", err);
      setError(extractErrorMessage(err));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchTree = async (rootId) => {
    setLoading(true);
    try {
      const res = await getPharmacyTree(rootId);
      const mapped = mapTree(res?.data ?? res);
      setTree(mapped);
      setError(null);
      return mapped;
    } catch (err) {
      console.error("❌ fetchTree error:", err);
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchTop = async (count = 5) => {
    setLoading(true);
    try {
      const res = await getTopPharmacies(count);
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      const mapped = list.map(mapTopStat);
      setTopPharmacies(mapped);
      setError(null);
      return mapped;
    } catch (err) {
      console.error("❌ fetchTop pharmacies error:", err);
      setError(extractErrorMessage(err));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalOrders = async (id) => {
    setLoading(true);
    try {
      const res = await getPharmacyTotalOrders(id);
      const data = res?.data ?? res ?? {};
      setError(null);
      return toNumber(data.totalOrders ?? data.TotalOrders ?? 0);
    } catch (err) {
      console.error("❌ fetchTotalOrders error:", err);
      setError(extractErrorMessage(err));
      return 0;
    } finally {
      setLoading(false);
    }
  };

  /* ──── MUTATIONS ──── */
  const create = async (payload = {}) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        formData.append(key, value);
      });

      const res = await createPharmacy(formData);
      await fetchAll();
      setError(null);
      return res?.data ?? res;
    } catch (err) {
      console.error("❌ create pharmacy error:", err);
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    setLoading(true);
    try {
      const res = await updatePharmacy(id, data);
      const updated = mapPharmacy(res?.data ?? res);
      setPharmacies((prev) =>
        prev.map((p) => (p.id === id ? { ...updated } : p)),
      );
      setError(null);
      return updated;
    } catch (err) {
      console.error("❌ update pharmacy error:", err);
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      await deletePharmacy(id);
      setPharmacies((prev) => prev.filter((p) => p.id !== id));
      setError(null);
      return true;
    } catch (err) {
      console.error("❌ delete pharmacy error:", err);
      setError(extractErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restore = async (id) => {
    setLoading(true);
    try {
      await restorePharmacy(id);
      await fetchAll();
      setError(null);
      return true;
    } catch (err) {
      console.error("❌ restore pharmacy error:", err);
      setError(extractErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (id) => {
    setLoading(true);
    try {
      const res = await resetManagerPassword(id);
      const data = res?.data ?? res ?? {};
      setError(null);
      return data.newPassword ?? data.NewPassword ?? null;
    } catch (err) {
      console.error("❌ resetPassword error:", err);
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const detach = async (branchId) => {
    setLoading(true);
    try {
      await detachBranch(branchId);
      await fetchAll();
      setError(null);
      return true;
    } catch (err) {
      console.error("❌ detach branch error:", err);
      setError(extractErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const attach = async (branchId, parentId) => {
    setLoading(true);
    try {
      await attachBranch(branchId, parentId);
      await fetchAll();
      setError(null);
      return true;
    } catch (err) {
      console.error("❌ attach branch error:", err);
      setError(extractErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    pharmacies,
    mainPharmacies,
    topPharmacies,
    branches,
    tree,
    loading,
    error,

    fetchAll,
    fetchById,
    fetchMain,
    fetchBranches,
    fetchTree,
    fetchTop,
    fetchTotalOrders,

    create,
    update,
    remove,
    restore,
    resetPassword,
    detach,
    attach,
  };
}
