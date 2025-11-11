import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserProgress {
  total_points: number;
  current_streak: number;
  total_xp: number;
  achievements_count: number;
  last_activity_date: string | null;
}

export const useUserProgress = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) {
        // Create initial progress - start at 0
        const { data: newProgress, error: insertError } = await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            total_points: 0,
            current_streak: 0,
            total_xp: 0,
            achievements_count: 0,
            last_activity_date: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setProgress(newProgress);
      } else {
        // Update streak based on last activity
        const today = new Date().toISOString().split('T')[0];
        const lastActivity = data.last_activity_date;
        
        let updatedStreak = data.current_streak;
        if (lastActivity) {
          const lastDate = new Date(lastActivity);
          const todayDate = new Date(today);
          const diffTime = todayDate.getTime() - lastDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1) {
            updatedStreak = 0; // Reset streak if missed a day
          }
        }
        
        if (updatedStreak !== data.current_streak) {
          const { data: updated } = await supabase
            .from("user_progress")
            .update({ current_streak: updatedStreak })
            .eq("user_id", user.id)
            .select()
            .single();
          
          if (updated) setProgress(updated);
        } else {
          setProgress(data);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading progress",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<UserProgress>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_progress")
        .update({
          ...updates,
          last_activity_date: new Date().toISOString().split('T')[0],
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setProgress(data);
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating progress",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addXP = async (xp: number) => {
    if (!progress) return;
    
    const newTotalXP = progress.total_xp + xp;
    const oldLevel = Math.floor(progress.total_xp / 1000);
    const newLevel = Math.floor(newTotalXP / 1000);
    const leveledUp = newLevel > oldLevel;
    
    const newStreak = progress.current_streak + 1;
    
    await updateProgress({
      total_xp: newTotalXP,
      current_streak: newStreak,
    });
    
    return leveledUp;
  };

  const addPoints = async (points: number) => {
    if (!progress) return;
    await updateProgress({
      total_points: progress.total_points + points,
    });
  };

  const deductPoints = async (points: number) => {
    if (!progress) return;
    await updateProgress({
      total_points: progress.total_points - points,
    });
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return {
    progress,
    loading,
    updateProgress,
    addXP,
    addPoints,
    deductPoints,
    refetch: fetchProgress,
  };
};
