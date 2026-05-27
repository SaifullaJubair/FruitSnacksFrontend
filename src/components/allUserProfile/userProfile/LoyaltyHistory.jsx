/**
 * LoyaltyHistory — F3.
 *
 * User-side loyalty points ledger. Reads from `GET /loyalty/history`
 * (`verifyUserToken` gated, returns { rows, balance, total }). Renders a
 * balance card + paginated transaction table (earn/redeem/admin_adjust/expire).
 *
 * Earn-on-order + redeem-on-order are server-side; this is read-only.
 */

"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "@/components/utils/baseURL";
import { FaGift } from "react-icons/fa";
import MiniSpinner from "@/components/shared/loader/MiniSpinner";

const TYPE_BADGE = {
  order_earn: "bg-emerald-100 text-emerald-700",
  order_redeem: "bg-amber-100 text-amber-700",
  admin_adjust: "bg-blue-100 text-blue-700",
  expire: "bg-gray-200 text-gray-700",
};

const TYPE_LABEL = {
  order_earn: "অর্ডারে অর্জিত",
  order_redeem: "অর্ডারে ব্যবহৃত",
  admin_adjust: "অ্যাডমিন সমন্বয়",
  expire: "মেয়াদোত্তীর্ণ",
};

const fmt = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const LoyaltyHistory = () => {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/api/v1/loyalty/history?page=${page}&limit=${limit}`],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/loyalty/history?page=${page}&limit=${limit}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded shadow-sm flex items-center justify-center">
        <MiniSpinner />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="bg-white p-6 rounded shadow-sm text-sm text-red-600">
        লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
      </div>
    );
  }

  // BE response shape (post-F3 controller patch): { data: { rows, balance }, totalData }
  const rows = data?.data?.rows || [];
  const balance = Number(data?.data?.balance) || 0;
  const totalRows = data?.totalData ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / limit));

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-lg p-5 flex items-center gap-4">
        <div className="p-3 bg-rose-600 rounded-xl">
          <FaGift className="text-white text-2xl" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-rose-600 tracking-wide">
            আপনার লয়ালটি পয়েন্ট
          </p>
          <p className="text-3xl font-bold text-rose-700">
            {Number(balance) || 0}{" "}
            <span className="text-sm font-medium text-rose-500">পয়েন্ট</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            চেকআউটে redeem করতে পারবেন — settings অনুযায়ী।
          </p>
        </div>
      </div>

      {/* Ledger table */}
      <div className="bg-white rounded shadow-sm border border-gray-100">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="font-semibold text-gray-800">লেজার</p>
        </div>
        {rows.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            এখনো কোনো লেনদেন নেই।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">ধরন</th>
                  <th className="p-3 text-right">পয়েন্ট</th>
                  <th className="p-3">কারণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="p-3 text-xs text-gray-500">
                      {fmt(r.createdAt)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                          TYPE_BADGE[r.type] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {TYPE_LABEL[r.type] || r.type}
                      </span>
                    </td>
                    <td
                      className={`p-3 text-right font-mono font-bold ${
                        r.delta > 0 ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {r.delta > 0 ? "+" : ""}
                      {r.delta}
                    </td>
                    <td className="p-3 text-xs text-gray-600 italic">
                      {r.reason || (
                        <span className="text-gray-300 not-italic">—</span>
                      )}
                      {r.reference_id && (
                        <span className="block text-[10px] text-gray-400 font-mono not-italic">
                          ref: {r.reference_id}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
            >
              আগের
            </button>
            <span className="text-xs text-gray-500">
              পেজ {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
            >
              পরের
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyHistory;
