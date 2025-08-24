import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CartTableSkeleton = () => {
  return (
    <table className="min-w-full text-sm">
      <thead className="border-b pb-1">
        <tr className="text-gray-900">
          {[
            "#",
            "Image",
            "Product Info",
            "Quantity",
            "Unit Price",
            "SubTotal",
            "Remove",
          ].map((heading, index) => (
            <td key={index} className="whitespace-nowrap p-4">
              {/* <Skeleton width={heading === "Remove" ? 25 : 80} /> */}
              {heading}
            </td>
          ))}
        </tr>
      </thead>

      <tbody className="divide-gray-200">
        {[...Array(5)].map((_, index) => (
          <tr
            key={index}
            className={`divide-y divide-gray-100 ${
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            }`}
          >
            <td className="whitespace-nowrap p-4">
              <Skeleton width={20} />
            </td>
            <td>
              <Skeleton width={80} height={72} />
            </td>
            <td className="min-w-[260px] py-2.5 px-4">
              <Skeleton count={2} />
              <Skeleton width={100} />
            </td>
            <td className="whitespace-nowrap py-1.5 px-4">
              <Skeleton width={80} />
            </td>
            <td className="whitespace-nowrap py-2.5 px-4">
              <Skeleton width={60} />
            </td>
            <td className="whitespace-nowrap py-2.5 px-4">
              <Skeleton width={60} />
            </td>
            <td className="whitespace-nowrap py-2.5 px-4">
              <Skeleton circle width={25} height={25} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CartTableSkeleton;
