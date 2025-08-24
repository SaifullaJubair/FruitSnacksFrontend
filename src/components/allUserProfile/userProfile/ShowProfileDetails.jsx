"use client";

import { useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import ProfileSetting from "./ProfileSetting";

const ShowProfileDetails = ({ userInfo, refetch }) => {
  const [userupdateModalOpen, setUserupdateModalOpen] = useState(false);
  const [userupdateModaldata, setUserupdateModaldata] = useState();

  //updateUser function
  const handleUpdateUser = () => {
    setUserupdateModalOpen(true);
    setUserupdateModaldata();
  };
  return (
    <div>
      <h4 className=" bg-primary  p-4 flex items-center gap-3 text-white mb-2">
        <FiSettings className=" text-2xl text-white" />
        <span>Profile Details</span>
      </h4>
      <div className="my-10 bg-slate-50 shadow relative">
        <button
          className="absolute right-5 top-5 flex items-center text-xl gap-2 font-semibold"
          onClick={() => handleUpdateUser()}
        >
          Edit <FaRegEdit size={30} className="hover:text-gray-500" />
        </button>
        <div className="p-10">
          {" "}
          <div className="mb-10 flex justify-center items-center md:justify-start">
            <img
              src={userInfo?.data?.user_image}
              alt=""
              className="w-[70px] h-[70px] object-cover "
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 text-xl md:text-2xl gap-4 md:gap-10">
            <p>
              {" "}
              <span className="font-medium"> Name : </span>{" "}
              {userInfo?.data?.user_name}
            </p>

            <p>
              {" "}
              <span className="font-medium"> Phone : </span>{" "}
              {userInfo?.data?.user_phone}
            </p>
            <p>
              <span className="font-medium">Country : </span> Bangladesh
            </p>
            <p>
              <span className="font-medium">Division : </span>{" "}
              {userInfo?.data?.user_division}
            </p>
            <p>
              <span className="font-medium">District : </span>{" "}
              {userInfo?.data?.user_district}
            </p>
            <p>
              <span className="font-medium">Address : </span>{" "}
              {userInfo?.data?.user_address}
            </p>
          </div>
        </div>
      </div>

      {userupdateModalOpen && (
        <ProfileSetting
          setUserupdateModalOpen={setUserupdateModalOpen}
          userInfo={userInfo}
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default ShowProfileDetails;
