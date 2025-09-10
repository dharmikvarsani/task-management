"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { updateUser } from "@/hooks/useUsers";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import { Edit } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

//  Zod schema
const editUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["manager", "tl", "developer"]),
  teamLead: z.string().optional(),
  isActive: z.boolean(),
});

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "developer",
    teamLead: "",
    isActive: true,
  });

  const [teamLeads, setTeamLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/auth/register/${id}`);
        setForm(prev => ({
          ...prev,
          ...res.data.user,
          teamLead: res.data.user.teamLead || "",
        }));
      } catch (error) {
        setModalMessage(error.response?.data?.message || "Error fetching user");
        setModalOpen(true);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchTeamLeads = async () => {
      try {
        const res = await axios.get("/api/auth/register?role=tl");
        setTeamLeads(res.data.users || []);
      } catch (error) {
        console.error("Error fetching team leads:", error);
      }
    };
    fetchTeamLeads();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({}); 

    // Validate with Zod
    const parsed = editUserSchema.safeParse(form);
    if (!parsed.success) {
      const errors = {};
      parsed.error.issues.forEach(issue => {
        if (issue.path && issue.path[0]) {
          errors[issue.path[0]] = issue.message;
        }
      });
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await updateUser(id, form);
      router.push("/users");
    } catch (error) {
      setModalMessage(error.response?.data?.message || "Error updating user");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex justify-center items-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900"
    >
      <Card className="w-full max-w-lg shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-100">
            <Edit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Edit User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-5">

            <TextField
              fullWidth
              label="Name"
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              variant="outlined"
              size="small"
              className="bg-white dark:bg-gray-900 rounded-lg"
              error={!!fieldErrors.name}
              helperText={fieldErrors.name || ""}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email || ""}
              onChange={handleChange}
              variant="outlined"
              size="small"
              className="bg-white dark:bg-gray-900 rounded-lg"
              error={!!fieldErrors.email}
              helperText={fieldErrors.email || ""}
            />

            <TextField
              select
              fullWidth
              label="Role"
              name="role"
              value={form.role || ""}
              onChange={handleChange}
              variant="outlined"
              size="small"
              className="bg-white dark:bg-gray-900 rounded-lg"
              error={!!fieldErrors.role}
              helperText={fieldErrors.role || ""}
            >
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="tl">Team Lead</MenuItem>
              <MenuItem value="developer">Developer</MenuItem>
            </TextField>

            {form.role === "developer" && (
              <TextField
                select
                fullWidth
                label="Assign Team Lead"
                name="teamLead"
                value={form.teamLead || ""}
                onChange={handleChange}
                variant="outlined"
                size="small"
                className="bg-white dark:bg-gray-900 rounded-lg"
                error={!!fieldErrors.teamLead}
                helperText={fieldErrors.teamLead || ""}
              >
                {teamLeads.length === 0 ? (
                  <MenuItem disabled>No Team Leads Found</MenuItem>
                ) : (
                  teamLeads.map((tl) => (
                    <MenuItem key={tl._id} value={tl._id}>
                      {tl.name} ({tl.email})
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={handleChange}
                  name="isActive"
                  color="primary"
                />
              }
              label="Active"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-base font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <CircularProgress size={20} className="text-white" />
              ) : (
                <>
                  <Edit className="w-4 h-4" /> Update User
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Modal for other errors */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="py-2">{modalMessage}</div>
          <DialogFooter>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
