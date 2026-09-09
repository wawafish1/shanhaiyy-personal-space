from pathlib import Path
import pypdfium2 as pdfium
from pypdf import PdfReader
root = Path(__file__).resolve().parent.parent
file = root / 'output/pdf/yu-binbin-resume.pdf'
reader = PdfReader(file)
assert len(reader.pages) == 1
text = '\n'.join(page.extract_text() for page in reader.pages)
assert 'xyu024864@gmail.com' in text
assert '苏州汇川联合动力' not in text
assert '微信' not in text and '手机号' not in text
doc = pdfium.PdfDocument(file)
image = doc[0].render(scale=1.6).to_pil()
image.save(root / 'output/pdf/yu-binbin-resume-preview.png')
print('PASS: 1 page, correct email, no removed employer or private-contact fields. PDF rendered for visual review.')
