import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
}

interface UserProfile {
  total_points: number;
  tests_completed: number;
  streak_days: number;
}

export const checkAndAwardAchievements = async (
  userId: string,
  profile: UserProfile,
  options?: { perfectScore?: boolean; dailyCompleted?: number }
): Promise<Achievement[]> => {
  // Fetch all achievements
  const { data: achievements, error: achError } = await supabase
    .from('achievements')
    .select('*');

  if (achError || !achievements) return [];

  // Fetch user's earned achievements
  const { data: userAchievements, error: uaError } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  if (uaError) return [];

  const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
  const newlyEarned: Achievement[] = [];

  for (const achievement of achievements) {
    if (earnedIds.has(achievement.id)) continue;

    let earned = false;

    switch (achievement.requirement_type) {
      case 'tests_completed':
        earned = profile.tests_completed >= achievement.requirement_value;
        break;
      case 'total_points':
        earned = profile.total_points >= achievement.requirement_value;
        break;
      case 'streak_days':
        earned = profile.streak_days >= achievement.requirement_value;
        break;
      case 'perfect_score':
        earned = options?.perfectScore === true && achievement.requirement_value === 1;
        break;
      case 'daily_completed':
        earned = (options?.dailyCompleted || 0) >= achievement.requirement_value;
        break;
    }

    if (earned) {
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({ user_id: userId, achievement_id: achievement.id });

      if (!insertError) {
        newlyEarned.push(achievement);

        // Create notification for the achievement
        await supabase.from('notifications').insert({
          user_id: userId,
          title: `🏆 ${achievement.name}`,
          message: achievement.description,
          type: 'achievement',
          link: '/achievements',
        });
      }
    }
  }

  return newlyEarned;
};

export const getDailyCompletedCount = async (userId: string): Promise<number> => {
  const { count } = await supabase
    .from('daily_challenge_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  return count || 0;
};
