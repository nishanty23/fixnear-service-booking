import { registerUser } from "../../services/authService";

export const register = async (name, email, password) => {
    try {
        const response = await registerUser(name, email, password);

        return {
            success: true,
            user: response.data.user
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Registration failed"
        };
    }
};
