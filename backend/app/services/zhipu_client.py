import os
from zai import ZhipuAiClient


def get_client():
    api_key = os.getenv("ZHIPU_API_KEY")
    return ZhipuAiClient(api_key=api_key)


def call_model(client, prompt, image_url=None):
    content = [{"type": "text", "text": prompt}]
    if image_url:
        content.insert(0, {"type": "image_url", "image_url": {"url": image_url}})

    resp = client.chat.completions.create(
        model="glm-4.6v",
        messages=[{"role": "user", "content": content}]
    )
    return resp.choices[0].message.content.strip()


def load_prompt(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()
