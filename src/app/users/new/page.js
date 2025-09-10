"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/hooks/useUsers";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField, MenuItem, CircularProgress, InputAdornment, IconButton } from "@mui/material";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["manager", "tl", "developer"]),
  teamLead: z.string().optional(),
});

export default function NewUserPage() {
  const [teamLeads, setTeamLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const router = useRouter();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "developer",
      teamLead: "",
    },
  });

  const role = watch("role");

  useEffect(() => {
    const fetchTeamLeads = async () => {
      try {
        const res = await axios.get("/api/auth/register?role=tl");
        setTeamLeads(res.data.users);
      } catch (error) {
        console.error("Error fetching team leads:", error);
      }
    };
    fetchTeamLeads();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await createUser(data);
      router.push("/users");
    } catch (error) {
      setErrorModal(error.response?.data?.message || "Error creating user");
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
      <Card className="w-full flex flex-col max-w-lg shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Create User
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex flex-col gap-5 mt-5">
            <TextField
              fullWidth
              label="Name"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              variant="outlined"
              size="small"
              className="bg-white dark:bg-gray-900 rounded-lg"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              variant="outlined"
              size="small"
              className="bg-white dark:bg-gray-900 rounded-lg"
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              variant="outlined"
              size="small"
              className="bg-white dark:bg-gray-900 rounded-lg"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <EyeOff /> : <Eye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              fullWidth
              label="Role"
              {...register("role")}
              variant="outlined"
              size="small"
              className="bg-white dark:bg-gray-900 rounded-lg"
            >
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="tl">Team Lead</MenuItem>
              <MenuItem value="developer">Developer</MenuItem>
            </TextField>

            {role === "developer" && (
              <TextField
                select
                fullWidth
                label="Assign Team Lead"
                {...register("teamLead")}
                variant="outlined"
                value={watch("teamLead") || ""}
                size="small"
                className="bg-white dark:bg-gray-900 rounded-lg"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-base font-medium flex items-center justify-center gap-2"
            >
              {loading ? <CircularProgress size={20} className="text-white" /> : <>
                <UserPlus className="w-4 h-4" /> Create User
              </>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Modal */}
      <Dialog open={!!errorModal} onOpenChange={() => setErrorModal("")}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{errorModal}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setErrorModal("")}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
