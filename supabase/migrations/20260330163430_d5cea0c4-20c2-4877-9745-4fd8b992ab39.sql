
-- Add unique constraint for upsert support on journey_milestones
ALTER TABLE public.journey_milestones ADD CONSTRAINT journey_milestones_user_milestone_unique UNIQUE (user_id, milestone_name);

-- Add RLS policy for delete on journey_milestones (needed for unchecking items)
CREATE POLICY "Users can delete own milestones"
ON public.journey_milestones
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
