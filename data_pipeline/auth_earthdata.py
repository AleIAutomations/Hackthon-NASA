"""Autenticacao NASA Earthdata para o pipeline TerraAlerta.

Nunca lanca excecao para o chamador: sem credencial, devolve None e o
pipeline segue no modo somente-metadados.
"""
from __future__ import annotations

import os
import stat
from pathlib import Path

try:
    import asf_search as asf
except ImportError:
    asf = None


def has_credentials() -> bool:
    """True se ha token ou par usuario/senha no ambiente."""
    if os.getenv("ASF_EDL_TOKEN"):
        return True
    return bool(os.getenv("EARTHDATA_USERNAME") and os.getenv("EARTHDATA_PASSWORD"))


def ensure_netrc(path: Path | None = None) -> Path | None:
    """Grava ~/.netrc (ou _netrc no Windows) com as credenciais do ambiente (chmod 0600)."""
    user = os.getenv("EARTHDATA_USERNAME")
    password = os.getenv("EARTHDATA_PASSWORD")
    if not (user and password):
        return None
    default_name = "_netrc" if os.name == "nt" else ".netrc"
    netrc = path or (Path.home() / default_name)
    netrc.write_text(
        f"machine urs.earthdata.nasa.gov\nlogin {user}\npassword {password}\n",
        encoding="utf-8",
    )
    try:
        netrc.chmod(stat.S_IRUSR | stat.S_IWUSR)  # 0600
    except OSError:
        pass
    return netrc


def get_session():
    """Sessao autenticada, ou None se nao houver credencial valida."""
    if asf is None:
        return None
    token = os.getenv("ASF_EDL_TOKEN")
    try:
        if token:
            return asf.ASFSession().auth_with_token(token)
        user = os.getenv("EARTHDATA_USERNAME")
        password = os.getenv("EARTHDATA_PASSWORD")
        if user and password:
            return asf.ASFSession().auth_with_creds(user, password)
        # Ultima chance: .netrc / _netrc ja existente na maquina
        default_name = "_netrc" if os.name == "nt" else ".netrc"
        existing = (Path.home() / default_name)
        if existing.exists():
            return asf.ASFSession()
        return None
    except Exception as exc:  # credencial recusada nao pode derrubar o pipeline
        print(f"[auth] sem sessao autenticada: {exc}")
        return None
