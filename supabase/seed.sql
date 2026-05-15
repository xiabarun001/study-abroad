-- Seed data for study-abroad app

-- 1. Insert Continents
INSERT INTO public.continents (id, name, slug, cover_image) VALUES 
('north-america', '北美洲', 'north-america', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80'),
('europe', '欧洲', 'europe', 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80'),
('asia', '亚洲', 'asia', 'https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?w=800&q=80'),
('oceania', '大洋洲', 'oceania', 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Countries
INSERT INTO public.countries (id, continent_id, name_zh, name_en, code, flag_emoji, popular) VALUES 
('usa', 'north-america', '美国', 'United States', 'US', '🇺🇸', true),
('uk', 'europe', '英国', 'United Kingdom', 'GB', '🇬🇧', true),
('singapore', 'asia', '新加坡', 'Singapore', 'SG', '🇸🇬', true),
('australia', 'oceania', '澳大利亚', 'Australia', 'AU', '🇦🇺', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Universities (Using a few specific UUIDs so we can link programs)
INSERT INTO public.universities (id, country_id, name_zh, name_en, qs_ranking, location, acceptance_rate, undergrad_tuition, is_target) VALUES 
('11111111-1111-1111-1111-111111111111', 'usa', '斯坦福大学', 'Stanford University', 3, 'Stanford, CA', 4, 56000, true),
('22222222-2222-2222-2222-222222222222', 'uk', '牛津大学', 'University of Oxford', 2, 'Oxford, UK', 15, 38000, true),
('33333333-3333-3333-3333-333333333333', 'singapore', '新加坡国立大学', 'National University of Singapore', 8, 'Singapore', 20, 25000, true),
('44444444-4444-4444-4444-444444444444', 'australia', '墨尔本大学', 'University of Melbourne', 14, 'Melbourne, VIC', 40, 32000, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Programs
INSERT INTO public.programs (id, university_id, title, degree, description, tuition_fee, duration, language_req, gpa_req) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '计算机科学硕士 (MS in Computer Science)', 'Master', '斯坦福计算机硕士项目，全球顶尖，涵盖人工智能、系统和理论。', 60000, '1.5-2 years', 'TOEFL 100+', '3.8/4.0'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '工商管理硕士 (MBA)', 'Master', '斯坦福商学院MBA项目，注重创新与领导力培养。', 75000, '2 years', 'TOEFL 105+', '3.7/4.0'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', '金融经济学硕士 (MSc in Financial Economics)', 'Master', '牛津大学赛德商学院顶级金融项目，极具挑战性。', 48000, '1 year', 'IELTS 7.5', '3.8/4.0'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', '商业分析硕士 (MSc in Business Analytics)', 'Master', '新加坡国立大学热门商科项目，结合数据科学与商业决策。', 35000, '1 year', 'IELTS 7.0', '3.5/4.0'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', '信息技术硕士 (Master of Information Technology)', 'Master', '墨尔本大学IT项目，适合跨专业或有一定技术背景的学生。', 42000, '2 years', 'IELTS 6.5', '3.0/4.0'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', '计算机科学本科 (BA in Computer Science)', 'Bachelor', '牛津大学计算机本科项目，理论与实践并重。', 38000, '3 years', 'IELTS 7.5', 'A*AA')
ON CONFLICT (id) DO NOTHING;
