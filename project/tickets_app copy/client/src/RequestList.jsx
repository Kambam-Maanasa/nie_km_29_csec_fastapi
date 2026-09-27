import { useEffect, useState } from "react";

import {
    getRequests,
    deleteRequest,
    nurseUpdateRequest,
    doctorUpdateRequest,
    staffUpdateRequest,
    updateRequestStatus
} from "./api";


function RequestList() {

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState(null);

    const [editData, setEditData] = useState({});


    // Get logged-in user's role

    const role = Number(
        localStorage.getItem("role")
    );


    // =================================================
    // LOAD REQUESTS
    // =================================================

    async function loadRequests() {

        try {

            const data = await getRequests();

            setRequests(data);

        } catch (error) {

            alert(error.message);

        } finally {

            setLoading(false);
        }
    }


    // =================================================
    // DELETE REQUEST
    // =================================================

    async function handleDelete(id) {

        const confirmed = window.confirm(
            "Are you sure you want to delete this resolved request?"
        );


        if (!confirmed) {

            return;
        }


        try {

            await deleteRequest(id);

            alert(
                "Request deleted successfully"
            );

            loadRequests();

        } catch (error) {

            alert(error.message);
        }
    }


    // =================================================
    // UPDATE STATUS
    // =================================================

    async function handleStatusChange(
        requestId,
        newStatus
    ) {

        try {

            await updateRequestStatus(
                requestId,
                newStatus
            );

            setRequests(
                (previousRequests) =>
                    previousRequests.map(
                        (request) =>
                            request.id === requestId
                                ? {
                                    ...request,
                                    status: newStatus
                                }
                                : request
                    )
            );

            alert(
                "Status updated successfully!"
            );

        } catch (error) {

            alert(error.message);
        }
    }


    // =================================================
    // START EDIT
    // =================================================

    function startEdit(request) {

        setEditingId(request.id);

        setEditData({

            patient_id:
                request.patient_id,

            patient_name:
                request.patient_name,

            department:
                request.department,

            request_type:
                request.request_type,

            description:
                request.description,

            priority:
                request.priority,

            prescription:
                request.prescription || "",

            doctor_notes:
                request.doctor_notes || "",

            staff_update:
                request.staff_update || "",

            status:
                request.status
        });
    }


    // =================================================
    // CANCEL EDIT
    // =================================================

    function cancelEdit() {

        setEditingId(null);

        setEditData({});
    }


    // =================================================
    // HANDLE EDIT FIELD
    // =================================================

    function handleEditChange(e) {

        setEditData({

            ...editData,

            [e.target.name]:
                e.target.value
        });
    }


    // =================================================
    // SAVE EDIT
    // =================================================

    async function saveEdit(requestId) {

        try {

            // -----------------------------------------
            // NURSE
            // -----------------------------------------

            if (role === 1) {

                await nurseUpdateRequest(
                    requestId,
                    {
                        patient_id:
                            editData.patient_id,

                        patient_name:
                            editData.patient_name,

                        department:
                            editData.department,

                        request_type:
                            editData.request_type,

                        description:
                            editData.description,

                        priority:
                            editData.priority
                    }
                );
            }


            // -----------------------------------------
            // DOCTOR
            // -----------------------------------------

            else if (role === 2) {

                await doctorUpdateRequest(
                    requestId,
                    {
                        description:
                            editData.description,

                        priority:
                            editData.priority,

                        prescription:
                            editData.prescription,

                        doctor_notes:
                            editData.doctor_notes
                    }
                );
            }


            // -----------------------------------------
            // DEPARTMENT STAFF
            // -----------------------------------------

            else if (role === 3) {

                await staffUpdateRequest(
                    requestId,
                    {
                        staff_update:
                            editData.staff_update,

                        status:
                            editData.status
                    }
                );
            }


            // -----------------------------------------
            // ADMIN
            // -----------------------------------------

            else if (role === 4) {

                await nurseUpdateRequest(
                    requestId,
                    {
                        patient_id:
                            editData.patient_id,

                        patient_name:
                            editData.patient_name,

                        department:
                            editData.department,

                        request_type:
                            editData.request_type,

                        description:
                            editData.description,

                        priority:
                            editData.priority
                    }
                );
            }


            alert(
                "Request updated successfully"
            );


            setEditingId(null);

            setEditData({});

            loadRequests();

        } catch (error) {

            alert(error.message);
        }
    }


    // =================================================
    // LOAD WHEN PAGE OPENS
    // =================================================

    useEffect(() => {

        loadRequests();

    }, []);


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (

            <div>

                <h2>
                    Hospital Support Requests
                </h2>

                <p>
                    Loading requests...
                </p>

            </div>
        );
    }


    // =================================================
    // REQUEST LIST
    // =================================================

    return (

        <div className="container">

            <h2>
                Hospital Support Requests
            </h2>


            {requests.length === 0 ? (

                <p>
                    No support requests found.
                </p>

            ) : (

                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Patient ID
                                </th>

                                <th>
                                    Patient Name
                                </th>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Request Type
                                </th>

                                <th>
                                    Description
                                </th>

                                <th>
                                    Priority
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Prescription
                                </th>

                                <th>
                                    Doctor Notes
                                </th>

                                <th>
                                    Staff Update
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {requests.map(
                                (request) => (

                                    <tr
                                        key={request.id}
                                    >

                                        {/* ===================== */}
                                        {/* PATIENT ID */}
                                        {/* ===================== */}

                                        <td>

                                            {editingId === request.id &&
                                            role === 1 ? (

                                                <input
                                                    name="patient_id"
                                                    value={
                                                        editData.patient_id
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                />

                                            ) : (

                                                request.patient_id

                                            )}

                                        </td>


                                        {/* ===================== */}
                                        {/* PATIENT NAME */}
                                        {/* ===================== */}

                                        <td>

                                            {editingId === request.id &&
                                            role === 1 ? (

                                                <input
                                                    name="patient_name"
                                                    value={
                                                        editData.patient_name
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                />

                                            ) : (

                                                request.patient_name

                                            )}

                                        </td>


                                        {/* ===================== */}
                                        {/* DEPARTMENT */}
                                        {/* ===================== */}

                                        <td>

                                            {editingId === request.id &&
                                            role === 1 ? (

                                                <input
                                                    name="department"
                                                    value={
                                                        editData.department
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                />

                                            ) : (

                                                request.department

                                            )}

                                        </td>


                                        {/* ===================== */}
                                        {/* REQUEST TYPE */}
                                        {/* ===================== */}

                                        <td>

                                            {editingId === request.id &&
                                            role === 1 ? (

                                                <input
                                                    name="request_type"
                                                    value={
                                                        editData.request_type
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                />

                                            ) : (

                                                request.request_type

                                            )}

                                        </td>


                                        {/* ===================== */}
                                        {/* DESCRIPTION */}
                                        {/* ===================== */}

                                        <td>

                                            {editingId === request.id &&
                                            (
                                                role === 1 ||
                                                role === 2
                                            ) ? (

                                                <textarea
                                                    name="description"
                                                    value={
                                                        editData.description
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                />

                                            ) : (

                                                request.description

                                            )}

                                        </td>


                                        {/* ===================== */}
                                        {/* PRIORITY */}
                                        {/* ===================== */}

                                        <td>

                                            {editingId === request.id &&
                                            (
                                                role === 1 ||
                                                role === 2
                                            ) ? (

                                                <select
                                                    name="priority"
                                                    value={
                                                        editData.priority
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                >

                                                    <option value="LOW">
                                                        LOW
                                                    </option>

                                                    <option value="MEDIUM">
                                                        MEDIUM
                                                    </option>

                                                    <option value="HIGH">
                                                        HIGH
                                                    </option>

                                                    <option value="CRITICAL">
                                                        CRITICAL
                                                    </option>

                                                </select>

                                            ) : (

                                                request.priority

                                            )}

                                        </td>


                                        {/* ===================== */}
                                        {/* STATUS */}
                                        {/* ===================== */}

                                        <td>

                                            <select
                                                value={
                                                    request.status ||
                                                    "Open"
                                                }
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        request.id,
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                <option value="Open">
                                                    Open
                                                </option>

                                                <option value="In Progress">
                                                    In Progress
                                                </option>

                                                <option value="On Hold">
                                                    On Hold
                                                </option>

                                                <option value="Resolved">
                                                    Resolved
                                                </option>

                                                <option value="Closed">
                                                    Closed
                                                </option>

                                            </select>

                                        </td>


                                        {/* ===================== */}
                                        {/* PRESCRIPTION */}
                                        {/* ===================== */}

                                        <td>

                                            {editingId === request.id &&
                                            role === 2 ? (

                                                <textarea
                                                    name="prescription"
                                                    placeholder="Enter prescription"
                                                    value={
                                                        editData.prescription
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                />

                                            ) : (

                                                request.prescription ||
                                                "-"

                                            )}

                                        </td>


                                        {/* ===================== */}
                                        {/* DOCTOR NOTES */}
                                        {/* ===================== */}

                                        <td>

                                            {editingId === request.id &&
                                            role === 2 ? (

                                                <textarea
                                                    name="doctor_notes"
                                                    placeholder="Enter doctor notes"
                                                    value={
                                                        editData.doctor_notes
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                />

                                            ) : (

                                                request.doctor_notes ||
                                                "-"

                                            )}

                                        </td>


                                        {/* ===================== */}
                                        {/* STAFF UPDATE */}
                                        {/* ===================== */}

                                        <td>

                                            {editingId === request.id &&
                                            role === 3 ? (

                                                <textarea
                                                    name="staff_update"
                                                    placeholder="Enter staff update"
                                                    value={
                                                        editData.staff_update
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                />

                                            ) : (

                                                request.staff_update ||
                                                "-"

                                            )}

                                        </td>


                                        {/* ===================== */}
                                        {/* ACTIONS */}
                                        {/* ===================== */}

                                        <td>

                                            {/* ================= */}
                                            {/* NURSE */}
                                            {/* ================= */}

                                            {role === 1 && (

                                                <>

                                                    {editingId === request.id ? (

                                                        <>

                                                            <button
                                                                onClick={() =>
                                                                    saveEdit(
                                                                        request.id
                                                                    )
                                                                }
                                                            >
                                                                Save
                                                            </button>

                                                            <button
                                                                onClick={
                                                                    cancelEdit
                                                                }
                                                            >
                                                                Cancel
                                                            </button>

                                                        </>

                                                    ) : (

                                                        <button
                                                            onClick={() =>
                                                                startEdit(
                                                                    request
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                    )}


                                                    {request.status ===
                                                        "Resolved" && (

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    request.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    )}

                                                </>

                                            )}


                                            {/* ================= */}
                                            {/* DOCTOR */}
                                            {/* ================= */}

                                            {role === 2 && (

                                                <>

                                                    {editingId === request.id ? (

                                                        <>

                                                            <button
                                                                onClick={() =>
                                                                    saveEdit(
                                                                        request.id
                                                                    )
                                                                }
                                                            >
                                                                Save
                                                            </button>

                                                            <button
                                                                onClick={
                                                                    cancelEdit
                                                                }
                                                            >
                                                                Cancel
                                                            </button>

                                                        </>

                                                    ) : (

                                                        <button
                                                            onClick={() =>
                                                                startEdit(
                                                                    request
                                                                )
                                                            }
                                                        >
                                                            Edit Clinical Info
                                                        </button>

                                                    )}

                                                </>

                                            )}


                                            {/* ================= */}
                                            {/* DEPARTMENT STAFF */}
                                            {/* ================= */}

                                            {role === 3 && (

                                                <>

                                                    {editingId === request.id ? (

                                                        <>

                                                            <button
                                                                onClick={() =>
                                                                    saveEdit(
                                                                        request.id
                                                                    )
                                                                }
                                                            >
                                                                Save
                                                            </button>

                                                            <button
                                                                onClick={
                                                                    cancelEdit
                                                                }
                                                            >
                                                                Cancel
                                                            </button>

                                                        </>

                                                    ) : (

                                                        <button
                                                            onClick={() =>
                                                                startEdit(
                                                                    request
                                                                )
                                                            }
                                                        >
                                                            Update Request
                                                        </button>

                                                    )}

                                                </>

                                            )}


                                            {/* ================= */}
                                            {/* ADMIN */}
                                            {/* ================= */}

                                            {role === 4 && (

                                                <>

                                                    {editingId === request.id ? (

                                                        <>

                                                            <button
                                                                onClick={() =>
                                                                    saveEdit(
                                                                        request.id
                                                                    )
                                                                }
                                                            >
                                                                Save
                                                            </button>

                                                            <button
                                                                onClick={
                                                                    cancelEdit
                                                                }
                                                            >
                                                                Cancel
                                                            </button>

                                                        </>

                                                    ) : (

                                                        <button
                                                            onClick={() =>
                                                                startEdit(
                                                                    request
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                    )}


                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                request.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </>

                                            )}


                                            {/* ================= */}
                                            {/* PATIENT */}
                                            {/* ================= */}

                                            {role === 5 && (

                                                <span>
                                                    Read Only
                                                </span>

                                            )}

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}

export default RequestList;