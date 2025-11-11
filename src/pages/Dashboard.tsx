import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Sparkles, Trophy, Target, Clock, Brain, Droplet, Apple, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import ChallengeCard from "@/components/ChallengeCard";
import AchievementBadge from "@/components/AchievementBadge";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserProgress } from "@/hooks/useUserProgress";

interface Challenge {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  duration: string;
  xp: number;
  completed: boolean;
}

interface Badge {
  id: number;
  icon: LucideIcon;
  title: string;
}

const iconMap: Record<string, LucideIcon> = {
  Target,
  Clock,
  Brain,
  Droplet,
  Apple,
  Flame,
  Sparkles,
  Trophy,
};

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { progress, loading, addXP, addPoints } = useUserProgress();
  const [todayXp, setTodayXp] = useState(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeRewards, setActiveRewards] = useState<any[]>([]);
  const [xpMultiplier, setXpMultiplier] = useState(1);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      } else {
        await Promise.all([
          loadChallenges(user.id),
          loadEarnedBadges(user.id),
          loadActiveRewards(user.id),
        ]);
      }
    };
    checkAuth();
  }, [navigate]);

  const loadActiveRewards = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("active_rewards")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      if (data) {
        setActiveRewards(data);
        // Check for XP boost
        const xpBoost = data.find(r => r.reward_type === 'xp_boost');
        if (xpBoost) {
          setXpMultiplier(2);
        }
      }
    } catch (error: any) {
      console.error("Error loading active rewards:", error);
    }
  };

  const loadChallenges = async (userId: string) => {
    try {
      // Load available challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .limit(5);

      if (challengesError) throw challengesError;

      // Load completed challenges for today
      const today = new Date().toISOString().split('T')[0];
      const { data: completedData, error: completedError } = await supabase
        .from("completed_challenges")
        .select("challenge_id")
        .eq("user_id", userId)
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`);

      if (completedError) throw completedError;

      const completedIds = new Set(completedData?.map(c => c.challenge_id) || []);

      const formattedChallenges: Challenge[] = (challengesData || []).map((c) => ({
        id: c.id,
        icon: iconMap[c.icon_name] || Target,
        title: c.title,
        description: c.description,
        duration: c.duration,
        xp: c.xp,
        completed: completedIds.has(c.id),
      }));

      setChallenges(formattedChallenges);
    } catch (error: any) {
      console.error("Error loading challenges:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadEarnedBadges = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_badges")
        .select(`
          badge_id,
          badges (
            id,
            title,
            icon_name
          )
        `)
        .eq("user_id", userId)
        .order("earned_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      const formattedBadges: Badge[] = (data || [])
        .filter(item => item.badges)
        .map((item: any) => ({
          id: item.badges.id,
          icon: iconMap[item.badges.icon_name] || Trophy,
          title: item.badges.title,
        }));

      setEarnedBadges(formattedBadges);
    } catch (error: any) {
      console.error("Error loading badges:", error);
    }
  };

  const handleStartChallenge = async (id: number) => {
    const challenge = challenges.find(c => c.id === id);
    
    if (challenge?.completed) return;
    
    setChallenges(challenges.map(c => 
      c.id === id ? { ...c, completed: true } : c
    ));
    
    if (challenge) {
      const xpEarned = challenge.xp * xpMultiplier;
      const pointsEarned = xpEarned * 10;
      
      setTodayXp(prev => prev + xpEarned);
      
      const leveledUp = await addXP(xpEarned);
      
      // Award points along with XP
      await addPoints(pointsEarned);
      
      // Save to database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("completed_challenges").insert({
            user_id: user.id,
            challenge_id: challenge.id,
            xp_earned: challenge.xp,
          });

          // Check for new badge achievements
          await checkBadgeAchievements(user.id);
        }
      } catch (error) {
        console.error("Error saving challenge:", error);
      }
      
      let toastDescription = `+${xpEarned} XP and +${pointsEarned} points earned!`;
      if (xpMultiplier > 1) {
        toastDescription += ` (${xpMultiplier}x XP Boost active!)`;
      }

      toast({
        title: "Challenge Completed! 🎉",
        description: toastDescription,
      });
      
      if (leveledUp) {
        setTimeout(() => {
          toast({
            title: "Level Up! 🎊",
            description: "You've reached a new level!",
          });
        }, 500);
      }
    }
  };

  const checkBadgeAchievements = async (userId: string) => {
    if (!progress) return;

    try {
      // Get all badges
      const { data: allBadges } = await supabase
        .from("badges")
        .select("*");

      if (!allBadges) return;

      // Get user's earned badges
      const { data: earnedBadgesData } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", userId);

      const earnedBadgeIds = new Set(earnedBadgesData?.map(b => b.badge_id) || []);

      // Check each badge requirement
      for (const badge of allBadges) {
        if (earnedBadgeIds.has(badge.id)) continue;

        let earned = false;
        
        if (badge.requirement_type === "challenges_completed") {
          const { count } = await supabase
            .from("completed_challenges")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);
          
          earned = (count || 0) >= badge.requirement_value;
        } else if (badge.requirement_type === "streak_days") {
          earned = progress.current_streak >= badge.requirement_value;
        } else if (badge.requirement_type === "level_reached") {
          const level = Math.floor(progress.total_xp / 1000) + 1;
          earned = level >= badge.requirement_value;
        }

        if (earned) {
          await supabase.from("user_badges").insert({
            user_id: userId,
            badge_id: badge.id,
          });

          toast({
            title: "New Badge Earned! 🏆",
            description: `You earned: ${badge.title}`,
          });

          // Reload badges
          await loadEarnedBadges(userId);
        }
      }
    } catch (error) {
      console.error("Error checking badges:", error);
    }
  };

  if (loading || !progress || loadingData) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const currentLevel = Math.floor(progress.total_xp / 1000) + 1;
  const levelProgress = progress.total_xp % 1000;

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Welcome Back!
            </h1>
            <p className="text-muted-foreground">Keep building your healthy habits</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2 bg-secondary text-secondary-foreground">
            <Sparkles className="h-4 w-4 mr-2" />
            Level {currentLevel}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Flame} value={`${progress.current_streak} days`} label="Daily Streak" iconColor="text-orange-500" />
          <StatCard icon={Sparkles} value={todayXp.toString()} label="Today's XP" iconColor="text-accent" />
          <StatCard icon={Trophy} value={earnedBadges.length.toString()} label="Achievements" iconColor="text-amber-500" />
        </div>

        {/* Progress Section */}
        <Card className="p-6 mb-8 shadow-sm">
          <ProgressBar current={levelProgress} max={1000} label={`Level ${currentLevel} Progress`} />
        </Card>

        {/* Today's Challenges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Today's Challenges
          </h2>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                {...challenge}
                onStart={() => handleStartChallenge(challenge.id)}
              />
            ))}
          </div>
        </div>

      </div>

      <Navigation />
    </div>
  );
};

export default Dashboard;
