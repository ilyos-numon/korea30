"""Generate deterministic photo fixtures for unit and E2E tests.

Run: uvx --with pillow python tests/e2e/fixtures/make-photo-fixtures.py

- photo-exif.jpg: 640x480 gradient, EXIF DateTimeOriginal/CreateDate 2026:10:20 09:15:00,
  GPS 37.5665 N / 126.9780 E, Orientation 1 (GPS is there so the app can prove it strips it).
- photo-plain.png: 320x240 gradient, no metadata.
"""

from fractions import Fraction
from pathlib import Path

from PIL import Image
from PIL.TiffImagePlugin import IFDRational

HERE = Path(__file__).resolve().parent
TAKEN = "2026:10:20 09:15:00"


def gradient(width: int, height: int) -> Image.Image:
    img = Image.new("RGB", (width, height))
    px = img.load()
    for y in range(height):
        for x in range(width):
            px[x, y] = (x * 255 // (width - 1), y * 255 // (height - 1), 128)
    return img


def dms(value: float) -> tuple:
    deg = int(value)
    rest = (value - deg) * 60
    minutes = int(rest)
    seconds = round((rest - minutes) * 60, 4)
    frac = Fraction(seconds).limit_denominator(10000)
    return (
        IFDRational(deg, 1),
        IFDRational(minutes, 1),
        IFDRational(frac.numerator, frac.denominator),
    )


def make_exif_jpg() -> None:
    img = gradient(640, 480)
    exif = Image.Exif()
    exif[0x0112] = 1  # Orientation
    exif_ifd = exif.get_ifd(0x8769)
    exif_ifd[0x9003] = TAKEN  # DateTimeOriginal
    exif_ifd[0x9004] = TAKEN  # CreateDate (DateTimeDigitized)
    gps = exif.get_ifd(0x8825)
    gps[0x0001] = "N"
    gps[0x0002] = dms(37.5665)
    gps[0x0003] = "E"
    gps[0x0004] = dms(126.9780)
    out = HERE / "photo-exif.jpg"
    img.save(out, "JPEG", quality=85, exif=exif.tobytes())
    size = out.stat().st_size
    assert size < 200 * 1024, size


def make_plain_png() -> None:
    img = gradient(320, 240)
    img.save(HERE / "photo-plain.png", "PNG", optimize=False)


def verify() -> None:
    with Image.open(HERE / "photo-exif.jpg") as im:
        exif = im.getexif()
        assert exif.get_ifd(0x8769).get(0x9003) == TAKEN
        gps = exif.get_ifd(0x8825)
        assert gps.get(0x0001) == "N" and gps.get(0x0003) == "E", gps
    with Image.open(HERE / "photo-plain.png") as im:
        assert not im.getexif(), "png must have no EXIF"
        assert "exif" not in im.info


if __name__ == "__main__":
    make_exif_jpg()
    make_plain_png()
    verify()
    print("ok")
