-- 가상 수강생 유저
INSERT OR IGNORE INTO users (id, wallet, role, nickname, is_admin, created_at) VALUES
  ('s-01', '0xstu0000000000000000000000000000000000001', 'student', '정글러지망생', 0, unixepoch()-2592000),
  ('s-02', '0xstu0000000000000000000000000000000000002', 'student', 'AimBot99', 0, unixepoch()-2160000),
  ('s-03', '0xstu0000000000000000000000000000000000003', 'student', 'SilverHope', 0, unixepoch()-1728000),
  ('s-04', '0xstu0000000000000000000000000000000000004', 'student', '골드탈출각', 0, unixepoch()-1296000),
  ('s-05', '0xstu0000000000000000000000000000000000005', 'student', '힐러연습생', 0, unixepoch()-864000),
  ('s-06', '0xstu0000000000000000000000000000000000006', 'student', 'TFT입문자', 0, unixepoch()-432000);

-- 완료된 더미 슬롯
INSERT OR IGNORE INTO slots (id, coach_id, date, start_time, end_time, is_booked) VALUES
  ('sl-r01', 'c-moba-01', '2026-05-01', '18:00', '19:00', 1),
  ('sl-r02', 'c-moba-01', '2026-05-08', '20:00', '21:00', 1),
  ('sl-r03', 'c-moba-01', '2026-05-15', '19:00', '20:00', 1),
  ('sl-r04', 'c-fps-01',  '2026-05-03', '14:00', '15:00', 1),
  ('sl-r05', 'c-fps-01',  '2026-05-10', '16:00', '17:00', 1),
  ('sl-r06', 'c-team-01', '2026-05-05', '21:00', '22:00', 1),
  ('sl-r07', 'c-team-01', '2026-05-12', '20:00', '21:00', 1),
  ('sl-r08', 'c-strat-01','2026-05-07', '15:00', '16:00', 1),
  ('sl-r09', 'c-moba-02', '2026-05-09', '18:00', '19:00', 1),
  ('sl-r10', 'c-fps-02',  '2026-05-11', '14:00', '15:00', 1),
  ('sl-r11', 'c-br-01',   '2026-05-13', '19:00', '20:30', 1),
  ('sl-r12', 'c-cas-01',  '2026-05-20', '16:00', '17:00', 1);

-- 완료된 더미 수업
INSERT OR IGNORE INTO lessons (id, coach_id, student_id, slot_id, contract_addr, state, deposit_eth, balance_eth, created_at, completed_at) VALUES
  ('ls-r01', 'c-moba-01', 's-01', 'sl-r01', '', 'COMPLETED', '0.018', '0.042', unixepoch()-2505600, unixepoch()-2505600+3600),
  ('ls-r02', 'c-moba-01', 's-02', 'sl-r02', '', 'COMPLETED', '0.018', '0.042', unixepoch()-1900800, unixepoch()-1900800+3600),
  ('ls-r03', 'c-moba-01', 's-03', 'sl-r03', '', 'COMPLETED', '0.018', '0.042', unixepoch()-1296000, unixepoch()-1296000+3600),
  ('ls-r04', 'c-fps-01',  's-02', 'sl-r04', '', 'COMPLETED', '0.012', '0.028', unixepoch()-2332800, unixepoch()-2332800+3600),
  ('ls-r05', 'c-fps-01',  's-04', 'sl-r05', '', 'COMPLETED', '0.012', '0.028', unixepoch()-1728000, unixepoch()-1728000+3600),
  ('ls-r06', 'c-team-01', 's-05', 'sl-r06', '', 'COMPLETED', '0.0135','0.0315',unixepoch()-2160000, unixepoch()-2160000+3600),
  ('ls-r07', 'c-team-01', 's-03', 'sl-r07', '', 'COMPLETED', '0.0135','0.0315',unixepoch()-1555200, unixepoch()-1555200+3600),
  ('ls-r08', 'c-strat-01','s-06', 'sl-r08', '', 'COMPLETED', '0.0105','0.0245',unixepoch()-1987200, unixepoch()-1987200+3600),
  ('ls-r09', 'c-moba-02', 's-01', 'sl-r09', '', 'COMPLETED', '0.015', '0.035', unixepoch()-1814400, unixepoch()-1814400+3600),
  ('ls-r10', 'c-fps-02',  's-04', 'sl-r10', '', 'COMPLETED', '0.015', '0.035', unixepoch()-1641600, unixepoch()-1641600+3600),
  ('ls-r11', 'c-br-01',   's-02', 'sl-r11', '', 'COMPLETED', '0.012', '0.028', unixepoch()-1468800, unixepoch()-1468800+5400),
  ('ls-r12', 'c-cas-01',  's-06', 'sl-r12', '', 'COMPLETED', '0.0075','0.0175',unixepoch()-1209600, unixepoch()-1209600+3600);

-- 리뷰
INSERT OR IGNORE INTO reviews (id, lesson_id, coach_id, student_id, score_explain, score_comm, score_time, score_curr, body, created_at) VALUES
  ('rv-01', 'ls-r01', 'c-moba-01', 's-01', 5, 5, 5, 5,
   '정글 동선이 확실히 잡혔어요. 갱킹 타이밍이 왜 중요한지 이론부터 실전까지 단계적으로 가르쳐줘서 이해하기 쉬웠습니다. 수업 후 랭크 올랐어요!', unixepoch()-2505600+7200),
  ('rv-02', 'ls-r02', 'c-moba-01', 's-02', 5, 4, 5, 5,
   '시야 장악과 오브젝트 우선순위에 대해 많은 걸 배웠습니다. 설명이 논리적이고 명확해서 금방 흡수됐어요. 다음 수업도 예약할 것 같아요.', unixepoch()-1900800+7200),
  ('rv-03', 'ls-r03', 'c-moba-01', 's-03', 5, 5, 4, 5,
   '한타 진입 각을 완전히 새로운 시각으로 이해하게 됐습니다. 챌린저 시점에서 보는 정글이 이렇게 다르다는 걸 처음 알았어요. 최고의 코치!', unixepoch()-1296000+7200),
  ('rv-04', 'ls-r04', 'c-fps-01',  's-02', 5, 5, 5, 4,
   '크로스헤어 배치만 고쳤는데 K/D가 바로 올랐어요. 실전 예시를 많이 들어줘서 이해가 쉬웠고, 워밍업 루틴도 새로 잡았습니다.', unixepoch()-2332800+7200),
  ('rv-05', 'ls-r05', 'c-fps-01',  's-04', 4, 5, 5, 4,
   '피킹 각도와 무빙에 대한 설명이 정말 좋았어요. 에임 트레이너에서 연습할 방법까지 알려줘서 혼자서도 연습할 수 있게 됐습니다.', unixepoch()-1728000+7200),
  ('rv-06', 'ls-r06', 'c-team-01', 's-05', 5, 5, 5, 5,
   '서포터로 어떻게 게임을 주도하는지 완전히 달라졌어요. 궁 타이밍 하나만 바꿨는데 팀 전투 승률이 크게 올랐습니다. 진심으로 추천!', unixepoch()-2160000+7200),
  ('rv-07', 'ls-r07', 'c-team-01', 's-03', 5, 4, 5, 5,
   '힐러 포지셔닝에 대한 생각이 완전히 바뀌었어요. 살아남으면서도 팀을 지원하는 라인을 잡는 법을 배웠습니다. 수업이 알차고 재미있었어요.', unixepoch()-1555200+7200),
  ('rv-08', 'ls-r08', 'c-strat-01','s-06', 5, 5, 4, 5,
   'TFT 경제 운영이 이렇게 중요한 줄 몰랐어요. 골드 이자 타이밍과 레벨업 포인트를 체계적으로 배우니 순방 횟수가 늘었습니다.', unixepoch()-1987200+7200),
  ('rv-09', 'ls-r09', 'c-moba-02', 's-01', 5, 5, 5, 4,
   '정글 시야 싸움이 얼마나 중요한지 실감했습니다. 와드 배치 하나하나에 이유가 있다는 걸 배우고 나서 맵 리딩이 달라졌어요.', unixepoch()-1814400+7200),
  ('rv-10', 'ls-r10', 'c-fps-02',  's-04', 4, 4, 5, 5,
   'AWP 포지션 잡는 법이 많이 부족했는데 맵별 핵심 각을 다 짚어줘서 좋았어요. 데모 분석도 해줘서 제 플레이 습관을 객관적으로 볼 수 있었습니다.', unixepoch()-1641600+7200),
  ('rv-11', 'ls-r11', 'c-br-01',   's-02', 5, 4, 5, 4,
   '자기장 운영이 이렇게 체계적으로 정리될 줄 몰랐어요. 로테이션 판단 기준이 생기니 생존률이 크게 올랐습니다. 실전 감각을 키우기 좋은 수업이었어요.', unixepoch()-1468800+7200),
  ('rv-12', 'ls-r12', 'c-cas-01',  's-06', 5, 5, 5, 5,
   '브롤스타즈 전략이 이렇게 깊은 줄 몰랐어요. 맵별 브롤러 선택 이유부터 팀 시너지까지 꼼꼼하게 알려줘서 파워 리그에서 바로 써먹었습니다!', unixepoch()-1209600+7200);

-- 코치 avg_rating / review_count 업데이트
UPDATE coaches SET avg_rating = 4.93, review_count = 3 WHERE id = 'c-moba-01';
UPDATE coaches SET avg_rating = 4.80, review_count = 2 WHERE id = 'c-fps-01';
UPDATE coaches SET avg_rating = 4.95, review_count = 2 WHERE id = 'c-team-01';
UPDATE coaches SET avg_rating = 4.80, review_count = 1 WHERE id = 'c-strat-01';
UPDATE coaches SET avg_rating = 4.80, review_count = 1 WHERE id = 'c-moba-02';
UPDATE coaches SET avg_rating = 4.50, review_count = 1 WHERE id = 'c-fps-02';
UPDATE coaches SET avg_rating = 4.75, review_count = 1 WHERE id = 'c-br-01';
UPDATE coaches SET avg_rating = 5.00, review_count = 1 WHERE id = 'c-cas-01';
