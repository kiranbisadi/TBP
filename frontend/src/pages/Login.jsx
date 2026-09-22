import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log("Login button clicked");
        console.log("Email:", email);

        try {
            const response = await api.post("/auth/login", {
                email: email,
                password: password,
            });

            console.log("Login response:", response.data);

            localStorage.setItem("token", response.data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/");
        } catch (error) {
            console.log("Login error:", error);

            setError(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center">

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white p-6 rounded-lg shadow"
            >

                <h1 className="text-3xl font-bold mb-6 text-center">
                    Login
                </h1>

                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full border p-3 mb-4 rounded"
                    required
                />

                <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full border p-3 mb-4 rounded"
                    required
                />

                {error && (
                    <p className="text-red-600 mb-4">
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full bg-red-600 text-white p-3 rounded"
                >
                    Login
                </button>

            </form>

        </div>
    );
}

export default Login;