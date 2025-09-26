"""
LLM驱动的F1比赛策略和对话端点
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import openai
import json
import random
from datetime import datetime

router = APIRouter()

# 兼容OpenAI新版客户端或环境变量未配置场景
try:
    from openai import OpenAI
    import os
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")
    openai_client = None
    if OPENAI_API_KEY and OPENAI_API_KEY != "your_openai_api_key_here":
        if OPENAI_BASE_URL:
            openai_client = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)
        else:
            openai_client = OpenAI(api_key=OPENAI_API_KEY)
except Exception:
    openai_client = None

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

class RaceEventRequest(BaseModel):
    eventType: str
    currentLap: int
    classification: List[dict]
    weather: dict

# F1车手个性数据库
DRIVER_PERSONALITIES = {
    "max_verstappen": {
        "traits": ["直接", "自信", "竞争性强"],
        "communication_style": "简洁有力",
        "profanity_tolerance": "低",
        "stress_response": "保持冷静，专注技术"
    },
    "lewis_hamilton": {
        "traits": ["经验丰富", "战术思维", "领袖气质"],
        "communication_style": "鼓舞人心",
        "profanity_tolerance": "中等",
        "stress_response": "积极应对，寻找机会"
    },
    "charles_leclerc": {
        "traits": ["激情", "技术型", "完美主义"],
        "communication_style": "技术细节导向",
        "profanity_tolerance": "低",
        "stress_response": "分析问题，寻求解决方案"
    }
}

# 车队文化数据库
TEAM_CULTURES = {
    "red_bull": {
        "philosophy": "创新激进，数据驱动",
        "communication": "直接高效，技术导向",
        "strategy_tendency": "冒险型"
    },
    "ferrari": {
        "philosophy": "传统与激情并重",
        "communication": "情感丰富，历史感强",
        "strategy_tendency": "平衡型"
    },
    "mercedes": {
        "philosophy": "精密工程，完美执行",
        "communication": "数据精确，系统性强",
        "strategy_tendency": "保守型"
    }
}

async def generate_llm_response(prompt: str, context: Dict, conversation_history: List = None) -> Dict:
    """
    调用OpenAI GPT-4生成真实的F1对话和策略
    """
    try:
        driver_id = context.get('driverId', '')
        team_id = context.get('teamId', '')
        current_lap = context.get('currentLap', 0)
        position = context.get('position', 10)
        
        # 构建系统提示 - 更详细和真实
        system_prompt = f"""你是{context.get('driverName', 'F1车手')}，一名专业的F1赛车手。

【车手背景】
个性特征：{json.dumps(DRIVER_PERSONALITIES.get(driver_id, {}), ensure_ascii=False)}
车队文化：{json.dumps(TEAM_CULTURES.get(team_id, {}), ensure_ascii=False)}

【当前比赛情况】
- 比赛圈数：第{current_lap}圈 / 总{context.get('totalLaps', 57)}圈
- 当前位置：P{position}
- 与前车差距：{context.get('gap', '未知')}
- 轮胎状况：{context.get('tyreCondition', '中性胎')}，磨损{context.get('tyreWear', 0)*100:.1f}%
- 燃油水平：{context.get('fuelLevel', '正常')}
- 赛道状况：{context.get('raceFlag', '绿旗')}
- 天气条件：{json.dumps(context.get('weather', {}), ensure_ascii=False)}

【对话规则】
1. 保持车手的真实个性和专业素养
2. 根据比赛情况调整回应的紧迫感和专业度
3. 对不当言论要有真实的人类反应，但保持专业
4. 技术指令要给出专业的执行确认
5. 可以表达情绪，但要符合F1车手的职业标准
6. 回应要考虑当前比赛压力和位置

【回应格式】
必须返回JSON格式：
{{
  "response": "车手的回应内容",
  "mood": "当前情绪状态(professional/confident/frustrated/angry/excited/concerned)",
  "confidence": 0.0-1.0,
  "strategyImpact": {{
    "paceMultiplier": 0.95-1.1,
    "description": "对表现的影响描述"
  }},
  "teamRadioMessage": "向车队的回应消息（可选）"
}}"""

        # 构建对话消息
        messages = [{"role": "system", "content": system_prompt}]
        
        # 添加对话历史
        if conversation_history:
            messages.extend(conversation_history[-6:])  # 最近6轮对话
        
        messages.append({"role": "user", "content": prompt})

        # 调用OpenAI API
        # 优先使用同步/异步客户端，兼容两种写法
        result_text = ""
        if openai_client:
            resp = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=600,
                temperature=0.85,
            )
            result_text = resp.choices[0].message.content.strip()
        else:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=messages,
                max_tokens=600,
                temperature=0.85,
                presence_penalty=0.1,
                frequency_penalty=0.1
            )
            result_text = response.choices[0].message.content.strip()
        
        # 尝试解析JSON
        try:
            result = json.loads(result_text)
            
            # 验证和补充必要字段
            if not isinstance(result, dict):
                raise ValueError("Invalid response format")
                
            result.setdefault('mood', 'professional')
            result.setdefault('confidence', 0.8)
            
            # 确保策略影响在合理范围内
            if result.get('strategyImpact') and result['strategyImpact'].get('paceMultiplier'):
                pace = result['strategyImpact']['paceMultiplier']
                result['strategyImpact']['paceMultiplier'] = max(0.9, min(1.15, pace))
            
            return result
            
        except (json.JSONDecodeError, ValueError):
            # JSON解析失败，使用文本作为回应
            return {
                "response": result_text,
                "mood": "professional",
                "confidence": 0.7,
                "strategyImpact": None
            }

    except Exception as e:
        print(f"LLM调用错误: {e}")
        
        # 生成基于上下文的智能降级回应
        fallback_responses = {
            'high_pressure': f"现在是第{current_lap}圈，我在P{position}，专注比赛中。有什么技术指令吗？",
            'normal': f"收到，{context.get('driverName', '车手')}在线。当前P{position}位置，一切正常。",
            'pit_window': f"轮胎感觉还可以，但如果你觉得需要进站，我随时准备。",
            'defensive': f"后面的车在推进，我会保持防守位置。"
        }
        
        # 根据比赛情况选择降级回应
        if current_lap > 45:
            fallback = fallback_responses['high_pressure']
        elif position <= 3:
            fallback = fallback_responses['defensive']
        else:
            fallback = fallback_responses['normal']
        
        return {
            "response": fallback,
            "mood": "professional",
            "confidence": 0.6,
            "strategyImpact": None
        }

@router.post("/api/race/strategy_analysis")
async def strategy_analysis(request: StrategyAnalysisRequest):
    """
    LLM驱动的策略分析
    """
    try:
        prompt = f"""
分析F1比赛策略：

赛道：{request.circuit}
圈数：{request.raceLength}
天气：{request.weather}
赛道温度：{request.trackTemp}°C

发车顺序：
{json.dumps(request.gridOrder, ensure_ascii=False)}

当前策略：
{json.dumps(request.currentStrategies, ensure_ascii=False)}

请提供：
1. 赛道条件分析
2. 每车策略建议
3. 风险评估
4. 预期结果

格式：JSON，包含analysis、recommendations、riskAssessment字段
"""

        context = {
            'weather': request.weather,
            'trackTemp': request.trackTemp,
            'circuit': request.circuit
        }

        result = await generate_llm_response(prompt, context)
        
        # 补充默认结构
        return {
            "analysis": result.get("analysis", f"{request.circuit}在{request.trackTemp}°C条件下，轮胎衰减将是关键因素。"),
            "recommendations": result.get("recommendations", [
                {"driver": "Top 3", "suggestion": "保守一停策略", "impact": "确保积分"},
                {"driver": "Mid-field", "suggestion": "激进二停", "impact": "争取更好位置"}
            ]),
            "riskAssessment": result.get("riskAssessment", ["轮胎衰减: 高", "超车难度: 中"])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"策略分析失败: {str(e)}")

@router.post("/api/chat/driver_response")
async def driver_response(request: DriverResponseRequest):
    """
    车手AI回应（真实反应，包含恶意输入处理）
    """
    try:
        # 检测不当言论和指令类型
        profanity_words = ['草泥马', '傻逼', '白痴', '蠢货', 'fuck', 'shit', 'damn', '滚', '死', '操']
        technical_words = ['进站', 'pit', 'box', '推进', 'push', 'attack', '防守', 'defend', '节油', 'save fuel']
        
        is_profanity = any(word in request.message.lower() for word in profanity_words)
        is_technical = any(word in request.message.lower() for word in technical_words)
        
        # 构建更详细的上下文
        enhanced_context = {
            'driverId': request.driverId,
            'driverName': request.driverName,
            'teamId': request.teamContext.get('name', '').lower().replace(' ', '_'),
            'currentLap': request.teamContext.get('currentLap', 0),
            'totalLaps': request.teamContext.get('totalLaps', 57),
            'position': request.teamContext.get('position', 10),
            'gap': request.teamContext.get('gap', '+0.00s'),
            'tyreCondition': request.teamContext.get('tyreCondition', 'medium'),
            'tyreWear': request.teamContext.get('tyreWear', 0),
            'fuelLevel': request.teamContext.get('fuelLevel', 'normal'),
            'weather': request.raceContext.get('weather', {}),
            'raceFlag': request.raceContext.get('raceFlag', 'green'),
            'phase': request.raceContext.get('phase', 'race')
        }

        # 构建提示词
        if is_profanity:
            prompt = f"""用户刚才对你说了不当的话："{request.message}"

作为一名专业的F1车手，你需要：
1. 表达不满但保持职业素养
2. 重新引导对话到比赛技术层面
3. 显示你的个性但不失专业标准

当前你正在激烈的比赛中，压力很大，但必须保持专业。"""

        elif is_technical:
            prompt = f"""车队给你下达了技术指令："{request.message}"

请根据当前比赛情况给出专业回应：
- 如果是合理指令，确认执行
- 如果有疑虑，提出专业建议
- 根据你的个性和经验做出判断

这个指令可能会影响你的驾驶表现和比赛策略。"""

        else:
            prompt = f"""用户对你说："{request.message}"

请根据你的个性、当前比赛情况和压力水平做出真实回应。
- 如果是闲聊，可以简短回应但要保持专注
- 如果是鼓励，表达感谢并保持信心
- 如果是质疑，专业地解释你的判断"""

        # 获取对话历史
        conversation_history = getattr(request, 'conversationHistory', [])
        
        result = await generate_llm_response(prompt, enhanced_context, conversation_history)
        
        # 确保返回格式正确
        if not isinstance(result, dict):
            result = {"response": str(result), "mood": "professional", "strategyImpact": None}
        
        # 添加额外的比赛情境信息
        result['raceContext'] = {
            'currentLap': enhanced_context['currentLap'],
            'position': enhanced_context['position'],
            'isUnderPressure': enhanced_context['currentLap'] > 40 or enhanced_context['position'] > 15,
            'isPitWindow': enhanced_context['currentLap'] in [15, 16, 17, 35, 36, 37, 38, 39, 40]
        }
            
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"车手回应生成失败: {str(e)}")

@router.post("/api/race/llm_strategy")
async def llm_strategy_update(request: LLMStrategyRequest):
    """
    实时策略更新和无线电生成
    """
    try:
        prompt = f"""
F1比赛实时策略分析：

当前圈数：{request.currentLap}
比赛阶段：{request.phase}
天气条件：{json.dumps(request.weather, ensure_ascii=False)}
实时排名：{json.dumps(request.classification[:10], ensure_ascii=False)}

请生成：
1. 策略调整建议（哪些车需要改变进站计划）
2. 车队无线电对话（3-5条真实的团队沟通）
3. 比赛事件预测

格式：JSON，包含strategyUpdates、teamRadio、eventPredictions字段
"""

        result = await generate_llm_response(prompt, {
            'currentLap': request.currentLap,
            'phase': request.phase,
            'weather': request.weather
        })

        # 补充默认结构
        return {
            "strategyUpdates": result.get("strategyUpdates", []),
            "teamRadio": result.get("teamRadio", [
                {
                    "teamName": "Ferrari",
                    "driverName": "Leclerc",
                    "message": "轮胎温度正常，保持节奏",
                    "teamColor": "#DC143C"
                }
            ]),
            "eventPredictions": result.get("eventPredictions", [])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM策略更新失败: {str(e)}")

@router.post("/api/race/generate_event")
async def generate_race_event(request: RaceEventRequest):
    """
    LLM生成真实比赛事件
    """
    try:
        prompt = f"""
根据当前比赛情况生成真实的F1比赛事件：

当前圈数：{request.currentLap}
排名情况：{json.dumps(request.classification[:5], ensure_ascii=False)}
天气：{json.dumps(request.weather, ensure_ascii=False)}

可能的事件类型：
- 机械故障
- 碰撞事故
- 天气变化
- 轮胎问题
- 战术失误

请生成一个真实的事件，包含：
1. 事件描述
2. 影响的车手
3. 对比赛的影响
4. 车队反应

格式：JSON
"""

        result = await generate_llm_response(prompt, {
            'currentLap': request.currentLap,
            'weather': request.weather
        })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"事件生成失败: {str(e)}")
