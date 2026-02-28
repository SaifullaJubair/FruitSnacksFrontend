"use client";
import { isVideo } from "@/utils/helper";
import Image from "next/image";
import { useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";

const ProductPhotoSelect = ({ product, variationProduct }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Determine the main media to display
  const mainMedia = selectedVideo
    ? selectedVideo // User-selected video takes precedence
    : selectedImage
    ? selectedImage // User-selected image takes precedence
    : variationProduct
    ? variationProduct?.variation_video
      ? variationProduct?.variation_video
      : variationProduct?.variation_image
      ? variationProduct?.variation_image
      : product?.main_video
      ? product?.main_video
      : product?.main_image
    : product?.main_video
    ? product?.main_video
    : product?.main_image; // Fallback to main video or image

  return (
    <PhotoProvider>
      <div className="">
        {/* Main media display (video or image) */}
        <div className=" w-full  aspect-[2/3] relative">
          {isVideo(mainMedia) ? (
            <video
              src={mainMedia}
              loop
              controls
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <PhotoView src={mainMedia}>
              <Image
                src={mainMedia}
                alt="product"
                fill
                className="w-full h-full object-cover cursor-zoom-in"
              />
            </PhotoView>
          )}
        </div>

        {/* Thumbnails for other images and videos */}
        <div className="flex overflow-x-auto cursor-pointer scrollbar-thin my-2">
          {/* Variation video or image thumbnail (if variation is selected) */}
          {variationProduct &&
            (variationProduct?.variation_video ||
              variationProduct?.variation_image) && (
              <div
                className={`h-16 w-16 border p-1 mr-2 my-2 relative ${
                  mainMedia === variationProduct?.variation_video ||
                  mainMedia === variationProduct?.variation_image
                    ? "border-primary"
                    : "border-gray-200"
                }`}
                onClick={() => {
                  setSelectedVideo(null);
                  setSelectedImage(null); // Reset user selections to show variation media
                }}
              >
                {isVideo(variationProduct?.variation_video) ? (
                  <video
                    src={variationProduct?.variation_video}
                    className="h-full w-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={variationProduct?.variation_image}
                    alt="variation"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            )}

          {/* Main video thumbnail (if no variation is selected) */}
          {!variationProduct && product?.main_video && (
            <div
              className={`h-16 w-16 border p-1 mr-2 my-2 relative ${
                selectedVideo === product.main_video
                  ? "border-primary"
                  : "border-gray-200"
              }`}
              onClick={() => {
                setSelectedVideo(product.main_video);
                setSelectedImage(null);
              }}
            >
              <video
                src={product.main_video}
                className="h-full w-full object-cover"
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Other images */}
          {product?.other_images &&
            product?.other_images.map((item, index) => (
              <img
                key={index}
                src={item?.other_image}
                alt={`image-${index}`}
                className={`h-16 w-16 border p-1 mr-2 my-2 ${
                  selectedImage === item?.other_image
                    ? "border-primary"
                    : "border-gray-200"
                }`}
                onClick={() => {
                  setSelectedImage(item?.other_image);
                  setSelectedVideo(null);
                }}
              />
            ))}
        </div>
      </div>
    </PhotoProvider>
  );
};

export default ProductPhotoSelect;

// "use client";
// import { isVideo } from "@/utils/helper";
// import { useState } from "react";
// import { PhotoProvider, PhotoView } from "react-photo-view";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Pagination, Autoplay } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/pagination";
// const ProductPhotoSelect = ({ product, variationProduct }) => {
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [selectedVideo, setSelectedVideo] = useState(null);

//   // Determine the main media to display
//   const mainMedia = selectedVideo
//     ? selectedVideo // User-selected video takes precedence
//     : selectedImage
//     ? selectedImage // User-selected image takes precedence
//     : variationProduct
//     ? variationProduct?.variation_video || variationProduct?.variation_image // Variation media
//     : product?.main_video || product?.main_image; // Fallback to main video or image

//   const mediaItems = [
//     ...(variationProduct
//       ? [variationProduct.variation_video || variationProduct.variation_image]
//       : []),
//     ...(product?.main_video ? [product.main_video] : []),
//     ...(product?.other_images?.map((item) => item.other_image) || []),
//   ].filter(Boolean);
//   return (
//     <PhotoProvider>
//       <div className="">
//         {/* Main media display (video or image) */}
//         <div className="hidden md:block">
//           <div className="w-full lg:h-[382px] md:h-[272px] sm:h-[353px] xl:h-[450px] relative">
//             {isVideo(mainMedia) ? (
//               <video
//                 src={mainMedia}
//                 loop
//                 controls
//                 muted
//
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <PhotoView src={mainMedia}>
//                 <img
//                   src={mainMedia}
//                   alt="product"
//                   className="w-full h-full object-cover cursor-zoom-in"
//                 />
//               </PhotoView>
//             )}
//           </div>

//           {/* Thumbnails for other images and videos */}
//           <div className="flex overflow-x-auto cursor-pointer scrollbar-thin my-2">
//             {/* Variation video or image thumbnail (if variation is selected) */}
//             {variationProduct && (
//               <div
//                 className={`h-16 w-16 border p-1 mr-2 my-2 relative ${
//                   mainMedia === variationProduct?.variation_video ||
//                   mainMedia === variationProduct?.variation_image
//                     ? "border-primary"
//                     : "border-gray-200"
//                 }`}
//                 onClick={() => {
//                   setSelectedVideo(null);
//                   setSelectedImage(null); // Reset user selections to show variation media
//                 }}
//               >
//                 {isVideo(variationProduct?.variation_video) ? (
//                   <video
//                     src={variationProduct?.variation_video}
//                     className="h-full w-full object-cover"
//                     muted
//                   />
//                 ) : (
//                   <img
//                     src={variationProduct?.variation_image}
//                     alt="variation"
//                     className="h-full w-full object-cover"
//                   />
//                 )}
//               </div>
//             )}

//             {/* Main video thumbnail (if no variation is selected) */}
//             {!variationProduct && product?.main_video && (
//               <div
//                 className={`h-16 w-16 border p-1 mr-2 my-2 relative ${
//                   selectedVideo === product.main_video
//                     ? "border-primary"
//                     : "border-gray-200"
//                 }`}
//                 onClick={() => {
//                   setSelectedVideo(product.main_video);
//                   setSelectedImage(null); // Clear selected image when video is clicked
//                 }}
//               >
//                 <video
//                   src={product.main_video}
//                   className="h-full w-full object-cover"
//                   muted
//                 />
//                 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6 text-white"
//                     viewBox="0 0 24 24"
//                     fill="currentColor"
//                   >
//                     <path d="M8 5v14l11-7z" />
//                   </svg>
//                 </div>
//               </div>
//             )}

//             {/* Other images */}
//             {!variationProduct &&
//               product?.other_images &&
//               product?.other_images.map((item, index) => (
//                 <img
//                   key={index}
//                   src={item?.other_image}
//                   alt={`image-${index}`}
//                   className={`h-16 w-16 border p-1 mr-2 my-2 ${
//                     selectedImage === item?.other_image
//                       ? "border-primary"
//                       : "border-gray-200"
//                   }`}
//                   onClick={() => {
//                     setSelectedImage(item?.other_image);
//                     setSelectedVideo(null); // Clear selected video when image is clicked
//                   }}
//                 />
//               ))}
//           </div>
//         </div>
//         <div className="md:hidden">
//           <Swiper
//             modules={[Pagination, Autoplay]}
//             autoplay={{ delay: 5000, disableOnInteraction: false }}
//             pagination={{ clickable: true }}
//             loop={true}
//             spaceBetween={10}
//             slidesPerView={1}
//             className="w-full"
//           >
//             {mediaItems.map((item, index) => (
//               <SwiperSlide key={index}>
//                 {isVideo(item) ? (
//                   <video
//                     src={item}
//                     loop
//                     controls
//                     muted
//
//                     className="w-full h-[350px] object-cover"
//                   />
//                 ) : (
//                   <PhotoView src={item}>
//                     <img
//                       src={item}
//                       alt={`image-${index}`}
//                       className="w-full h-[350px] object-cover"
//                     />
//                   </PhotoView>
//                 )}
//               </SwiperSlide>
//             ))}
//           </Swiper>
//         </div>
//       </div>
//     </PhotoProvider>
//   );
// };

// export default ProductPhotoSelect;
