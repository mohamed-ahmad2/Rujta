import React, { useState } from "react";
import { Search, Edit3, Trash2, Package, PlusCircle } from "lucide-react";

export default function ViewProducts() {
  const [products, setProducts] = useState([
    { id: 1, name: "Paracetamol", category: "Pain Relief", price: 25, stock: 50 },
    { id: 2, name: "Amoxicillin", category: "Antibiotic", price: 70, stock: 30 },
    { id: 3, name: "Vitamin C", category: "Supplements", price: 40, stock: 100 },
    { id: 4, name: "Ibuprofen", category: "Pain Relief", price: 35, stock: 25 },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <Package className="text-blue-600" />
          View Products
        </h1>
        <button className="bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <PlusCircle size={18} /> Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-1/3 mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search for a product..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white shadow-md rounded-2xl p-5 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">{p.name}</h2>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    p.stock < 10
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {p.stock < 10 ? "Low Stock" : "In Stock"}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-1">
                Category: <span className="font-medium">{p.category}</span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Price: <span className="font-medium text-blue-600">{p.price} EGP</span>
              </p>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => alert(`Editing ${p.name}`)}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition"
                >
                  <Edit3 size={16} /> Edit
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">No products found 😕</p>
        </div>
      )}
    </div>
  );
}
