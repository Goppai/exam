import os, json, base64, io
from zai import ZhipuAiClient
from app.utils.image import compress_image
from app.services.zhipu_client import get_client, call_model
from app.services.zhipu_client import load_prompt


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_MATH = load_prompt(os.path.join(BASE_DIR, "prompts", "prompt_math.txt"))
PROMPT_ENGLISH = load_prompt(os.path.join(BASE_DIR, "prompts", "prompt_english.txt"))


async def extract_exam(file, subject: str):
    content = await file.read()

    image_base64 = compress_image(content)
    image_url = f"data:image/jpeg;base64,{image_base64}"

    client = get_client()

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
    content = call_model(client, prompt, image_url)

    try:
        return json.loads(content)
    except Exception:
        return {"raw_output": content}
