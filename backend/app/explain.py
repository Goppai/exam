import os, json, time, hashlib
from app.services.zhipu_client import get_client, call_model, load_prompt

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_EXPLAIN_MATH = load_prompt(os.path.join(BASE_DIR, "prompts", "explain_math.txt"))
PROMPT_EXPLAIN_ENG = load_prompt(os.path.join(BASE_DIR, "prompts", "explain_english.txt"))

CACHE_DIR = os.path.join(BASE_DIR, "..", "cache_explain")
os.makedirs(CACHE_DIR, exist_ok=True)
CACHE_DELAY_SECONDS = float(os.getenv("CACHE_DELAY_SECONDS", "12"))


def md5(s: str) -> str:
    return hashlib.md5(s.encode("utf-8")).hexdigest()


def explain_question(payload: dict):
    t0 = time.time()

    subject = payload.get("subject", "math")
    question = payload.get("question", {})

    if subject not in ("math", "english"):
        subject = "math"

    tpl = PROMPT_EXPLAIN_MATH if subject == "math" else PROMPT_EXPLAIN_ENG

    # ✅ prompt 模板兜底
    if not tpl or not tpl.strip():
        print("⚠️ Explain prompt template empty, fallback to math.")
        tpl = PROMPT_EXPLAIN_MATH

    q_str = json.dumps(question, ensure_ascii=False, sort_keys=True)
    cache_key = md5(subject + ":" + q_str)
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.json")

    # ✅ 命中缓存
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            cached = json.load(f)
        if CACHE_DELAY_SECONDS > 0:
            time.sleep(CACHE_DELAY_SECONDS)
        cost = round(time.time() - t0, 2)
        return {
            "from_cache": True,
            "cost": cost,
            "explanation": cached.get("explanation", "")
        }

    prompt = tpl.replace("{{QUESTION_JSON}}",
                          json.dumps(question, ensure_ascii=False, indent=2))

    if not prompt.strip():
        raise ValueError("Explain prompt is empty after replace!")

    client = get_client()
    explanation = call_model(client, prompt)

    cost = round(time.time() - t0, 2)

    result = {
        "from_cache": False,
        "cost": cost,
        "explanation": explanation
    }

    # ✅ 写缓存
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    return result
