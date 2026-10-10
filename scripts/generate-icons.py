"""One-time vector icon export. Requires PyMuPDF; not part of app runtime."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path('.tools').resolve()))
import fitz
source=fitz.open('public/icons/icon.svg')
pdf=fitz.open('pdf',source.convert_to_pdf())
for size in (192,512):
    page=pdf[0]
    page.get_pixmap(matrix=fitz.Matrix(size/page.rect.width,size/page.rect.height),alpha=False).save(f'public/icons/icon-{size}.png')
