-- ── Users (coaches) ──
INSERT OR IGNORE INTO users (id, wallet, role, nickname, is_admin, created_at) VALUES
  ('c-fps-01', '0xfps0000000000000000000000000000000000001', 'coach', 'AimGod_K',    0, unixepoch()),
  ('c-fps-02', '0xfps0000000000000000000000000000000000002', 'coach', 'HeadshotPro', 0, unixepoch()),
  ('c-moba-01','0xmoba000000000000000000000000000000000001', 'coach', 'ChallengerJ', 0, unixepoch()),
  ('c-moba-02','0xmoba000000000000000000000000000000000002', 'coach', 'JungleMaster',0, unixepoch()),
  ('c-strat-01','0xstrat00000000000000000000000000000000001','coach', 'MetaKing',    0, unixepoch()),
  ('c-strat-02','0xstrat00000000000000000000000000000000002','coach', 'EcoQueen',    0, unixepoch()),
  ('c-team-01', '0xteam000000000000000000000000000000000001','coach', 'SupportAce',  0, unixepoch()),
  ('c-team-02', '0xteam000000000000000000000000000000000002','coach', 'TankWall',    0, unixepoch()),
  ('c-br-01',   '0xbr00000000000000000000000000000000000001','coach', 'CircleKing',  0, unixepoch()),
  ('c-br-02',   '0xbr00000000000000000000000000000000000002','coach', 'LootMaster',  0, unixepoch()),
  ('c-cas-01',  '0xcas0000000000000000000000000000000000001','coach', 'BrawlQueen',  0, unixepoch()),
  ('c-cas-02',  '0xcas0000000000000000000000000000000000002','coach', 'StarCoach',   0, unixepoch());

-- ── Coaches ──
INSERT OR IGNORE INTO coaches (id, nickname, game_category, tier, tier_self, price_eth, session_min, intro, is_published, avg_rating, review_count, created_at) VALUES
  ('c-fps-01',  'AimGod_K',    'fps',    '다이아몬드 3', 0, '0.04', 60, '발로란트 전문 코치. 에임 루틴, 크로스헤어 세팅, 피킹 각 분석으로 실력을 끌어올립니다.',    1, 4.8, 42, unixepoch()),
  ('c-fps-02',  'HeadshotPro', 'fps',    '글로벌 엘리트',0, '0.05', 60, 'CS2 AWP 전문. 포지셔닝, 유틸 사용, 에코 라운드 운영까지 체계적으로 가르칩니다.',           1, 4.7, 31, unixepoch()),
  ('c-moba-01', 'ChallengerJ', 'moba',   '챌린저',       0, '0.06', 60, 'LoL 챌린저 미드 라이너. 로밍 타이밍, CS 관리, 패치 메타 분석을 강점으로 합니다.',          1, 4.9, 87, unixepoch()),
  ('c-moba-02', 'JungleMaster','moba',   '그랜드마스터', 0, '0.05', 60, '정글 전문 코치. 오브젝트 우선순위, 갱킹 동선, 시야 장악을 집중적으로 가르칩니다.',          1, 4.8, 63, unixepoch()),
  ('c-strat-01','MetaKing',    'strat',  '마스터',       0, '0.035',60, 'TFT 마스터. 메타 덱 파악, 골드 관리, 오그먼트 선택 노하우를 전달합니다.',                  1, 4.7, 29, unixepoch()),
  ('c-strat-02','EcoQueen',    'strat',  '다이아몬드 1', 0, '0.04', 60, '스타크래프트2 다이아. 빌드오더, 타이밍 어택, 멀티태스킹 훈련법을 코칭합니다.',              1, 4.6, 18, unixepoch()),
  ('c-team-01', 'SupportAce',  'team',   '그랜드마스터', 0, '0.045',60, '오버워치2 서포터 GM. 포지셔닝, 궁 타이밍, 팀 콜 방법론을 전문적으로 지도합니다.',           1, 4.9, 54, unixepoch()),
  ('c-team-02', 'TankWall',    'team',   '마스터',       0, '0.04', 60, '탱크 메인 마스터. 스페이스 메이킹, 궁 연계, 오프앵글 포지셔닝을 집중 코칭합니다.',          1, 4.7, 33, unixepoch()),
  ('c-br-01',   'CircleKing',  'br',     '다이아몬드',   0, '0.04', 90, 'PUBG 자기장 운영 전문. 로테이션 판단, 교전 회피, 최종 서클 운영을 가르칩니다.',              1, 4.6, 22, unixepoch()),
  ('c-br-02',   'LootMaster',  'br',     '플래티넘',     0, '0.03', 60, '초반 파밍 루트와 장비 우선순위를 체계적으로 분석해드립니다.',                                1, 4.5, 15, unixepoch()),
  ('c-cas-01',  'BrawlQueen',  'casual', '파워 리그 다이아', 0, '0.025',60,'브롤스타즈 전략 코치. 브롤러 선택, 맵 이해, 팀전 운영을 함께 분석합니다.',              1, 4.8, 38, unixepoch()),
  ('c-cas-02',  'StarCoach',   'casual', '파워 리그 골드',0, '0.02', 45, '입문자·중급자 전용. 기초부터 차근차근 실력을 올려드립니다.',                               1, 4.6, 24, unixepoch());

-- ── Lectures ──
INSERT OR IGNORE INTO lectures (id, coach_id, title, description, game, game_category, price_eth, duration, level, is_published, created_at) VALUES
  ('l-fps-01', 'c-fps-01', 'Valorant 에임 집중 코칭',       '크로스헤어 배치, 무빙샷, 워밍업 루틴 완전 정복', 'Valorant',          'fps',    '0.04', 60, '중급', 1, unixepoch()),
  ('l-fps-02', 'c-fps-01', 'Valorant 에이전트별 포지셔닝',  '각 에이전트 특성에 맞는 포지션과 각 잡기 실습',  'Valorant',          'fps',    '0.04', 60, '초급', 1, unixepoch()),
  ('l-fps-03', 'c-fps-02', 'CS2 AWP 완전 정복',             '정적 AWP 각, 무빙샷, 맵별 포지션 분석',          'CS2',               'fps',    '0.05', 60, '중급', 1, unixepoch()),
  ('l-fps-04', 'c-fps-02', 'CS2 유틸 & 전략 코칭',          '스모크, 플래시, 몰로토프 정석 사용법과 팀 전략',  'CS2',               'fps',    '0.05', 60, '고급', 1, unixepoch()),
  ('l-moba-01','c-moba-01','LoL 미드 라인전 완전 정복',      'CS 관리, 솔로킬 타이밍, 로밍 판단력 집중 훈련',  'League of Legends', 'moba',   '0.06', 60, '중급', 1, unixepoch()),
  ('l-moba-02','c-moba-01','LoL 후반 한타 & 운영 코칭',     '오브젝트 우선순위, 한타 진입 각, 포지션 잡기',   'League of Legends', 'moba',   '0.06', 60, '고급', 1, unixepoch()),
  ('l-moba-03','c-moba-02','LoL 정글 동선 마스터',           '초반 동선 설계, 갱킹 타이밍, 카운터 정글 전략',  'League of Legends', 'moba',   '0.05', 60, '중급', 1, unixepoch()),
  ('l-moba-04','c-moba-02','LoL 정글 시야 장악 전략',        '와드 배치, 제어 와드 활용, 시야 싸움 이기기',    'League of Legends', 'moba',   '0.05', 60, '고급', 1, unixepoch()),
  ('l-strat-01','c-strat-01','TFT 메타 덱 & 경제 완전 정복','현 메타 티어 덱, 골드 관리, 레벨업 타이밍 분석', 'TFT',               'strat',  '0.035',60, '초급', 1, unixepoch()),
  ('l-strat-02','c-strat-01','TFT 포지셔닝 & 아이템 배분',  '유닛 배치 전략, 아이템 우선순위, 증강체 선택',   'TFT',               'strat',  '0.035',60, '중급', 1, unixepoch()),
  ('l-strat-03','c-strat-02','SC2 테란 빌드오더 집중 코칭', '바이오닉, 메카닉 빌드 완전 분석 및 실전 적용',   'StarCraft 2',       'strat',  '0.04', 60, '중급', 1, unixepoch()),
  ('l-strat-04','c-strat-02','SC2 멀티태스킹 & 컨트롤',     '유닛 컨트롤, 멀티 관리, 타이밍 어택 훈련',       'StarCraft 2',       'strat',  '0.04', 60, '고급', 1, unixepoch()),
  ('l-team-01', 'c-team-01', 'OW2 서포터 포지셔닝 심화',    '생존 라인, 힐 우선순위, 궁극기 타이밍 완전 정복', 'Overwatch 2',      'team',   '0.045',60, '중급', 1, unixepoch()),
  ('l-team-02', 'c-team-01', 'OW2 루시우 & 바티스트 전문',  '속도 부스트 타이밍, 앰프 매트릭스 포지션 실습',  'Overwatch 2',       'team',   '0.045',60, '고급', 1, unixepoch()),
  ('l-team-03', 'c-team-02', 'OW2 탱커 스페이스 메이킹',    '라인하르트, 오리사로 공간 창출하는 법 집중 코칭', 'Overwatch 2',      'team',   '0.04', 60, '중급', 1, unixepoch()),
  ('l-team-04', 'c-team-02', 'OW2 탱커 궁 연계 & 콜',       '팀과 궁 타이밍 맞추는 법, 오프앵글 활용법',      'Overwatch 2',       'team',   '0.04', 60, '고급', 1, unixepoch()),
  ('l-br-01',   'c-br-01',   'PUBG 자기장 운영 완전 정복',  '로테이션 타이밍, 엣지 포지션, 최종권 서클 전략', 'PUBG',              'br',     '0.04', 90, '중급', 1, unixepoch()),
  ('l-br-02',   'c-br-01',   'PUBG 교전 판단 & IGL 코칭',   '교전 시작 타이밍, 후퇴 판단, 팀 콜 훈련',        'PUBG',              'br',     '0.04', 90, '고급', 1, unixepoch()),
  ('l-br-03',   'c-br-02',   'PUBG 초반 파밍 & 드랍 루트',  '안전 드랍 존, 파밍 효율, 초반 교전 회피 전략',   'PUBG',              'br',     '0.03', 60, '초급', 1, unixepoch()),
  ('l-br-04',   'c-br-02',   'PUBG 총기 & 반동 컨트롤',     '주요 총기별 반동 패턴 분석 및 연습법 공유',       'PUBG',              'br',     '0.03', 60, '초급', 1, unixepoch()),
  ('l-cas-01',  'c-cas-01',  '브롤스타즈 브롤러 선택 전략', '맵·모드별 최적 브롤러 선택과 팀 시너지 분석',    'Brawl Stars',       'casual', '0.025',60, '초급', 1, unixepoch()),
  ('l-cas-02',  'c-cas-01',  '브롤스타즈 파워 리그 입문',   '파워 리그 승격 전략, 메타 브롤러 운용법',        'Brawl Stars',       'casual', '0.025',60, '중급', 1, unixepoch()),
  ('l-cas-03',  'c-cas-02',  '브롤스타즈 기초 완전 정복',   '조이스틱 조작, 슈퍼 스킬 활용, 맵 이해하기',    'Brawl Stars',       'casual', '0.02', 45, '입문', 1, unixepoch()),
  ('l-cas-04',  'c-cas-02',  '브롤스타즈 팀전 운영 코칭',   '3인 팀전 포지션, 서포트 역할, 공격 타이밍',      'Brawl Stars',       'casual', '0.02', 45, '초급', 1, unixepoch());
