from PIL import Image
import io, base64


def compress_image(image_bytes, max_size=1600, quality=80):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size
    scale = min(max_size / max(w, h), 1.0)
    if scale < 1:
        img = img.resize((int(w*scale), int(h*scale)))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality)
    return base64.b64encode(buf.getvalue()).decode("utf-8")
