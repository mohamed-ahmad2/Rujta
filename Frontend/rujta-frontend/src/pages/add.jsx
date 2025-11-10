import React, { useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([
    { id: 1, name: "Paracetamol", category: "Pain Relief", price: 25, stock: 50 },
    { id: 2, name: "Amoxicillin", category: "Antibiotic", price: 70, stock: 30 },
  ]);

  const [newProduct, setNewProduct] = useState({ name: "", category: "", price: "", stock: "" });

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) return alert("Please fill all fields");
    setProducts([...products, { id: Date.now(), ...newProduct }]);
    setNewProduct({ name: "", category: "", price: "", stock: "" });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Pharmacy Products</h2>

      {/* Add Product Form */}
      <div className="bg-white p-4 shadow-md rounded-md mb-6">
        <h3 className="font-semibold mb-3">Add New Product</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          />
        </div>
        <button
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={addProduct}
        >
          Add Product
        </button>
      </div>

      {/* Product Table */}
      <table className="w-full border bg-white shadow-md rounded-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.category}</td>
              <td className="border p-2">{p.price} EGP</td>
              <td className="border p-2">{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
