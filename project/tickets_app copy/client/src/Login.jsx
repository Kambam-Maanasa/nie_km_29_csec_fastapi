import { useState } from "react";
import { login } from "./api";

function Login({ onLogin, onRegister }) {

    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");


    async function handleLogin(e) {

        e.preventDefault();

        try {

            // Login API
            await login(username, password);

            alert("Login successful!");

            // Tell App.jsx that login was successful
            onLogin();

        } catch (error) {

            alert(error.message);
        }
    }


    return (

        <div className="form-container">

            <h1>
                🏥 Hospital Support System
            </h1>

            <h2>Login</h2>


            <form onSubmit={handleLogin}>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                    required
                />


                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    required
                />


                <button type="submit">
                    Login
                </button>

            </form>


            <p>
                Don't have an account?
            </p>


            <button
                type="button"
                onClick={onRegister}
            >
                Register
            </button>

        </div>
    );
}

export default Login;