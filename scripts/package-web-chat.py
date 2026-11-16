from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_STORED
root = Path(__file__).resolve().parents[1]
target = root / 'public/downloads/suviet-base-chat.zip'
target.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(target, 'w', ZIP_STORED) as archive:
    for path in sorted((root / 'wordpress/suviet-base-chat').glob('*')):
        if path.is_file():
            info = ZipInfo('suviet-base-chat/' + path.name, (2026, 11, 15, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            archive.writestr(info, path.read_bytes())
print(target)
