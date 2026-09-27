const API_URL = "https://hospital-support-backend.onrender.com";


// =====================================================
// REGISTER
// =====================================================

export async function register(user) {

    const response = await fetch(
        `${API_URL}/register`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(user)
        }
    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.detail || "Registration failed"
        );
    }

    return data;
}


// =====================================================
// LOGIN
// =====================================================

export async function login(username, password) {

    const formData = new URLSearchParams();

    formData.append(
        "username",
        username
    );

    formData.append(
        "password",
        password
    );


    const response = await fetch(
        `${API_URL}/login`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },

            body: formData
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail || "Login failed"
        );
    }


    // Save JWT token

    localStorage.setItem(
        "token",
        data.access_token
    );


    // Save logged-in user's role

    localStorage.setItem(
        "role",
        data.role
    );


    // Save username

    localStorage.setItem(
        "username",
        data.username
    );


    return data;
}


// =====================================================
// CREATE REQUEST
// =====================================================
// Only Patient can use this successfully.
// Backend checks the role.
// =====================================================

export async function createRequest(request) {

    const token =
        localStorage.getItem("token");


    const response = await fetch(
        `${API_URL}/requests`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${token}`
            },

            body: JSON.stringify(request)
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            typeof data.detail === "string"
                ? data.detail
                : "Failed to create request"
        );
    }


    return data;
}


// =====================================================
// GET ALL REQUESTS
// =====================================================
// All logged-in roles can read requests.
// =====================================================

export async function getRequests() {

    const token =
        localStorage.getItem("token");


    const response = await fetch(
        `${API_URL}/requests`,
        {
            method: "GET",

            headers: {
                "Authorization":
                    `Bearer ${token}`
            }
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Failed to get requests"
        );
    }


    return data;
}


// =====================================================
// GET ONE REQUEST
// =====================================================

export async function getRequest(id) {

    const token =
        localStorage.getItem("token");


    const response = await fetch(
        `${API_URL}/requests/${id}`,
        {
            method: "GET",

            headers: {
                "Authorization":
                    `Bearer ${token}`
            }
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Failed to get request"
        );
    }


    return data;
}


// =====================================================
// NURSE UPDATE
// =====================================================
// Nurse can update basic request information.
// =====================================================

export async function nurseUpdateRequest(
    id,
    request
) {

    const token =
        localStorage.getItem("token");


    const response = await fetch(
        `${API_URL}/requests/${id}/nurse`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${token}`
            },

            body: JSON.stringify(request)
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Failed to update request"
        );
    }


    return data;
}


// =====================================================
// DOCTOR UPDATE
// =====================================================
// Doctor can update:
// - Description
// - Priority
// - Prescription
// - Doctor notes
// =====================================================

export async function doctorUpdateRequest(
    id,
    request
) {

    const token =
        localStorage.getItem("token");


    const response = await fetch(
        `${API_URL}/requests/${id}/doctor`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${token}`
            },

            body: JSON.stringify(request)
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Failed to update doctor information"
        );
    }


    return data;
}


// =====================================================
// DEPARTMENT STAFF UPDATE
// =====================================================
// Department staff can update:
// - Staff update
// - Status
//
// Status can be:
// - In Progress
// - Resolved
// =====================================================

export async function staffUpdateRequest(
    id,
    request
) {

    const token =
        localStorage.getItem("token");


    const response = await fetch(
        `${API_URL}/requests/${id}/staff`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${token}`
            },

            body: JSON.stringify(request)
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Failed to update staff information"
        );
    }


    return data;
}


// =====================================================
// DELETE REQUEST
// =====================================================
// Nurse can delete ONLY resolved requests.
// Admin can delete requests.
// Backend enforces this.
// =====================================================

export async function deleteRequest(id) {

    const token =
        localStorage.getItem("token");


    const response = await fetch(
        `${API_URL}/requests/${id}`,
        {
            method: "DELETE",

            headers: {
                "Authorization":
                    `Bearer ${token}`
            }
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Failed to delete request"
        );
    }


    return data;
}
// =====================================================
// UPDATE STATUS
// =====================================================
// All logged-in roles can update only the status.
// =====================================================

export async function updateRequestStatus(
    id,
    status
) {

    const token =
        localStorage.getItem("token");


    const response = await fetch(
        `${API_URL}/requests/${id}/status`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${token}`
            },

            body: JSON.stringify({
                status: status
            })
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Failed to update status"
        );
    }


    return data;
}