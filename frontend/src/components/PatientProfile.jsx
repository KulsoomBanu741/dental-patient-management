import { useEffect, useState } from "react";
import CaseSheet from "./CaseSheet";
import "./PatientProfile.css";

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function calculateAge(dateString) {
  const birthDate = new Date(dateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

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

function PatientProfile({
  patient,
  onPatientUpdated,
  onBack,
  showCaseSheetFromUrl,
  showEditProfileFromUrl,
}) {
  const [showCaseSheet, setShowCaseSheet] = useState(showCaseSheetFromUrl);

  useEffect(() => {
    setShowCaseSheet(showCaseSheetFromUrl);
  }, [showCaseSheetFromUrl]);

  useEffect(() => {
  setIsEditing(showEditProfileFromUrl);
}, [showEditProfileFromUrl]);

  const [isEditing, setIsEditing] = useState(showEditProfileFromUrl);
  const [saveMessage, setSaveMessage] = useState("");
  const [editErrors, setEditErrors] = useState({});

  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    if (!saveMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSaveMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [saveMessage]);

  useEffect(() => {
    const fetchCaseSheet = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/patients/${patient.patient_id}/case-sheet`
        );

        if (response.status === 404) {
          setAiSummary("");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch case sheet");
        }

        const data = await response.json();

        setAiSummary(data.case_sheet.ai_summary || "");
      } catch (error) {
        console.error("Error fetching AI summary:", error);
      }
    };

    fetchCaseSheet();
  }, [patient.patient_id]);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setSummaryError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/patients/${patient.patient_id}/summary`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to generate AI summary"
        );
      }

      setAiSummary(data.summary);
    } catch (error) {
      console.error("AI summary error:", error);

      setSummaryError(
        "Unable to generate the AI summary. Please check your connection and try again."
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const [editForm, setEditForm] = useState({
    name: patient.name,
    date_of_birth: patient.date_of_birth,
    gender: patient.gender,
    phone: patient.phone,
    address: patient.address,
  });

  const validateEditForm = () => {
    const newErrors = {};

    if (!editForm.name.trim()) {
      newErrors.name = "Patient name is required.";
    } else if (editForm.name.trim().length < 3) {
      newErrors.name = "Patient name must be at least 3 characters.";
    }

    if (!editForm.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required.";
    } else {
      const dateError = validateDateOfBirth(editForm.date_of_birth);

      if (dateError) {
        newErrors.date_of_birth = dateError;
      }
    }

    if (!editForm.gender) {
      newErrors.gender = "Please select a gender.";
    }

    if (!editForm.phone) {
      newErrors.phone = "Phone number is required.";
    } else if (
      !/^(?:[6-9]\d{9}|\+91[6-9]\d{9})$/.test(editForm.phone)
    ) {
      newErrors.phone = "Please enter a valid 10-digit phone number.";
    }

    if (!editForm.address.trim()) {
      newErrors.address = "Address is required.";
    } else if (editForm.address.trim().length < 3) {
      newErrors.address = "Address must be at least 3 characters.";
    }

    setEditErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateEditForm()) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/patients/${patient.patient_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data.detail));
      }

      onPatientUpdated(data.patient);

window.history.pushState(
  {},
  "",
  `/patients/${patient.patient_id}`
);

window.dispatchEvent(new PopStateEvent("popstate"));

setSaveMessage("Changes saved successfully");
    } catch (error) {
      console.error("Error updating patient:", error);
    }
  };

  if (showCaseSheet) {
    return (
      <CaseSheet
        patient={patient}
        onBack={() => {
          window.history.pushState(
            {},
            "",
            `/patients/${patient.patient_id}`
          );

          window.dispatchEvent(new PopStateEvent("popstate"));
        }}
      />
    );
  }

  return (
    <>
      {/* Success toast */}
      {saveMessage && (
        <div className="save-toast">
          ✓ {saveMessage}
        </div>
      )}

      {/* Back navigation */}
      <div className="profile-navigation">
        <button className="back-button" onClick={onBack}>
          ← Back to Patients
        </button>
      </div>

      <div className="patient-profile-page">

        {/* Profile header */}
        <div className="profile-header">
          <div>
            <h1>Patient Profile</h1>

            <p className="profile-patient-name">
              {patient.name}
            </p>

            <p className="profile-patient-id">
              Patient · {patient.patient_id}
            </p>
          </div>

          <button
  className="edit-profile-button"
  onClick={() => {
    window.history.pushState(
      {},
      "",
      `/patients/${patient.patient_id}/edit`
    );

    window.dispatchEvent(new PopStateEvent("popstate"));
  }}
>
  ✏ Edit Profile
</button>
        </div>

        {/* Patient information */}
        <section className="profile-section">
          <div className="section-heading">
            <h2>Patient Information</h2>
            <p>Basic information about the patient.</p>
          </div>

          {isEditing ? (
            <div className="edit-form">

              {Object.keys(editErrors).length > 0 && (
                <div className="form-error-message">
                  Please correct the highlighted fields before saving your changes.
                </div>
              )}

              {/* Name */}
              <div className="form-field">
                <label>Name</label>

                <input
                  type="text"
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      name: event.target.value,
                    })
                  }
                />

                {editErrors.name && (
                  <p className="field-error">
                    {editErrors.name}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="form-field">
                <label>Date of Birth</label>

                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={
                    editForm.date_of_birth
                      ? editForm.date_of_birth
                          .split("-")
                          .reverse()
                          .join("/")
                      : ""
                  }
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      date_of_birth: event.target.value,
                    })
                  }
                />

                {editErrors.date_of_birth && (
                  <p className="field-error">
                    {editErrors.date_of_birth}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="form-field">
                <label>Gender</label>

                <select
                  value={editForm.gender}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      gender: event.target.value,
                    })
                  }
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                {editErrors.gender && (
                  <p className="field-error">
                    {editErrors.gender}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="form-field">
                <label>Phone</label>

                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      phone: event.target.value,
                    })
                  }
                />

                {editErrors.phone && (
                  <p className="field-error">
                    {editErrors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="form-field full-width">
                <label>Address</label>

                <textarea
                  value={editForm.address}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      address: event.target.value,
                    })
                  }
                />

                {editErrors.address && (
                  <p className="field-error">
                    {editErrors.address}
                  </p>
                )}
              </div>

              {/* Form buttons */}
              <div className="edit-form-actions">
                <button
  type="button"
  onClick={() => {
    window.history.pushState(
      {},
      "",
      `/patients/${patient.patient_id}`
    );

    window.dispatchEvent(new PopStateEvent("popstate"));
  }}
>
  Cancel
</button>

                <button
                  type="button"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              </div>

            </div>
          ) : (
            <div className="patient-information-card">

              <div className="information-item">
                <span className="information-label">
                  <span className="information-icon">📅</span>
                  Date of Birth
                </span>

                <strong>
                  {formatDate(patient.date_of_birth)}
                </strong>
              </div>

              <div className="information-item">
                <span className="information-label">
                  <span className="information-icon">🎂</span>
                  Age
                </span>

                <strong>
                  {calculateAge(patient.date_of_birth)} years
                </strong>
              </div>

              <div className="information-item">
                <span className="information-label">
                  <span className="information-icon">♀</span>
                  Gender
                </span>

                <strong>
                  {patient.gender}
                </strong>
              </div>

              <div className="information-item">
                <span className="information-label">
                  <span className="information-icon">☎</span>
                  Phone
                </span>

                <strong>
                  {patient.phone}
                </strong>
              </div>

              <div className="information-item full-width">
                <span className="information-label">
                  <span className="information-icon">📍</span>
                  Address
                </span>

                <strong>
                  {patient.address}
                </strong>
              </div>

            </div>
          )}
        </section>

        {/* Clinical Records */}
        <section className="profile-section">
          <div className="section-heading">
            <h2>Clinical Records</h2>

            <p>
              Manage the patient's clinical information and records.
            </p>
          </div>

          <div className="clinical-record-card">

            <div className="clinical-record-icon">
              📋
            </div>

            <div className="clinical-record-content">
              <h3>Case Sheet</h3>

              <p>
                View and manage the patient's dental examination and clinical records.
              </p>
            </div>

            <button
              className="record-action-button"
              onClick={() => {
                window.history.pushState(
                  {},
                  "",
                  `/patients/${patient.patient_id}/case-sheet`
                );

                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
            >
              View Case Sheet →
            </button>

          </div>
        </section>

        {/* AI Clinical Summary */}
        <section className="profile-section">
          <div className="section-heading">
            <h2>AI Clinical Summary</h2>

            <p>
              AI-powered summary generated from the patient's clinical records.
            </p>
          </div>

          <div className="ai-summary-card">

            <div className="ai-summary-icon">
              ✨
            </div>

            <div className="ai-summary-content">

              <div className="ai-summary-header">
                <h3>AI Clinical Summary</h3>

                <span className="summary-status">
                  {aiSummary ? "Generated" : "Not generated"}
                </span>
              </div>

              {aiSummary ? (
                <p className="ai-summary-text">
                  {aiSummary}
                </p>
              ) : (
                <p>
                  Generate a concise summary from the patient's latest case sheet
                  and clinical information.
                </p>
              )}

              {summaryError && (
                <div className="summary-error-message">
                  {summaryError}
                </div>
              )}

            </div>

            <button
              className="generate-summary-button"
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
            >
              {isGeneratingSummary
                ? "Generating..."
                : aiSummary
                  ? "Regenerate Summary →"
                  : "Generate Summary →"}
            </button>

          </div>
        </section>

      </div>
    </>
  );
}

export default PatientProfile;