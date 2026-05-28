-- 1. 创建会话表 (chat_sessions)
-- 用于存储每个独立的聊天会话信息，其中 recommended_programs 使用 JSONB 类型存储推荐卡片以获得最大数据包容度
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '新会话',
    recommended_programs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 创建消息表 (chat_messages)
-- 用于持久化存储每个会话的具体聊天记录上下文，并使用 CASCADE 与会话表联动删除
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 启用 RLS (行级安全策略) 以防止多用户场景下的数据越权访问
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. 创建会话表 RLS 增删改查策略
CREATE POLICY "Users can manage their own chat sessions" 
    ON public.chat_sessions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. 创建消息表 RLS 增删改查策略
CREATE POLICY "Users can manage their own messages" 
    ON public.chat_messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions s 
            WHERE s.id = chat_messages.session_id AND s.user_id = auth.uid()
        )
    );
