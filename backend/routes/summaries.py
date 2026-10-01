import os
from datetime import date, datetime, timezone

from fastapi import APIRouter, HTTPException
from google import genai

from database import patients_collection, case_sheets_collection

router = APIRouter(
    prefix="/patients",
    tags=["AI Summary"]
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def calculate_age(date_of_birth):
    birth_date = datetime.strptime(
        date_of_birth,
        "%Y-%m-%d"
    ).date()

    today = date.today()

    age = today.year - birth_date.year

    if (
        today.month,
        today.day
    ) < (
        birth_date.month,
        birth_date.day
    ):
        age -= 1

    return age


@router.post("/{patient_id}/summary")
def generate_summary(patient_id: str):

    # Find patient
    patient = patients_collection.find_one(
        {"patient_id": patient_id},
        {"_id": 0}
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # Find case sheet
    case_sheet = case_sheets_collection.find_one(
        {"patient_id": patient_id},
        {"_id": 0}
    )

    if case_sheet is None:
        raise HTTPException(
            status_code=404,
            detail="Case sheet not found"
        )

    age = calculate_age(patient["date_of_birth"])

    prompt = f"""
Generate a short, professional clinical summary using ONLY
the patient information and case sheet data provided below.

Do not introduce new findings, diagnoses, treatments,
recommendations, or information that is not present in the data.

Write the result as one concise, readable clinical paragraph.

Patient Information:
Name: {patient["name"]}
Age: {age}
Gender: {patient["gender"]}

Case Sheet:
Chief Complaint: {case_sheet["chief_complaint"]}
Duration: {case_sheet["duration"]}
Tooth / Area: {case_sheet["tooth_area"]}
Clinical Findings: {case_sheet["clinical_findings"]}
Tenderness: {case_sheet["tenderness"]}
Sensitivity: {case_sheet["sensitivity"]}
Additional Findings: {case_sheet["additional_findings"]}
Diagnosis: {case_sheet["diagnosis"]}
Notes: {case_sheet["notes"]}
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        summary = response.text.strip()

        case_sheets_collection.update_one(
            {"patient_id": patient_id},
            {
                "$set": {
                    "ai_summary": summary,
                    "ai_summary_generated_at": datetime.now(timezone.utc)
                }
            }
        )

        return {
            "patient_id": patient_id,
            "summary": summary
        }


    except Exception as error:
        print("Gemini API error:", error)

        raise HTTPException(
            status_code=500,
            detail="Failed to generate AI summary"
        )