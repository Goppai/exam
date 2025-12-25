import sys
import os
import json
import base64
import argparse
import io
import time

from PIL import Image
from dotenv import load_dotenv
from zai import ZhipuAiClient
from datetime import datetime

from app.utils.image import compress_image


# ========= utils =========

def load_prompt(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def call_model(client, prompt, image_url, debug=False):
    start = time.perf_counter()
    response = client.chat.completions.create(
        model="glm-4.6v",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ],
        # thinking={"type": "enabled"}
    )
    cost = time.perf_counter() - start

    content = response.choices[0].message.content

    usage = getattr(response, "usage", None)
    tokens = None
    if usage:
        prompt_t = getattr(usage, "prompt_tokens", None)
        completion_t = getattr(usage, "completion_tokens", None)
        total_t = getattr(usage, "total_tokens", None)

        tokens = total_t
        print(
            f"    ↳ tokens: prompt={prompt_t}, "
            f"completion={completion_t}, total={total_t}"
        )

    if debug:
        print("\n========== RAW MODEL OUTPUT ==========")
        print(content)
        print("=====================================\n")

    return content.strip(), tokens, cost



# ========= main =========

def main():
    start_total = time.perf_counter()

    parser = argparse.ArgumentParser()
    parser.add_argument("image", help="exam image path")
    parser.add_argument(
        "--subject",
        choices=["math", "english", "auto"],
        default="auto",
        help="subject type"
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="print raw model output"
    )
    args = parser.parse_args()

    image_path = args.image
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        sys.exit(1)

    load_dotenv()
    api_key = os.getenv("ZHIPU_API_KEY")
    if not api_key:
        print("❌ Please set ZHIPU_API_KEY in .env file")
        sys.exit(1)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_math_path = os.path.join(base_dir, "prompts", "prompt_math.txt")
    prompt_english_path = os.path.join(base_dir, "prompts", "prompt_english.txt")

    PROMPT_MATH = load_prompt(prompt_math_path)
    PROMPT_ENGLISH = load_prompt(prompt_english_path)

    # ===== Load image bytes =====
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    # 原始图片信息
    img0 = Image.open(io.BytesIO(image_bytes))
    w0, h0 = img0.size
    fmt0 = img0.format
    raw_kb = len(image_bytes) / 1024
    print(f"🖼️ Original image: {w0}x{h0}, format={fmt0}, size={raw_kb:.1f} KB")

    # ===== Compress image =====
    image_base64 = compress_image(image_bytes)
    comp_kb = len(image_base64) * 3 / 4 / 1024
    print(f"📦 Compressed image size: {comp_kb:.1f} KB")

    image_url = f"data:image/jpeg;base64,{image_base64}"

    client = ZhipuAiClient(api_key=api_key)

    subject = args.subject
    tokens1 = cost1 = None

    # ===== auto detect =====
    if subject == "auto":
        print("🔍 Detecting subject...")
        auto_prompt = "请判断该试卷图片的学科类型，只输出一个词：数学 / 英语 / 未知"
        res, tokens1, cost1 = call_model(client, auto_prompt, image_url, debug=args.debug)
        print(f"🔍 Subject detect done in {cost1:.2f}s, tokens: {tokens1}")

        if "数" in res:
            subject = "math"
        elif "英" in res:
            subject = "english"
        else:
            print("⚠️ Subject unknown, default to math")
            subject = "math"

    print(f"📘 Using subject: {subject}")

    prompt = PROMPT_MATH if subject == "math" else PROMPT_ENGLISH
    print(f"📝 Prompt length: {len(prompt)} chars")

    # ===== extract =====
    print("🚀 Parsing exam with glm-4.6v...")
    content, tokens2, cost2 = call_model(client, prompt, image_url, debug=args.debug)
    print(f"✅ Extract done in {cost2:.2f}s, tokens: {tokens2}")

    # ===== parse json =====
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        print("⚠️ Output is not valid JSON, saving raw output.")
        data = {"raw_output": content}

    # ===== save =====
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    out_name = f"{base_name}_{ts}.json"

    with open(out_name, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    json_kb = os.path.getsize(out_name) / 1024
    print(f"🧾 Output JSON size: {json_kb:.1f} KB")

    # ===== summary =====
    total_tokens = None
    if tokens2:
        total_tokens = tokens2
        if args.subject == "auto" and tokens1:
            total_tokens += tokens1

    if total_tokens:
        print(f"🔢 Total tokens used: {total_tokens}")

    if args.subject == "auto" and cost1 is not None:
        print(f"⏱️ Breakdown: detect={cost1:.2f}s, extract={cost2:.2f}s")
    else:
        print(f"⏱️ Breakdown: extract={cost2:.2f}s")

    total_cost = time.perf_counter() - start_total
    print(f"⏱️ Total time: {total_cost:.2f}s")

    print(f"✅ Done! Result saved to: {out_name}")


if __name__ == "__main__":
    main()
