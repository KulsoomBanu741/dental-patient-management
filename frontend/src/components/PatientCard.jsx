import "./PatientCard.css";


function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function PatientCard({ patient,onClick }) {
    return (
  <div
    className="patient-card"
    onClick={() => onClick(patient)}
  >

      <div className="patient-card-header">
        <div>
          <h3 className="patient-name">
            {patient.name}
          </h3>

          <p className="patient-type">
            Patient
          </p>
        </div>

        <div className="patient-id-container">
  <span className="patient-id">
    {patient.patient_id}
  </span>

  <span className="patient-id-label">
    Patient ID
  </span>
</div>
      </div>

      <div className="patient-divider"></div>

      <div className="patient-details">

        <div className="patient-detail">
          <span className="detail-label">
            📅 Date of Birth
          </span>

          <span className="detail-value">
            {formatDate(patient.date_of_birth)}
          </span>
        </div>

        <div className="patient-detail">
          <span className="detail-label">
            ♀ Gender
          </span>

          <span className="detail-value">
            {patient.gender}
          </span>
        </div>

        <div className="patient-detail">
          <span className="detail-label">
            ☎ Phone
          </span>

          <span className="detail-value">
            {patient.phone}
          </span>
        </div>

      </div>

      <div className="patient-location">
        <span>📍</span>
        <span>{patient.address}</span>

        <span className="patient-arrow">
          →
        </span>
      </div>

    </div>
  );
}

export default PatientCard;