import { loginUser } from "../../services/authService"

export const login = async (email, password) => {
    
    try {

        const response = await loginUser(email, password);
        const { token, user } = response.data;

        if(!token || !user) {
            throw new Error("Login response is missing")
        }

        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event("fixnear-auth-change"));

        return {
            success: true,
            user
        };
    }
    catch(error) {
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Login failed"
        }
    }
}