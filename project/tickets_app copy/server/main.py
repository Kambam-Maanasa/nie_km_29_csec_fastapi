from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId

from pwdlib import PasswordHash
import jwt

from datetime import datetime, timedelta, timezone
from fastapi.middleware.cors import CORSMiddleware
import os


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="Hospital Support Request System"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# MONGODB
# =========================================================

MONGODB_URL = os.getenv("MONGODB_URL")

client = MongoClient(MONGODB_URL)

db = client["hospital_support"]

user_collection = db["users"]

request_collection = db["support_requests"]


# =========================================================
# PASSWORD + JWT
# =========================================================

password_hash = PasswordHash.recommended()

SECRET_KEY = os.getenv("SECRET_KEY")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)


# =========================================================
# ROLE CONSTANTS
# =========================================================

NURSE = 1
DOCTOR = 2
DEPARTMENT_STAFF = 3
ADMIN = 4
PATIENT = 5


# =========================================================
# USER MODEL
# =========================================================

class UserRegister(BaseModel):
    username: str
    password: str
    role: int = PATIENT


# =========================================================
# REQUEST CREATION MODEL
# =========================================================
# Used when a PATIENT creates a new request.
#
# Status is NOT taken from the frontend.
# Every newly created request starts as "Open".
# =========================================================

class SupportRequestCreate(BaseModel):

    patient_id: str

    patient_name: str

    department: str

    request_type: str

    description: str

    priority: str


# =========================================================
# NURSE UPDATE MODEL
# =========================================================
# Nurse can update general/request information.
#
# Nurse cannot change:
# - prescription
# - doctor notes
# - staff update
# - status
# =========================================================

class NurseUpdate(BaseModel):

    patient_id: str

    patient_name: str

    department: str

    request_type: str

    description: str

    priority: str


# =========================================================
# DOCTOR UPDATE MODEL
# =========================================================
# Doctor can update clinical information.
# =========================================================

class DoctorUpdate(BaseModel):

    description: str

    priority: str

    prescription: str = ""

    doctor_notes: str = ""


# =========================================================
# DEPARTMENT STAFF UPDATE MODEL
# =========================================================
# Department staff receives the doctor's information,
# performs the required work and updates the request.
# =========================================================

class StaffUpdate(BaseModel):

    staff_update: str

    status: str

class StatusUpdate(BaseModel):
    status: str
# =========================================================
# REQUEST RESPONSE HELPER
# =========================================================

def request_helper(request):

    return {
        "id": str(request["_id"]),

        "patient_id": request.get("patient_id", ""),

        "patient_name": request.get("patient_name", ""),

        "department": request.get("department", ""),

        "request_type": request.get("request_type", ""),

        "description": request.get("description", ""),

        "priority": request.get("priority", ""),

        "status": request.get("status", "Open"),

        "prescription": request.get("prescription", ""),

        "doctor_notes": request.get("doctor_notes", ""),

        "staff_update": request.get("staff_update", ""),

        "created_by": request.get("created_by", "")
    }


# =========================================================
# OBJECT ID VALIDATION
# =========================================================

def get_object_id(id: str):

    try:
        return ObjectId(id)

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid request ID"
        )


# =========================================================
# REGISTER
# =========================================================

@app.post("/register")
def register(user: UserRegister):

    # Check whether username already exists

    existing_user = user_collection.find_one(
        {
            "username": user.username
        }
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )


    # Check valid role

    valid_roles = {
        NURSE,
        DOCTOR,
        DEPARTMENT_STAFF,
        ADMIN,
        PATIENT
    }

    if user.role not in valid_roles:

        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )


    # Hash password

    hashed_password = password_hash.hash(
        user.password
    )


    # Store user

    user_collection.insert_one(
        {
            "username": user.username,
            "password": hashed_password,
            "role": user.role
        }
    )


    return {
        "message": "User registered successfully"
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    # Find user

    user = user_collection.find_one(
        {
            "username": form_data.username
        }
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )


    # Verify password

    if not password_hash.verify(
        form_data.password,
        user["password"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )


    # Create JWT payload

    payload = {

        "sub": str(user["_id"]),

        "username": user["username"],

        "role": user["role"],

        "exp": datetime.now(timezone.utc)
        + timedelta(hours=2)
    }


    # Create token

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm="HS256"
    )


    return {

        "access_token": token,

        "token_type": "bearer",

        "username": user["username"],

        "role": user["role"]
    }


# =========================================================
# GET CURRENT USER
# =========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        return payload

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


# =========================================================
# ROLE CHECKER
# =========================================================

def require_roles(*allowed_roles):

    def role_checker(
        current_user=Depends(get_current_user)
    ):

        user_role = current_user.get("role")


        if user_role not in allowed_roles:

            raise HTTPException(
                status_code=403,
                detail="You do not have permission to perform this action"
            )


        return current_user

    return role_checker


# =========================================================
# CREATE REQUEST
# =========================================================
#
# PATIENT:
#   Can create a new request.
#
# The request automatically starts as:
#   Open
#
# Patient cannot decide the status.
# =========================================================

@app.post("/requests")
def create_request(

    request: SupportRequestCreate,

    current_user=Depends(
        require_roles(PATIENT)
    )
):

    request_data = request.model_dump()


    # New request always starts as Open

    request_data["status"] = "Open"


    # Doctor-related fields

    request_data["prescription"] = ""

    request_data["doctor_notes"] = ""


    # Department staff field

    request_data["staff_update"] = ""


    # Store who created the request

    request_data["created_by"] = current_user.get(
        "username"
    )


    # Insert into MongoDB

    result = request_collection.insert_one(
        request_data
    )


    return {

        "message": "Hospital support request created successfully",

        "id": str(result.inserted_id)
    }


# =========================================================
# GET ALL REQUESTS
# =========================================================
#
# EVERY ROLE can read requests.
#
# Patient:
#   READ ONLY
#
# Nurse:
#   READ
#
# Doctor:
#   READ
#
# Department Staff:
#   READ
#
# Admin:
#   READ
# =========================================================

@app.get("/requests")
def get_requests(

    current_user=Depends(
        require_roles(
            PATIENT,
            NURSE,
            DOCTOR,
            DEPARTMENT_STAFF,
            ADMIN
        )
    )
):

    requests = request_collection.find()


    return [
        request_helper(request)
        for request in requests
    ]


# =========================================================
# GET ONE REQUEST
# =========================================================
#
# Reading one request is also allowed for every role.
# =========================================================

@app.get("/requests/{id}")
def get_request(

    id: str,

    current_user=Depends(
        require_roles(
            PATIENT,
            NURSE,
            DOCTOR,
            DEPARTMENT_STAFF,
            ADMIN
        )
    )
):

    object_id = get_object_id(id)


    request = request_collection.find_one(
        {
            "_id": object_id
        }
    )


    if not request:

        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )


    return request_helper(request)


# =========================================================
# NURSE UPDATE
# =========================================================
#
# Nurse can update general request information.
#
# Nurse CANNOT update:
# - prescription
# - doctor notes
# - staff update
# - status
# =========================================================

@app.put("/requests/{id}/nurse")
def nurse_update_request(

    id: str,

    request: NurseUpdate,

    current_user=Depends(
        require_roles(
            NURSE,
            ADMIN
        )
    )
):

    object_id = get_object_id(id)


    result = request_collection.update_one(

        {
            "_id": object_id
        },

        {
            "$set": {

                "patient_id":
                    request.patient_id,

                "patient_name":
                    request.patient_name,

                "department":
                    request.department,

                "request_type":
                    request.request_type,

                "description":
                    request.description,

                "priority":
                    request.priority
            }
        }
    )


    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )


    return {
        "message": "Request updated successfully by nurse"
    }


# =========================================================
# DOCTOR UPDATE
# =========================================================
#
# Doctor can update:
# - description
# - priority
# - prescription
# - doctor notes
#
# Doctor cannot directly mark the request as Resolved.
# Department staff handles resolution.
# =========================================================

@app.put("/requests/{id}/doctor")
def doctor_update_request(

    id: str,

    request: DoctorUpdate,

    current_user=Depends(
        require_roles(
            DOCTOR,
            ADMIN
        )
    )
):

    object_id = get_object_id(id)


    result = request_collection.update_one(

        {
            "_id": object_id
        },

        {
            "$set": {

                "description":
                    request.description,

                "priority":
                    request.priority,

                "prescription":
                    request.prescription,

                "doctor_notes":
                    request.doctor_notes
            }
        }
    )


    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )


    return {
        "message": "Doctor information updated successfully"
    }


# =========================================================
# DEPARTMENT STAFF UPDATE
# =========================================================
#
# Department staff:
# - receives doctor information
# - performs required action
# - adds staff update
# - changes status
#
# Allowed statuses:
#   In Progress
#   Resolved
# =========================================================

@app.put("/requests/{id}/staff")
def staff_update_request(

    id: str,

    request: StaffUpdate,

    current_user=Depends(
        require_roles(
            DEPARTMENT_STAFF,
            ADMIN
        )
    )
):

    object_id = get_object_id(id)


    # Only these statuses are allowed

    allowed_statuses = {
        "In Progress",
        "Resolved"
    }


    if request.status not in allowed_statuses:

        raise HTTPException(

            status_code=400,

            detail=(
                "Department staff can only set "
                "status to 'In Progress' or 'Resolved'"
            )
        )


    result = request_collection.update_one(

        {
            "_id": object_id
        },

        {
            "$set": {

                "staff_update":
                    request.staff_update,

                "status":
                    request.status
            }
        }
    )


    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )


    return {
        "message": "Department staff updated the request successfully"
    }

@app.put("/requests/{id}/status")
def update_request_status(
    id: str,
    request: StatusUpdate,
    current_user=Depends(
        require_roles(
            PATIENT,
            NURSE,
            DOCTOR,
            DEPARTMENT_STAFF,
            ADMIN
        )
    )
):

    object_id = get_object_id(id)

    allowed_statuses = {
        "Open",
        "In Progress",
        "On Hold",
        "Resolved",
        "Closed"
    }

    if request.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    result = request_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": request.status
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    return {
        "message": "Request status updated successfully"
    }
# =========================================================
# DELETE REQUEST
# =========================================================
#
# Only Nurse and Admin can delete.
#
# BUT:
# Nurse can delete ONLY Resolved requests.
# =========================================================

@app.delete("/requests/{id}")
def delete_request(

    id: str,

    current_user=Depends(
        require_roles(
            NURSE,
            ADMIN
        )
    )
):

    object_id = get_object_id(id)


    # Find request first

    request = request_collection.find_one(
        {
            "_id": object_id
        }
    )


    if not request:

        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )


    # Admin can delete any request

    user_role = current_user.get("role")


    if user_role == NURSE:

        # Nurse can delete ONLY resolved requests

        if request.get("status") != "Resolved":

            raise HTTPException(

                status_code=400,

                detail=(
                    "Nurse can delete only resolved requests"
                )
            )


    # Delete request

    result = request_collection.delete_one(
        {
            "_id": object_id
        }
    )


    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )


    return {
        "message": "Request deleted successfully"
    }