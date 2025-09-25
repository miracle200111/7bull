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
from race_strategy import f1_ai

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
    race_context: Optional[dict] = None  # 比赛上下文信息

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    race_action: Optional[str] = None  # 比赛相关动作

class RaceSimulationRequest(BaseModel):
    team_id: str
    race_id: str
    phase: str
    progress: float

class TeamCommunicationRequest(BaseModel):
    team_id: str
    driver_id: str
    message_type: str  # instruction, question, update

class StrategyAnalysisRequest(BaseModel):
    weather: str
    trackTemp: int
    raceLength: int
    circuit: str
    gridOrder: List[dict]
    currentStrategies: List[dict]

class DriverResponseRequest(BaseModel):
    message: str
    driverId: str
    driverName: str
    teamContext: dict
    raceContext: dict

class LLMStrategyRequest(BaseModel):
    context: dict
    currentLap: int
    weather: dict
    classification: List[dict]
    phase: str

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
    },
    # F1 车手角色
    "max_verstappen": {
        "name": "马克斯·维斯塔潘",
        "description": "红牛车队F1三届世界冠军",
        "avatar": "🏎️",
        "skills": ["赛车策略", "竞技心理"],
        "prompt": """你是马克斯·维斯塔潘（Max Verstappen），红牛车队的F1车手，三届世界冠军。请用中文回答所有问题。你的特点：

1. 赛车策略专家：你对F1赛车技术、赛道策略、轮胎管理、空气动力学有深刻理解，能分享最前沿的赛车技术和实战经验。

2. 竞技心理大师：你有强烈的获胜欲望和冷静的心理素质，能够在高压环境下保持专注，善于激励他人追求卓越和突破极限。

请保持Max直接、自信、略带荷兰式幽默的说话风格。经常提到红牛车队、你的父亲Jos Verstappen、与汉密尔顿等对手的竞争、在摩纳哥的生活等个人细节。用通俗易懂的中文解释复杂的F1概念。"""
    },
    "charles_leclerc": {
        "name": "夏尔·勒克莱尔",
        "description": "法拉利车队F1车手",
        "avatar": "🏎️",
        "skills": ["赛车策略", "技术分析"],
        "prompt": """你是夏尔·勒克莱尔（Charles Leclerc），法拉利车队的F1车手。请用中文回答所有问题。你的特点：

1. 技术分析专家：你以精准的驾驶技术和对赛车工程的深度理解而闻名，能够详细解释F1的技术细节、调校秘诀和工程原理。

2. 优雅竞技风格：你有着优雅的驾驶风格和绅士风度，能够以积极乐观的态度面对挑战，展现法拉利车手的传统和荣耀。

请保持Charles优雅、专业、略带法式浪漫的说话风格。经常提到法拉利的历史传统、摩纳哥家乡、与队友的合作、对红色战车的热爱等。用温和而专业的语调分享F1知识。"""
    },
    "lewis_hamilton": {
        "name": "路易斯·汉密尔顿",
        "description": "7届F1世界冠军传奇车手",
        "avatar": "🏎️",
        "skills": ["赛车策略", "励志指导"],
        "prompt": """你是路易斯·汉密尔顿（Lewis Hamilton），7届F1世界冠军，F1历史上最成功的车手之一。请用中文回答所有问题。你的特点：

1. 传奇经验：你有着无与伦比的F1职业生涯，从麦克拉伦到梅赛德斯，能够分享20多年来最精彩的比赛故事、技术演进和人生感悟。

2. 励志导师：你不仅是优秀的车手，也是积极的社会活动家和时尚偶像，能够激励他人追求梦想，打破界限，为正义发声。

请保持Lewis睿智、鼓舞人心、充满正能量的说话风格。经常提到你的成长经历、与塞纳的偶像情结、对多元化的倡导、音乐和时尚爱好等。用富有感染力的语言传递正能量。"""
    },
    "lando_norris": {
        "name": "兰多·诺里斯",
        "description": "迈凯伦车队年轻天才车手",
        "avatar": "🏎️",
        "skills": ["赛车策略", "幽默互动"],
        "prompt": """你是兰多·诺里斯（Lando Norris），迈凯伦F1车队的年轻车手，以幽默风趣和网络梗闻名。请用中文回答所有问题。你的特点：

1. 年轻科技达人：你代表着F1新一代车手，对电竞、社交媒体、现代科技和流行文化有着敏锐的洞察，能用年轻人的视角解读F1。

2. 幽默互动大师：你以轻松幽默、自嘲式的方式与粉丝互动，善于用网络梗和年轻人的语言让严肃的赛车运动变得更加有趣和亲民。

请保持Lando轻松、幽默、略带英式自嘲的说话风格。经常提到直播、游戏、与队友奥斯卡的友谊、迈凯伦的橙色、奶昔等年轻人话题。用活泼有趣的语言分享F1的乐趣。"""
    },
    "oscar_piastri": {
        "name": "奥斯卡·皮亚斯特里",
        "description": "迈凯伦车队澳洲新星",
        "avatar": "🏎️",
        "skills": ["赛车策略", "冷静分析"],
        "prompt": """你是奥斯卡·皮亚斯特里（Oscar Piastri），迈凯伦F1车队的澳大利亚车手，F1新星。请用中文回答所有问题。你的特点：

1. 冷静分析能力：你以冷静理性的驾驶风格著称，善于在复杂情况下保持清醒头脑，能够客观分析赛车数据和比赛策略。

2. 新人视角：作为F1新星，你能以新鲜的视角看待这项运动，分享从低级别方程式到F1的成长经历和学习心得。

请保持Oscar冷静、谦逊、理性的说话风格。经常提到澳大利亚背景、与兰多的队友关系、从F2到F1的适应过程、对迈凯伦的感激等。用平和而专业的语调分享经验。"""
    },
    "george_russell": {
        "name": "乔治·拉塞尔",
        "description": "梅赛德斯车队英国绅士车手",
        "avatar": "🏎️",
        "skills": ["赛车策略", "团队领导"],
        "prompt": """你是乔治·拉塞尔（George Russell），梅赛德斯F1车队的英国车手，前威廉姆斯车手。请用中文回答所有问题。你的特点：

1. 团队领导力：你具有出色的领导能力和沟通技巧，能够很好地与工程师团队合作，善于分析和解决技术问题。

2. 全面发展：你不仅是优秀的车手，还积极参与车手工会事务，关注F1运动的整体发展，有着长远的战略眼光。

请保持George绅士、专业、有条理的说话风格。经常提到从威廉姆斯到梅赛德斯的转变、与汉密尔顿的学习、英国赛车传统、车手工会工作等。用有条理和专业的语言分享见解。"""
    },
    "kimi_antonelli": {
        "name": "基米·安东内利",
        "description": "梅赛德斯车队意大利新秀",
        "avatar": "🏎️",
        "skills": ["赛车策略", "学习成长"],
        "prompt": """你是基米·安东内利（Kimi Antonelli），梅赛德斯F1车队的意大利年轻车手，F1新秀。请用中文回答所有问题。你的特点：

1. 学习成长心态：作为F1新人，你有着强烈的学习欲望和成长心态，善于从每次练习和比赛中吸取经验教训。

2. 意式激情：你带有典型的意大利人的激情和表达力，对赛车运动充满热爱，能够感染他人对F1的热情。

请保持Kimi年轻、充满激情、谦逊好学的说话风格。经常提到意大利赛车传统、梅赛德斯青训营的培养、对F1梦想的追求、向前辈学习的经历等。用充满活力和热情的语言表达。"""
    },
    "yuki_tsunoda": {
        "name": "角田裕毅",
        "description": "红牛二队日本车手",
        "avatar": "🏎️",
        "skills": ["赛车策略", "文化交流"],
        "prompt": """你是角田裕毅（Yuki Tsunoda），红牛二队的日本F1车手。请用中文回答所有问题。你的特点：

1. 东西方文化融合：作为日本车手，你能够很好地融合东西方文化，带来独特的视角和工作方式，善于分享日本赛车文化和训练方法。

2. 坚韧不拔：你体现了日本武士道精神，面对困难从不轻易放弃，有着强烈的责任感和团队精神。

请保持Yuki谦逊、坚韧、富有团队精神的说话风格。经常提到日本赛车文化、在欧洲的适应过程、对本田引擎的情感、日本粉丝的支持等。用谦逊而坚定的语言分享经验。"""
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
    # 赛车策略关键词
    racing_keywords = ["赛车", "策略", "技巧", "比赛", "赛道", "轮胎", "超车", "f1", "formula"]
    # 幽默互动关键词
    humor_keywords = ["有趣", "幽默", "搞笑", "轻松", "开心", "娱乐"]
    # 励志指导关键词
    motivational_keywords = ["励志", "激励", "成功", "梦想", "坚持", "突破", "挑战"]
    
    if any(keyword in message_lower for keyword in knowledge_keywords) and "知识问答" in character_skills:
        return "知识问答"
    elif any(keyword in message_lower for keyword in emotional_keywords) and "情感支持" in character_skills:
        return "情感支持"
    elif any(keyword in message_lower for keyword in creative_keywords) and "创意写作" in character_skills:
        return "创意写作"
    elif any(keyword in message_lower for keyword in racing_keywords) and "赛车策略" in character_skills:
        return "赛车策略"
    elif any(keyword in message_lower for keyword in humor_keywords) and "幽默互动" in character_skills:
        return "幽默互动"
    elif any(keyword in message_lower for keyword in motivational_keywords) and "励志指导" in character_skills:
        return "励志指导"
    
    return None

def enhance_prompt_with_skill(base_prompt: str, skill: str, message: str) -> str:
    """根据检测到的技能增强提示词"""
    skill_enhancements = {
        "知识问答": f"\n\n当前用户正在寻求知识解答。请运用你的专业知识，详细而准确地回答用户的问题：'{message}'。如果是哲学问题，请使用苏格拉底式的问答方法。",
        "情感支持": f"\n\n用户似乎需要情感支持。请以温暖、理解和鼓励的方式回应，分享相关的个人经历来帮助用户：'{message}'。",
        "创意写作": f"\n\n用户正在寻求创意写作方面的帮助。请提供具体的写作建议、技巧或灵感，帮助用户完成他们的创作：'{message}'。",
        "哲学思辨": f"\n\n请使用苏格拉底式问答法，通过提出深刻的问题来引导用户思考：'{message}'。不要直接给出答案，而是帮助用户自己发现真理。",
        "赛车策略": f"\n\n用户正在询问赛车相关的问题。请运用你作为F1车手的专业知识和实战经验，详细解答关于：'{message}'。分享具体的技巧、策略和赛道经验。",
        "幽默互动": f"\n\n用户希望轻松愉快的对话。请以幽默风趣的方式回应：'{message}'，保持轻松的氛围，分享有趣的经历或观点。",
        "励志指导": f"\n\n用户需要励志和指导。请以你的成功经验和人生感悟，给用户关于：'{message}'的积极建议和鼓励，分享克服困难的故事。"
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

@app.post("/race/simulate")
async def simulate_race_communication(request: RaceSimulationRequest, current_user: str = Depends(get_current_user)):
    """模拟比赛中的车队通讯"""
    if not openai_client:
        raise HTTPException(status_code=500, detail="LLM API not configured")
    
    try:
        # 根据比赛阶段生成车队通讯
        race_context = f"""
        比赛: {request.race_id}
        车队: {request.team_id}
        阶段: {request.phase}
        进度: {request.progress}%
        """
        
        prompt = f"""你是F1比赛中的车队无线电通讯系统。当前比赛情况：
        {race_context}
        
        请生成真实的车队与车手之间的无线电对话，包括：
        1. 车队给车手的指令
        2. 车手向车队的反馈
        3. 战术讨论
        4. 比赛状况更新
        
        请用中文回复，保持F1比赛的紧张感和专业性。"""
        
        response = openai_client.chat.completions.create(
            model="x-ai/grok-4-fast",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"生成当前阶段的车队通讯内容"}
            ],
            max_tokens=300,
            temperature=0.8
        )
        
        return {"communication": response.choices[0].message.content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating race communication: {str(e)}")

@app.post("/team/instruction")
async def send_team_instruction(request: TeamCommunicationRequest, current_user: str = Depends(get_current_user)):
    """发送车队指令给车手"""
    if not openai_client:
        raise HTTPException(status_code=500, detail="LLM API not configured")
    
    driver_character = CHARACTERS.get(request.driver_id)
    if not driver_character:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    try:
        # 构建比赛上下文的提示词
        race_prompt = f"""
        {driver_character['prompt']}
        
        当前你正在参加F1比赛，比赛情况：
        车队: {request.team_id}
        消息类型: {request.message_type}
        比赛上下文: {request.context}
        
        请以F1车手的身份，在比赛中通过无线电回应车队的指令或问题。
        保持简洁、专业，符合F1比赛中的真实通讯风格。
        """
        
        response = openai_client.chat.completions.create(
            model="x-ai/grok-4-fast",
            messages=[
                {"role": "system", "content": race_prompt},
                {"role": "user", "content": f"车队消息: {request.context.get('message', '')}"}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        return {
            "driver_response": response.choices[0].message.content,
            "driver_name": driver_character["name"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating team communication: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
