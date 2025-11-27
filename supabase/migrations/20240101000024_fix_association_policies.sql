-- Add policies to allow viewing associations via the Contact ownership
-- This ensures that if you can see the contact, you can see its associations, 
-- provided you also have access to the linked task/deal (which is covered by standard RLS)

CREATE POLICY "Users can view deal contacts via contact ownership" ON public.deal_contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contacts
            WHERE contacts.id = deal_contacts.contact_id
            AND contacts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view task contacts via contact ownership" ON public.task_contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contacts
            WHERE contacts.id = task_contacts.contact_id
            AND contacts.user_id = auth.uid()
        )
    );
