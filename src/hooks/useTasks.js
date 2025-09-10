
import axios from "axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url,{ withCredentials: true }).then((res) => res.data);


export const useTasks = (status = '') => {
    const url = status ? `/api/task?status=${status}` : '/api/task';
    const { data, error, mutate, isLoading } = useSWR(url, fetcher);

    return {
        tasks: data?.out || [],
        isLoading,
        isError: error,
        mutate
    }
}

export const createTask = async (payload) => {
    const res = await axios.post('/api/task', payload , { withCredentials: true });
    return res.data;
}

export const updateTaskStatus = async (id, status) => {
    const res = await axios.put(`/api/task/${id}/status`, { status }, { withCredentials: true });
    return res.data;
}


export const deleteTask = async (id) => {
    const res = await axios.delete(`/api/task/${id}`, { withCredentials: true });
    return res.data;
};

export const reassignTask = async (id, payload) => {
    const res = await axios.put(`/api/task/${id}/reassign`, payload , { withCredentials: true }); ;
    return res.data;
}

