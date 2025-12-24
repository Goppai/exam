import sys
import os
import json
import base64
import argparse
import io

from PIL import Image
from dotenv import load_dotenv
from zai import ZhipuAiClient
from datetime import datetime



# ========= utils =========

def load_prompt(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def encode_image_to_base64(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")
    

def compress_image(image_path, max_size=1600, quality=80):
    img = Image.open(image_path).convert("RGB")
    w, h = img.size
    scale = min(max_size / max(w, h), 1.0)
    if scale < 1:
        img = img.resize((int(w*scale), int(h*scale)))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality)
    return base64.b64encode(buf.getvalue()).decode("utf-8")



def call_model(client, prompt, image_url, debug=False):
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
    content = response.choices[0].message.content
    if debug:
        print("\n========== RAW MODEL OUTPUT ==========")
        print(content)
        print("=====================================\n")
    return content.strip()


# ========= main =========

def main():
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
    # 原图加载
    # image_base64 = encode_image_to_base64(image_path)
    # 压缩图加载
    image_base64 = compress_image(image_path)

    image_url = f"data:image/jpeg;base64,{image_base64}"

    client = ZhipuAiClient(api_key=api_key)

    subject = args.subject

    # ===== auto detect =====
    if subject == "auto":
        print("🔍 Detecting subject...")
        auto_prompt = "请判断该试卷图片的学科类型，只输出一个词：数学 / 英语 / 未知"
        res = call_model(client, auto_prompt, image_url, debug=args.debug)
        if "数" in res:
            subject = "math"
        elif "英" in res:
            subject = "english"
        else:
            print("⚠️ Subject unknown, default to math")
            subject = "math"

    print(f"📘 Using subject: {subject}")

    prompt = PROMPT_MATH if subject == "math" else PROMPT_ENGLISH

    print("🚀 Parsing exam with glm-4.6v...")
    content = call_model(client, prompt, image_url, debug=args.debug)

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        print("⚠️ Output is not valid JSON, saving raw output.")
        data = {"raw_output": content}

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    out_name = f"{base_name}_{ts}.json"
    with open(out_name, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ Done! Result saved to: {out_name}")


if __name__ == "__main__":
    main()
