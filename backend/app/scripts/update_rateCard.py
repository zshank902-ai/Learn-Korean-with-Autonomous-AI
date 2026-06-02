import os
import re

file_path = "D:/Python Workshop/K-Mastery/frontend/src/store/useKMasteryStore.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_rateCard = """  rateCard: async (rating) => {
    let xpGain = 0;
    let quality = 0;
    
    if (rating === 'again') quality = 0;
    if (rating === 'hard') quality = 2;
    if (rating === 'good') { xpGain = 10; quality = 4; }
    if (rating === 'easy') { xpGain = 20; quality = 5; }

    const state = useKMasteryStore.getState();
    const currentCard = state.flashcardDeck[state.currentCardIndex];

    if (currentCard) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_ENDPOINTS.VOCAB}/flashcards/review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            vocab_id: parseInt(currentCard.id),
            quality: quality
          })
        });
      } catch (e) {
        console.error("Failed to sync flashcard review", e);
      }
    }

    if (xpGain > 0) {
      state.updateXP(xpGain);
    }
    state.advanceCard();
  },"""

content = re.sub(r"  rateCard: \(rating\) => \{.*?(?=\n  loadFlashcards:)", new_rateCard + "\n", content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated rateCard in useKMasteryStore.ts")
