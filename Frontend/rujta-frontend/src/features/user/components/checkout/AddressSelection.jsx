import React from "react";

const ADDRESS_FIELDS = [
  { label: "Street", name: "Street", placeholder: "Enter street name" },
  {
    label: "Building No",
    name: "BuildingNo",
    placeholder: "Enter building number",
  },
  { label: "City", name: "City", placeholder: "Enter city" },
  {
    label: "Governorate",
    name: "Governorate",
    placeholder: "Enter governorate",
  },
];

const AddressSelection = ({
  addresses,
  addressesLoading,
  addressesError,
  selectedAddressId,
  setSelectedAddressId,
  showNewAddressForm,
  setShowNewAddressForm,
  newAddressForm,
  setNewAddressForm,
  handleNewAddressChange,
  handleAddNewAddress,
  handleConfirmAddress,
  isConfirmingAddress,
  audio,
}) => (
  <div className="max-h-[80vh] w-full overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
    <h2 className="mb-6 text-2xl font-bold text-gray-800">
      Select Delivery Address
    </h2>

    {addressesLoading && (
      <p className="mb-4 text-gray-600">Loading addresses...</p>
    )}
    {addressesError && <p className="mb-4 text-red-500">{addressesError}</p>}

    {!showNewAddressForm ? (
      <div className="mb-6 flex flex-col gap-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Choose an address:
        </label>

        <select
          value={selectedAddressId || ""}
          onChange={(e) =>
            setSelectedAddressId(parseInt(e.target.value) || null)
          }
          className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 transition focus:border-secondary focus:ring-1 focus:ring-secondary"
        >
          <option value="">Select an address...</option>
          {addresses.map((addr) => (
            <option key={addr.id} value={addr.id}>
              {addr.street}, {addr.buildingNo}, {addr.city}, {addr.governorate}
              {addr.isDefault ? " (Default)" : ""}
            </option>
          ))}
        </select>

        {addresses.length === 0 && (
          <p className="text-gray-600">
            No addresses found. Please add a new one.
          </p>
        )}

        <button
          onClick={() => setShowNewAddressForm(true)}
          className="mt-2 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300"
        >
          Add New Address
        </button>
      </div>
    ) : (
      <div className="mb-6 flex flex-col gap-4">
        {ADDRESS_FIELDS.map(({ label, name, placeholder }) => (
          <div key={name}>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type="text"
              name={name}
              placeholder={placeholder}
              value={newAddressForm[name]}
              onChange={handleNewAddressChange}
              className="w-full rounded-lg border border-gray-300 p-2 transition focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
          </div>
        ))}

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="IsDefault"
            checked={newAddressForm.IsDefault}
            onChange={(e) =>
              setNewAddressForm((prev) => ({
                ...prev,
                IsDefault: e.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-gray-300 accent-secondary"
          />
          Set as Default
        </label>

        <button
          onClick={handleAddNewAddress}
          className="mt-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
        >
          Save New Address
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-800 hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    )}

    {!showNewAddressForm && (
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => {
            handleConfirmAddress();
            audio.currentTime = 0;
            audio.play();
          }}
          disabled={!selectedAddressId || isConfirmingAddress}
          className="rounded-lg bg-secondary px-5 py-2 font-medium text-white transition-all hover:bg-secondary-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isConfirmingAddress ? "Searching..." : "Confirm Address"}
        </button>
      </div>
    )}
  </div>
);

export default AddressSelection;
