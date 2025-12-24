import os, time
from zai import ZhipuAiClient


def get_client():
    api_key = os.getenv("ZHIPU_API_KEY")
    return ZhipuAiClient(api_key=api_key)


def call_model(client, prompt, image_url=None, retry=2):
    if not prompt or not prompt.strip():
        raise ValueError("call_model received empty prompt!")

    # ✅ 永远保证 text 在第一个
    content = [{"type": "text", "text": prompt}]

    print("CALL content:", content)


    if image_url:
        content.append({"type": "image_url", "image_url": {"url": image_url}})

    last_err = None
    for _ in range(retry + 1):
        try:
            resp = client.chat.completions.create(
                model="glm-4.6v",
                messages=[{"role": "user", "content": content}],
                timeout=120
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            last_err = e
            time.sleep(1)

    raise last_err



def load_prompt(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()
