function CaseSheetView({ caseSheet }) {
  return (
    <div className="case-sheet-view">

      <div className="case-sheet-saved-message">
        <div className="saved-message-icon">✓</div>

        <div>
          <h3>Case sheet saved successfully</h3>
          <p>Your clinical information has been saved.</p>
        </div>
      </div>


      {/* Chief Complaint */}

      <section className="case-sheet-view-section">
        <div className="case-sheet-view-header">
          <span className="section-number">1</span>
          <h2>Chief Complaint</h2>
        </div>

        <div className="case-sheet-view-content">

          <div className="case-sheet-view-field">
            <span>Chief Complaint</span>
            <strong>{caseSheet.chief_complaint}</strong>
          </div>

          <div className="case-sheet-view-field">
            <span>Duration</span>
            <strong>{caseSheet.duration}</strong>
          </div>

        </div>
      </section>


      {/* Investigation */}

      <section className="case-sheet-view-section">
        <div className="case-sheet-view-header">
          <span className="section-number">2</span>
          <h2>Investigation</h2>
        </div>

        <div className="case-sheet-view-content">

          <div className="case-sheet-view-field">
            <span>Tooth / Area</span>
            <strong>{caseSheet.tooth_area}</strong>
          </div>

          <div className="case-sheet-view-field">
            <span>Clinical Findings</span>
            <strong>{caseSheet.clinical_findings}</strong>
          </div>

          <div className="case-sheet-view-field">
            <span>Tenderness</span>
            <strong>{caseSheet.tenderness}</strong>
          </div>

          <div className="case-sheet-view-field">
            <span>Sensitivity</span>
            <strong>{caseSheet.sensitivity}</strong>
          </div>

          <div className="case-sheet-view-field">
            <span>Additional Findings</span>
            <strong>{caseSheet.additional_findings || "—"}</strong>
          </div>

        </div>
      </section>


      {/* Diagnosis */}

      <section className="case-sheet-view-section">
        <div className="case-sheet-view-header">
          <span className="section-number">3</span>
          <h2>Diagnosis</h2>
        </div>

        <div className="case-sheet-view-content">

          <div className="case-sheet-view-field">
            <span>Diagnosis</span>
            <strong>{caseSheet.diagnosis}</strong>
          </div>

          <div className="case-sheet-view-field">
            <span>Notes</span>
            <strong>{caseSheet.notes || "—"}</strong>
          </div>

        </div>
      </section>

    </div>
  );
}

export default CaseSheetView;