import { useState } from "react";
import { register } from "./api";

function Register({ onRegistered }) {

    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");

    const [role, setRole] = useState(5);


    async function handleRegister(e) {

        e.preventDefault();

        try {

            await register({
                username: username,
                password: password,
                role: Number(role)
            });

            alert("Registration successful!");

            setUsername("");

            setPassword("");

            setRole(5);

            onRegistered();

        } catch (error) {

            alert(error.message);
        }
    }


    return (

        <div className="form-container">

            <h1>🏥 Hospital Support System</h1>

            <h2>Register</h2>


            <form onSubmit={handleRegister}>

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


                <label>Register As</label>

                <select
                    value={role}
                    onChange={(e) =>
                        setRole(e.target.value)
                    }
                >

                    <option value="5">
                        Patient
                    </option>

                    <option value="1">
                        Nurse
                    </option>

                    <option value="2">
                        Doctor
                    </option>

                    <option value="3">
                        Department Staff
                    </option>

                    <option value="4">
                        Admin
                    </option>

                </select>


                <button type="submit">
                    Register
                </button>

            </form>


            <p>
                Already have an account?
            </p>


            <button
                type="button"
                onClick={onRegistered}
            >
                Back to Login
            </button>

        </div>
    );
}

export default Register;