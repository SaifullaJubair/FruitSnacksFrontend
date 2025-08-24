"use client";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../utils/baseURL";

const useGetZoneData = (city_id) => {
  return useQuery({
    queryKey: [`/api/v1/setting/zone?city_id=${city_id}`],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/setting/zone?city_id=${city_id}`);
      const data = await res.json();
      return data;
    },
  });
};

export default useGetZoneData;
