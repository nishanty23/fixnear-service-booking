import api from "./api";

export const loginUser = (email, password) =>
    api.post("/user/auth/login", { email, password });

export const registerUser = (name, email, password) =>
    api.post("/user/auth/register", { name, email, password });

export const getProfile = () => api.get("/user/auth/me");

export const updateProfile = (name) =>
    api.put("/user/auth/profile", { name });

export const changePassword = (currentPassword, newPassword) =>
    api.put("/user/auth/change-password", { currentPassword, newPassword });

export const loginProvider = (email, password) =>
    api.post("/provider/auth/login", { email, password });

// Forgot Password APIs

export const forgotPassword = (email) =>
    api.post("/auth/forgot-password", { email });

export const verifyOTP = (email, otp) =>
    api.post("/auth/verify-otp", { email, otp });

export const resetPassword = (email, resetToken, newPassword) =>
    api.post("/auth/reset-password", {
        email,
        resetToken,
        newPassword
    });

export const registerProvider = (name, email, password, profile) =>
    api.post("/provider/auth/register", {
        name,
        email,
        password,
        ...profile
    });