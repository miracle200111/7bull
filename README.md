# AI角色扮演网页应用

一个基于AI的角色扮演对话平台，让用户能够与历史人物、文学角色和虚拟人物进行深度对话。

## 🌟 功能特色

- **多样化AI角色**: 苏格拉底、哈利·波特、莎士比亚等经典角色
- **智能技能系统**: 每个角色具备独特的专业技能
- **语音交互**: 支持语音识别和文本转语音
- **用户个性化**: 登录系统和对话历史记录
- **响应式设计**: 现代化的用户界面

## 🎭 AI角色技能

### 1. 苏格拉底 🧙‍♂️
- **知识问答能力**: 深厚的哲学知识，多角度分析问题
- **哲学思辨能力**: 苏格拉底式问答法，引导用户思考

### 2. 哈利·波特 ⚡
- **情感支持能力**: 理解情感困扰，给予温暖支持
- **冒险故事分享**: 分享霍格沃茨的冒险经历

### 3. 威廉·莎士比亚 🎭
- **创意写作能力**: 各种文学形式的创作指导
- **文学创作指导**: 分析作品结构，指导角色塑造

## 🛠 技术架构

### 前端
- **React 18**: 主框架
- **Material-UI**: 现代化UI组件
- **Web Speech API**: 语音识别
- **Axios**: HTTP客户端

### 后端
- **Python 3.9+**: 主语言
- **FastAPI**: 高性能Web框架
- **OpenAI GPT-4**: 大语言模型
- **JWT**: 身份认证
- **本地文件存储**: 用户数据和对话历史

## 🚀 快速开始

### 环境要求
- Python 3.8+ (在macOS上通常使用 `python3` 命令)
- Node.js 14+
- OpenAI API密钥

### 1. 克隆项目
```bash
git clone <repository-url>
cd 7bull
```

### 2. 配置后端
```bash
# 复制环境变量模板
cp backend/env_example.txt backend/.env

# 编辑.env文件，添加你的OpenAI API密钥
# OPENAI_API_KEY=your_openai_api_key_here

# 可选：手动创建虚拟环境 (启动脚本会自动处理)
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 3. 启动后端服务
```bash
# 方法1: 使用自动启动脚本 (推荐)
python3 start_backend.py

# 方法2: 手动设置虚拟环境
chmod +x setup_venv.sh
./setup_venv.sh
```

### 4. 启动前端服务
```bash
./start_frontend.sh
```

### 5. 访问应用
打开浏览器访问: http://localhost:3000

## 📱 使用指南

### 注册/登录
1. 访问应用首页
2. 选择"注册"创建新账户或"登录"现有账户
3. 输入用户名、邮箱和密码

### 选择AI角色
1. 登录后进入角色选择页面
2. 浏览可用的AI角色
3. 使用搜索功能查找特定角色
4. 点击"开始对话"与角色互动

### 进行对话
1. 在聊天界面输入消息
2. 使用麦克风按钮进行语音输入
3. 点击音量按钮听取AI回复
4. 查看角色的专业技能标签

### 技能触发示例
- **知识问答**: "什么是真理？"、"如何理解正义？"
- **情感支持**: "我感到很困惑"、"需要一些鼓励"
- **创意写作**: "帮我写一首诗"、"如何创作故事？"

## 🏗 项目结构

```
7bull/
├── backend/                 # Python后端
│   ├── main.py             # FastAPI应用主文件
│   ├── requirements.txt    # Python依赖
│   └── env_example.txt     # 环境变量模板
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # React组件
│   │   │   ├── Login.js    # 登录组件
│   │   │   ├── Dashboard.js# 角色选择页面
│   │   │   └── Chat.js     # 聊天界面
│   │   └── App.js          # 主应用组件
│   └── package.json        # 前端依赖
├── data/                   # 数据存储
│   ├── users.json          # 用户数据
│   └── conversations/      # 对话历史
├── start_backend.py        # 后端启动脚本
├── start_frontend.sh       # 前端启动脚本
├── 产品规划文档.md          # 详细产品规划
└── README.md              # 项目说明
```

## 🔧 开发说明

### API端点
- `POST /register`: 用户注册
- `POST /login`: 用户登录
- `GET /characters`: 获取AI角色列表
- `POST /chat`: 发送消息给AI角色
- `GET /conversations`: 获取用户对话历史

### 数据存储
- 用户数据存储在 `data/users.json`
- 对话历史存储在 `data/conversations/` 目录下
- 每个对话会话对应一个JSON文件

### 环境变量配置
```
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_secret_key_for_jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🐛 调试指南

### 常见问题及解决方案

#### 1. 后端启动问题

**问题**: `ModuleNotFoundError: No module named 'xxx'`
```bash
# 解决方案：安装缺失的依赖
cd backend

# 方案1: 使用虚拟环境 (推荐)
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 方案2: 用户目录安装
python3 -m pip install --user -r requirements.txt

# 方案3: 系统级安装 (不推荐，可能破坏系统)
python3 -m pip install --break-system-packages -r requirements.txt
```

**问题**: `externally-managed-environment` (macOS常见)
```bash
# 这是macOS保护系统Python的机制
# 解决方案：使用虚拟环境
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 或者使用启动脚本自动处理
python3 ../start_backend.py
```

**问题**: `OpenAI API key not configured`
```bash
# 解决方案：检查环境变量配置
# 1. 确保 backend/.env 文件存在
# 2. 检查 OPENAI_API_KEY 是否正确设置
cat backend/.env
```

**问题**: 端口8000被占用
```bash
# 查看占用端口的进程
lsof -i :8000

# 杀死占用进程
kill -9 <PID>

# 或者使用不同端口启动
uvicorn main:app --port 8001
```

#### 2. 前端启动问题

**问题**: `npm: command not found`
```bash
# 解决方案：安装Node.js
# macOS
brew install node

# Ubuntu
sudo apt install nodejs npm

# Windows
# 从 https://nodejs.org 下载安装
```

**问题**: 依赖安装失败
```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

**问题**: 前端无法连接后端
- 检查后端是否在8000端口运行
- 确认CORS配置正确
- 检查防火墙设置

#### 3. API调用问题

**问题**: 401 Unauthorized
```bash
# 检查JWT token是否有效
# 在浏览器开发者工具中查看localStorage
localStorage.getItem('token')

# 重新登录获取新token
```

**问题**: OpenAI API调用失败
```bash
# 检查API密钥余额
# 访问 https://platform.openai.com/usage

# 测试API连接
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.openai.com/v1/models
```

#### 4. 语音功能问题

**问题**: 语音识别不工作
- 检查浏览器是否支持Web Speech API
- 确认麦克风权限已授予
- 使用HTTPS或localhost（HTTP不支持语音API）

**问题**: 语音合成无声音
- 检查浏览器音量设置
- 确认语音合成API可用性
- 尝试不同的语音引擎

### 调试工具和技巧

#### 1. 后端调试

**启用详细日志**:
```python
# 在 backend/main.py 中添加
import logging
logging.basicConfig(level=logging.DEBUG)
```

**API测试工具**:
```bash
# 使用curl测试API
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456"}'

# 使用httpie (更友好的API测试工具)
pip install httpie
http POST localhost:8000/register username=test email=test@test.com password=123456
```

**数据库调试**:
```bash
# 查看用户数据
cat data/users.json | python3 -m json.tool

# 查看对话记录
ls data/conversations/
cat data/conversations/[conversation_id].json | python3 -m json.tool
```

#### 2. 前端调试

**浏览器开发者工具**:
- 按F12打开开发者工具
- Console标签页查看错误信息
- Network标签页监控API请求
- Application标签页查看localStorage

**React开发工具**:
```bash
# 安装React Developer Tools浏览器扩展
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
```

**添加调试日志**:
```javascript
// 在组件中添加console.log
console.log('用户数据:', user);
console.log('API响应:', response.data);
```

#### 3. 网络调试

**检查API连接**:
```bash
# 测试后端健康状态
curl http://localhost:8000/

# 测试跨域请求
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS http://localhost:8000/login
```

**代理配置** (如果需要):
```json
// 在 frontend/package.json 中添加
{
  "proxy": "http://localhost:8000"
}
```

### 性能调试

#### 1. 后端性能

**监控API响应时间**:
```python
# 添加中间件记录请求时间
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

#### 2. 前端性能

**React性能分析**:
```bash
# 启用性能分析
npm start -- --profile

# 构建分析包大小
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

### 日志文件位置

```bash
# 后端日志 (如果配置)
tail -f backend/app.log

# 系统日志
# macOS
tail -f /var/log/system.log

# Linux
tail -f /var/log/syslog
```

### 开发环境重置

**完全重置项目**:
```bash
# 停止所有服务
pkill -f "uvicorn\|npm"

# 清理后端
cd backend
rm -rf __pycache__ .env
cd ..

# 清理前端
cd frontend
rm -rf node_modules package-lock.json build
cd ..

# 清理数据
rm -rf data/users.json data/conversations/*

# 重新开始
python3 start_backend.py  # 终端1
./start_frontend.sh      # 终端2
```

## 🎯 用户故事

1. **教育学习者**: "作为历史专业学生，我可以与苏格拉底对话，深入理解古希腊哲学思想"
2. **娱乐爱好者**: "作为哈利波特粉丝，我可以与哈利聊天，体验魔法世界的乐趣"
3. **语言学习者**: "作为英语学习者，我可以与莎士比亚对话，提升英语水平和文学素养"

## 🔒 安全特性

- JWT身份认证
- 密码哈希存储
- API访问控制
- CORS安全配置

## 📈 未来规划

- [ ] 支持更多AI角色
- [ ] 多语言界面
- [ ] 角色自定义功能
- [ ] 社交分享功能
- [ ] 移动端适配
- [ ] 云端数据同步

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License
