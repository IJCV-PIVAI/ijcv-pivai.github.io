"""Validate local HTML/CSS references independently of deployment prefix."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re
ROOT = Path(__file__).resolve().parents[1]
checked = 0

def check(source, value):
    global checked
    url = urlsplit(value)
    if url.scheme or url.netloc or not url.path:
        return
    assert not url.path.startswith('/'), f'Origin-root URL: {source}: {value}'
    target = (source.parent / unquote(url.path)).resolve()
    assert target.is_relative_to(ROOT), f'Escapes repository: {source}: {value}'
    assert target.exists(), f'Missing asset: {source}: {value}'
    checked += 1

class Page(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('src', 'href') and value:
                check(self.path, value)

for path in ROOT.glob('*.html'):
    parser = Page()
    parser.path = path
    parser.feed(path.read_text())
for path in (ROOT / 'assets').rglob('*.css'):
    for value in re.findall(r'url\(\s*[\'\"]?([^\)\'\"]+)', path.read_text()):
        check(path, value.strip())
print(f'Passed: {checked} local HTML/CSS references stay inside the repository and exist.')
