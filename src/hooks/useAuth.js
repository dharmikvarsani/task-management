import useSWR from "swr";
import axios from "axios";

const fetcher = (url) => axios.get(url, { withCredentials: true }).then((res) => res.data);

export const useAuth = () => {
  const { data, error, mutate } = useSWR("/api/auth/me", fetcher);

  return {
    user: data?.user || null,
    loading: !data && !error,
    error,
    mutate,
  };
};
