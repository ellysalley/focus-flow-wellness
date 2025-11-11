-- Add DELETE policy for chat_messages
CREATE POLICY "Users can delete their own messages"
ON public.chat_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Add DELETE policy for active_rewards (for un-redeem functionality)
CREATE POLICY "Users can delete their own active rewards"
ON public.active_rewards
FOR DELETE
USING (auth.uid() = user_id);
