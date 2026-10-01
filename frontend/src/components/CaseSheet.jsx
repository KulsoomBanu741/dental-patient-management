import { useEffect, useState } from "react";
import CaseSheetView from "./CaseSheetView";
import "./CaseSheet.css";

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

function CaseSheet({ patient, onBack }) {
  const [caseSheet, setCaseSheet] = useState({
    chief_complaint: "",
    duration: "",
    tooth_area: "",
    clinical_findings: "",
    tenderness: "",
    sensitivity: "",
    additional_findings: "",
    diagnosis: "",
    notes: "",
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [caseSheetErrors, setCaseSheetErrors] = useState({});

  // AI Summary state
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // Get the patient's existing case sheet
  useEffect(() => {
    const fetchCaseSheet = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/patients/${patient.patient_id}/case-sheet`
        );

        if (response.status === 404) {
          // Patient exists, but no case sheet exists yet.
          setIsSaved(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch case sheet");
        }

        const data = await response.json();

        setCaseSheet(data.case_sheet);
        setIsSaved(true);
        setIsEditing(false);
      } catch (error) {
        console.error("Error fetching case sheet:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaseSheet();
  }, [patient.patient_id]);

  const validateCaseSheet = () => {
  const newErrors = {};

 if (!caseSheet.chief_complaint.trim()) {
  newErrors.chief_complaint = "Chief complaint is required.";
} else if (caseSheet.chief_complaint.trim().length < 3) {
  newErrors.chief_complaint =
    "Chief complaint must be at least 3 characters.";
}

  if (!caseSheet.duration.trim()) {
    newErrors.duration = "Duration is required.";
  }

  if (!caseSheet.tooth_area.trim()) {
    newErrors.tooth_area = "Tooth / area is required.";
  }

  if (!caseSheet.clinical_findings.trim()) {
  newErrors.clinical_findings = "Clinical findings are required.";
} else if (caseSheet.clinical_findings.trim().length < 3) {
  newErrors.clinical_findings =
    "Clinical findings must be at least 3 characters.";
}

  if (!caseSheet.tenderness.trim()) {
  newErrors.tenderness = "Tenderness information is required.";
} else if (caseSheet.tenderness.trim().length < 3) {
  newErrors.tenderness =
    "Tenderness information must be at least 3 characters.";
}

  if (!caseSheet.sensitivity.trim()) {
  newErrors.sensitivity = "Sensitivity information is required.";
} else if (caseSheet.sensitivity.trim().length < 3) {
  newErrors.sensitivity =
    "Sensitivity information must be at least 3 characters.";
}

  if (!caseSheet.diagnosis.trim()) {
  newErrors.diagnosis = "Diagnosis is required.";
} else if (caseSheet.diagnosis.trim().length < 3) {
  newErrors.diagnosis =
    "Diagnosis must be at least 3 characters.";
}

  setCaseSheetErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  const handleSave = async () => {

    if (!validateCaseSheet()) {
  return;
}

    setIsSaving(true);
    setErrorMessage("");

    try {
      let response;

      if (isEditing) {
        // Update an existing case sheet
        response = await fetch(
          `http://127.0.0.1:8000/patients/${patient.patient_id}/case-sheet`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(caseSheet),
          }
        );
      } else {
        // Create a new case sheet
        response = await fetch(
          `http://127.0.0.1:8000/patients/${patient.patient_id}/case-sheet`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(caseSheet),
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save case sheet");
      }

      setCaseSheet(data.case_sheet);
      setIsSaved(true);
      setIsEditing(false);

      console.log("Case sheet saved:", data.case_sheet);
    } catch (error) {
  console.error("Case sheet save error:", error);
  setErrorMessage(
    "Unable to save the case sheet. Please check your connection and try again."
  );
} finally {
      setIsSaving(false);
    }
  };

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
}finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setAiSummary("");
    setSummaryError("");
  };

  return (
    <div className="case-sheet-page">

      <button
        className="case-sheet-back-button"
        onClick={onBack}
      >
        ← Back to Patient Profile
      </button>

      <div className="case-sheet-header">

        <div>
          <p className="case-sheet-label">
            Clinical Record
          </p>

          <h1>Case Sheet</h1>

          <p className="case-sheet-description">
            Dental examination and clinical information.
          </p>
        </div>

        <div className="case-sheet-patient-info">

          <h2>{patient.name}</h2>

          <p>{patient.patient_id}</p>

          <div className="case-sheet-patient-details">

            <span>
              Age: {calculateAge(patient.date_of_birth)}
            </span>

            <span>
              Gender: {patient.gender}
            </span>

          </div>

        </div>

      </div>

      {/* LOADING */}

      {isLoading ? (
        <div className="case-sheet-loading">
          Loading case sheet...
        </div>
      ) : (
        <>

          {/* FORM */}

          {(!isSaved || isEditing) && (
            <>

              {errorMessage && (
                <div className="case-sheet-error-message">
                  {errorMessage}
                </div>
              )}

              {/* CHIEF COMPLAINT */}

              <section className="case-sheet-section">

                <div className="case-sheet-section-header">
                  <span className="section-number">1</span>
                  <h2>Chief Complaint</h2>
                </div>

                <div className="case-sheet-form">

                  <div className="case-sheet-field">

                    <label>
                      Chief Complaint <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={caseSheet.chief_complaint}
                      onChange={(event) =>
                        setCaseSheet({
                          ...caseSheet,
                          chief_complaint: event.target.value,
                        })
                      }
                      placeholder="Enter the patient's chief complaint"
                    />
                  {caseSheetErrors.chief_complaint && (
  <p className="case-sheet-field-error">
    {caseSheetErrors.chief_complaint}
  </p>
)}

                  </div>

                  <div className="case-sheet-field">

                    <label>
                      Duration <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={caseSheet.duration}
                      onChange={(event) =>
                        setCaseSheet({
                          ...caseSheet,
                          duration: event.target.value,
                        })
                      }
                      placeholder="e.g. 3 days"
                    />

                    {caseSheetErrors.duration && (
  <p className="case-sheet-field-error">
    {caseSheetErrors.duration}
  </p>
)}

                  </div>

                </div>

              </section>


              {/* INVESTIGATION */}

              <section className="case-sheet-section">

                <div className="case-sheet-section-header">
                  <span className="section-number">2</span>
                  <h2>Investigation</h2>
                </div>

                <div className="case-sheet-form">

                  <div className="case-sheet-field">

                    <label>
                      Tooth / Area <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={caseSheet.tooth_area}
                      onChange={(event) =>
                        setCaseSheet({
                          ...caseSheet,
                          tooth_area: event.target.value,
                        })
                      }
                      placeholder="Enter tooth number or affected area"
                    />

                    {caseSheetErrors.tooth_area && (
  <p className="case-sheet-field-error">
    {caseSheetErrors.tooth_area}
  </p>
)}

                  </div>

                  <div className="case-sheet-field">

                    <label>
                      Clinical Findings <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={caseSheet.clinical_findings}
                      onChange={(event) =>
                        setCaseSheet({
                          ...caseSheet,
                          clinical_findings: event.target.value,
                        })
                      }
                      placeholder="Describe clinical findings"
                    />

                      {caseSheetErrors.clinical_findings && (
  <p className="case-sheet-field-error">
    {caseSheetErrors.clinical_findings}
  </p>
)}

                  </div>

                  <div className="case-sheet-field">

                    <label>
                      Tenderness <span>*</span>
                    </label>

                    <select
                      value={caseSheet.tenderness}
                      onChange={(event) =>
                        setCaseSheet({
                          ...caseSheet,
                          tenderness: event.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  {caseSheetErrors.tenderness && (
  <p className="case-sheet-field-error">
    {caseSheetErrors.tenderness}
  </p>
)}
                  </div>

                  <div className="case-sheet-field">

                    <label>
                      Sensitivity <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={caseSheet.sensitivity}
                      onChange={(event) =>
                        setCaseSheet({
                          ...caseSheet,
                          sensitivity: event.target.value,
                        })
                      }
                      placeholder="Describe sensitivity"
                    />

                    {caseSheetErrors.sensitivity && (
  <p className="case-sheet-field-error">
    {caseSheetErrors.sensitivity}
  </p>
)}

                  </div>

                  <div className="case-sheet-field">

                    <label>
                      Additional Findings
                    </label>

                    <textarea
                      value={caseSheet.additional_findings}
                      onChange={(event) =>
                        setCaseSheet({
                          ...caseSheet,
                          additional_findings: event.target.value,
                        })
                      }
                      placeholder="Enter any additional findings"
                    />

                  

                  </div>

                </div>

              </section>


              {/* DIAGNOSIS */}

              <section className="case-sheet-section">

                <div className="case-sheet-section-header">
                  <span className="section-number">3</span>
                  <h2>Diagnosis</h2>
                </div>

                <div className="case-sheet-form">

                  <div className="case-sheet-field">

                    <label>
                      Diagnosis <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={caseSheet.diagnosis}
                      onChange={(event) =>
                        setCaseSheet({
                          ...caseSheet,
                          diagnosis: event.target.value,
                        })
                      }
                      placeholder="Enter the diagnosis"
                    />
                  {caseSheetErrors.diagnosis && (
  <p className="case-sheet-field-error">
    {caseSheetErrors.diagnosis}
  </p>
)}
                  </div>

                  <div className="case-sheet-field">

                    <label>
                      Notes
                    </label>

                    <textarea
                      value={caseSheet.notes}
                      onChange={(event) =>
                        setCaseSheet({
                          ...caseSheet,
                          notes: event.target.value,
                        })
                      }
                      placeholder="Add any relevant notes or treatment recommendations"
                    />

                  </div>

                </div>

              </section>


              {/* SAVE BUTTON */}

              <div className="case-sheet-actions">

                <button
                  className="save-case-sheet-button"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : isEditing
                      ? "Save Changes"
                      : "Save Case Sheet"}
                </button>

              </div>

            </>
          )}


          {/* SAVED INFORMATION */}

          {isSaved && !isEditing && (
            <>
              <CaseSheetView caseSheet={caseSheet} />

        <div className="case-sheet-edit-actions">
  <button
    className="edit-case-sheet-button"
    onClick={handleEdit}
  >
    ✏ Edit Case Sheet
  </button>

  <button
    className="generate-summary-button"
    onClick={handleGenerateSummary}
    disabled={isGeneratingSummary}
  >
    {isGeneratingSummary
      ? "Generating..."
      : " Generate Summary"}
  </button>
</div>

              {summaryError && (
                <div className="summary-error-message">
                  {summaryError}
                </div>
              )}

              {aiSummary && (
                <div className="ai-summary-section">

                  <div className="ai-summary-header">
                    <span>✨ AI Generated Summary</span>
                  </div>

                  <p className="ai-summary-text">
                    {aiSummary}
                  </p>

                </div>
              )}

            </>
          )}

        </>
      )}

    </div>
  );
}

export default CaseSheet;