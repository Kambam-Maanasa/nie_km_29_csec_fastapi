from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from pymongo import MongoClient
from bson import ObjectId 

# app
app = FastAPI(
    title="Hospital Support Request System",
    description="API for managing hospital facility and maintenance requests"
)

# db config
URL = "mongodb://127.0.0.1:27017"
client = MongoClient(URL)
db = client["hospital_support_request_system"]
request_collection = db["requests"]

# Schema pydantic
class RequestCreate(BaseModel):
    title : str
    description : str
    category : str
    status : str
    
class RequestResponse(RequestCreate):
    id : str #mongodb to python object should be string
    
# helper 
def request_helper(request_doc):
    return {
        "id" : str(request_doc["_id"]),
        "title" : request_doc["title"],
        "description" : request_doc["description"],
        "category" : request_doc["category"],
        "status" : request_doc["status"]
    }
    
# apis - CRUD - create, read all, read by id, update, delete
@app.post("/requests",tags=["Hospital Requests"],status_code = 201,response_model=RequestResponse) #200 - ok , 201 - resource
def request_create(payload:RequestCreate):
    request_dict = payload.model_dump()
    result = request_collection.insert_one(request_dict)
    new_request = request_collection.find_one({"_id : result.inserted_id"})
    return request_helper(new_request)

@app.get("/requests",tags=["Hospital Requests"],response_model = list[RequestResponse])
def request_read_all():
    docs = request_collection.find()
    requests = [request_helper(doc) for doc in docs]
    return requests

@app.get("/requests/{id}",tags=["Hospital Requests"],response_model = RequestResponse)
def request_read_by_id(id : str):
    if not ObjectId.is_valid(id):
        raise HTTPException(detail = "Invalid Request ID",status_code=403) #403 = forbidden
    doc = request_collection.find_one({"_id" : ObjectId(id)})
    if not doc:
        raise HTTPException(detail = "Request Not Found",status_code=404) #404 = Not found
    return request_helper(doc)

@app.put("/requests/{id}",tags=["Hospital Requests"],response_model = RequestResponse)
def request_update(id: str, payload:RequestCreate):
    if not ObjectId.is_valid(id):
        raise HTTPException(detail = "Invalid Request ID",status_code=403)
    request_dict = payload.model_dump()
    result = request_collection.update_one({"_id" : ObjectId(id)},
            {"$set" : request_dict})
    if result.matched_count == 0:
        raise HTTPException(detail = "Request Not Found",status_code=404)
    new_request = request_collection.find_one({"_id" : ObjectId(id)})
    return request_helper(new_request)

@app.delete("/requests/{id}",tags=["Hospital Requests"])
def request_delete(id:str):
    if not ObjectId.is_valid(id):
        raise HTTPException(detail = "Invalid Request ID",status_code=403)
    result = request_collection.delete_one({"_id" : ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(detail = "Request Not Found",status_code=404)
    return {"message" : "Request Deleted Successfully"}
        

