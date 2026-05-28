-- 数据库迁移脚本：扩展 user_applications 表中的申请状态字段约束
-- 运行方法：请复制以下 SQL 代码，在 Supabase 控制台的 SQL Editor 中粘贴并执行一次

-- 1. 尝试删除现有的 status 字段 check 约束（PostgreSQL 自动生成的名称通常为 user_applications_status_check）
ALTER TABLE public.user_applications 
DROP CONSTRAINT IF EXISTS user_applications_status_check;

-- 2. 重新添加支持 7 个状态（加上老的 result 作为向后兼容）的 CHECK 约束
-- 状态扩充为：planning (规划中), preparing (准备材料中), supplement (补充材料中), submitted (已提交), waiting (面试/等待), offer (已获录取/Offer), rejected (已拒绝), result (保留作为向下兼容)
ALTER TABLE public.user_applications 
ADD CONSTRAINT user_applications_status_check 
CHECK (status IN (
    'planning', 
    'preparing', 
    'supplement', 
    'submitted', 
    'waiting', 
    'offer', 
    'rejected', 
    'result'
));

-- 3. （可选迁移）将已有老数据中状态为旧“result”（结果）的项目一律迁移并更新为新状态“offer”（已获录取）
UPDATE public.user_applications 
SET status = 'offer' 
WHERE status = 'result';
