from app.services.roadmap_service import get_level_structure

levels = get_level_structure()
total_modules = sum(len(level["modules"]) for level in levels)
print(f"Loaded {len(levels)} levels, {total_modules} total modules. Backend OK.")
