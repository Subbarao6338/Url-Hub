import ipaddress
import socket
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse
import requests
import ssl
from typing import Optional
import json
from datetime import datetime

router = APIRouter()

def is_public_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return not (ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast)
    except ValueError:
        return False

def validate_domain(domain: str):
    if not domain or not domain.strip():
        raise HTTPException(status_code=400, detail="Domain name cannot be empty")
    try:
        # Resolve domain to IP
        ip_list = socket.gethostbyname_ex(domain)[2]
        for ip in ip_list:
            if not is_public_ip(ip):
                raise HTTPException(status_code=400, detail=f"Domain {domain} resolves to a non-public IP: {ip}")
    except socket.gaierror:
        raise HTTPException(status_code=400, detail=f"Could not resolve domain: {domain}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")

def query_doh(domain: str, qtype: str) -> list:
    try:
        url = f"https://cloudflare-dns.com/dns-query?name={domain}&type={qtype}"
        headers = {"accept": "application/dns-json"}
        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code == 200:
            data = res.json()
            answers = data.get("Answer", [])
            return [ans.get("data") for ans in answers if "data" in ans]
    except Exception:
        # Fallback to Google DoH
        try:
            url = f"https://dns.google/resolve?name={domain}&type={qtype}"
            res = requests.get(url, timeout=5)
            if res.status_code == 200:
                data = res.json()
                answers = data.get("Answer", [])
                return [ans.get("data") for ans in answers if "data" in ans]
        except Exception:
            pass
    return []

def format_error_html(message: str) -> str:
    return f"""
    <div class="result-container animate-fadeIn mt-20 text-left">
        <div class="card p-20 glass-card flex gap-15 align-center" style="border: 1px solid var(--error); background: rgba(220, 53, 69, 0.1); flex-direction: row; align-items: center;">
            <span class="material-icons text-danger" style="font-size: 2rem;">error_outline</span>
            <div>
                <h5 class="text-danger" style="margin: 0; font-weight: bold;">Lookup Failed</h5>
                <p class="small" style="margin: 5px 0 0 0; color: var(--text-primary);">{message}</p>
            </div>
        </div>
    </div>
    """

def format_ip_info_html(data: dict) -> str:
    ip = data.get("ip", "N/A")
    city = data.get("city", "N/A")
    region = data.get("region", "N/A")
    country = data.get("country_name", "N/A")
    postal = data.get("postal", "N/A")
    org = data.get("org", "N/A")
    asn = data.get("asn", "N/A")
    timezone = data.get("timezone", "N/A")
    lat = data.get("latitude")
    lon = data.get("longitude")

    map_html = ""
    if lat is not None and lon is not None:
        map_html = f"""
        <div class="mt-15">
            <a href="https://www.openstreetmap.org/?mlat={lat}&mlon={lon}#map=12/{lat}/{lon}" target="_blank" class="pill active flex-center gap-10" style="display: inline-flex; background: var(--brand-accent); border-color: var(--brand-accent); text-decoration: none;">
                <span class="material-icons" style="font-size: 1.1rem;">map</span> View on Interactive Map
            </a>
        </div>
        """

    raw_json = json.dumps(data, indent=2)

    html = f"""
    <div class="result-container animate-fadeIn mt-20 text-left">
        <div class="flex-between mb-15">
            <span class="smallest opacity-6 uppercase font-bold tracking-wider">IP Information Details</span>
            <button class="pill smallest active" style="background: var(--brand-accent); border-color: var(--brand-accent);" onclick="navigator.clipboard.writeText(document.getElementById('ip-raw-data').textContent); alert('Copied raw data to clipboard!')">
                <span class="material-icons" style="font-size: 1rem;">content_copy</span> Copy Raw Data
            </button>
        </div>
        <div class="card p-25 glass-card grid gap-15">
            <div class="grid cols-2 gap-15" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">IP Address</div>
                    <div class="font-mono text-lg font-bold" style="color: var(--brand-accent);">{ip}</div>
                </div>
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">ISP / Organization</div>
                    <div class="font-bold">{org}</div>
                </div>
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">Location</div>
                    <div>{city}, {region}, {country} (Postal: {postal})</div>
                </div>
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">Timezone & ASN</div>
                    <div>{timezone} | {asn}</div>
                </div>
            </div>
            {map_html}

            <details class="mt-15" style="border: 1px solid var(--border-color); border-radius: 12px; padding: 10px;">
                <summary class="cursor-pointer smallest font-bold opacity-7 select-none">Show Raw JSON Data</summary>
                <pre id="ip-raw-data" class="code-editor mt-10 p-10 font-mono text-xs" style="max-height: 200px; overflow-y: auto; background: var(--bg-surface); border-radius: 8px; color: var(--text-primary); margin: 0;">{raw_json}</pre>
            </details>
        </div>
    </div>
    """
    return html

def format_dns_html(domain: str, records: dict) -> str:
    rows = []
    has_any = False

    # Render table rows
    for rtype, vals in records.items():
        if vals:
            has_any = True
            for val in vals:
                rows.append(f"""
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td class="font-bold py-10" style="padding: 10px 15px; color: var(--brand-accent);">{rtype}</td>
                    <td class="font-mono py-10" style="padding: 10px 15px; word-break: break-all;">{val}</td>
                </tr>
                """)

    if not has_any:
        table_content = """
        <tr>
            <td colspan="2" class="text-center py-20 opacity-6">No DNS records found for this domain.</td>
        </tr>
        """
    else:
        table_content = "".join(rows)

    raw_json = json.dumps({"domain": domain, "records": records}, indent=2)

    html = f"""
    <div class="result-container animate-fadeIn mt-20 text-left">
        <div class="flex-between mb-15">
            <span class="smallest opacity-6 uppercase font-bold tracking-wider">DNS Resolution Results</span>
            <button class="pill smallest active" style="background: var(--brand-accent); border-color: var(--brand-accent);" onclick="navigator.clipboard.writeText(document.getElementById('dns-raw-data').textContent); alert('Copied raw data to clipboard!')">
                <span class="material-icons" style="font-size: 1rem;">content_copy</span> Copy Raw Data
            </button>
        </div>
        <div class="card p-25 glass-card grid gap-15">
            <h4 class="mb-5">Records for <span style="color: var(--brand-accent);">{domain}</span></h4>
            <div style="overflow-x: auto; border: 1px solid var(--border-color); border-radius: 12px; background: var(--bg-surface);">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: rgba(255, 255, 255, 0.05); border-bottom: 2px solid var(--border-color);">
                            <th style="padding: 12px 15px; font-weight: bold; font-size: 0.85rem; text-transform: uppercase; width: 100px;">Type</th>
                            <th style="padding: 12px 15px; font-weight: bold; font-size: 0.85rem; text-transform: uppercase;">Value / Record Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table_content}
                    </tbody>
                </table>
            </div>

            <details class="mt-15" style="border: 1px solid var(--border-color); border-radius: 12px; padding: 10px;">
                <summary class="cursor-pointer smallest font-bold opacity-7 select-none">Show Raw JSON Data</summary>
                <pre id="dns-raw-data" class="code-editor mt-10 p-10 font-mono text-xs" style="max-height: 200px; overflow-y: auto; background: var(--bg-surface); border-radius: 8px; color: var(--text-primary); margin: 0;">{raw_json}</pre>
            </details>
        </div>
    </div>
    """
    return html

def format_whois_html(domain: str, data: dict) -> str:
    ldh_name = data.get("ldhName", domain)

    # Extract events
    events = data.get("events", [])
    reg_date = "N/A"
    exp_date = "N/A"
    upd_date = "N/A"
    for ev in events:
        action = ev.get("eventAction")
        date_str = ev.get("eventDate", "N/A")
        if "T" in date_str:
            date_str = date_str.split("T")[0]
        if action == "registration":
            reg_date = date_str
        elif action == "expiration":
            exp_date = date_str
        elif action == "last changed":
            upd_date = date_str

    # Extract nameservers
    nameservers = []
    for ns in data.get("nameservers", []):
        if "ldhName" in ns:
            nameservers.append(ns["ldhName"])
    ns_str = ", ".join(nameservers) if nameservers else "N/A"

    # Extract status
    status = ", ".join(data.get("status", [])) or "N/A"

    # Extract registrar
    registrar = "N/A"
    entities = data.get("entities", [])
    for ent in entities:
        roles = ent.get("roles", [])
        if "registrar" in roles:
            vcardArray = ent.get("vcardArray", [])
            if len(vcardArray) > 1:
                properties = vcardArray[1]
                for prop in properties:
                    if prop[0] == "fn":
                        registrar = prop[3]
                        break

    raw_json = json.dumps(data, indent=2)

    html = f"""
    <div class="result-container animate-fadeIn mt-20 text-left">
        <div class="flex-between mb-15">
            <span class="smallest opacity-6 uppercase font-bold tracking-wider">WHOIS RDAP Details</span>
            <button class="pill smallest active" style="background: var(--brand-accent); border-color: var(--brand-accent);" onclick="navigator.clipboard.writeText(document.getElementById('whois-raw-data').textContent); alert('Copied raw data to clipboard!')">
                <span class="material-icons" style="font-size: 1rem;">content_copy</span> Copy Raw Data
            </button>
        </div>
        <div class="card p-25 glass-card grid gap-15">
            <h4 class="mb-5">Domain WHOIS: <span style="color: var(--brand-accent);">{ldh_name}</span></h4>

            <div class="grid cols-2 gap-15" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">Registrar</div>
                    <div class="font-bold">{registrar}</div>
                </div>
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">Domain Status</div>
                    <div class="small text-truncate" title="{status}">{status}</div>
                </div>
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">Registration Date</div>
                    <div>{reg_date}</div>
                </div>
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">Expiration Date</div>
                    <div class="font-bold text-success">{exp_date}</div>
                </div>
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">Last Updated</div>
                    <div>{upd_date}</div>
                </div>
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">Name Servers</div>
                    <div class="small font-mono">{ns_str}</div>
                </div>
            </div>

            <details class="mt-15" style="border: 1px solid var(--border-color); border-radius: 12px; padding: 10px;">
                <summary class="cursor-pointer smallest font-bold opacity-7 select-none">Show Raw RDAP JSON Data</summary>
                <pre id="whois-raw-data" class="code-editor mt-10 p-10 font-mono text-xs" style="max-height: 200px; overflow-y: auto; background: var(--bg-surface); border-radius: 8px; color: var(--text-primary); margin: 0;">{raw_json}</pre>
            </details>
        </div>
    </div>
    """
    return html

def parse_ssl_dict(cert: dict) -> dict:
    subject_dict = {}
    for item in cert.get('subject', []):
        for subitem in item:
            subject_dict[subitem[0]] = subitem[1]

    issuer_dict = {}
    for item in cert.get('issuer', []):
        for subitem in item:
            issuer_dict[subitem[0]] = subitem[1]

    common_name = subject_dict.get('commonName', 'N/A')
    issuer_name = issuer_dict.get('commonName', issuer_dict.get('organizationName', 'N/A'))

    not_before_str = cert.get('notBefore', '')
    not_after_str = cert.get('notAfter', '')

    days_left = -1
    valid_from = "N/A"
    valid_until = "N/A"

    for fmt in ('%b %d %H:%M:%S %Y %Z', '%b  %d %H:%M:%S %Y %Z', '%b %d %H:%M:%S %Y'):
        try:
            clean_before = " ".join(not_before_str.split())
            clean_after = " ".join(not_after_str.split())
            dt_before = datetime.strptime(clean_before, fmt)
            dt_after = datetime.strptime(clean_after, fmt)

            valid_from = dt_before.strftime('%Y-%m-%d %H:%M:%S')
            valid_until = dt_after.strftime('%Y-%m-%d %H:%M:%S')

            now = datetime.utcnow()
            days_left = (dt_after - now).days
            break
        except Exception:
            pass

    serial = cert.get('serialNumber', 'N/A')

    alt_names = []
    for type_name, val in cert.get('subjectAltName', []):
        if type_name == 'DNS':
            alt_names.append(val)

    return {
        "common_name": common_name,
        "issuer": issuer_name,
        "valid_from": valid_from,
        "valid_until": valid_until,
        "days_left": days_left,
        "serial": serial,
        "alt_names": alt_names
    }

def format_ssl_html(domain: str, raw_cert: dict) -> str:
    parsed = parse_ssl_dict(raw_cert)

    common_name = parsed["common_name"]
    issuer = parsed["issuer"]
    valid_from = parsed["valid_from"]
    valid_until = parsed["valid_until"]
    days_left = parsed["days_left"]
    serial = parsed["serial"]
    alt_names_str = ", ".join(parsed["alt_names"][:10])
    if len(parsed["alt_names"]) > 10:
        alt_names_str += "..."

    status_badge = ""
    status_text = ""
    status_color = "var(--text-primary)"

    if days_left > 0:
        status_badge = '<span class="material-icons text-success" style="font-size: 2.5rem;">verified</span>'
        status_text = f"Secure (Valid for another {days_left} days)"
        status_color = "var(--success)"
    else:
        status_badge = '<span class="material-icons text-danger" style="font-size: 2.5rem;">gpp_bad</span>'
        status_text = "Expired / Invalid Certificate"
        status_color = "var(--error)"

    raw_json = json.dumps(raw_cert, indent=2)

    html = f"""
    <div class="result-container animate-fadeIn mt-20 text-left">
        <div class="flex-between mb-15">
            <span class="smallest opacity-6 uppercase font-bold tracking-wider">SSL Certificate Details</span>
            <button class="pill smallest active" style="background: var(--brand-accent); border-color: var(--brand-accent);" onclick="navigator.clipboard.writeText(document.getElementById('ssl-raw-data').textContent); alert('Copied raw data to clipboard!')">
                <span class="material-icons" style="font-size: 1rem;">content_copy</span> Copy Raw Data
            </button>
        </div>
        <div class="card p-25 glass-card grid gap-20">
            <div class="flex-center gap-15" style="justify-content: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
                {status_badge}
                <div>
                    <h4 style="margin: 0; color: {status_color};">{status_text}</h4>
                    <span class="smallest opacity-6 font-mono">Domain analyzed: {domain}</span>
                </div>
            </div>

            <div class="grid cols-2 gap-15" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">Common Name (CN)</div>
                    <div class="font-mono font-bold">{common_name}</div>
                </div>
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">Issuer (CA)</div>
                    <div class="font-bold">{issuer}</div>
                </div>
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">Valid From</div>
                    <div>{valid_from}</div>
                </div>
                <div>
                    <div class="smallest opacity-6 uppercase font-bold">Expiration Date</div>
                    <div class="font-bold">{valid_until}</div>
                </div>
                <div style="grid-column: span 2;">
                    <div class="smallest opacity-6 uppercase font-bold">Subject Alternative Names (SANs)</div>
                    <div class="small font-mono text-truncate" title="{alt_names_str}">{alt_names_str}</div>
                </div>
                <div style="grid-column: span 2;">
                    <div class="smallest opacity-6 uppercase font-bold">Serial Number</div>
                    <div class="small font-mono">{serial}</div>
                </div>
            </div>

            <details class="mt-10" style="border: 1px solid var(--border-color); border-radius: 12px; padding: 10px;">
                <summary class="cursor-pointer smallest font-bold opacity-7 select-none">Show Raw Certificate Dictionary</summary>
                <pre id="ssl-raw-data" class="code-editor mt-10 p-10 font-mono text-xs" style="max-height: 200px; overflow-y: auto; background: var(--bg-surface); border-radius: 8px; color: var(--text-primary); margin: 0;">{raw_json}</pre>
            </details>
        </div>
    </div>
    """
    return html

@router.get("/ip-info")
async def get_ip_info(ip: Optional[str] = None, request: Request = None):
    is_htmx = request is not None and request.headers.get("hx-request") is not None
    if ip and not is_public_ip(ip):
        msg = f"Invalid or private IP address: {ip}"
        if is_htmx:
            return HTMLResponse(content=format_error_html(msg))
        raise HTTPException(status_code=400, detail=msg)
    try:
        url = f"https://ipapi.co/{ip}/json/" if ip else "https://ipapi.co/json/"
        res = requests.get(url, timeout=5)
        data = res.json()
        if "error" in data:
            raise Exception(data.get("reason", "Unknown API error"))
        if is_htmx:
            return HTMLResponse(content=format_ip_info_html(data))
        return data
    except Exception as e:
        msg = str(e)
        if is_htmx:
            return HTMLResponse(content=format_error_html(msg))
        raise HTTPException(status_code=400, detail=msg)

import asyncio

@router.get("/dns")
async def dns_lookup(domain: str, request: Request = None):
    is_htmx = request is not None and request.headers.get("hx-request") is not None
    try:
        validate_domain(domain)

        loop = asyncio.get_running_loop()
        record_types = ["A", "AAAA", "MX", "TXT", "NS"]

        tasks = [
            loop.run_in_executor(None, query_doh, domain, rtype)
            for rtype in record_types
        ]
        results = await asyncio.gather(*tasks)
        records = dict(zip(record_types, results))

        if is_htmx:
            return HTMLResponse(content=format_dns_html(domain, records))
        return {"domain": domain, "records": records}
    except Exception as e:
        msg = e.detail if hasattr(e, 'detail') else str(e)
        if is_htmx:
            return HTMLResponse(content=format_error_html(msg))
        raise HTTPException(status_code=400, detail=msg)

@router.get("/ssl")
async def ssl_check(domain: str, request: Request = None):
    is_htmx = request is not None and request.headers.get("hx-request") is not None
    try:
        validate_domain(domain)
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                if not cert:
                    raise Exception("No certificate returned by peer")
                if is_htmx:
                    return HTMLResponse(content=format_ssl_html(domain, cert))
                return cert
    except Exception as e:
        msg = e.detail if hasattr(e, 'detail') else str(e)
        if is_htmx:
            return HTMLResponse(content=format_error_html(msg))
        raise HTTPException(status_code=400, detail=msg)

@router.get("/whois")
async def whois_lookup(domain: str, request: Request = None):
    is_htmx = request is not None and request.headers.get("hx-request") is not None
    try:
        validate_domain(domain)
        res = requests.get(f"https://rdap.org/domain/{domain}", timeout=5)
        if res.status_code != 200:
            raise Exception(f"RDAP query failed with status code {res.status_code}")
        data = res.json()
        if is_htmx:
            return HTMLResponse(content=format_whois_html(domain, data))
        return data
    except Exception as e:
        msg = e.detail if hasattr(e, 'detail') else str(e)
        if is_htmx:
            return HTMLResponse(content=format_error_html(msg))
        raise HTTPException(status_code=400, detail=msg)
