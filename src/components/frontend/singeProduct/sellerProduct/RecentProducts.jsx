"use client";
import RecentProductCard from "./RecentProductCard";
import { useEffect, useState } from "react";
const RecentProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const recentProducts = localStorage.getItem("recent-products");
    setProducts(recentProducts ? JSON.parse(recentProducts) : []);
  }, [productId]);

  return (
    <div className=" py-4 ">
      {products?.length > 0 && (
        <h2 className="text-lg md:text-xl text-center lg:-mt-12 font-bold  pb-4 text-gray-800">
          Recent Products
        </h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-2 gap-4 ml-2">
        {products
          ?.filter((product) => product?._id !== productId)
          ?.map((product, i) => (
            <div key={i}>
              <RecentProductCard product={product} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default RecentProducts;
