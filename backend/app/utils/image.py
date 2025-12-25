from PIL import Image, ImageOps
import io
import base64


def compress_image(
    image_bytes: bytes,
    max_size: int = 1400,     # 最长边，建议 1200~1600
    quality: int = 75,       # JPEG 质量，70~80 很平衡
) -> str:
    """
    压缩图片并返回 base64 字符串：
    - 修正 EXIF 方向
    - 按最长边缩放
    - 转 RGB + JPEG 压缩
    """

    # 1️⃣ 读取图片 + 修正方向
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)  # 防止手机拍照旋转
    img = img.convert("RGB")

    # 2️⃣ 按最长边缩放（不放大）
    w, h = img.size
    if max(w, h) > max_size:
        scale = max_size / max(w, h)
        new_size = (int(w * scale), int(h * scale))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

    # 3️⃣ 保存为 JPEG 到内存
    buf = io.BytesIO()
    img.save(
        buf,
        format="JPEG",
        quality=quality,
        optimize=True,       # 优化 Huffman 表，体积更小
        progressive=True,   # 渐进式 JPEG
        subsampling=2       # 4:2:0 采样，更省体积
    )

    return base64.b64encode(buf.getvalue()).decode("utf-8")

