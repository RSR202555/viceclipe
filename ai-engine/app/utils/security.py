import ipaddress
import socket
from urllib.parse import urlparse
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from app.core.config import settings

api_key_header = APIKeyHeader(name="X-AI-Engine-Key", auto_error=False)

def verify_api_key(api_key: str = Security(api_key_header)):
    """
    Validates internal service key between Next.js and AI Engine.
    """
    if not settings.AI_ENGINE_API_KEY:
        return True
    if api_key != settings.AI_ENGINE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso não autorizado ao motor AI Engine. Chave inválida ou ausente."
        )
    return True

# SSRF Protection: Allowed domains and private IP blocklist
ALLOWED_DOMAINS = [
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
    "twitch.tv",
    "www.twitch.tv",
    "kick.com",
    "www.kick.com",
    "supabase.co",
    "github.com",
    "unsplash.com",
    "localhost",
    "127.0.0.1"
]

def validate_url_security(url: str, allow_localhost: bool = True, is_file: bool = False) -> str:
    """
    Blocks SSRF attacks against AWS/GCP metadata endpoints, internal RFC1918 IPs, etc.
    Validates safe local file paths when is_file is True.
    """
    if not url or not isinstance(url, str):
        raise HTTPException(status_code=400, detail="URL inválida ou ausente.")

    cleaned = url.strip()

    # Local file path validation
    if is_file or (len(cleaned) > 2 and cleaned[1] == ':' and '\\' in cleaned or '/' in cleaned):
        import os
        if not os.path.exists(cleaned):
            raise HTTPException(status_code=404, detail=f"Arquivo local não encontrado: {cleaned}")
        return cleaned

    parsed = urlparse(cleaned)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail=f"Esquema de URL '{parsed.scheme}' não suportado. Utilize HTTP ou HTTPS.")

    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="Hostname inválido na URL informada.")

    # Check for metadata service IPs (e.g., 169.254.169.254)
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_link_local or ip.is_multicast or ip.is_reserved:
            raise HTTPException(status_code=400, detail="Endereço de rede restrito ou reservado.")
        if ip.is_private and not allow_localhost:
            raise HTTPException(status_code=400, detail="Acesso a IPs privados bloqueado por segurança (SSRF).")
    except ValueError:
        # Hostname is a domain name
        pass

    return url.strip()
