import axios from "axios";
import useSWR from "swr";


const fetcher = (url) => axios.get(url).then((res) => res.data);

export const useUsers = () => {
    const { data, error, mutate, isLoading } = useSWR("/api/auth/register", fetcher);

    return {
        users: data?.users || [],
        isLoading,
        isError: error,
        mutate,
    }
}


export const createUser = async (payload) => {
    const res = await axios.post("/api/auth/register", payload);
    return res.data;
}

export const updateUser = async (id, payload) => {
    const res = await axios.put(`/api/auth/register/${id}`, payload);
    return res.data;
}

export const deleteUser = async (id) => {
    const res = await axios.delete(`/api/auth/register/${id}`);
    return res.data;
}   