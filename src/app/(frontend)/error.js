"use client";

// Route-level error boundary for the storefront.
//
// The home sections now fetch on the server. Their helpers all fail soft (return
// null) so a dead backend degrades one section instead of the page — but this is
// the backstop for anything that still throws during render, so a visitor gets a
// branded page with a retry instead of Next's raw error screen.
export default function FrontendError({ error, reset }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          কিছু একটা সমস্যা হয়েছে
        </h2>
        <p className="text-gray-600 mb-6">
          পেজটি লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white px-7 py-3 rounded-full font-semibold transition-colors"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    </div>
  );
}
