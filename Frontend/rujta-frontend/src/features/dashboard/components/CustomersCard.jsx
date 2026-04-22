export default function CustomersCard({ title, value, variant }) {
  return (
    <div className="w-full rounded-xl bg-white p-3 shadow-sm sm:p-4 md:p-5">
      <h3 className="truncate text-xs text-gray-500 sm:text-sm md:text-base">
        {title}
      </h3>
      <p className="mt-1 truncate text-xl font-bold sm:mt-2 sm:text-2xl md:text-3xl">
        {value}
      </p>
    </div>
  );
}
