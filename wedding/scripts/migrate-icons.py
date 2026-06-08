# -*- coding: utf-8 -*-
"""Копирует и оптимизирует иконки из папки «иконки» в assets/icons/."""
import os
from pathlib import Path

from PIL import Image

IGRA = Path(r"f:\МОЯ ЗАГРУЗКИ\курсор\igra")
SRC = IGRA / "иконки"
OUT = IGRA / "assets" / "icons"

# UUID/имя файла в «иконки» → целевое имя (без расширения)
FILE_MAP = {
    "08da7c27-2fa5-4408-ab27-9f54f4865068.jpg": "btn-next",
    "935e18ab-f238-431e-9636-a53b3a1a5a89.jpg": "btn-back",
    "789d88af-11c2-4137-9ede-007e77bcda85.jpg": "progress-bar",
    "afaa0776-37e6-4a1d-94e4-9c201e11fc85.jpg": "icon-gift",
    "cedffff5-a35e-430e-b1c9-f4e75ebcbbaa.jpg": "icon-heart",
    "b2b4cc25-efa5-4651-8d94-45cc8a2151d0.jpg": "icon-check",
    "49216602-8d1c-4e58-8468-6583d1e41e05.jpg": "icon-share",
    "1b7d9a5b-e4f0-425a-8f95-c097887eb449.jpg": "icon-3-occasion",
    "Gemini_Generated_Image_7qk1c87qk1c87qk1.png": "icon-4-message",
    "d0b08bc0-fd01-4880-8820-98c8149df058.jpg": "icon-5-details",
    "83de5cb0-c262-444b-bfb4-26c1dfb4355c.jpg": "icon-2-character",
    "21f52203-417a-4e71-97fb-f41d59562e00.jpg": "icon-6-style",
}

# Шаги + алиасы для карточек
ALIASES = {
    "icon-1-person": "icon-gift",
    "icon-person": "icon-gift",
    "icon-calendar": "icon-3-occasion",
    "icon-message": "icon-4-message",
    "icon-details": "icon-5-details",
    "icon-style": "icon-6-style",
    "icon-character": "icon-2-character",
    "icon-creative": "icon-6-style",
    "icon-restart": "icon-share",
}

SIZES = {
    "btn-next": 160,
    "btn-back": 96,
    "progress-bar": 480,
    "default": 128,
}


def remove_white_bg(img: Image.Image, threshold: int = 238) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                pixels[x, y] = (r, g, b, 0)
    return img


def optimize(src_path: Path, name: str) -> None:
    img = Image.open(src_path)
    max_w = SIZES.get(name, SIZES["default"])
    img = remove_white_bg(img)
    if name == "progress-bar":
        if img.width > max_w:
            ratio = max_w / img.width
            img = img.resize((max_w, int(img.height * ratio)), Image.LANCZOS)
    else:
        w, h = img.size
        scale = min(1.0, max_w / max(w, h))
        if scale < 1.0:
            img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    png_path = OUT / f"{name}.png"
    webp_path = OUT / f"{name}.webp"
    img.save(png_path, "PNG", optimize=True)
    img.save(webp_path, "WEBP", quality=88, method=6)
    print(f"OK {name}: {png_path.stat().st_size // 1024}KB png, {webp_path.stat().st_size // 1024}KB webp")


def resolve_src(key: str) -> Path | None:
    """Ищет файл в «иконки» по точному имени или по UUID (в т.ч. «… копия»)."""
    exact = SRC / key
    if exact.exists():
        return exact
    stem = Path(key).stem
    for f in sorted(SRC.iterdir()):
        if not f.is_file():
            continue
        if f.stem.startswith(stem) or f.name.startswith(stem):
            return f
    return None


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    created = set()
    for src_name, dest in FILE_MAP.items():
        src = resolve_src(src_name)
        if src is None:
            print("MISSING", src_name)
            continue
        print(f"from {src.name} -> {dest}")
        optimize(src, dest)
        created.add(dest)

    for alias, target in ALIASES.items():
        if target not in created:
            continue
        for ext in (".png", ".webp"):
            src_f = OUT / f"{target}{ext}"
            dst_f = OUT / f"{alias}{ext}"
            if src_f.exists():
                dst_f.write_bytes(src_f.read_bytes())
                print(f"alias {alias}{ext} <- {target}")


if __name__ == "__main__":
    main()
