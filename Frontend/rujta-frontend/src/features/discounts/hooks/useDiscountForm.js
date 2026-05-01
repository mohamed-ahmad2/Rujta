// src/features/discounts/hooks/useDiscountForm.js
import { useState, useEffect } from "react";
import useDiscounts, {
  DiscountType,
  DiscountScope,
} from "../hooks/useDiscounts";
import useInventory from "../../inventory item/hook/useInventoryItem";
import useCategory from "../../category/hook/useCategory";
import useCompany from "../../company/hooks/useCompany";

export { DiscountType, DiscountScope };

export const scopeLabel = (scope) => {
  switch (scope) {
    case DiscountScope.Medicine:
      return "Medicine";
    case DiscountScope.Category:
      return "Category";
    case DiscountScope.Company:
      return "Company";
    default:
      return "Item";
  }
};

export const scopePlaceholder = (scope) => {
  switch (scope) {
    case DiscountScope.Medicine:
      return "Select a medicine...";
    case DiscountScope.Category:
      return "Select a category...";
    case DiscountScope.Company:
      return "Select a company...";
    default:
      return "Select...";
  }
};

const toISOFromLocal = (localValue) => {
  if (!localValue) return null;
  const d = new Date(localValue);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
};

export const nowAsLocalInput = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
};

const classifyBackendError = (msg = "") => {
  const m = msg.toLowerCase();

  if (m.includes("active discount already exists")) {
    return {
      type: "warning",
      title: "Duplicate Discount",
      icon: "🔁",
      btnLabel: "Got it",
    };
  }
  if (m.includes("percentage")) {
    return {
      type: "warning",
      title: "Invalid Percentage",
      icon: "📊",
      btnLabel: "Fix it",
    };
  }
  if (m.includes("fixed discount") || m.includes("medicine price")) {
    return {
      type: "warning",
      title: "Discount Too High",
      icon: "💰",
      btnLabel: "Adjust",
    };
  }
  if (
    m.includes("end date") ||
    m.includes("start date") ||
    m.includes("date")
  ) {
    return {
      type: "warning",
      title: "Invalid Date Range",
      icon: "📅",
      btnLabel: "Fix dates",
    };
  }
  if (m.includes("not found")) {
    return {
      type: "error",
      title: "Not Found",
      icon: "🔍",
      btnLabel: "Close",
    };
  }
  if (m.includes("unauthorized") || m.includes("forbidden")) {
    return {
      type: "error",
      title: "Access Denied",
      icon: "🔒",
      btnLabel: "Close",
    };
  }
  return {
    type: "error",
    title: "Couldn't create discount",
    icon: "⚠️",
    btnLabel: "Close",
  };
};

export function useDiscountForm() {
  const { create } = useDiscounts();

  const {
    items: medicines,
    loading: loadingMedicines,
    error: medicinesError,
    fetchAll: fetchMedicines,
  } = useInventory();

  const {
    pharmacyCategories,
    loading: loadingCategories,
    error: categoriesError,
    fetchPharmacyCategories,
  } = useCategory();

  const {
    pharmacyCompanies,
    loading: loadingCompanies,
    error: companiesError,
    fetchPharmacyCompanies,
  } = useCompany();

  const [selectedScope, setSelectedScope] = useState(DiscountScope.Medicine);
  const [selectedItem, setSelectedItem] = useState(null);
  const [discountName, setDiscountName] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState(DiscountType.Percentage);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (selectedScope === DiscountScope.Medicine) fetchMedicines();
    else if (selectedScope === DiscountScope.Category)
      fetchPharmacyCategories();
    else if (selectedScope === DiscountScope.Company) fetchPharmacyCompanies();
  }, [selectedScope]);

  const currentList =
    selectedScope === DiscountScope.Medicine
      ? medicines
      : selectedScope === DiscountScope.Category
        ? pharmacyCategories
        : pharmacyCompanies;

  const loadingData =
    selectedScope === DiscountScope.Medicine
      ? loadingMedicines
      : selectedScope === DiscountScope.Category
        ? loadingCategories
        : loadingCompanies;

  const fetchError =
    selectedScope === DiscountScope.Medicine
      ? medicinesError
      : selectedScope === DiscountScope.Category
        ? categoriesError
        : companiesError;

  const selectedMedicinePrice =
    selectedScope === DiscountScope.Medicine && selectedItem
      ? Number(
          selectedItem.price ??
            selectedItem.Price ??
            selectedItem.effectivePrice ??
            0,
        )
      : 0;

  const handleScopeChange = (scope) => {
    setSelectedScope(scope);
    setSelectedItem(null);
    setErrors({});
    setToast(null);
  };

  const validate = () => {
    const e = {};

    if (!discountName.trim()) e.name = "Discount name is required";
    if (!selectedItem) e.item = `Please select a ${scopeLabel(selectedScope)}`;

    const numVal = Number(discountValue);

    if (!discountValue || numVal <= 0) {
      e.discount = "Please enter a valid discount value";
    } else if (discountType === DiscountType.Percentage) {
      if (numVal >= 100) {
        e.discount = "Percentage discount must be less than 100%";
      }
    } else if (discountType === DiscountType.Fixed) {
      if (
        selectedScope === DiscountScope.Medicine &&
        selectedItem &&
        selectedMedicinePrice > 0 &&
        numVal >= selectedMedicinePrice
      ) {
        e.discount =
          `Fixed discount (
$${numVal.toFixed(2)}) must be less than ` +
          `medicine price (
$${selectedMedicinePrice.toFixed(2)})`;
      }
    }

    if (!startDate) {
      e.startDate = "Start date & time is required";
    }

    if (!endDate) {
      e.endDate = "End date & time is required";
    } else if (startDate && new Date(endDate) <= new Date(startDate)) {
      e.endDate = "End date must be after start date";
    } else if (new Date(endDate) < new Date()) {
      e.endDate = "End date cannot be in the past";
    }

    return e;
  };

  const resetForm = () => {
    setDiscountName("");
    setDiscountValue("");
    setDiscountType(DiscountType.Percentage);
    setStartDate("");
    setEndDate("");
    setSelectedItem(null);
    setErrors({});
  };

  const handleSubmit = async () => {
    setToast(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      const errorList = Object.values(validationErrors).filter(Boolean);
      setToast({
        type: "warning",
        title: "Please fix the highlighted fields",
        icon: "📝",
        message: `${errorList.length} field${errorList.length > 1 ? "s" : ""} need your attention`,
        details: errorList,
        btnLabel: "OK",
      });
      return;
    }

    setSubmitting(true);

    const payload = {
      name: discountName.trim(),
      value: Number(discountValue),
      type: discountType,
      scope: selectedScope,

      startDate: toISOFromLocal(startDate),
      endDate: toISOFromLocal(endDate),

      medicineId:
        selectedScope === DiscountScope.Medicine
          ? (selectedItem.medicineId ?? selectedItem.id)
          : null,
      categoryId:
        selectedScope === DiscountScope.Category ? selectedItem.id : null,
      companyId:
        selectedScope === DiscountScope.Company ? selectedItem.id : null,
    };

    try {
      const result = await create(payload);

      if (result?.ok) {
        setToast({
          type: "success",
          title: "Discount Created!",
          icon: "🎉",
          message: `"${discountName.trim()}" has been activated successfully.`,
          btnLabel: "Awesome! 🎉",
        });
        resetForm();
      } else {
        const errMsg =
          result?.error || "Failed to create discount. Please try again.";
        const classified = classifyBackendError(errMsg);
        setToast({
          ...classified,
          message: errMsg,
        });
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "An unexpected error occurred. Please try again.";
      const classified = classifyBackendError(errMsg);
      setToast({
        ...classified,
        message: errMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    currentList,
    loadingData,
    fetchError,
    selectedScope,
    handleScopeChange,
    selectedItem,
    setSelectedItem,
    selectedMedicinePrice,
    discountName,
    setDiscountName,
    discountValue,
    setDiscountValue,
    discountType,
    setDiscountType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    submitting,
    toast,
    setToast,
    errors,
    setErrors,
    handleSubmit,
  };
}
