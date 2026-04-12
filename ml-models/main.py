from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import disease, diabetes, heart, clustering

app = FastAPI(title="Healthcare ML API")

# Allow Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(disease.router)
app.include_router(diabetes.router)
app.include_router(heart.router)
app.include_router(clustering.router)

@app.get("/")
def root():
    return {"message": "Healthcare ML API is running!"}