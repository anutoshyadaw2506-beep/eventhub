import sys
import os
import logging
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger("eventhub.vercel")

# Ensure backend directory is in Python path for absolute imports
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

@app.middleware("http")
async def fix_vercel_path_middleware(request: Request, call_next):
    raw_subpath = request.query_params.get("__path__")
    if raw_subpath:
        if raw_subpath in ["docs", "openapi.json", "redoc"]:
            request.scope["path"] = f"/{raw_subpath}"
        else:
            request.scope["path"] = f"/api/{raw_subpath}"

    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Error handling request {request.url}: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"}
        )
