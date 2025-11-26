import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, ArrowLeft, Save, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ScreenTime = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [minutes, setMinutes] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingScreenTime, setExistingScreenTime] = useState<any>(null);

  useEffect(() => {
    const loadExistingScreenTime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from("screen_time")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          setExistingScreenTime(data);
          setMinutes(data.minutes.toString());
        }
      } catch (error: any) {
        console.error("Error loading screen time:", error);
      }
    };

    loadExistingScreenTime();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!minutes) {
      toast({
        title: "Missing Information",
        description: "Please enter your screen time in minutes.",
        variant: "destructive",
      });
      return;
    }

    const minutesNum = parseInt(minutes, 10);

    if (isNaN(minutesNum) || minutesNum < 0 || minutesNum > 1440) {
      toast({
        title: "Invalid Screen Time",
        description: "Please enter a valid number between 0 and 1440 minutes (24 hours).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      if (existingScreenTime) {
        const { error } = await supabase
          .from("screen_time")
          .update({
            minutes: minutesNum,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingScreenTime.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("screen_time")
          .insert({
            user_id: user.id,
            minutes: minutesNum,
            date: today,
          });

        if (error) throw error;
      }

      const hours = Math.floor(minutesNum / 60);
      const remainingMinutes = minutesNum % 60;
      const timeString = hours > 0 
        ? `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
        : `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;

      toast({
        title: "Screen Time Saved!",
        description: `Your screen time for today: ${timeString}`,
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save screen time.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Enter Screen Time
          </h1>
          <p className="text-muted-foreground">
            Track your daily screen time to maintain healthy digital habits
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="minutes" className="text-base font-semibold flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Screen Time (minutes)
              </Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="1440"
                placeholder="Enter your screen time in minutes"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Enter the total number of minutes you spent on screens today (0-1440 minutes)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : existingScreenTime ? "Update Screen Time" : "Save Screen Time"}
            </Button>
          </form>
        </Card>

        <Card className="p-6 mt-6 bg-muted/50">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold mb-2">About Screen Time Tracking</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Tracking your screen time helps you become more aware of your digital habits. 
                Research suggests limiting screen time to 2-3 hours per day for optimal health and productivity.
              </p>
              <p className="text-sm text-muted-foreground">
                If you exceed 3 hours, we'll suggest alternative activities to help you reduce screen time and improve your well-being.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default ScreenTime;


