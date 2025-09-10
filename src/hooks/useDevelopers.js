import axios from "axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url,{ withCredentials: true }).then((res) => res.data);


export const useDevelopers = () => {
    const { data, error, isLoading } = useSWR("/api/auth/register/developers", fetcher);
    return {
        developers: data?.users || [],
        isLoading,
        isError: error,
    };
}