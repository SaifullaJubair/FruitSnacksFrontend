"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const ProductDescription = ({ product }) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isSpecificationOpen, setIsSpecificationOpen] = useState(false);

  return (
    <div className="my-4">
      {/* Product Description Accordion */}
      {product?.description && (
        <div className="border-y mb-4">
          <div
            className=" px-3 flex items-center justify-between py-2 cursor-pointer"
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
          >
            <p className="text-gray-700 font-semibold">Details</p>
            {isDescriptionOpen ? (
              <FaChevronUp className="text-[20px] font-light text-gray-600" />
            ) : (
              <FaChevronDown className="text-[20px] font-light text-gray-600" />
            )}
          </div>
          <div
            className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
              isDescriptionOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden ">
              <div className="p-4">
                {" "}
                <p
                  className="text-gray-700 "
                  dangerouslySetInnerHTML={{ __html: product?.description }}
                ></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Specification Accordion */}
      {product?.specifications?.length > 0 && (
        <div className="border-y">
          <div
            className=" px-3 flex items-center justify-between py-2 cursor-pointer"
            onClick={() => setIsSpecificationOpen(!isSpecificationOpen)}
          >
            <p className="text-gray-700 font-semibold">Specifications</p>
            {isSpecificationOpen ? (
              <FaChevronUp className="text-[20px] font-light text-gray-600" />
            ) : (
              <FaChevronDown className="text-[20px] font-light text-gray-600" />
            )}
          </div>
          <div
            className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
              isSpecificationOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden ">
              <div className="p-4">
                {" "}
                <div className="overflow-x-auto shadow-md ">
                  <table className="w-full text-sm text-left text-gray-700 border border-gray-300">
                    <thead className="text-sm text-gray-700 uppercase bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 border">Specification Name</th>
                        <th className="px-4 py-3 border">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product?.specifications?.map((specification, i) => (
                        <tr
                          key={specification._id}
                          className={`border-t ${
                            i % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-4 py-3 border font-medium text-gray-800">
                            {
                              specification?.specification_id
                                ?.specification_name
                            }
                          </td>
                          <td className="px-4 py-3 border">
                            {specification?.specification_id?.specification_values
                              ?.map((value) => value?.specification_value_name)
                              .join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDescription;

// "use client";

// import { Button } from "@/components/ui/button";
// import { yatra } from "@/utils/font";
// import { useState } from "react";

// const ProductDescription = ({ product }) => {
//   const [active, setActive] = useState(
//     product?.specifications?.length > 0 ? "specification" : "description"
//   );
//   return (
//     <>
//       {(product?.description || product?.specifications) && (
//         <div className="mb-6">
//           <div className="border  ">
//             <div className="flex items-center m-4 mt-6 gap-4 ">
//               {product?.specifications?.length > 0 && (
//                 <Button
//                   className="rounded-lx shadow shadow-primaryVariant-100 "
//                   variant={active === "specification" ? "default" : "outline"}
//                   onClick={() => setActive("specification")}
//                 >
//                   Specification
//                 </Button>
//               )}
//               {product?.description?.length > 0 && (
//                 <Button
//                   className="rounded-lx shadow shadow-primaryVariant-100 "
//                   variant={active === "description" ? "default" : "outline"}
//                   onClick={() => setActive("description")}
//                 >
//                   Description
//                 </Button>
//               )}
//             </div>
//             <hr className="mx-4" />
//             {active === "specification" && (
//               <div className="my-8 px-8">
//                 <div className="overflow-x-auto   shadow-md">
//                   <table className="w-full text-sm text-left text-gray-700 border border-gray-300">
//                     <thead className="text-sm text-gray-700 uppercase bg-gray-100">
//                       <tr>
//                         <th className="px-4 py-3 border">Specification Name</th>
//                         <th className="px-4 py-3 border">Details</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {product?.specifications?.map((specification, i) => (
//                         <tr
//                           key={specification._id}
//                           className={`border-t ${
//                             i % 2 === 0 ? "bg-white" : "bg-gray-50"
//                           }`}
//                         >
//                           <td className="px-4 py-3 border font-medium text-gray-800">
//                             {
//                               specification?.specification_id
//                                 ?.specification_name
//                             }
//                           </td>

//                           <td className="px-4 py-3 border">
//                             {specification?.specification_id?.specification_values
//                               ?.map((value) => value?.specification_value_name)
//                               .join(", ")}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//             {active === "description" && (
//               <div className="p-4">
//                 <p
//                   className="mx-6 text-text-Lighter"
//                   dangerouslySetInnerHTML={{ __html: product?.description }}
//                 ></p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default ProductDescription;

//  <div className="mb-6">
//    <div className="border  ">
//      <h2
//        className="text-xl sm:text-2xl  pt-6 px-6  font-bold  text-gray-800"
//        style={{
//          fontFamily: yatra.style.fontFamily,
//        }}
//      >
//        Product <span className="text-primaryVariant-500">Description</span>
//      </h2>
//      <hr className="mx-6 mt-2" />
//      <div className="p-4">
//        <p
//          className="mx-6 text-text-Lighter"
//          dangerouslySetInnerHTML={{ __html: product?.description }}
//        ></p>
//      </div>
//    </div>
//  </div>;
