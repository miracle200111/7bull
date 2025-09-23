#!/usr/bin/env python3
"""
AI角色扮演后端启动脚本
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 8):
        print("❌ 需要Python 3.8或更高版本")
        return False
    print(f"✅ Python版本: {sys.version}")
    return True

def install_dependencies():
    """安装依赖包"""
    print("📦 安装Python依赖包...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, cwd="backend")
        print("✅ 依赖包安装完成")
        return True
    except subprocess.CalledProcessError:
        print("❌ 依赖包安装失败")
        return False

def check_env_file():
    """检查环境变量文件"""
    env_file = Path("backend/.env")
    env_example = Path("backend/env_example.txt")
    
    if not env_file.exists():
        print("⚠️  未找到.env文件")
        if env_example.exists():
            print("📋 请参考env_example.txt创建.env文件")
            print("需要配置以下环境变量:")
            with open(env_example, 'r') as f:
                print(f.read())
        return False
    
    print("✅ 环境变量文件存在")
    return True

def start_server():
    """启动服务器"""
    print("🚀 启动AI角色扮演后端服务...")
    try:
        os.chdir("backend")
        subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"])
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")

def main():
    print("🎭 AI角色扮演后端启动器")
    print("=" * 40)
    
    if not check_python_version():
        return
    
    if not install_dependencies():
        return
    
    if not check_env_file():
        print("\n请完成环境变量配置后重新运行")
        return
    
    start_server()

if __name__ == "__main__":
    main()
