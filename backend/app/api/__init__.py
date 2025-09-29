# Import all routers here to make them available when importing from app.api
from .counties import router as counties_router
from .minigrids import router as minigrids_router
from .dashboard import router as dashboard_router
from .recommendations import router as recommendations_router

# This makes it easier to import routers in other parts of the application
__all__ = [
    'counties_router',
    'minigrids_router',
    'dashboard_router',
    'recommendations_router'
]
