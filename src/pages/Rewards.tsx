import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Star, Gift, Zap, Crown, Target, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useTheme } from "@/components/ThemeProvider";

interface BadgeType {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  earned: boolean;
  rarity: string;
}

interface RewardType {
  id: number;
  title: string;
  cost: number;
  description: string;
  reward_type: string;
  reward_data: any;
}

const iconMap: Record<string, LucideIcon> = {
  Trophy,
  Star,
  Zap,
  Crown,
  Target,
};

const Rewards = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { progress, loading, deductPoints } = useUserProgress();
  const [redeemedRewards, setRedeemedRewards] = useState<number[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [rewards, setRewards] = useState<RewardType[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      } else {
        await Promise.all([
          fetchRedeemedRewards(user.id),
          loadBadges(user.id),
          loadRewards(),
        ]);
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchRedeemedRewards = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("redeemed_rewards")
        .select("reward_id")
        .eq("user_id", userId);

      if (error) throw error;
      setRedeemedRewards(data.map(r => r.reward_id));
    } catch (error: any) {
      console.error("Error fetching redeemed rewards:", error);
    }
  };

  const loadBadges = async (userId: string) => {
    try {
      const { data: allBadges, error: badgesError } = await supabase
        .from("badges")
        .select("*");

      if (badgesError) throw badgesError;

      const { data: earnedBadges, error: earnedError } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", userId);

      if (earnedError) throw earnedError;

      const earnedIds = new Set(earnedBadges?.map(b => b.badge_id) || []);

      const formattedBadges: BadgeType[] = (allBadges || []).map((badge) => ({
        id: badge.id,
        icon: iconMap[badge.icon_name] || Trophy,
        title: badge.title,
        description: badge.description,
        earned: earnedIds.has(badge.id),
        rarity: badge.rarity,
      }));

      setBadges(formattedBadges);
    } catch (error: any) {
      console.error("Error loading badges:", error);
    }
  };

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from("rewards_catalog")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      setRewards(data || []);
    } catch (error: any) {
      console.error("Error loading rewards:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleRedeem = async (id: number, title: string, cost: number, rewardType: string) => {
    if (!progress) return;

    if (progress.total_points < cost) {
      toast({
        title: "Not Enough Points!",
        description: `You need ${cost - progress.total_points} more points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }

    if (redeemedRewards.includes(id)) {
      toast({
        title: "Already Redeemed!",
        description: "You've already unlocked this reward.",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const reward = rewards.find(r => r.id === id);

      await supabase.from("redeemed_rewards").insert({
        user_id: user.id,
        reward_id: id,
        reward_title: title,
        reward_cost: cost,
      });

      // Activate the reward so it has actual effects
      await supabase.from("active_rewards").insert({
        user_id: user.id,
        reward_type: rewardType,
        reward_data: reward?.reward_data,
      });

      await deductPoints(cost);
      setRedeemedRewards([...redeemedRewards, id]);
      
      // Show what they actually got
      let rewardDescription = "";
      switch (rewardType) {
        case "custom_theme":
          // Toggle between light and dark mode
          const newTheme = theme === "dark" ? "light" : "dark";
          setTheme(newTheme);
          rewardDescription = `Theme switched to ${newTheme} mode! You can toggle anytime by redeeming again.`;
          break;
        case "bonus_challenges":
          rewardDescription = "Bonus challenges unlocked! Check your dashboard for new opportunities.";
          break;
        case "exclusive_content":
          rewardDescription = "Exclusive content unlocked! New features are now available.";
          break;
        case "xp_boost":
          rewardDescription = "XP Boost activated! You now earn 2x XP on all challenges!";
          break;
        default:
          rewardDescription = `You've unlocked: ${title}`;
      }
      
      toast({
        title: "Reward Redeemed! 🎁",
        description: rewardDescription,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || !progress || loadingData) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Your Rewards
          </h1>
          <p className="text-muted-foreground">Track your progress and redeem exciting rewards</p>
        </div>

        {/* Points Overview */}
        <Card className="p-6 mb-8 shadow-md bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90 mb-1">Available Points</p>
              <p className="text-5xl font-bold">{progress.total_points.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90 mb-1">Current Streak</p>
              <p className="text-3xl font-bold flex items-center gap-2">
                {progress.current_streak} 🔥
              </p>
            </div>
          </div>
        </Card>

        {/* Achievement Badges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Achievement Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <Card
                  key={idx}
                  className={`p-5 transition-all ${
                    badge.earned
                      ? "border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950"
                      : "opacity-60 border-border"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        badge.earned ? "bg-amber-500" : "bg-muted"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${badge.earned ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{badge.title}</h3>
                        <Badge variant={badge.earned ? "default" : "secondary"} className="text-xs">
                          {badge.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Redeemable Rewards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Redeemable Rewards
          </h2>
          <div className="space-y-4">
            {rewards.map((reward) => {
              const isRedeemed = redeemedRewards.includes(reward.id);
              const canAfford = progress.total_points >= reward.cost;
              
              return (
                <Card
                  key={reward.id}
                  className={`p-6 shadow-sm transition-all ${
                    isRedeemed
                      ? "bg-success-light border-2 border-accent"
                      : "hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{reward.title}</h3>
                        {isRedeemed && (
                          <Badge variant="default" className="bg-accent text-accent-foreground">
                            Redeemed ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                      <Badge
                        variant="secondary"
                        className={`${
                          canAfford && !isRedeemed
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {reward.cost} points
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleRedeem(reward.id, reward.title, reward.cost, reward.reward_type)}
                      disabled={reward.reward_type !== 'custom_theme' && isRedeemed}
                      className={`${
                        isRedeemed && reward.reward_type !== 'custom_theme'
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : canAfford
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-muted text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {reward.reward_type === 'custom_theme' ? 'Toggle Theme' : isRedeemed ? "Redeemed" : "Redeem"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Rewards;
