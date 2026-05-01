// src/features/discounts/hooks/useDiscountForm.js
import { useState, useEffect } from "react";
import useDiscounts, { DiscountType, DiscountScope } from "../hooks/useDiscounts";
import useInventory from "../../inventory item/hook/useInventoryItem";
import useCategory from "../../category/hook/useCategory";
import useCompany from "../../company/hooks/useCompany";

// ─────────────────────────────────────────────
// 📤 Re-exports
// ─────────────────────────────────────────────
export { DiscountType, DiscountScope };

export const scopeLabel = (scope) => {
  switch (scope) {
    case DiscountScope.Medicine: return "Medicine";
    case DiscountScope.Category: return "Category";
    case DiscountScope.Company:  return "Company";
    default:                     return "Item";
  }
};

export const scopePlaceholder = (scope) => {
  switch (scope) {
    case DiscountScope.Medicine: return "Select a medicine...";
    case DiscountScope.Category: return "Select a category...";
    case DiscountScope.Company:  return "Select a company...";
    default:                     return "Select...";
  }
};

// ─────────────────────────────────────────────
// 🪝 useDiscountForm
// ─────────────────────────────────────────────
export function useDiscountForm() {

  // ── 1️⃣ The 4 hooks ───────────────────────────
  const { create } = useDiscounts();

  const {
    items:    medicines,
    loading:  loadingMedicines,
    error:    medicinesError,
    fetchAll: fetchMedicines,
  } = useInventory();

  const {
    pharmacyCategories,
    loading:                 loadingCategories,
    error:                   categoriesError,
    fetchPharmacyCategories,
  } = useCategory();

  const {
    pharmacyCompanies,
    loading:                loadingCompanies,
    error:                  companiesError,
    fetchPharmacyCompanies,
  } = useCompany();

  // ── 2️⃣ Form State ────────────────────────────
  const [selectedScope, setSelectedScope] = useState(DiscountScope.Medicine);
  const [selectedItem,  setSelectedItem]  = useState(null);
  const [discountName,  setDiscountName]  = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountType,  setDiscountType]  = useState(DiscountType.Percentage);
  const [startDate,     setStartDate]     = useState("");
  const [endDate,       setEndDate]       = useState("");
  const [errors,        setErrors]        = useState({});
  const [submitting,    setSubmitting]    = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [submitError,   setSubmitError]   = useState(null);

  // ── 3️⃣ Load list when scope changes ──────────
  useEffect(() => {
    if      (selectedScope === DiscountScope.Medicine) fetchMedicines();
    else if (selectedScope === DiscountScope.Category) fetchPharmacyCategories();
    else if (selectedScope === DiscountScope.Company)  fetchPharmacyCompanies();
  }, [selectedScope]);

  // ── 4️⃣ Derived values ────────────────────────
  const currentList =
    selectedScope === DiscountScope.Medicine ? medicines          :
    selectedScope === DiscountScope.Category ? pharmacyCategories :
    pharmacyCompanies;

  const loadingData =
    selectedScope === DiscountScope.Medicine ? loadingMedicines  :
    selectedScope === DiscountScope.Category ? loadingCategories :
    loadingCompanies;

  const fetchError =
    selectedScope === DiscountScope.Medicine ? medicinesError  :
    selectedScope === DiscountScope.Category ? categoriesError :
    companiesError;

  // ── 5️⃣ Scope Change ──────────────────────────
  const handleScopeChange = (scope) => {
    setSelectedScope(scope);
    setSelectedItem(null);
    setErrors({});
  };

  // ── 6️⃣ Validation ────────────────────────────
  const validate = () => {
    const e = {};

    if (!discountName.trim())
      e.name = "Discount name is required";

    if (!selectedItem)
      e.item = `Please select a ${scopeLabel(selectedScope)}`;

    const numVal = Number(discountValue);
    if (!discountValue || numVal <= 0)
      e.discount = "Please enter a valid discount value";
    else if (discountType === DiscountType.Percentage && numVal > 100)
      e.discount = "Percentage cannot exceed 100%";

    if (!startDate)
      e.startDate = "Start date is required";

    if (endDate && startDate && new Date(endDate) <= new Date(startDate))
      e.endDate = "End date must be after start date";

    return e;
  };

  // ── 7️⃣ Reset ─────────────────────────────────
  const resetForm = () => {
    setDiscountName("");
    setDiscountValue("");
    setDiscountType(DiscountType.Percentage);
    setStartDate("");
    setEndDate("");
    setSelectedItem(null);
    setErrors({});
    setSubmitError(null);
  };

  // ── 8️⃣ Submit ────────────────────────────────
  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      name:  discountName.trim(),
      value: Number(discountValue),
      type:  discountType,
      scope: selectedScope,

      startDate: new Date(startDate).toISOString(),
      endDate: endDate
        ? new Date(endDate).toISOString()
        : new Date(
            new Date(startDate).setFullYear(
              new Date(startDate).getFullYear() + 1
            )
          ).toISOString(),

      medicineId: selectedScope === DiscountScope.Medicine
        ? (selectedItem.medicineId ?? selectedItem.id)
        : null,
      categoryId: selectedScope === DiscountScope.Category
        ? selectedItem.id
        : null,
      companyId: selectedScope === DiscountScope.Company
        ? selectedItem.id
        : null,
    };

    try {
      const result = await create(payload);
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          resetForm();
        }, 2000);
      } else {
        setSubmitError("Failed to create discount. Please try again.");
      }
    } catch (err) {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── 9️⃣ Return ────────────────────────────────
  return {
    currentList,
    loadingData,
    fetchError,
    selectedScope,
    handleScopeChange,
    selectedItem,
    setSelectedItem,
    discountName,   setDiscountName,
    discountValue,  setDiscountValue,
    discountType,   setDiscountType,
    startDate,      setStartDate,
    endDate,        setEndDate,
    submitting,
    success,
    submitError,
    errors,
    setErrors,
    handleSubmit,
  };
}