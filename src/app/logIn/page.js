"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { mutate } from "swr";
import {
    Button,
    TextField,
    Typography,
    Card,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
});

const LoginPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        try {
            const res = await axios.post("/api/auth/login", data , { withCredentials: true });

            mutate("/api/auth/me", { user: res.data.user }, false);

            router.push("/");
        } catch (error) {
            console.log("Login failed", error);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
            <Card className="p-8 w-full max-w-md shadow-xl rounded-2xl space-y-6">
                <div className="text-center space-y-2">
                    <Typography variant="h4" className="font-bold">
                        Welcome Back 👋
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Login to continue to your dashboard
                    </Typography>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex gap-2 flex-col">
                    <TextField
                        label="Email"
                        {...register("email")}
                        fullWidth
                        variant="outlined"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />

                    <TextField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        fullWidth
                        variant="outlined"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        className="rounded-lg"
                    >
                        Login
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default LoginPage;
