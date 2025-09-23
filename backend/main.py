from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import openai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Role Play API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")

# Initialize OpenAI client
openai_client = None
if OPENAI_API_KEY and OPENAI_API_KEY != "your_openai_api_key_here":
    from openai import OpenAI
    if OPENAI_BASE_URL:
        openai_client = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)
    else:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Data models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    character_id: str
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

# Data storage paths
DATA_DIR = "data"
USERS_FILE = os.path.join(DATA_DIR, "users.json")
CONVERSATIONS_DIR = os.path.join(DATA_DIR, "conversations")

# Ensure data directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(CONVERSATIONS_DIR, exist_ok=True)

# Initialize users file if it doesn't exist
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as f:
        json.dump({}, f)

# AI Characters configuration with enhanced skills
CHARACTERS = {
    "socrates": {
        "name": "苏格拉底",
        "description": "古希腊哲学家，以问答式教学法闻名",
        "avatar": "🧙‍♂️",
        "skills": ["知识问答", "哲学思辨"],
        "prompt": """你是苏格拉底，古希腊最伟大的哲学家之一。你的核心技能包括：

1. 知识问答能力：你拥有深厚的哲学知识，能够回答关于伦理学、认识论、政治哲学等方面的问题。你善于从多个角度分析问题，提供深刻的见解。

2. 哲学思辨能力：你擅长使用苏格拉底式问答法，通过一系列精心设计的问题来引导对话者思考，帮助他们发现自己思维中的矛盾，最终获得更深层的理解。

请始终保持苏格拉底的谦逊态度，经常说"我只知道我什么都不知道"，通过提问而非直接给出答案的方式来引导用户思考。"""
    },
    "harry_potter": {
        "name": "哈利·波特",
        "description": "霍格沃茨的巫师学生，勇敢善良",
        "avatar": "⚡",
        "skills": ["情感支持", "冒险故事"],
        "prompt": """你是哈利·波特，霍格沃茨魔法学校格兰芬多学院的学生。你的核心技能包括：

1. 情感支持能力：你经历过失去父母的痛苦、被误解的孤独、面对伏地魔的恐惧，因此你能够理解他人的情感困扰。你会用自己的经历来安慰和鼓励遇到困难的人，给予温暖的支持。

2. 冒险故事分享：你可以分享在霍格沃茨的各种冒险经历，包括与朋友们一起解决谜题、对抗黑魔法、保护魔法世界的故事。这些故事充满勇气、友谊和成长的主题。

请保持哈利·波特的性格特点：勇敢但不鲁莽、善良但有原则、谦逊但有担当。在对话中可以提及赫敏、罗恩等朋友，以及霍格沃茨的生活细节。"""
    },
    "shakespeare": {
        "name": "威廉·莎士比亚",
        "description": "英国文学史上最伟大的剧作家和诗人",
        "avatar": "🎭",
        "skills": ["创意写作", "文学创作"],
        "prompt": """你是威廉·莎士比亚，英国文艺复兴时期最伟大的剧作家和诗人。你的核心技能包括：

1. 创意写作能力：你精通各种文学形式，包括十四行诗、戏剧、叙事诗等。你能够帮助用户进行创意写作，提供灵感、结构建议、修辞技巧等指导。你善于运用比喻、象征、对比等文学手法。

2. 文学创作指导：你可以分析文学作品的结构、主题、人物塑造等要素，帮助用户理解和创作优秀的文学作品。你了解人性的复杂性，能够创造出深刻而生动的角色。

请保持莎士比亚时代的优雅语言风格，偶尔使用一些诗意的表达，但要确保现代读者能够理解。在指导创作时，要鼓励用户表达真实的情感和深刻的思考。"""
    }
}

# Utility functions
def load_users():
    try:
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {}

def save_users(users):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception

# API Routes
@app.get("/")
async def root():
    return {"message": "AI Role Play API"}

@app.post("/register")
async def register(user: UserCreate):
    users = load_users()
    
    if user.username in users:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    users[user.username] = {
        "email": user.email,
        "password": hashed_password,
        "created_at": datetime.utcnow().isoformat(),
        "conversations": []
    }
    
    save_users(users)
    return {"message": "User registered successfully"}

@app.post("/login")
async def login(user: UserLogin):
    users = load_users()
    
    if user.username not in users:
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password"
        )
    
    if not verify_password(user.password, users[user.username]["password"]):
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/characters")
async def get_characters():
    return CHARACTERS

def detect_skill_usage(message: str, character_skills: List[str]) -> Optional[str]:
    """检测用户消息中需要使用的技能"""
    message_lower = message.lower()
    
    # 知识问答关键词
    knowledge_keywords = ["什么是", "如何", "为什么", "解释", "告诉我", "问题", "疑问"]
    # 情感支持关键词
    emotional_keywords = ["难过", "困惑", "害怕", "担心", "焦虑", "帮助", "安慰", "鼓励"]
    # 创意写作关键词
    creative_keywords = ["写", "创作", "诗歌", "故事", "剧本", "灵感", "文学"]
    
    if any(keyword in message_lower for keyword in knowledge_keywords) and "知识问答" in character_skills:
        return "知识问答"
    elif any(keyword in message_lower for keyword in emotional_keywords) and "情感支持" in character_skills:
        return "情感支持"
    elif any(keyword in message_lower for keyword in creative_keywords) and "创意写作" in character_skills:
        return "创意写作"
    
    return None

def enhance_prompt_with_skill(base_prompt: str, skill: str, message: str) -> str:
    """根据检测到的技能增强提示词"""
    skill_enhancements = {
        "知识问答": f"\n\n当前用户正在寻求知识解答。请运用你的专业知识，详细而准确地回答用户的问题：'{message}'。如果是哲学问题，请使用苏格拉底式的问答方法。",
        "情感支持": f"\n\n用户似乎需要情感支持。请以温暖、理解和鼓励的方式回应，分享相关的个人经历来帮助用户：'{message}'。",
        "创意写作": f"\n\n用户正在寻求创意写作方面的帮助。请提供具体的写作建议、技巧或灵感，帮助用户完成他们的创作：'{message}'。",
        "哲学思辨": f"\n\n请使用苏格拉底式问答法，通过提出深刻的问题来引导用户思考：'{message}'。不要直接给出答案，而是帮助用户自己发现真理。"
    }
    
    return base_prompt + skill_enhancements.get(skill, "")

@app.post("/chat")
async def chat(request: ChatRequest, current_user: str = Depends(get_current_user)):
    if not openai_client:
        raise HTTPException(
            status_code=500,
            detail="LLM API not configured"
        )
    
    character = CHARACTERS.get(request.character_id)
    if not character:
        raise HTTPException(
            status_code=404,
            detail="Character not found"
        )
    
    try:
        # 检测需要使用的技能
        detected_skill = detect_skill_usage(request.message, character["skills"])
        
        # 根据技能增强提示词
        enhanced_prompt = character["prompt"]
        if detected_skill:
            enhanced_prompt = enhance_prompt_with_skill(character["prompt"], detected_skill, request.message)
        
        # 加载对话历史
        conversation_id = request.conversation_id or f"{current_user}_{request.character_id}_{int(datetime.utcnow().timestamp())}"
        conversation_file = os.path.join(CONVERSATIONS_DIR, f"{conversation_id}.json")
        
        messages = [{"role": "system", "content": enhanced_prompt}]
        
        # 如果有对话历史，添加最近的几轮对话作为上下文
        if os.path.exists(conversation_file):
            with open(conversation_file, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                # 只取最近的4轮对话作为上下文
                recent_messages = existing_data["messages"][-8:] if len(existing_data["messages"]) > 8 else existing_data["messages"]
                for msg in recent_messages:
                    messages.append({"role": msg["role"], "content": msg["content"]})
        
        # 添加当前用户消息
        messages.append({"role": "user", "content": request.message})
        
        # 根据图片显示的模型使用 x-ai/grok-4-fast
        response = openai_client.chat.completions.create(
            model="x-ai/grok-4-fast",
            messages=messages,
            max_tokens=800,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        # 保存对话
        new_messages = [
            {"role": "user", "content": request.message, "timestamp": datetime.utcnow().isoformat(), "skill_used": detected_skill},
            {"role": "assistant", "content": ai_response, "timestamp": datetime.utcnow().isoformat()}
        ]
        
        conversation_data = {
            "user": current_user,
            "character_id": request.character_id,
            "messages": new_messages
        }
        
        if os.path.exists(conversation_file):
            with open(conversation_file, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
            existing_data["messages"].extend(new_messages)
            conversation_data = existing_data
        
        with open(conversation_file, 'w', encoding='utf-8') as f:
            json.dump(conversation_data, f, ensure_ascii=False, indent=2)
        
        return ChatResponse(response=ai_response, conversation_id=conversation_id)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}"
        )

@app.get("/conversations")
async def get_conversations(current_user: str = Depends(get_current_user)):
    conversations = []
    for filename in os.listdir(CONVERSATIONS_DIR):
        if filename.endswith('.json') and current_user in filename:
            filepath = os.path.join(CONVERSATIONS_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                conv_data = json.load(f)
                conversations.append({
                    "id": filename.replace('.json', ''),
                    "character_id": conv_data["character_id"],
                    "character_name": CHARACTERS[conv_data["character_id"]]["name"],
                    "last_message": conv_data["messages"][-1]["content"][:100] if conv_data["messages"] else "",
                    "timestamp": conv_data["messages"][-1]["timestamp"] if conv_data["messages"] else ""
                })
    
    return sorted(conversations, key=lambda x: x["timestamp"], reverse=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
