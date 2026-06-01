import json
import os

from groq import AsyncGroq


# Configure Groq client
# It will automatically pick up GROQ_API_KEY from the environment
def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("WARNING: GROQ_API_KEY is not set.")
    return AsyncGroq(api_key=api_key)


async def analyze_quiz_answers(answers_dict: dict) -> dict:
    """
    Sends the user's raw answers to the Groq LLM (llama-3.1-8b-instant)
    to determine their initial flashcard difficulty level.
    """
    client = get_groq_client()

    system_prompt = (
        "You are a Korean language learning specialist. Based on a student's quiz answers, "
        "determine the appropriate flashcard difficulty level.\n\n"
        "Respond ONLY with a valid JSON object, no explanation, no markdown:\n"
        "{\n"
        '  "flashcard_difficulty": "easy" | "medium" | "hard",\n'
        '  "reasoning": "one sentence explaining why"\n'
        "}\n\n"
        "Rules:\n"
        "- easy: complete beginners, no prior Korean, low time commitment\n"
        "- medium: some exposure to Korean, casual learners, moderate time\n"
        "- hard: prior study experience, took TOPIK before, high time commitment or exam goal"
    )

    user_message = (
        f"Here are the student's quiz answers:\n{json.dumps(answers_dict, indent=2)}"
    )

    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            model="llama-3.1-8b-instant",
            temperature=0.2,  # Low temperature for more deterministic JSON output
            response_format={"type": "json_object"},
        )

        response_content = chat_completion.choices[0].message.content
        return json.loads(response_content)

    except Exception as e:
        print(f"Failed to analyze quiz answers via Groq: {e}")
        # Fallback in case the LLM call fails
        return {
            "flashcard_difficulty": "medium",
            "reasoning": "Fallback to medium difficulty due to AI service unavailability.",
        }
