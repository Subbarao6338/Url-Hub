from fastapi import APIRouter, HTTPException, Form
from fastapi.responses import HTMLResponse
import random, string, requests, re
from bs4 import BeautifulSoup, Comment
from api.core.data_adv.kusto import generate_kusto_query

router = APIRouter()

def html_to_gfm(soup):
    # Remove script, style, head, nav, footer, iframe, form elements
    for s in soup(["script", "style", "head", "nav", "footer", "iframe", "form", "header"]):
        s.decompose()

    # Remove comments
    for comment in soup.find_all(text=lambda text: isinstance(text, Comment)):
        comment.extract()

    # Simple recursive parser to turn DOM elements into clean markdown
    def convert_element(element):
        if not element:
            return ""

        if isinstance(element, str):
            return element

        tag = element.name

        # Inline elements / formatting
        if tag in ['strong', 'b']:
            content = "".join(convert_element(child) for child in element.children)
            return f"**{content}**" if content.strip() else ""
        elif tag in ['em', 'i']:
            content = "".join(convert_element(child) for child in element.children)
            return f"*{content}*" if content.strip() else ""
        elif tag == 'code':
            content = "".join(convert_element(child) for child in element.children)
            return f"`{content}`" if content.strip() else ""
        elif tag == 'a':
            href = element.get('href', '')
            content = "".join(convert_element(child) for child in element.children)
            if content.strip() and href and not href.startswith('#') and not href.startswith('javascript:'):
                return f"[{content}]({href})"
            return content
        elif tag == 'br':
            return "\n"

        # Block elements
        elif tag == 'p':
            content = "".join(convert_element(child) for child in element.children)
            return f"\n\n{content}\n\n" if content.strip() else ""
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            level = int(tag[1])
            hashes = "#" * level
            content = "".join(convert_element(child) for child in element.children)
            return f"\n\n{hashes} {content.strip()}\n\n" if content.strip() else ""
        elif tag == 'li':
            # Check if parent is ol
            parent = element.parent
            is_ordered = parent and parent.name == 'ol'
            prefix = "1. " if is_ordered else "* "
            content = "".join(convert_element(child) for child in element.children)
            return f"\n{prefix}{content.strip()}" if content.strip() else ""
        elif tag in ['ul', 'ol']:
            content = "".join(convert_element(child) for child in element.children)
            return f"\n\n{content}\n\n" if content.strip() else ""
        elif tag == 'pre':
            content = element.get_text()
            return f"\n\n```\n{content}\n```\n\n"
        elif tag == 'hr':
            return "\n\n---\n\n"

        # Generic container
        content = "".join(convert_element(child) for child in element.children)
        return content

    # Get body or the whole soup
    body = soup.find('body') or soup
    markdown = convert_element(body)

    # Post-processing: clean up extra whitespace/newlines
    markdown = re.sub(r'\n{3,}', '\n\n', markdown)
    return markdown.strip()

@router.get("/generate-otp")
async def generate_otp_api(length: int = 6):
    return {"otp": ''.join(random.choice(string.digits) for _ in range(length))}

@router.get("/regex-gen")
async def regex_gen(pattern_type: str):
    mapping = {"email": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", "url": r"https?://.*"}
    return {"regex": mapping.get(pattern_type, ".*")}

@router.post("/kusto-gen")
async def kusto_gen(data: dict):
    try:
        query = generate_kusto_query(data['table'], data['fields'], data.get('joins'), data.get('filters'))
        return {"query": query}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/url-to-markdown")
async def url_to_markdown_api(url: str = Form(...)):
    if not url.strip():
        return HTMLResponse(content='<div class="result-container p-15 bg-error rounded-xl text-white">URL cannot be empty</div>')

    try:
        # Standardize URL schema if missing
        if not url.startswith('http://') and not url.startswith('https://'):
            url = 'https://' + url

        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"}, timeout=15)
        res.raise_for_status()

        soup = BeautifulSoup(res.content, 'html.parser')
        title = soup.title.string if soup.title else url
        markdown = html_to_gfm(soup)

        full_markdown = f"# {title.strip()}\n\nConverted from: {url}\n\n---\n\n{markdown}"

        html_response = f"""
        <div class="result-container animate-fadeIn mt-20 text-left">
            <div class="flex-between mb-15">
                <span class="smallest opacity-6 uppercase font-bold tracking-wider">Converted Markdown</span>
                <button class="pill smallest active" style="background: var(--brand-accent); border-color: var(--brand-accent);" onclick="navigator.clipboard.writeText(document.getElementById('markdown-output').value); alert('Copied to clipboard!')">
                    <span class="material-icons" style="font-size: 1rem;">content_copy</span> Copy
                </button>
            </div>
            <textarea id="markdown-output" class="code-editor w-full font-mono text-left" style="height: 300px; padding: 15px; border-radius: 12px; background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-primary); resize: vertical;" readonly>{full_markdown}</textarea>
        </div>
        """
        return HTMLResponse(content=html_response)
    except Exception as e:
        error_html = f'<div class="result-container p-15 rounded-xl border mt-20 text-left" style="background: rgba(var(--error-rgb), 0.1); border-color: var(--error); color: var(--error);">Error converting URL: {str(e)}</div>'
        return HTMLResponse(content=error_html)
