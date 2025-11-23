import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Mail, Calendar, Award, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserProgress } from "@/hooks/useUserProgress";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { progress, loading } = useUserProgress();
  const [userEmail, setUserEmail] = useState("");
  const [joinedDate, setJoinedDate] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserEmail(user.email || "");
      setJoinedDate(new Date(user.created_at).toLocaleDateString());
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logged Out",
        description: "You've been successfully logged out.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || !progress) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const currentLevel = Math.floor(progress.total_xp / 1000) + 1;

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Profile
          </h1>
          <p className="text-muted-foreground">Manage your account and view your stats</p>
        </div>

        {/* User Info Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-4 rounded-full bg-primary/10">
              <User className="h-12 w-12 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">Welcome!</h2>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{userEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Joined {joinedDate}</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Level {currentLevel}
            </Badge>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-orange-500/10">
                <Award className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold text-foreground">{progress.total_xp.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-bold text-foreground">{progress.total_points.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-amber-500/10">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">{progress.current_streak} days</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Account Actions</h3>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default Profile;
