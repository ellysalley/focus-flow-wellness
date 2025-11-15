import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Sparkles, Trophy, Target, Clock, Brain, Droplet, Apple, Scale, AlertCircle, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  started: boolean;
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
  const [bodyMetrics, setBodyMetrics] = useState<{ bmi: number; weight_pounds: number; height_inches: number } | null | undefined>(undefined);
  const [bmiSuggestedChallenges, setBmiSuggestedChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      } else {
        await Promise.all([
          loadBodyMetrics(user.id),
          loadEarnedBadges(user.id),
          loadActiveRewards(user.id),
        ]);
      }
    };
    checkAuth();
  }, [navigate]);

  // Load challenges after bodyMetrics is loaded (or determined to be null)
  useEffect(() => {
    const loadChallengesWithBMI = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadChallenges(user.id);
      }
    };
    // Only load if we've attempted to load body metrics (to avoid double loading)
    if (bodyMetrics !== undefined) {
      loadChallengesWithBMI();
    }
  }, [bodyMetrics]);

  const loadBodyMetrics = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("body_metrics")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setBodyMetrics({
          bmi: data.bmi || 0,
          weight_pounds: data.weight_pounds,
          height_inches: data.height_inches,
        });
      } else {
        setBodyMetrics(null);
      }
    } catch (error: any) {
      console.error("Error loading body metrics:", error);
      setBodyMetrics(null);
    }
  };

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
      // Load all available challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true);

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
        started: false,
      }));

      // Get body metrics if not already loaded
      let currentBodyMetrics = bodyMetrics;
      if (!currentBodyMetrics) {
        const { data: metricsData } = await supabase
          .from("body_metrics")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        if (metricsData) {
          currentBodyMetrics = {
            bmi: metricsData.bmi || 0,
            weight_pounds: metricsData.weight_pounds,
            height_inches: metricsData.height_inches,
          };
        }
      }

      // Filter challenges based on BMI if available
      if (currentBodyMetrics && currentBodyMetrics.bmi > 0) {
        const bmi = currentBodyMetrics.bmi;
        let suggestedChallengeTitles: string[] = [];

        if (bmi < 18.5) {
          // Underweight - suggest weight gain challenges
          suggestedChallengeTitles = [
            'Strength Training',
            'Protein-Rich Meal',
            'Calorie Tracking'
          ];
        } else if (bmi >= 25) {
          // Overweight/Obese - suggest weight loss challenges
          suggestedChallengeTitles = [
            '30-Minute Cardio',
            'Portion Control',
            '10K Steps',
            'Skip Sugary Drinks',
            'Meal Planning'
          ];
        }

        // Filter and set BMI-suggested challenges
        const bmiChallenges = formattedChallenges.filter(c => 
          suggestedChallengeTitles.includes(c.title)
        );
        setBmiSuggestedChallenges(bmiChallenges);

        // Set regular challenges (exclude BMI-suggested ones, or show all if BMI is healthy)
        if (bmi >= 18.5 && bmi < 25) {
          // Healthy BMI - show regular challenges
          setChallenges(formattedChallenges.slice(0, 5));
        } else {
          // Unhealthy BMI - show regular challenges excluding BMI-suggested ones
          const regularChallenges = formattedChallenges.filter(c => 
            !suggestedChallengeTitles.includes(c.title)
          );
          setChallenges(regularChallenges.slice(0, 5));
        }
      } else {
        // No BMI data - show regular challenges
        setChallenges(formattedChallenges.slice(0, 5));
      }
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

    if (challenge?.completed || challenge?.started) return;

    setChallenges(challenges.map(c =>
      c.id === id ? { ...c, started: true } : c
    ));

    toast({
      title: "Challenge Started! 💪",
      description: `Timer started for ${challenge?.title}! It will auto-complete when time's up.`,
    });
  };

  const handleCompleteChallenge = async (id: number) => {
    const challenge = challenges.find(c => c.id === id);

    if (challenge?.completed || !challenge?.started) return;

    setChallenges(challenges.map(c =>
      c.id === id ? { ...c, completed: true, started: false } : c
    ));

    if (challenge) {
      const xpEarned = challenge.xp * xpMultiplier;
      const pointsEarned = xpEarned; // 1:1 ratio with XP

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

        {/* BMI Alert and Suggested Tasks */}
        {bodyMetrics !== undefined && bodyMetrics !== null && bodyMetrics.bmi > 0 && (
          <div className="mb-8">
            {bodyMetrics.bmi < 18.5 ? (
              <Alert className="mb-4 border-amber-500 bg-amber-50 dark:bg-amber-950">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800 dark:text-amber-200">Underweight BMI Detected</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  Your BMI is {bodyMetrics.bmi.toFixed(1)} (underweight). Consider these tasks to help you gain healthy weight:
                </AlertDescription>
              </Alert>
            ) : bodyMetrics.bmi >= 30 ? (
              <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-950">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800 dark:text-red-200">High BMI Detected</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300">
                  Your BMI is {bodyMetrics.bmi.toFixed(1)} (obese). Consider these tasks to help you lose weight:
                </AlertDescription>
              </Alert>
            ) : bodyMetrics.bmi >= 25 ? (
              <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800 dark:text-orange-200">Overweight BMI Detected</AlertTitle>
                <AlertDescription className="text-orange-700 dark:text-orange-300">
                  Your BMI is {bodyMetrics.bmi.toFixed(1)} (overweight). Consider these tasks to help you reach a healthy weight:
                </AlertDescription>
              </Alert>
            ) : null}

            {bmiSuggestedChallenges.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Scale className="h-6 w-6 text-primary" />
                  Recommended Tasks for You
                </h2>
                <div className="space-y-4">
                  {bmiSuggestedChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      {...challenge}
                      onStart={() => handleStartChallenge(challenge.id)}
                      onComplete={() => handleCompleteChallenge(challenge.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Today's Challenges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Today's Challenges
          </h2>
          {challenges.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No challenges available at the moment.
            </Card>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  {...challenge}
                  onStart={() => handleStartChallenge(challenge.id)}
                  onComplete={() => handleCompleteChallenge(challenge.id)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      <Navigation />
    </div>
  );
};

export default Dashboard;
