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

        return {
            success: true,
            user
        };
    }
    catch(error) {
        return {
            success: false,
            message: "Login failed"
        }
    }
}