"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function MyTeam() {
  const [team, setTeam] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const resUser = await axios.get("/api/auth/me", { withCredentials: true });
        setUser(resUser.data);

        const resTeam = await axios.get("/api/task/team", { withCredentials: true });
        setTeam(resTeam.data.team || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching team:", err);

        if (err.response?.status === 401) {
          setError("Please log in to view your team");
          router.push("/login");
        } else {
          setError(err.response?.data?.message || err.message || "Failed to fetch team data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [router]);

  if (loading) return <p className="p-4">Loading...</p>;

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Team</h1>
      {team.length === 0 ? (
        <p>No team members found</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-800">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {team.map((member) => (
              <tr key={member._id} className="border-t">
                <td className="p-2">{member.name}</td>
                <td className="p-2">{member.email}</td>
                <td className="p-2 capitalize">{member.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}