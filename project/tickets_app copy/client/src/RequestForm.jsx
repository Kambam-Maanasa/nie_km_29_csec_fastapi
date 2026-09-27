import { useState } from "react";
import { createRequest } from "./api";

function RequestForm({ onCreated }) {

    const [form, setForm] = useState({
        patient_id: "",
        patient_name: "",
        department: "",
        request_type: "",
        description: "",
        priority: "MEDIUM"
    });

    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function saveRequest(e) {
        e.preventDefault();

        if (
            !form.patient_id ||
            !form.patient_name ||
            !form.department ||
            !form.request_type ||
            !form.description
        ) {
            alert("Please fill all required fields");
            return;
        }

        try {
            setLoading(true);

            await createRequest(form);

            alert(
                "Hospital support request created successfully!"
            );

            setForm({
                patient_id: "",
                patient_name: "",
                department: "",
                request_type: "",
                description: "",
                priority: "MEDIUM"
            });

            if (onCreated) {
                onCreated();
            }

        } catch (error) {
            alert(error.message);

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="request-form">

            <h2>
                New Hospital Support Request
            </h2>

            <form onSubmit={saveRequest}>

                {/* Patient ID */}

                <label>
                    Patient ID
                </label>

                <input
                    type="text"
                    name="patient_id"
                    placeholder="Enter patient ID"
                    value={form.patient_id}
                    onChange={handleChange}
                    required
                />

                {/* Patient Name */}

                <label>
                    Patient Name
                </label>

                <input
                    type="text"
                    name="patient_name"
                    placeholder="Enter patient name"
                    value={form.patient_name}
                    onChange={handleChange}
                    required
                />

                {/* Department */}

                <label>
                    Department
                </label>

                <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                >
                    <option value="">
                        Select Department
                    </option>

                    <option value="Emergency">
                        Emergency
                    </option>

                    <option value="ICU">
                        ICU
                    </option>

                    <option value="OPD">
                        OPD
                    </option>

                    <option value="Pharmacy">
                        Pharmacy
                    </option>

                    <option value="Laboratory">
                        Laboratory
                    </option>

                    <option value="Radiology">
                        Radiology
                    </option>

                    <option value="Administration">
                        Administration
                    </option>
                </select>

                {/* Request Type */}

                <label>
                    Request Type
                </label>

                <select
                    name="request_type"
                    value={form.request_type}
                    onChange={handleChange}
                    required
                >
                    <option value="">
                        Select Request Type
                    </option>

                    <option value="IT Support">
                        IT Support
                    </option>

                    <option value="Medical Equipment">
                        Medical Equipment
                    </option>

                    <option value="Network">
                        Network
                    </option>

                    <option value="Software">
                        Software
                    </option>

                    <option value="Hardware">
                        Hardware
                    </option>

                    <option value="Maintenance">
                        Maintenance
                    </option>
                </select>

                {/* Description */}

                <label>
                    Description
                </label>

                <textarea
                    name="description"
                    placeholder="Describe the problem"
                    value={form.description}
                    onChange={handleChange}
                    required
                />

                {/* Priority */}

                <label>
                    Priority
                </label>

                <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
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

                {/* Status is automatically Open */}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Submitting..."
                        : "Submit Support Request"
                    }
                </button>

            </form>

        </div>
    );
}

export default RequestForm;