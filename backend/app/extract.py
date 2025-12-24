import os, json, time, hashlib
from app.utils.image import compress_image
from app.services.zhipu_client import get_client, call_model, load_prompt

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_MATH = load_prompt(os.path.join(BASE_DIR, "prompts", "prompt_math.txt"))
PROMPT_ENGLISH = load_prompt(os.path.join(BASE_DIR, "prompts", "prompt_english.txt"))

CACHE_DIR = os.path.join(BASE_DIR, "..", "cache")
os.makedirs(CACHE_DIR, exist_ok=True)


def md5(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


async def extract_exam(file, subject: str, debug: bool = False):
    t0 = time.time()
    content = await file.read()

    key = md5(content)
    cache_path = os.path.join(CACHE_DIR, f"{key}.json")

    # ✅ 命中缓存
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            cached = json.load(f)
        return {"from_cache": True, "cost": 0, "result": cached}

    image_base64 = compress_image(content)
    image_url = f"data:image/jpeg;base64,{image_base64}"

    client = get_client()

    # auto 学科判断
    if subject == "auto":
        auto_prompt = "请判断该试卷图片的学科类型，只输出一个词：数学 / 英语 / 未知"
        res = call_model(client, auto_prompt, image_url)
        if "数" in res:
            subject = "math"
        elif "英" in res:
            subject = "english"
        else:
            subject = "math"

    prompt = PROMPT_MATH if subject == "math" else PROMPT_ENGLISH

    raw = call_model(client, prompt, image_url)

    try:
        result = json.loads(raw)
    except Exception:
        result = {"raw_output": raw}

    cost = round(time.time() - t0, 2)

    # ✅ 写缓存
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    if debug:
        return {
            "from_cache": False,
            "cost": cost,
            "subject": subject,
            "raw": raw,
            "result": result
        }

    return {
        "from_cache": False,
        "cost": cost,
        "subject": subject,
        "result": result
    }
