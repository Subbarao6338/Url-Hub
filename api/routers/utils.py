import ipaddress
import re
import secrets
import socket
import string
from urllib.parse import urlparse

import anyio
import requests
from bs4 import BeautifulSoup, Comment
from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import HTMLResponse

from api.core.data_adv.kusto import generate_kusto_query

router = APIRouter()


def validate_url_ssrf(url: str):
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            raise ValueError(f"Invalid URL scheme: {parsed.scheme}. Only HTTP and HTTPS are allowed.")

        hostname = parsed.hostname
        if not hostname:
            raise ValueError("Invalid URL: No hostname found.")

        # Resolve hostname to IP addresses
        addr_info = socket.getaddrinfo(hostname, None)
        for item in addr_info:
            ip_str = item[4][0]
            ip = ipaddress.ip_address(ip_str)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast or ip.is_unspecified:
                raise ValueError("Access to non-public/private IP address is restricted")
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Failed to validate URL host: {e!s}")


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
        if tag in ["strong", "b"]:
            content = "".join(convert_element(child) for child in element.children)
            return f"**{content}**" if content.strip() else ""
        elif tag in ["em", "i"]:
            content = "".join(convert_element(child) for child in element.children)
            return f"*{content}*" if content.strip() else ""
        elif tag == "code":
            content = "".join(convert_element(child) for child in element.children)
            return f"`{content}`" if content.strip() else ""
        elif tag == "a":
            href = element.get("href", "")
            content = "".join(convert_element(child) for child in element.children)
            if content.strip() and href and not href.startswith("#") and not href.startswith("javascript:"):
                return f"[{content}]({href})"
            return content
        elif tag == "br":
            return "\n"

        # Block elements
        elif tag == "p":
            content = "".join(convert_element(child) for child in element.children)
            return f"\n\n{content}\n\n" if content.strip() else ""
        elif tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            level = int(tag[1])
            hashes = "#" * level
            content = "".join(convert_element(child) for child in element.children)
            return f"\n\n{hashes} {content.strip()}\n\n" if content.strip() else ""
        elif tag == "li":
            # Check if parent is ol
            parent = element.parent
            is_ordered = parent and parent.name == "ol"
            prefix = "1. " if is_ordered else "* "
            content = "".join(convert_element(child) for child in element.children)
            return f"\n{prefix}{content.strip()}" if content.strip() else ""
        elif tag in ["ul", "ol"]:
            content = "".join(convert_element(child) for child in element.children)
            return f"\n\n{content}\n\n" if content.strip() else ""
        elif tag == "pre":
            content = element.get_text()
            return f"\n\n```\n{content}\n```\n\n"
        elif tag == "hr":
            return "\n\n---\n\n"

        # Generic container
        content = "".join(convert_element(child) for child in element.children)
        return content

    # Get body or the whole soup
    body = soup.find("body") or soup
    markdown = convert_element(body)

    # Post-processing: clean up extra whitespace/newlines
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)
    return markdown.strip()


@router.get("/generate-otp")
async def generate_otp_api(length: int = 6):
    if length < 4 or length > 32:
        raise HTTPException(status_code=400, detail="OTP length must be between 4 and 32")
    return {"otp": "".join(secrets.choice(string.digits) for _ in range(length))}


@router.get("/regex-gen")
async def regex_gen(pattern_type: str):
    mapping = {"email": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", "url": r"https?://.*"}
    return {"regex": mapping.get(pattern_type, ".*")}


@router.post("/kusto-gen")
async def kusto_gen(data: dict):
    try:
        query = generate_kusto_query(data["table"], data["fields"], data.get("joins"), data.get("filters"))
        return {"query": query}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def safe_requests_get(url: str, **kwargs):
    from urllib.parse import urljoin
    current_url = url
    max_redirects = 5
    redirects_followed = 0
    headers = kwargs.get("headers", {})
    timeout = kwargs.get("timeout", 10)

    while True:
        validate_url_ssrf(current_url)
        res = requests.get(current_url, headers=headers, timeout=timeout, allow_redirects=False)

        if res.is_redirect or (300 <= res.status_code < 400):
            redirects_followed += 1
            if redirects_followed > max_redirects:
                raise ValueError("Too many redirects")

            location = res.headers.get("Location")
            if not location:
                break

            current_url = urljoin(current_url, location)
        else:
            break

    validate_url_ssrf(current_url)
    return res


def sync_url_to_markdown(url: str):
    res = safe_requests_get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"}, timeout=15)
    res.raise_for_status()

    soup = BeautifulSoup(res.content, "html.parser")
    title = soup.title.string if soup.title else url
    markdown = html_to_gfm(soup)
    return title, markdown


@router.post("/url-to-markdown")
async def url_to_markdown_api(url: str = Form(...)):
    if not url.strip():
        return HTMLResponse(content='<div class="result-container p-15 bg-error rounded-xl text-white">URL cannot be empty</div>')

    try:
        # Standardize URL schema if missing
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        title, markdown = await anyio.to_thread.run_sync(sync_url_to_markdown, url)

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
        error_html = f'<div class="result-container p-15 rounded-xl border mt-20 text-left" style="background: rgba(var(--error-rgb), 0.1); border-color: var(--error); color: var(--error);">Error converting URL: {e!s}</div>'
        return HTMLResponse(content=error_html)
