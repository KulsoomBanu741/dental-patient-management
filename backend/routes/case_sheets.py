from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from pymongo import ReturnDocument
from database import case_sheets_collection, patients_collection


router = APIRouter(
    prefix="/patients",
    tags=["Case Sheets"]
)


class CaseSheetCreate(BaseModel):
    chief_complaint: str = Field(min_length=3)
    duration: str = Field(min_length=1)
    tooth_area: str = Field(min_length=1)
    clinical_findings: str = Field(min_length=3)
    tenderness: str = Field(min_length=2)
    sensitivity: str = Field(min_length=3)
    additional_findings: str = ""
    diagnosis: str = Field(min_length=3)
    notes: str = ""

@router.post("/{patient_id}/case-sheet")
def create_case_sheet(patient_id: str, case_sheet: CaseSheetCreate):

    # Check if patient exists
    patient = patients_collection.find_one(
        {"patient_id": patient_id}
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # Check if a case sheet already exists
    existing_case_sheet = case_sheets_collection.find_one(
        {"patient_id": patient_id}
    )

    if existing_case_sheet is not None:
        raise HTTPException(
            status_code=400,
            detail="Case sheet already exists for this patient"
        )

    # Create case sheet document
    case_sheet_document = {
        "patient_id": patient_id,
        "chief_complaint": case_sheet.chief_complaint,
        "duration": case_sheet.duration,
        "tooth_area": case_sheet.tooth_area,
        "clinical_findings": case_sheet.clinical_findings,
        "tenderness": case_sheet.tenderness,
        "sensitivity": case_sheet.sensitivity,
        "additional_findings": case_sheet.additional_findings,
        "diagnosis": case_sheet.diagnosis,
        "notes": case_sheet.notes,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    case_sheets_collection.insert_one(case_sheet_document)

    case_sheet_document.pop("_id", None)

    return {
        "message": "Case sheet created successfully",
        "case_sheet": case_sheet_document
    }

@router.get("/{patient_id}/case-sheet")
def get_case_sheet(patient_id: str):

    # Check if patient exists
    patient = patients_collection.find_one(
        {"patient_id": patient_id}
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # Find the patient's case sheet
    case_sheet = case_sheets_collection.find_one(
        {"patient_id": patient_id},
        {"_id": 0}
    )

    if case_sheet is None:
        raise HTTPException(
            status_code=404,
            detail="Case sheet not found"
        )

    return {
        "case_sheet": case_sheet
    }

@router.put("/{patient_id}/case-sheet")
def update_case_sheet(patient_id: str, case_sheet: CaseSheetCreate):

    # Check if patient exists
    patient = patients_collection.find_one(
        {"patient_id": patient_id}
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # Update the existing case sheet
    updated_case_sheet = case_sheets_collection.find_one_and_update(
        {"patient_id": patient_id},
        {
            "$set": {
                "chief_complaint": case_sheet.chief_complaint,
                "duration": case_sheet.duration,
                "tooth_area": case_sheet.tooth_area,
                "clinical_findings": case_sheet.clinical_findings,
                "tenderness": case_sheet.tenderness,
                "sensitivity": case_sheet.sensitivity,
                "additional_findings": case_sheet.additional_findings,
                "diagnosis": case_sheet.diagnosis,
                "notes": case_sheet.notes,
                "updated_at": datetime.now(timezone.utc)
            },
            "$unset": {
                "ai_summary": "",
                "ai_summary_generated_at": ""
}
            },
        return_document=ReturnDocument.AFTER
    )

    if updated_case_sheet is None:
        raise HTTPException(
            status_code=404,
            detail="Case sheet not found"
        )

    updated_case_sheet.pop("_id", None)

    return {
        "message": "Case sheet updated successfully",
        "case_sheet": updated_case_sheet
    }

