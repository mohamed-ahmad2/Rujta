export default function CustomersCard({ title, value, variant }) {
  return (
    <div className={`p-5 rounded-xl shadow-sm bg-white`}>
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}