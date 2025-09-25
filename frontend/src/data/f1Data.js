// F1 2024赛季完整数据结构

export const F1_TEAMS = {
  red_bull: {
    id: 'red_bull',
    name: 'Red Bull Racing',
    fullName: 'Oracle Red Bull Racing',
    color: '#0600EF',
    secondaryColor: '#FFB800',
    country: 'Austria',
    teamPrincipal: 'Christian Horner',
    drivers: [
      {
        id: 'max_verstappen',
        name: 'Max Verstappen',
        number: 1,
        nationality: 'Netherlands',
        age: 26,
        championships: 3
      },
      {
        id: 'sergio_perez',
        name: 'Sergio Pérez',
        number: 11,
        nationality: 'Mexico',
        age: 34,
        championships: 0
      }
    ]
  },
  ferrari: {
    id: 'ferrari',
    name: 'Ferrari',
    fullName: 'Scuderia Ferrari',
    color: '#DC143C',
    secondaryColor: '#FFD700',
    country: 'Italy',
    teamPrincipal: 'Frédéric Vasseur',
    drivers: [
      {
        id: 'charles_leclerc',
        name: 'Charles Leclerc',
        number: 16,
        nationality: 'Monaco',
        age: 26,
        championships: 0
      },
      {
        id: 'carlos_sainz',
        name: 'Carlos Sainz Jr.',
        number: 55,
        nationality: 'Spain',
        age: 30,
        championships: 0
      }
    ]
  },
  mclaren: {
    id: 'mclaren',
    name: 'McLaren',
    fullName: 'McLaren F1 Team',
    color: '#FF8000',
    secondaryColor: '#47C7FC',
    country: 'United Kingdom',
    teamPrincipal: 'Andrea Stella',
    drivers: [
      {
        id: 'lando_norris',
        name: 'Lando Norris',
        number: 4,
        nationality: 'United Kingdom',
        age: 24,
        championships: 0
      },
      {
        id: 'oscar_piastri',
        name: 'Oscar Piastri',
        number: 81,
        nationality: 'Australia',
        age: 23,
        championships: 0
      }
    ]
  },
  mercedes: {
    id: 'mercedes',
    name: 'Mercedes',
    fullName: 'Mercedes-AMG PETRONAS F1 Team',
    color: '#00D2BE',
    secondaryColor: '#C0C0C0',
    country: 'Germany',
    teamPrincipal: 'Toto Wolff',
    drivers: [
      {
        id: 'lewis_hamilton',
        name: 'Lewis Hamilton',
        number: 44,
        nationality: 'United Kingdom',
        age: 39,
        championships: 7
      },
      {
        id: 'george_russell',
        name: 'George Russell',
        number: 63,
        nationality: 'United Kingdom',
        age: 26,
        championships: 0
      }
    ]
  },
  aston_martin: {
    id: 'aston_martin',
    name: 'Aston Martin',
    fullName: 'Aston Martin Aramco Cognizant F1 Team',
    color: '#006F62',
    secondaryColor: '#CEDC00',
    country: 'United Kingdom',
    teamPrincipal: 'Mike Krack',
    drivers: [
      {
        id: 'fernando_alonso',
        name: 'Fernando Alonso',
        number: 14,
        nationality: 'Spain',
        age: 42,
        championships: 2
      },
      {
        id: 'lance_stroll',
        name: 'Lance Stroll',
        number: 18,
        nationality: 'Canada',
        age: 25,
        championships: 0
      }
    ]
  },
  alpine: {
    id: 'alpine',
    name: 'Alpine',
    fullName: 'BWT Alpine F1 Team',
    color: '#0090FF',
    secondaryColor: '#FF1E87',
    country: 'France',
    teamPrincipal: 'Bruno Famin',
    drivers: [
      {
        id: 'pierre_gasly',
        name: 'Pierre Gasly',
        number: 10,
        nationality: 'France',
        age: 28,
        championships: 0
      },
      {
        id: 'esteban_ocon',
        name: 'Esteban Ocon',
        number: 31,
        nationality: 'France',
        age: 27,
        championships: 0
      }
    ]
  },
  williams: {
    id: 'williams',
    name: 'Williams',
    fullName: 'Williams Racing',
    color: '#005AFF',
    secondaryColor: '#FFFFFF',
    country: 'United Kingdom',
    teamPrincipal: 'James Vowles',
    drivers: [
      {
        id: 'alex_albon',
        name: 'Alex Albon',
        number: 23,
        nationality: 'Thailand',
        age: 28,
        championships: 0
      },
      {
        id: 'franco_colapinto',
        name: 'Franco Colapinto',
        number: 43,
        nationality: 'Argentina',
        age: 21,
        championships: 0
      }
    ]
  },
  rb: {
    id: 'rb',
    name: 'RB',
    fullName: 'Visa Cash App RB F1 Team',
    color: '#6692FF',
    secondaryColor: '#1E41FF',
    country: 'Italy',
    teamPrincipal: 'Laurent Mekies',
    drivers: [
      {
        id: 'yuki_tsunoda',
        name: 'Yuki Tsunoda',
        number: 22,
        nationality: 'Japan',
        age: 24,
        championships: 0
      },
      {
        id: 'daniel_ricciardo',
        name: 'Daniel Ricciardo',
        number: 3,
        nationality: 'Australia',
        age: 35,
        championships: 0
      }
    ]
  },
  haas: {
    id: 'haas',
    name: 'Haas',
    fullName: 'MoneyGram Haas F1 Team',
    color: '#FFFFFF',
    secondaryColor: '#B6BABD',
    country: 'United States',
    teamPrincipal: 'Ayao Komatsu',
    drivers: [
      {
        id: 'kevin_magnussen',
        name: 'Kevin Magnussen',
        number: 20,
        nationality: 'Denmark',
        age: 31,
        championships: 0
      },
      {
        id: 'nico_hulkenberg',
        name: 'Nico Hülkenberg',
        number: 27,
        nationality: 'Germany',
        age: 36,
        championships: 0
      }
    ]
  },
  sauber: {
    id: 'sauber',
    name: 'Sauber',
    fullName: 'Kick Sauber F1 Team',
    color: '#52E252',
    secondaryColor: '#000000',
    country: 'Switzerland',
    teamPrincipal: 'Alessandro Alunni Bravi',
    drivers: [
      {
        id: 'valtteri_bottas',
        name: 'Valtteri Bottas',
        number: 77,
        nationality: 'Finland',
        age: 34,
        championships: 0
      },
      {
        id: 'guanyu_zhou',
        name: 'Zhou Guanyu',
        number: 24,
        nationality: 'China',
        age: 25,
        championships: 0
      }
    ]
  }
};

export const F1_RACES_2024 = {
  bahrain: {
    id: 'bahrain',
    name: 'Bahrain Grand Prix',
    location: 'Sakhir, Bahrain',
    circuit: 'Bahrain International Circuit',
    laps: 57,
    distance: 308.238,
    date: '2024-03-02',
    weather: 'Hot and Dry',
    difficulty: 'Medium',
    characteristics: ['High-speed straights', 'Hard braking zones', 'Desert heat']
  },
  saudi_arabia: {
    id: 'saudi_arabia',
    name: 'Saudi Arabian Grand Prix',
    location: 'Jeddah, Saudi Arabia',
    circuit: 'Jeddah Corniche Circuit',
    laps: 50,
    distance: 308.450,
    date: '2024-03-09',
    weather: 'Hot and Dry',
    difficulty: 'Very Hard',
    characteristics: ['Night race', 'High-speed street circuit', 'Narrow track']
  },
  australia: {
    id: 'australia',
    name: 'Australian Grand Prix',
    location: 'Melbourne, Australia',
    circuit: 'Albert Park Circuit',
    laps: 58,
    distance: 306.124,
    date: '2024-03-24',
    weather: 'Variable',
    difficulty: 'Medium',
    characteristics: ['Street circuit', 'High-speed corners', 'Unpredictable weather']
  },
  japan: {
    id: 'japan',
    name: 'Japanese Grand Prix',
    location: 'Suzuka, Japan',
    circuit: 'Suzuka International Racing Course',
    laps: 53,
    distance: 307.471,
    date: '2024-04-07',
    weather: 'Cool and Wet Risk',
    difficulty: 'Hard',
    characteristics: ['Figure-8 layout', 'Technical corners', 'Weather challenges']
  },
  china: {
    id: 'china',
    name: 'Chinese Grand Prix',
    location: 'Shanghai, China',
    circuit: 'Shanghai International Circuit',
    laps: 56,
    distance: 305.066,
    date: '2024-04-21',
    weather: 'Mild',
    difficulty: 'Medium',
    characteristics: ['Long back straight', 'Challenging first sector', 'Mixed corners']
  },
  miami: {
    id: 'miami',
    name: 'Miami Grand Prix',
    location: 'Miami, USA',
    circuit: 'Miami International Autodrome',
    laps: 57,
    distance: 308.326,
    date: '2024-05-05',
    weather: 'Hot and Humid',
    difficulty: 'Medium',
    characteristics: ['Street circuit', 'High temperatures', 'Technical layout']
  },
  monaco: {
    id: 'monaco',
    name: 'Monaco Grand Prix',
    location: 'Monte Carlo, Monaco',
    circuit: 'Circuit de Monaco',
    laps: 78,
    distance: 260.286,
    date: '2024-05-26',
    weather: 'Mediterranean',
    difficulty: 'Extreme',
    characteristics: ['Narrow streets', 'No overtaking', 'Prestige race']
  },
  canada: {
    id: 'canada',
    name: 'Canadian Grand Prix',
    location: 'Montreal, Canada',
    circuit: 'Circuit Gilles Villeneuve',
    laps: 70,
    distance: 305.270,
    date: '2024-06-09',
    weather: 'Variable',
    difficulty: 'Medium',
    characteristics: ['Semi-permanent circuit', 'Wall of Champions', 'High-speed chicanes']
  },
  spain: {
    id: 'spain',
    name: 'Spanish Grand Prix',
    location: 'Barcelona, Spain',
    circuit: 'Circuit de Barcelona-Catalunya',
    laps: 66,
    distance: 307.104,
    date: '2024-06-23',
    weather: 'Warm and Dry',
    difficulty: 'Medium',
    characteristics: ['Technical circuit', 'Aero-dependent', 'Testing venue']
  },
  austria: {
    id: 'austria',
    name: 'Austrian Grand Prix',
    location: 'Spielberg, Austria',
    circuit: 'Red Bull Ring',
    laps: 71,
    distance: 306.452,
    date: '2024-06-30',
    weather: 'Mountain Climate',
    difficulty: 'Medium',
    characteristics: ['Short lap', 'High altitude', 'Scenic mountains']
  }
};

export const GAME_MODES = {
  race_simulation: {
    id: 'race_simulation',
    name: '比赛模拟',
    description: '选择车队参与大奖赛，体验真实的比赛对话',
    icon: '🏁',
    features: [
      '与车手实时对话',
      '接收车队指令',
      '观察其他车队交流',
      '战术决策参与'
    ]
  },
  free_chat: {
    id: 'free_chat',
    name: '自由对话',
    description: '与任意F1车手进行深度交流',
    icon: '💬',
    features: [
      '深度技术讨论',
      '职业生涯分享',
      '个人经历交流',
      '赛车技巧传授'
    ]
  },
  team_strategy: {
    id: 'team_strategy',
    name: '车队策略',
    description: '作为车队成员参与策略制定',
    icon: '📊',
    features: [
      '策略分析讨论',
      '数据解读',
      '决策参与',
      '团队协作'
    ]
  }
};

export const RACE_PHASES = {
  pre_race: {
    name: '赛前准备',
    description: '车手热身、策略讨论、天气分析',
    duration: 30, // 分钟
    activities: ['暖胎圈讨论', '天气策略', '起步策略', '轮胎选择']
  },
  race_start: {
    name: '比赛开始',
    description: '起步阶段，关键的前几圈',
    duration: 15,
    activities: ['起步反应', '位置争夺', '早期超车', '轮胎温度']
  },
  mid_race: {
    name: '比赛中段',
    description: '策略执行和轮胎管理阶段',
    duration: 45,
    activities: ['进站策略', '轮胎管理', '燃油节省', '位置维持']
  },
  final_phase: {
    name: '比赛冲刺',
    description: '最后阶段的激烈争夺',
    duration: 20,
    activities: ['冲刺推进', '超车机会', '防守策略', '冲线争夺']
  }
};

// 车手AI角色配置
export const DRIVER_PERSONALITIES = {
  max_verstappen: {
    traits: ['直接', '自信', '竞争力强', '技术导向'],
    communicationStyle: '简洁明了，专注结果',
    expertise: ['轮胎管理', '雨天驾驶', '超车技巧', '心理素质'],
    catchphrases: ['Simply lovely', 'Box box', 'We need to push now']
  },
  charles_leclerc: {
    traits: ['优雅', '分析型', '团队合作', '技术精湛'],
    communicationStyle: '深思熟虑，注重细节',
    expertise: ['排位赛速度', '赛道分析', '车辆调校', '意式激情'],
    catchphrases: ['We are checking', 'Position and gap', 'Forza Ferrari']
  },
  lewis_hamilton: {
    traits: ['经验丰富', '励志', '战略思维', '适应性强'],
    communicationStyle: '鼓舞人心，经验分享',
    expertise: ['比赛策略', '压力管理', '职业经验', '团队领导'],
    catchphrases: ['Get in there', 'Still we rise', 'Blessed']
  },
  lando_norris: {
    traits: ['幽默', '年轻活力', '社交媒体达人', '电竞爱好者'],
    communicationStyle: '轻松幽默，贴近年轻人',
    expertise: ['现代F1技术', '数据分析', '社交媒体', '电竞技巧'],
    catchphrases: ['Send it', 'No brakes', 'Milk gang']
  }
  // ... 其他车手配置
};

// 比赛事件模板
export const RACE_EVENTS = {
  pit_stop: {
    type: 'strategy',
    triggers: ['轮胎磨损', '安全车', '战术需要'],
    responses: {
      driver: ['Roger that', '轮胎感觉如何？', '我们的位置怎么样？'],
      team: ['Box this lap', '准备进站', '轮胎准备好了']
    }
  },
  overtake_opportunity: {
    type: 'racing',
    triggers: ['DRS区', '刹车点', '轮胎优势'],
    responses: {
      driver: ['我看到机会了', '他的轮胎在衰退', '我要试试'],
      team: ['小心防守', '保持冷静', '等待更好机会']
    }
  },
  weather_change: {
    type: 'strategy',
    triggers: ['下雨', '赛道变干', '风向改变'],
    responses: {
      driver: ['赛道开始湿了', '抓地力在下降', '需要雨胎吗？'],
      team: ['天气雷达显示...', '其他车手在换胎', '保持当前策略']
    }
  }
};
