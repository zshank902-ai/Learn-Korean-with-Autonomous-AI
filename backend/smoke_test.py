from app.api.v1.endpoints.roadmap import router
from app.services.roadmap_service import get_level_structure

levels = get_level_structure()
total_modules = sum(len(l["modules"]) for l in levels)
print(f"Loaded {len(levels)} levels, {total_modules} total modules. Backend OK.")
