"""Record fixed app sentences with Supertonic 3 into MP3 files (development-time tool).

Run from the korea30 root:
  uv run --project /Users/illi/illy-projects/voice-agent --frozen --extra tts \
    python scripts/voice/record.py --manifest scripts/voice/manifest.json --out public/voice \
    [--only ko,vi] [--limit N] [--force] [--prune] [--check]
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
import wave
from collections.abc import Callable
from pathlib import Path

LANGS = ("ko", "vi", "en", "ru")
MAX_CHARS = 300
MIN_SEC = 0.30
MAX_SEC = 20.00
MAX_BYTES = 6291456


# Same rule as voice-agent app/pipeline/tts_supertonic.py sanitize_tts_text
# (reimplemented here, not imported).
def sanitize_tts_text(text: str, is_supported: Callable[[str], bool]) -> str:
    verdict = {ch: is_supported(ch) for ch in set(text)}
    cleaned = "".join(ch if verdict[ch] else " " for ch in text)
    return " ".join(cleaned.split())


def load_manifest(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def orphans(out: Path, entries: list[dict]) -> list[Path]:
    known = {e["file"] for e in entries}
    found: list[Path] = []
    for lang in LANGS:
        d = out / lang
        if not d.is_dir():
            continue
        for p in sorted(d.glob("*.mp3")):
            if f"{lang}/{p.name}" not in known:
                found.append(p)
    return found


def probe_duration(path: Path) -> float:
    res = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(res.stdout.strip())


def run_check(out: Path, entries: list[dict]) -> int:
    files = 0
    missing = 0
    total = 0
    durations: list[float] = []
    bad: list[str] = []
    for e in entries:
        p = out / e["file"]
        if not p.exists():
            missing += 1
            print(f"MISSING {e['file']}")
            continue
        files += 1
        total += p.stat().st_size
        try:
            d = probe_duration(p)
        except (subprocess.CalledProcessError, ValueError):
            bad.append(e["file"])
            print(f"BAD {e['file']}")
            continue
        durations.append(d)
        if d < MIN_SEC or d > MAX_SEC:
            print(f"RANGE {e['file']} {d:.2f}s")
    orphan = orphans(out, entries)
    for p in orphan:
        print(f"ORPHAN {p}")
    lo = min(durations) if durations else 0.0
    hi = max(durations) if durations else 0.0
    ok = (
        missing == 0
        and not orphan
        and not bad
        and durations
        and lo >= MIN_SEC
        and hi <= MAX_SEC
        and total <= MAX_BYTES
    )
    tag = "CHECK OK" if ok else "CHECK FAIL"
    print(
        f"{tag} files={files} missing={missing} orphan={len(orphan)} "
        f"min={lo:.2f}s max={hi:.2f}s bytes={total}"
    )
    return 0 if ok else 1


def write_mp3(samples, sample_rate: int, dest: Path) -> None:
    import numpy as np

    pcm = (np.clip(samples, -1.0, 1.0) * 32767).astype("<i2")
    dest.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    try:
        with wave.open(tmp, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sample_rate)
            w.writeframes(pcm.tobytes())
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error", "-i", tmp,
                "-ac", "1", "-ar", "24000", "-codec:a", "libmp3lame", "-b:a", "32k",
                "-map_metadata", "-1", str(dest),
            ],
            check=True,
        )
    finally:
        os.unlink(tmp)


def run_record(manifest: dict, out: Path, only: set[str] | None, limit: int | None, force: bool) -> int:
    entries = manifest["entries"]
    todo: list[dict] = []
    skipped = 0
    for e in entries:
        if only is not None and e["lang"] not in only:
            continue
        if len(e["text"]) > MAX_CHARS:
            print(f"ERROR text longer than {MAX_CHARS} chars: {e['lang']} {e['key']}", file=sys.stderr)
            return 2
        if (out / e["file"]).exists() and not force:
            skipped += 1
            continue
        if limit is not None and len(todo) >= limit:
            skipped += 1
            continue
        todo.append(e)

    recorded = 0
    if todo:
        import numpy as np
        from supertonic import TTS

        tts = TTS(auto_download=True)
        style = tts.get_voice_style(voice_name=manifest["voice"])
        sample_rate = int(tts.sample_rate)
        steps = int(manifest["totalSteps"])

        def is_supported(ch: str) -> bool:
            is_valid, _unsupported = tts.model.text_processor.validate_text(ch)
            return bool(is_valid)

        for e in todo:
            text = sanitize_tts_text(e["text"], is_supported)
            if not text:
                print(f"ERROR empty text after sanitize: {e['lang']} {e['key']}", file=sys.stderr)
                return 2
            wav, duration = tts.synthesize(
                text, voice_style=style, lang=e["lang"], total_steps=steps, verbose=False
            )
            samples = np.asarray(wav, dtype=np.float32)
            if samples.ndim == 2:
                samples = samples[0]
            write_mp3(samples, sample_rate, out / e["file"])
            recorded += 1
            dur = float(np.asarray(duration).reshape(-1)[0])
            print(f"REC {e['lang']} {e['key']} {dur:.2f}s", flush=True)

    print(f"DONE recorded={recorded} skipped={skipped}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--manifest", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--only", default=None, help="comma-separated langs, e.g. ko,vi")
    ap.add_argument("--limit", type=int, default=None, help="max number of new recordings")
    ap.add_argument("--force", action="store_true", help="re-record existing files")
    ap.add_argument("--prune", action="store_true", help="delete mp3 files not in the manifest")
    ap.add_argument("--check", action="store_true", help="check files only, no recording")
    args = ap.parse_args()

    manifest = load_manifest(args.manifest)
    entries = manifest["entries"]

    if args.prune:
        for p in orphans(args.out, entries):
            p.unlink()
            print(f"PRUNE {p}")

    if args.check:
        return run_check(args.out, entries)

    only = {s.strip() for s in args.only.split(",") if s.strip()} if args.only else None
    return run_record(manifest, args.out, only, args.limit, args.force)


if __name__ == "__main__":
    sys.exit(main())
