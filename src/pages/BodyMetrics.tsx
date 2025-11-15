import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Ruler, ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BodyMetrics = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingMetrics, setExistingMetrics] = useState<any>(null);

  useEffect(() => {
    const loadExistingMetrics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("body_metrics")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          setExistingMetrics(data);
          setWeight(data.weight_pounds.toString());
          setHeight(data.height_inches.toString());
        }
      } catch (error: any) {
        console.error("Error loading metrics:", error);
      }
    };

    loadExistingMetrics();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weight || !height) {
      toast({
        title: "Missing Information",
        description: "Please enter both weight and height.",
        variant: "destructive",
      });
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 1000) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid weight between 1 and 1000 pounds.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(heightNum) || heightNum <= 0 || heightNum > 120) {
      toast({
        title: "Invalid Height",
        description: "Please enter a valid height between 1 and 120 inches.",
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

      // Calculate BMI: (weight in pounds / (height in inches)^2) * 703
      const bmi = (weightNum / (heightNum * heightNum)) * 703;

      if (existingMetrics) {
        // Update existing record
        const { error } = await supabase
          .from("body_metrics")
          .update({
            weight_pounds: weightNum,
            height_inches: heightNum,
            bmi: bmi,
          })
          .eq("id", existingMetrics.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from("body_metrics")
          .insert({
            user_id: user.id,
            weight_pounds: weightNum,
            height_inches: heightNum,
            bmi: bmi,
          });

        if (error) throw error;
      }

      toast({
        title: "Metrics Saved!",
        description: `Your BMI is ${bmi.toFixed(1)}. ${getBMIMessage(bmi)}`,
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save body metrics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBMIMessage = (bmi: number): string => {
    if (bmi < 18.5) {
      return "You're underweight. Consider strength training and nutrition tasks.";
    } else if (bmi >= 18.5 && bmi < 25) {
      return "You're in a healthy weight range. Keep it up!";
    } else if (bmi >= 25 && bmi < 30) {
      return "You're slightly overweight. Consider adding cardio and diet tasks.";
    } else {
      return "You're in the obese range. Consider cardio and diet tasks.";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
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
            Enter Body Metrics
          </h1>
          <p className="text-muted-foreground">
            Track your weight and height to calculate your BMI
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-base font-semibold flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Weight (pounds)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="1"
                max="1000"
                placeholder="Enter your weight in pounds"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-base font-semibold flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                Height (inches)
              </Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="1"
                max="120"
                placeholder="Enter your height in inches"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Tip: 1 foot = 12 inches. For example, 5'10" = 70 inches
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : existingMetrics ? "Update Metrics" : "Save Metrics"}
            </Button>
          </form>
        </Card>

        {/* Info Card */}
        <Card className="p-6 mt-6 bg-muted/50">
          <h3 className="text-lg font-semibold mb-2">About BMI</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Body Mass Index (BMI) is calculated using your weight and height. 
            It's a screening tool to identify potential weight problems.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Underweight: BMI &lt; 18.5</li>
            <li>Normal weight: BMI 18.5 - 24.9</li>
            <li>Overweight: BMI 25 - 29.9</li>
            <li>Obese: BMI ≥ 30</li>
          </ul>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default BodyMetrics;

