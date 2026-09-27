import { useState } from "react";

import Login from "./Login";
import Register from "./Register";
import RequestForm from "./RequestForm";
import RequestList from "./RequestList";


function App() {

    // =================================================
    // CHECK LOGIN
    // =================================================

    const [loggedIn, setLoggedIn] = useState(
        !!localStorage.getItem("token")
    );


    // =================================================
    // CHECK ROLE
    // =================================================

    const [role, setRole] = useState(
        Number(localStorage.getItem("role"))
    );


    // =================================================
    // REGISTER SCREEN
    // =================================================

    const [showRegister, setShowRegister] =
        useState(false);


    // =================================================
    // NOT LOGGED IN
    // =================================================

    if (!loggedIn) {

        // Show Register page

        if (showRegister) {

            return (

                <Register
                    onRegistered={() =>
                        setShowRegister(false)
                    }
                />

            );
        }


        // Show Login page

        return (

            <Login

                onLogin={() => {

                    // Get role saved by api.js

                    const userRole = Number(
                        localStorage.getItem("role")
                    );


                    setRole(userRole);

                    setLoggedIn(true);
                }}


                onRegister={() =>
                    setShowRegister(true)
                }

            />

        );
    }


    // =================================================
    // LOGGED-IN USER
    // =================================================

    return (

        <div className="app">


            {/* ========================================= */}
            {/* HEADER */}
            {/* ========================================= */}

            <header>

                <h1>
                    🏥 Hospital Support Request System
                </h1>


                <div>

                    <span>
                        {getRoleName(role)}
                    </span>


                    <button
                        onClick={() => {

                            // Remove login information

                            localStorage.removeItem(
                                "token"
                            );

                            localStorage.removeItem(
                                "role"
                            );

                            localStorage.removeItem(
                                "username"
                            );


                            // Return to login

                            setLoggedIn(false);

                            setRole(null);

                        }}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* ========================================= */}
            {/* MAIN CONTENT */}
            {/* ========================================= */}

            <main>


                {/* ===================================== */}
                {/* PATIENT */}
                {/* ===================================== */}

                {true && (

                    <>

                        <RequestForm
                            onCreated={() => {

                                window.location.reload();

                            }}
                        />

                        <hr />

                    </>

                )}


                {/* ===================================== */}
                {/* ALL ROLES CAN READ REQUESTS */}
                {/* ===================================== */}

                <RequestList />

            </main>

        </div>
    );
}


// =====================================================
// ROLE NAME
// =====================================================

function getRoleName(role) {

    switch (role) {

        case 1:
            return "👩‍⚕️ Nurse";

        case 2:
            return "👨‍⚕️ Doctor";

        case 3:
            return "🏥 Department Staff";

        case 4:
            return "👑 Admin";

        case 5:
            return "👤 Patient";

        default:
            return "User";
    }
}


export default App;