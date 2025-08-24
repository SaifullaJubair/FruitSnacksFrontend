import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../utils/baseURL";

const useCategoriesQuery = () => {
  return useQuery({
    queryKey: [`/api/v1/category`],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/category`);
      const data = await res.json();
      return data;
    },
  });
};

export default useCategoriesQuery;
