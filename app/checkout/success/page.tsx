export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-700">Thank you for your order. 🎉</p>
        <a
          href="/cart"
          className="inline-block mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          View Orders
        </a>
      </div>
    </div>
  );
}
