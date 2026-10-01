import { useState } from "react";
import "../App.css";
import API_BASE_URL from "../api";

function validateDateOfBirth(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);

  if (!match) {
    return "Date of birth must be in DD/MM/YYYY format.";
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12) {
    return "Please enter a valid date.";
  }

  const daysInMonth = new Date(year, month, 0).getDate();

  if (day < 1 || day > daysInMonth) {
    return "Please enter a valid date.";
  }

  const enteredDate = new Date(year, month - 1, day);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (enteredDate > today) {
    return "Date of birth cannot be in the future.";
  }

  return "";
}

function AddPatient({ onBack, onPatientCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Patient name is required.";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Patient name must be at least 3 characters.";
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required.";
    } else {
      const dateError = validateDateOfBirth(formData.date_of_birth);

      if (dateError) {
        newErrors.date_of_birth = dateError;
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Please select a gender.";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required.";
    } else if (
      !/^(?:[6-9]\d{9}|\+91[6-9]\d{9})$/.test(formData.phone)
    ) {
      newErrors.phone = "Please enter a valid 10-digit phone number.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    } else if (formData.address.trim().length < 3) {
      newErrors.address = "Address must be at least 3 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("${API_BASE_URL}/patients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("Created patient:", data);

      if (!response.ok) {
        console.log("Validation error:", data.detail);

        throw new Error(
          data.detail || "Failed to create patient"
        );
      }

      onPatientCreated();
      onBack();
    } catch (error) {
      console.error("Error creating patient:", error);

      setErrors({
        form: "Unable to create the patient. Please check your connection and try again.",
      });
    }
  };

  return (
    <div className="add-patient-page">

      <div className="back-navigation">
        <button className="back-button" onClick={onBack}>
          ← Back to Patients
        </button>
      </div>

      <div className="add-patient-header">
        <h1>Add New Patient</h1>

        <p>
          Create a patient profile by entering their basic information.
        </p>
      </div>

      <div className="patient-form-card">

        <div className="form-section-header">
          <h2>Patient Information</h2>

          <p>
            Please provide the patient's details below.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {Object.keys(errors).length > 0 && (
            <div className="form-error-message">
              {errors.form ||
                "Please correct the highlighted fields before creating the patient."}
            </div>
          )}

          <div className="form-row">

            <div className="form-group">
              <label>Patient Name</label>

              <input
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    name: event.target.value,
                  })
                }
              />

              {errors.name && (
                <p className="field-error">{errors.name}</p>
              )}
            </div>

            <div className="form-group">
              <label>Date of Birth</label>

              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={formData.date_of_birth}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    date_of_birth: event.target.value,
                  })
                }
              />

              {errors.date_of_birth && (
                <p className="field-error">
                  {errors.date_of_birth}
                </p>
              )}
            </div>

          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Gender</label>

              <select
                value={formData.gender}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    gender: event.target.value,
                  })
                }
              >
                <option value="" disabled>
                  Select gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

              {errors.gender && (
                <p className="field-error">
                  {errors.gender}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="text"
                placeholder="+91XXXXXXXXXX"
                value={formData.phone}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    phone: event.target.value,
                  })
                }
              />

              {errors.phone && (
                <p className="field-error">
                  {errors.phone}
                </p>
              )}
            </div>

          </div>

          <div className="form-group full-width">
            <label>Address</label>

            <textarea
              placeholder="Enter patient's address"
              rows="4"
              value={formData.address}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  address: event.target.value,
                })
              }
            />

            {errors.address && (
              <p className="field-error">
                {errors.address}
              </p>
            )}
          </div>

          <div className="patient-id-info">

            <div className="patient-id-icon">
              #
            </div>

            <div>
              <strong>Patient ID</strong>

              <p>
                Automatically generated after registration.
              </p>
            </div>

          </div>

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={onBack}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-patient-button"
            >
              Create Patient
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddPatient;