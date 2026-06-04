export type Role = 'coach' | 'student' | 'both' | 'admin';

export type GameCategory = 'FPS' | 'MOBA' | '전략' | '팀파이트' | '배틀로얄' | '캐주얼' | '기타';

export type LessonState =
  | 'PENDING' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED'
  | 'REJECTED' | 'CANCELLED' | 'DISPUTED' | 'RESOLVED';

export interface User {
  id: string;
  phone: string;
  discord_id?: string;
  role: Role;
  wallet?: string;
  is_admin?: number;
  created_at: number;
}

export interface Lecture {
  id: string;
  coach_id: string;
  title: string;
  description?: string;
  game: string;
  game_category: string;
  price_eth: string;
  duration: number;
  level: string;
  is_published: number;
  created_at: number;
  coach_nickname?: string;
  coach_tier?: string;
  coach_avg_rating?: number;
}

export interface Coach {
  id: string;
  nickname: string;
  game_category: GameCategory;
  tier: string;
  tier_self: boolean;
  price_eth: string;
  session_min: number;
  intro?: string;
  curriculum?: CurriculumItem[];
  style?: string;
  thumbnail?: string;
  is_published: boolean;
  avg_rating: number;
  review_count: number;
  created_at: number;
}

export interface CurriculumItem {
  title: string;
  duration: number; // minutes
}

export interface Slot {
  id: string;
  coach_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export interface Lesson {
  id: string;
  coach_id: string;
  student_id: string;
  slot_id: string;
  contract_addr: string;
  tx_hash?: string;
  state: LessonState;
  deposit_eth: string;
  balance_eth: string;
  created_at: number;
  accepted_at?: number;
  completed_at?: number;
}

export interface Review {
  id: string;
  lesson_id: string;
  coach_id: string;
  student_id: string;
  score_explain: number;
  score_comm: number;
  score_time: number;
  score_curr: number;
  body?: string;
  created_at: number;
}

export interface Message {
  id: string;
  lesson_id: string;
  sender_id: string;
  body: string;
  created_at: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload?: Record<string, unknown>;
  is_read: boolean;
  created_at: number;
}
