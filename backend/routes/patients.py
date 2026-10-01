from datetime import date, datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from pymongo import ReturnDocument

from database import patients_collection, counters_collection


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


class PatientCreate(BaseModel):
    name: str = Field(min_length=3)

    date_of_birth: date

    gender: Literal["Male", "Female", "Other"]

    phone: str = Field(
        pattern=r"^(?:[6-9]\d{9}|\+91[6-9]\d{9})$"
    )

    address: str = Field(min_length=3)

    @field_validator("date_of_birth", mode="before")
    @classmethod
    def validate_date_of_birth(cls, value):
        if isinstance(value, date):
            return value

        for date_format in ("%d/%m/%Y", "%Y-%m-%d"):
            try:
                return datetime.strptime(
                    value,
                    date_format
                ).date()
            except ValueError:
                continue

        raise ValueError(
            "Date of birth must be in DD/MM/YYYY or YYYY-MM-DD format"
        )


@router.post("/")
def create_patient(patient: PatientCreate):

    counter = counters_collection.find_one_and_update(
        {"_id": "patients"},
        {"$inc": {"sequence": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )

    patient_number = counter["sequence"]

    patient_id = f"PAT-{patient_number:04d}"

    patient_document = {
        "patient_id": patient_id,
        "name": patient.name,
        "date_of_birth": patient.date_of_birth.isoformat(),
        "gender": patient.gender,
        "phone": patient.phone,
        "address": patient.address,
        "created_at": datetime.now(timezone.utc)
    }

    patients_collection.insert_one(patient_document)

    patient_document.pop("_id", None)

    return {
        "message": "Patient created successfully",
        "patient": patient_document
    }


@router.get("/")
def get_patients():

    patients = list(
        patients_collection.find(
            {},
            {"_id": 0}
        )
    )

    return {
        "patients": patients
    }


@router.put("/{patient_id}")
def update_patient(
    patient_id: str,
    patient: PatientCreate
):

    updated_patient = patients_collection.find_one_and_update(
        {"patient_id": patient_id},
        {
            "$set": {
                "name": patient.name,
                "date_of_birth": patient.date_of_birth.isoformat(),
                "gender": patient.gender,
                "phone": patient.phone,
                "address": patient.address,
            }
        },
        return_document=ReturnDocument.AFTER
    )

    if updated_patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    updated_patient.pop("_id", None)

    return {
        "message": "Patient updated successfully",
        "patient": updated_patient
    }