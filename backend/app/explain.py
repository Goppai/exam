import os, json
from app.services.zhipu_client import get_client, call_model, load_prompt

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_EXPLAIN_MATH = load_prompt(os.path.join(BASE_DIR, "prompts", "explain_math.txt"))
PROMPT_EXPLAIN_ENG = load_prompt(os.path.join(BASE_DIR, "prompts", "explain_english.txt"))


def explain_question(payload: dict):
    subject = payload.get("subject", "math")
    question = payload.get("question", {})

    tpl = PROMPT_EXPLAIN_MATH if subject == "math" else PROMPT_EXPLAIN_ENG
    prompt = tpl.replace("{{QUESTION_JSON}}",
                          json.dumps(question, ensure_ascii=False, indent=2))

    client = get_client()
    return {"explanation": call_model(client, prompt)}
