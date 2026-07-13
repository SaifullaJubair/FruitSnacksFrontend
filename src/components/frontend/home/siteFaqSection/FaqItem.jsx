"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

// Client leaf — only the accordion open/close needs the browser. The FAQ data
// itself is fetched by the server parent and passed in as a prop.
export default function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-800 pr-4">
          {faq.question}
        </span>
        {open ? (
          <FiChevronUp className="shrink-0 text-primary-500" />
        ) : (
          <FiChevronDown className="shrink-0 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 bg-white border-t border-gray-50">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
}
