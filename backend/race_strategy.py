"""
F1比赛策略与AI车手反应系统
提供LLM驱动的策略分析、车手无线电对话、事件响应
"""

import random
import json
from typing import Dict, List, Any
from datetime import datetime

class F1StrategyAI:
    def __init__(self):
        self.driver_personalities = {
            "aggressive": {
                "traits": ["冲动", "激进", "不服输"],
                "response_style": "直接、情绪化",
                "profanity_reaction": "愤怒但专业"
            },
            "calm": {
                "traits": ["冷静", "分析型", "专业"],
                "response_style": "理性、技术性",
                "profanity_reaction": "保持冷静，转向技术讨论"
            },
            "confident": {
                "traits": ["自信", "幽默", "领袖气质"],
                "response_style": "自信、略带幽默",
                "profanity_reaction": "用幽默化解，保持自信"
            }
        }
        
        self.team_characteristics = {
            "red_bull": {"culture": "创新激进", "communication": "直接高效"},
            "ferrari": {"culture": "传统激情", "communication": "情感丰富"},
            "mercedes": {"culture": "技术精准", "communication": "数据驱动"},
            "mclaren": {"culture": "年轻活力", "communication": "轻松友好"},
            "alpine": {"culture": "法式优雅", "communication": "战术细腻"}
        }

    async def analyze_strategy(self, race_context: Dict) -> Dict:
        """
        基于比赛情况生成策略分析
        """
        weather = race_context.get('weather', 'dry')
        track_temp = race_context.get('trackTemp', 42)
        race_length = race_context.get('raceLength', 57)
        
        # 模拟LLM分析（实际应调用GPT-4）
        analysis = self._generate_strategy_analysis(weather, track_temp, race_length)
        recommendations = self._generate_recommendations(race_context)
        
        return {
            "analysis": analysis,
            "recommendations": recommendations,
            "strategyUpdates": self._generate_strategy_updates(race_context),
            "teamRadio": self._generate_team_radio(race_context)
        }

    def _generate_strategy_analysis(self, weather: str, track_temp: int, race_length: int) -> str:
        """生成赛道分析"""
        base_analysis = f"巴林赛道{race_length}圈比赛分析："
        
        if track_temp > 45:
            base_analysis += " 高温条件下轮胎衰减严重，建议保守策略。"
        elif track_temp < 35:
            base_analysis += " 低温条件有利于轮胎寿命，可采用激进策略。"
        else:
            base_analysis += " 温度适中，多种策略可行。"
            
        if weather == 'light_rain':
            base_analysis += " 轻微降雨增加变数，需准备雨胎策略。"
        elif weather == 'heavy_rain':
            base_analysis += " 大雨条件下安全车概率极高，策略需灵活调整。"
            
        return base_analysis

    def _generate_recommendations(self, context: Dict) -> List[Dict]:
        """生成个性化建议"""
        recommendations = []
        grid_order = context.get('gridOrder', [])
        
        for i, car_info in enumerate(grid_order[:6]):  # 前6位
            if i < 2:
                rec = {
                    "driver": car_info['driver'],
                    "suggestion": "保持领先优势，采用保守一停策略",
                    "impact": "降低风险，确保积分"
                }
            elif i < 4:
                rec = {
                    "driver": car_info['driver'], 
                    "suggestion": "尝试undercut策略，早停抢位",
                    "impact": "有机会提升2-3个位置"
                }
            else:
                rec = {
                    "driver": car_info['driver'],
                    "suggestion": "激进二停策略，利用新胎优势",
                    "impact": "高风险高回报，可能大幅提升"
                }
            recommendations.append(rec)
            
        return recommendations

    def _generate_strategy_updates(self, context: Dict) -> List[Dict]:
        """生成策略更新"""
        updates = []
        current_lap = context.get('currentLap', 0)
        
        # 模拟基于当前比赛情况的策略调整
        if current_lap > 10:
            # 随机选择几辆车进行策略微调
            sample_cars = random.sample(list(context.get('classification', []))[:10], 3)
            for car in sample_cars:
                update = {
                    "carId": car.get('id'),
                    "changes": {
                        "paceK": random.uniform(0.98, 1.05),
                        "plannedPitLaps": [current_lap + random.randint(3, 8)]
                    }
                }
                updates.append(update)
                
        return updates

    def _generate_team_radio(self, context: Dict) -> List[Dict]:
        """生成车队无线电对话"""
        radio_messages = []
        current_lap = context.get('currentLap', 0)
        
        # 生成多样化的无线电内容
        radio_templates = [
            "轮胎温度正常，保持节奏",
            "前车防守很强，寻找机会",
            "DRS检测点通过，准备超车",
            "燃油消耗在预期范围内",
            "注意后车，他们在推进",
            "轮胎开始衰减，考虑进站窗口",
            "赛道温度上升，保护轮胎",
            "很好的防守，保持位置"
        ]
        
        # 随机生成2-4条无线电
        for _ in range(random.randint(2, 4)):
            team_names = ["Ferrari", "Mercedes", "McLaren", "Alpine", "Aston Martin"]
            team_colors = ["#DC143C", "#00D2BE", "#FF8000", "#0090FF", "#006F62"]
            
            team_idx = random.randint(0, len(team_names) - 1)
            radio_messages.append({
                "teamName": team_names[team_idx],
                "driverName": f"Driver {random.randint(1, 20)}",
                "message": random.choice(radio_templates),
                "teamColor": team_colors[team_idx]
            })
            
        return radio_messages

    async def generate_driver_response(self, user_input: str, driver_context: Dict) -> Dict:
        """
        生成车手对用户输入的真实反应
        包含对恶意输入的专业处理
        """
        driver_name = driver_context.get('driverName', 'Driver')
        team_name = driver_context.get('teamContext', {}).get('name', 'Team')
        position = driver_context.get('teamContext', {}).get('position', 10)
        current_lap = driver_context.get('teamContext', {}).get('currentLap', 0)
        
        # 检测输入类型
        profanity_detected = self._detect_profanity(user_input)
        instruction_type = self._classify_instruction(user_input)
        
        if profanity_detected:
            return self._handle_profanity_response(driver_name, team_name)
        elif instruction_type:
            return self._handle_instruction_response(instruction_type, driver_name, position, current_lap)
        else:
            return self._handle_general_response(user_input, driver_name, team_name)

    def _detect_profanity(self, text: str) -> bool:
        """检测不当用词"""
        profanity_words = ['草泥马', '傻逼', '白痴', '蠢货', 'fuck', 'shit', 'damn']
        return any(word in text.lower() for word in profanity_words)

    def _classify_instruction(self, text: str) -> str:
        """分类指令类型"""
        if any(word in text for word in ['进站', 'pit', 'box']):
            return 'pit'
        elif any(word in text for word in ['推进', '加速', 'push', 'attack']):
            return 'push'
        elif any(word in text for word in ['防守', '保持', 'defend', 'hold']):
            return 'defend'
        elif any(word in text for word in ['节油', '省油', 'fuel', 'save']):
            return 'fuel_save'
        return 'general'

    def _handle_profanity_response(self, driver_name: str, team_name: str) -> Dict:
        """处理不当用词的专业反应"""
        responses = [
            f"{driver_name}: 嘿，保持专业！我们专注比赛。",
            f"{driver_name}: 我明白你的沮丧，但让我们把注意力放在赛道上。",
            f"{driver_name}: 无线电请保持清洁，{team_name}车队有标准的。",
            f"{driver_name}: 我听到了，但现在我需要专注驾驶。"
        ]
        
        return {
            "response": random.choice(responses),
            "mood": "professional_but_firm",
            "strategyImpact": {
                "paceMultiplier": 0.98  # 轻微影响专注度
            }
        }

    def _handle_instruction_response(self, instruction_type: str, driver_name: str, position: int, current_lap: int) -> Dict:
        """处理技术指令"""
        responses = {
            'pit': [
                f"{driver_name}: 收到，轮胎确实需要更换了。进站！",
                f"{driver_name}: 明白，准备进站。告诉技师准备好。",
                f"{driver_name}: 轮胎已经到极限了，这是正确的决定。"
            ],
            'push': [
                f"{driver_name}: 收到！全力推进，轮胎感觉还不错。",
                f"{driver_name}: 明白，我会榨干每一分性能。",
                f"{driver_name}: 推进模式激活，让我们看看能提升多少。"
            ],
            'defend': [
                f"{driver_name}: 收到，我会守住内线。",
                f"{driver_name}: 明白，防守位置。他们很难超我。",
                f"{driver_name}: 防守模式，我会让他们知道什么叫难超。"
            ],
            'fuel_save': [
                f"{driver_name}: 收到，切换到节油模式。",
                f"{driver_name}: 明白，调整驾驶风格保存燃油。",
                f"{driver_name}: 燃油管理激活，我会控制好油门。"
            ]
        }
        
        impact_multipliers = {
            'pit': 1.0,
            'push': 1.05,
            'defend': 0.97,
            'fuel_save': 0.94
        }
        
        return {
            "response": random.choice(responses.get(instruction_type, responses['push'])),
            "mood": "focused",
            "strategyImpact": {
                "paceMultiplier": impact_multipliers.get(instruction_type, 1.0)
            }
        }

    def _handle_general_response(self, user_input: str, driver_name: str, team_name: str) -> Dict:
        """处理一般对话"""
        general_responses = [
            f"{driver_name}: 车感很好，{team_name}的调校很棒。",
            f"{driver_name}: 专注比赛中，有什么技术问题吗？",
            f"{driver_name}: 明白，我会根据情况调整。",
            f"{driver_name}: 收到，让我们拿下这场比赛！"
        ]
        
        return {
            "response": random.choice(general_responses),
            "mood": "neutral",
            "strategyImpact": None
        }

# 全局实例
f1_ai = F1StrategyAI()
