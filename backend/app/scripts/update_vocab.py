import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

file_path = "app/api/v1/endpoints/vocab.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# We need to import User, get_current_user, UserVocabProgress, etc.
if "from app.models.user import User" not in content:
    content = content.replace(
        "from app.models.srs import VocabItem",
        "from app.models.srs import VocabItem, UserVocabProgress\nfrom app.models.user import User\nfrom app.api.v1.endpoints.auth import get_current_user\nfrom datetime import datetime, timezone"
    )

new_func = """
@router.get("/flashcards", response_model=List[VocabItemResponse])
def get_daily_flashcards(
    level: Optional[str] = Query("All"),
    limit: int = Query(20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import json
    
    redis = None
    try:
        redis = get_redis()
    except:
        pass

    today_str = date.today().isoformat()
    cache_key = f"flashcards:u{current_user.id}:{today_str}:lvl{level}"
    
    if redis:
        cached_pool = redis.get(cache_key)
        if cached_pool:
            try:
                cached_data = json.loads(cached_pool)
                # If cached data exists, return it
                return [VocabItemResponse(**item) for item in cached_data]
            except:
                pass

    # 1. Fetch due cards
    now = datetime.now(timezone.utc)
    due_progress = db.query(UserVocabProgress).join(VocabItem).filter(
        UserVocabProgress.user_id == current_user.id,
        UserVocabProgress.next_review <= now
    )
    
    if level and level != "All":
        try:
            level_id = int(level)
            due_progress = due_progress.filter(VocabItem.level_id == level_id)
        except ValueError:
            pass
            
    due_items = due_progress.limit(limit).all()
    due_vocab_ids = [p.vocab_id for p in due_items]
    
    # 2. If short of limit, fetch new cards
    new_cards_needed = limit - len(due_vocab_ids)
    new_vocab_items = []
    
    if new_cards_needed > 0:
        # Get all vocab IDs for this user that already have progress
        all_user_progress = db.query(UserVocabProgress.vocab_id).filter(UserVocabProgress.user_id == current_user.id).all()
        learned_ids = {p[0] for p in all_user_progress}
        
        # Query for new cards
        new_query = db.query(VocabItem)
        if level and level != "All":
            try:
                new_query = new_query.filter(VocabItem.level_id == int(level))
            except:
                pass
                
        # Get all available new IDs
        available_new_ids = [v.id for v in new_query.with_entities(VocabItem.id).all() if v.id not in learned_ids]
        
        # Pick randomly
        import random
        random.seed(f"{today_str}-{current_user.id}-{level}") # deterministic fallback
        sampled_new_ids = random.sample(available_new_ids, min(new_cards_needed, len(available_new_ids)))
        
        new_vocab_items = db.query(VocabItem).filter(VocabItem.id.in_(sampled_new_ids)).all()

    # Combine VocabItems
    due_vocab_items = [p.vocab_item for p in due_items]
    final_vocab_items = due_vocab_items + new_vocab_items
    
    # Generate or fetch examples
    words = [item.word for item in final_vocab_items]
    lvl_int = int(level) if level and level != "All" else 0
    examples_map = _get_or_generate_examples(words, lvl_int)

    response_items = []
    for item in final_vocab_items:
        ex = examples_map.get(item.word)
        if not ex:
            ex = {
                "korean": f"'{item.word}' 단어를 연습하세요.",
                "english": f"Practice the word '{item.word}'.",
                "romanization": item.word,
            }
            
        # Find interval
        interval = 0
        for p in due_items:
            if p.vocab_id == item.id:
                interval = p.interval
                break

        response_items.append(
            VocabItemResponse(
                id=item.id,
                front=item.word,
                back=item.meaning,
                romanization=item.pronunciation or ex.get("romanization"),
                example=ex,
                level=str(item.level_id),
                interval=interval,
            )
        )

    # Save to Redis
    if redis and response_items:
        # Cache for 24 hours (86400 seconds)
        try:
            redis.setex(cache_key, 86400, json.dumps([item.dict() for item in response_items], ensure_ascii=False))
        except:
            pass

    return response_items
"""

import re
content = re.sub(r'@router\.get\("/flashcards".*?return response_items', new_func, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated vocab.py with personalized SRS logic and caching.")
