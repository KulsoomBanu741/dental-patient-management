# 🦷 Dental Patient Management System

A full-stack dental patient management application for managing patient records, dental case sheets, and AI-generated clinical summaries.

## 1. Project Overview

The application provides a simple workflow for managing dental patients:

**Patient List → Patient Profile → Case Sheet → AI Clinical Summary**

### Main Features

- View all registered patients.
- Search patients by name or patient ID.
- Add new patients with validated information.
- Automatically generate unique patient IDs such as `PAT-0001`.
- View and edit patient profiles.
- Create, view, and edit dental case sheets.
- Validate patient and clinical information before saving.
- Generate concise AI-powered clinical summaries.
- Store patient records, case sheets, and AI summaries in MongoDB.
- Persist AI summaries so they remain available after refreshing the application.

### Application Workflow

1. A user opens the Patient Dashboard and views the registered patients.
2. A new patient can be added using their basic information.
3. Selecting a patient opens their Patient Profile.
4. The user can edit the patient's information or open their Case Sheet.
5. The Case Sheet records the patient's dental examination and clinical information.
6. After the Case Sheet is saved, the user can generate an AI Clinical Summary.
7. The AI summary is stored with the Case Sheet and can be viewed again after refreshing.
8. If the Case Sheet is edited, the previous AI summary is cleared so that a new summary can be generated from the updated information.

---

## 2. Technologies Used

### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS

### Backend
- Python
- FastAPI
- Pydantic
- Uvicorn

### Database
- MongoDB Atlas
- PyMongo

### AI
- Google Gemini API
- `google-genai`

### Deployment
- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

---

## 3. Frontend Setup

Make sure Node.js and npm are installed.

From the project root:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

The frontend uses the `VITE_API_URL` environment variable to communicate with the FastAPI backend.

For local development, this points to the local FastAPI server:

```text
http://127.0.0.1:8000
```

For production, it points to the deployed Render backend.

---

## 4. Backend Setup

The backend is built using FastAPI and Python.

From the project root:

```bash
cd backend
python -m venv venv
```

### Windows PowerShell

Activate the virtual environment:

```powershell
.env\Scripts\Activate.ps1
```

Install the required packages:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The local backend runs at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### Backend Health Checks

Basic API health:

```text
GET /health
```

Database connectivity:

```text
GET /health/db
```

---

## 5. MongoDB Setup

The application uses MongoDB Atlas for persistent data storage.

### Setup

1. Create a MongoDB Atlas account and cluster.
2. Create a database user.
3. Obtain the MongoDB connection string.
4. Configure MongoDB Atlas Network Access for the environment where the backend is running.
5. Add the MongoDB connection string to the backend environment variables.

The application uses the following collections:

```text
patients
case_sheets
counters
```

### `patients`

Stores basic patient information such as:

- Patient ID
- Name
- Date of birth
- Gender
- Phone
- Address
- Creation timestamp

### `case_sheets`

Stores the clinical information associated with a patient, along with the generated AI summary when available.

### `counters`

Maintains the patient ID sequence used to generate IDs such as:

```text
PAT-0001
PAT-0002
PAT-0003
```

The counter is updated atomically so that sequential patient IDs can be generated safely.

---

## 6. Environment Variables Required

Sensitive configuration is kept outside the source code.

### Backend

Create a `.env` file inside the `backend` directory:

```env
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=dental_patient_management
GEMINI_API_KEY=your_gemini_api_key
```

### Variable Description

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `DATABASE_NAME` | Database used by the application |
| `GEMINI_API_KEY` | Google Gemini API key used for AI summaries |

### Frontend

The deployed frontend uses:

```env
VITE_API_URL=https://dental-patient-management-api.onrender.com
```

`VITE_API_URL` tells the React application where the FastAPI backend is hosted.

### Security

Actual passwords, API keys, and database credentials must not be committed to GitHub.

The project's `.gitignore` excludes the backend `.env` file and other local/generated files.

---

## 7. AI API Setup

The application uses the Google Gemini API to generate a concise clinical summary from the patient's saved case sheet.

### Setup

1. Obtain a Gemini API key.
2. Add the key to `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

3. Start the backend.
4. Create and save a patient's Case Sheet.
5. Open the patient's profile.
6. Select **Generate Summary**.

### AI Summary Behavior

- A Case Sheet must be completed and saved before an AI summary can be generated.
- If no Case Sheet exists, the application asks the user to complete and save it first.
- The summary is generated from the patient information and Case Sheet data supplied to the backend.
- The generated summary is stored in MongoDB.
- The summary remains available after refreshing the page.
- When a Case Sheet is edited, the previous AI summary is cleared so that a new summary can be generated from the updated information.
- The AI prompt instructs the model to use only the information supplied by the application and not introduce new findings, diagnoses, treatments, or recommendations.

The AI feature is intended to assist with summarization and should not be treated as an independent medical diagnosis or treatment decision.

---

## 8. Steps to Run the Application Locally

The frontend and backend should be run in separate terminals.

### Terminal 1 — Backend

```bash
cd backend
```

Activate the virtual environment on Windows:

```powershell
.env\Scripts\Activate.ps1
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Open the frontend URL in a browser after both services are running.

### Verify the Backend

Open:

```text
http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

The database connection can be checked using:

```text
http://127.0.0.1:8000/health/db
```

---

## 9. API Overview

### Patient Endpoints

Create a patient:

```text
POST /patients/
```

Get all patients:

```text
GET /patients/
```

Update a patient:

```text
PUT /patients/{patient_id}
```

### Case Sheet Endpoints

Create a Case Sheet:

```text
POST /patients/{patient_id}/case-sheet
```

Get a Case Sheet:

```text
GET /patients/{patient_id}/case-sheet
```

Update a Case Sheet:

```text
PUT /patients/{patient_id}/case-sheet
```

### AI Summary

Generate an AI summary:

```text
POST /patients/{patient_id}/summary
```

### Health

```text
GET /health
GET /health/db
```

---

## 10. Validation and Error Handling

The application includes validation on both the frontend and backend.

### Patient Validation

Examples include:

- Patient name is required and must meet the minimum length.
- Date of birth must use the expected `DD/MM/YYYY` format in the user interface.
- Invalid calendar dates are rejected.
- Future dates of birth are rejected.
- Phone numbers are validated against the supported format.
- Required address information is validated.

### Case Sheet Validation

Required clinical fields are validated before saving.

The Case Sheet supports values such as:

```text
Tenderness: Yes / No
```

The application also provides loading and error messages for API operations.

For example, attempting to generate an AI summary without a saved Case Sheet results in a clear message asking the user to complete and save the Case Sheet first.

---

## 11. Deployment

The application is deployed using the following architecture:

```text
React + Vite
    │
    ▼
Vercel
    │
    │ REST API
    ▼
FastAPI
    │
    ├──────────────► MongoDB Atlas
    │
    └──────────────► Google Gemini API
    │
    ▼
Render
```

### Frontend

Hosted on Vercel:

https://dental-patient-management-nu.vercel.app

### Backend

Hosted on Render:

https://dental-patient-management-api.onrender.com

### Database

Hosted on MongoDB Atlas.

### AI Service

Google Gemini API.

---

## 12. Assumptions and Known Limitations

- This is a project/demo application and is not intended to replace professional dental or medical practice-management software.
- Authentication and role-based access control are not implemented.
- Separate doctor, administrator, or staff accounts are not currently implemented.
- Patient data should be protected with appropriate security, access control, auditing, and compliance measures before use in a real healthcare environment.
- AI-generated summaries are intended as a summarization aid and should not be treated as independent medical diagnoses or treatment recommendations.
- The AI summary is generated from the information supplied in the application.
- The current implementation supports one Case Sheet per patient.
- Date of birth is entered in `DD/MM/YYYY` format in the user interface.
- The deployed backend uses Render's free tier and may take longer to respond after a period of inactivity because the service can spin down.
- An internet connection is required for the deployed application and Gemini API requests.
- Gemini API response time and availability may depend on the selected model and API service limits.

---

## 13. Live Application

The application is hosted and accessible at:

**https://dental-patient-management-nu.vercel.app**

The application can be accessed from desktop or mobile browsers.

---

## 14. GitHub Repository

Complete source code:

**https://github.com/KulsoomBanu741/dental-patient-management**

The repository contains both the React frontend and FastAPI backend.

---

## 15. Submission

### GitHub Repository URL

https://github.com/KulsoomBanu741/dental-patient-management

### Live Application URL

https://dental-patient-management-nu.vercel.app
