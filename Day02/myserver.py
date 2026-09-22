from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
def home():   #user defined name - identifier
    return {"message" : "Hospital Support Request System - Server"}

db = {
    1 : {"id" : 1,"title" : "Equipment issue",
         "description" : "Not scanning properly",
         "category" : "Hardware", "status" : "NEW"},
    2 : {"id" : 2,"title" : "IT issue",
         "description" : "Network problem",
         "category" : "Software", "status" : "NEW"}
}

# Schemas
class RequestCreate(BaseModel):
    title : str
    description : str
    category : str
    status : str
    
class RequestResponse(RequestCreate):
    id : int
# APIs
@app.get("/requests")
def request_read_all():
    return list(db.values())

@app.get("/requests/{id}")
def request_read_by_id(id : int):
    if id not in db:
        raise HTTPException(detail="Request Not Found",status_code=404)
    return db[id]

@app.post("/requests", status_code=201, response_model=RequestResponse)
def request_create(request_payload : RequestCreate):
    new_id = max(db.keys(), default=0) + 1
    db[new_id] = {"id" : new_id, **request_payload.model_dump()}
    return db[new_id]

@app.put("/requests/{id}",response_model=RequestResponse)
def requests_update(id : int, payload : RequestCreate):
    if id not in db:
        raise HTTPException(detail="Request Not Found",status_code=404)
    db[id] = {"id" : id, **payload.model_dump()}
    return db[id]

@app.delete("/requests/{id}")
def requests_delete(id : int):
    if id not in db:
        raise HTTPException(detail="Request Not Found",status_code=404)
    del db[id]
    return {"message" : "Request Deleted Successfully"}