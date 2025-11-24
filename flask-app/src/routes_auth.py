from typing import Dict, Any
from flask import Blueprint, jsonify, request, Response, redirect
from supabase_auth_service import SupabaseAuthService
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

supabase_auth_service = SupabaseAuthService()

# 認証ルーティング
bp_auth = Blueprint("auth", __name__)

# アカウント登録
@bp_auth.route("/api/auth/register", methods=["POST"])
def register() -> Response:
    data : Dict[str, Any]  = request.get_json() or {}
    redirect_to : str = base_host_url()
    supabase_result, status_code = supabase_auth_service.signup(
        email=data.get("email"), 
        password=data.get("password"), 
        redirect_to=redirect_to
    )
    if supabase_result.get("id"):
        return jsonify({"message": "Registration successful. Please check your email for confirmation."}), 200
    return jsonify(supabase_result), 400

# 認証ユーザ情報取得
@bp_auth.route("/api/auth/user")
def auth_user() -> Response:
    auth_header : str = request.headers.get("Authorization", "")
    supabase_result, status_code = supabase_auth_service.get_user_by_access_token(
        access_token=auth_header[7:]
    )
    return jsonify({"email": supabase_result.get("email")}), status_code
    
# ログイン
@bp_auth.route("/api/auth/login", methods=["POST"])
def login() -> Response:
    data : Dict[str, Any]  = request.get_json() or {}
    supabase_result, status_code = supabase_auth_service.login_with_password(
        email=data.get("email"), 
        password=data.get("password")
    )
    return jsonify(supabase_result), status_code

# ログアウト
@bp_auth.route("/api/auth/logout", methods=["POST"])
def logout() -> Response:
    auth_header : str = request.headers.get("Authorization", "")
    supabase_result, status_code = supabase_auth_service.logout(
        access_token=auth_header[7:]
    )
    return jsonify({"message": "Logout successful."}), 200

# base_host_urlの作成
def base_host_url() -> str:
    host = request.headers.get("X-Forwarded-Host") or request.headers.get("Host")
    scheme = (request.headers.get("X-Forwarded-Proto")
              or request.scheme)
    logger.info("base_host_url host=%s scheme=%s", host, scheme)
    return f"{scheme}://{host}/"

# GitHub認証リダイレクト
@bp_auth.route("/api/auth/oauth2/github")
def redirect_to_github() -> Response:
    redirect_to : str = base_host_url()
    github_url : str = supabase_auth_service.get_github_signin_url(redirect_to=redirect_to)
    return redirect(github_url)

