import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
  achievement: Achievement;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      const [allRes, userRes] = await Promise.all([
        supabase.from('achievements').select('*').order('requirement_value'),
        supabase.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', user.id)
      ]);
      
      if (allRes.data) setAchievements(allRes.data);
      if (userRes.data) setUserAchievements(userRes.data as any);
      setLoading(false);
    };
    
    fetchData();
  }, [user]);

  const checkAndAwardAchievements = async (profile: any) => {
    if (!user || !profile) return;
    
    const earnedIds = userAchievements.map(ua => ua.achievement_id);
    const newAchievements: Achievement[] = [];
    
    for (const achievement of achievements) {
      if (earnedIds.includes(achievement.id)) continue;
      
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
      }
      
      if (earned) {
        const { error } = await supabase.from('user_achievements').insert({
          user_id: user.id,
          achievement_id: achievement.id
        });
        
        if (!error) {
          newAchievements.push(achievement);
          toast({
            title: "🏆 Новое достижение!",
            description: `${achievement.name}: ${achievement.description}`,
          });
        }
      }
    }
    
    return newAchievements;
  };

  return { achievements, userAchievements, loading, checkAndAwardAchievements };
};
