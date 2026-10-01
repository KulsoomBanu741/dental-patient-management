import PatientCard from "./components/PatientCard";
import AddPatient from "./components/AddPatient";
import PatientProfile from "./components/PatientProfile";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [currentPath, setCurrentPath] = useState(
    window.location.pathname
  );

  const fetchPatients = () => {
    fetch("http://127.0.0.1:8000/patients/")
      .then((response) => response.json())
      .then((data) => {
        setPatients(data.patients);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle browser Back and Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Open the correct patient when the URL contains a patient ID
  useEffect(() => {
    if (currentPath === "/add-patient") {
      setShowAddPatient(true);
      setSelectedPatient(null);
      return;
    }

    if (currentPath.startsWith("/patients/")) {
      const pathParts = currentPath.split("/");

      const patientId = pathParts[2];

      const isCaseSheet = pathParts[3] === "case-sheet";
      const isEditProfile = pathParts[3] === "edit";

      const patient = patients.find(
        (patient) => patient.patient_id === patientId
      );

      if (patient) {
        setSelectedPatient(patient);
        setShowAddPatient(false);
      }

      if (isCaseSheet) {
        // Case Sheet will be opened by PatientProfile
        // based on the current URL.
      }

      if (isEditProfile) {
        // Edit Profile will be opened by PatientProfile
        // based on the current URL.
      }
    } else {
      setSelectedPatient(null);
      setShowAddPatient(false);
    }
  }, [currentPath, patients]);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.patient_id
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (selectedPatient) {
    return (
      <PatientProfile
        patient={selectedPatient}

        showCaseSheetFromUrl={currentPath.endsWith("/case-sheet")}

        showEditProfileFromUrl={currentPath.endsWith("/edit")}

        onPatientUpdated={(updatedPatient) => {
          setSelectedPatient(updatedPatient);

          setPatients((currentPatients) =>
            currentPatients.map((patient) =>
              patient.patient_id === updatedPatient.patient_id
                ? updatedPatient
                : patient
            )
          );
        }}

        onBack={() => {
          navigate("/");
        }}
      />
    );
  }

  if (showAddPatient) {
    return (
      <AddPatient
        onBack={() => {
          setShowAddPatient(false);
          navigate("/");
        }}
        onPatientCreated={fetchPatients}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          🦷 Dental Patient Management
        </h1>
      </header>

      <main className="patients-section">

        <div className="patients-heading-row">
          <div>
            <h2 className="patients-heading">
              Patients
            </h2>

            <p className="patients-subtitle">
              List of patients and their information
            </p>

            <div className="patient-toolbar">

              <p className="patient-count">
                {filteredPatients.length}{" "}
                {filteredPatients.length === 1
                  ? "patient"
                  : "patients"}
              </p>

              <div className="search-box">
                <span className="search-icon">⌕</span>

                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />
              </div>

            </div>
          </div>
        </div>

        <div className="dashboard-content">

          <section className="patient-list">

            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.patient_id}
                patient={patient}
                onClick={(selectedPatient) => {
                  navigate(
                    `/patients/${selectedPatient.patient_id}`
                  );
                }}
              />
            ))}

          </section>

          <aside className="new-patient-card">

            <h3>
              New Patient
            </h3>

            <p>
              Create a new patient profile and add their basic
              information.
            </p>

            <button
              className="add-patient-button"
              onClick={() => {
                window.history.pushState(
                  {},
                  "",
                  "/add-patient"
                );

                setCurrentPath("/add-patient");
                setShowAddPatient(true);
                setSelectedPatient(null);
              }}
            >
              + Add Patient
            </button>

          </aside>

        </div>
      </main>
    </div>
  );
}

export default App;