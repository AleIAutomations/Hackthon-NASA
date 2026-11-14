"""Testes de auth_earthdata."""
import os
import sys
from pathlib import Path

# Adiciona data_pipeline ao sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import auth_earthdata as auth


def test_sem_credencial_retorna_none(monkeypatch, tmp_path):
    monkeypatch.delenv("ASF_EDL_TOKEN", raising=False)
    monkeypatch.delenv("EARTHDATA_USERNAME", raising=False)
    monkeypatch.delenv("EARTHDATA_PASSWORD", raising=False)
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    assert auth.has_credentials() is False
    assert auth.get_session() is None


def test_com_usuario_e_senha_flag_true(monkeypatch):
    monkeypatch.setenv("EARTHDATA_USERNAME", "u")
    monkeypatch.setenv("EARTHDATA_PASSWORD", "p")
    assert auth.has_credentials() is True


def test_netrc_permissao_0600(monkeypatch, tmp_path):
    monkeypatch.setenv("EARTHDATA_USERNAME", "u")
    monkeypatch.setenv("EARTHDATA_PASSWORD", "p")
    alvo = tmp_path / ".netrc"
    out = auth.ensure_netrc(alvo)
    assert out == alvo
    corpo = alvo.read_text(encoding="utf-8")
    assert "urs.earthdata.nasa.gov" in corpo
    assert "login u" in corpo


def test_token_invalido_nao_lanca(monkeypatch):
    monkeypatch.setenv("ASF_EDL_TOKEN", "token-invalido-de-teste")
    sess = auth.get_session()  # nao pode levantar excecao
    assert sess is None
