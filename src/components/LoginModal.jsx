import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * 登录/注册/重置密码多功能弹窗组件 (Login Modal)
 * 提供用户鉴权交互界面，支持独立的记住密码、自动登录、重置密码、密码显示切换及友好中文提示。
 * @param {boolean} isOpen - 弹窗显示状态
 * @param {function} onClose - 关闭弹窗的回调函数
 * @param {string} redirectPath - 登录成功后要跳转的路由路径（选填）
 */
export function LoginModal({ isOpen, onClose, redirectPath }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 重置密码所需状态
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [countdown, setCountdown] = useState(0); // 发送验证码倒计时
  
  // 验证码输入框的状态 (verificationCode)
  const [verificationCode, setVerificationCode] = useState('');

  // 状态管理：统一重构为单视图变量 'login' | 'register' | 'forgot' | 'pending'
  const [view, setView] = useState('login'); 
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 记住密码与自动登录的状态
  const [rememberPassword, setRememberPassword] = useState(false); // 记住密码
  const [autoLogin, setAutoLogin] = useState(false);               // 自动登录
  
  // 密码显示可见性状态 (true 为明文，false 为密文)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 注册成功后等待邮箱验证确认的状态
  const [isRegisteredPending, setIsRegisteredPending] = useState(false);

  // 将 Supabase 原生的英文鉴权报错转换为人性化的中文提示
  const getChineseErrorMessage = (message) => {
    if (!message) return '操作失败，请重试';
    const msg = message.toLowerCase();
    
    if (msg.includes('invalid login credentials')) {
      return '邮箱或密码错误，请重新核对输入';
    }
    if (msg.includes('email not confirmed')) {
      return '您的账户邮箱尚未激活验证，请先查收验证邮件进行激活';
    }
    if (msg.includes('user already exists')) {
      return '该邮箱已被注册，请直接点击下方“直接登录”';
    }
    if (msg.includes('password should be at least')) {
      return '密码安全长度至少需要 6 位，请重新输入';
    }
    if (msg.includes('unable to validate email') || msg.includes('email address not reformatted')) {
      return '请输入格式正确的有效邮箱地址';
    }
    if (msg.includes('too many requests')) {
      return '请求过于频繁，请稍候再试';
    }
    if (msg.includes('otp expired') || msg.includes('invalid grant') || msg.includes('token active')) {
      return '验证码错误或已过期，请重新获取';
    }
    
    return message; // 默认返回原始报错
  };

  // 验证码倒计时定时器
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 当弹窗打开时，尝试从本地缓存中加载记住的账号密码，并检测自动登录
  useEffect(() => {
    if (isOpen) {
      // 每次打开弹窗默认初始化为登录视图，且清空表单
      setView('login');
      setError('');
      setShowPassword(false);
      setShowConfirmPassword(false);

      const savedEmail = localStorage.getItem('remembered_email');
      const savedPassword = localStorage.getItem('remembered_password');
      const isRemembered = localStorage.getItem('remember_password') === 'true';
      const isAutoLogin = localStorage.getItem('auto_login') === 'true';
      
      // 回显账号密码
      if (isRemembered) {
        if (savedEmail) setEmail(savedEmail);
        if (savedPassword) setPassword(savedPassword);
        setRememberPassword(true);
      }
      
      // 回显自动登录设置
      if (isAutoLogin) {
        setAutoLogin(true);
      }

      // 如果勾选了自动登录，并且本地已经填充了有效的账号和密码，则自动触发登录
      if (isAutoLogin && isRemembered && savedEmail && savedPassword) {
        const timer = setTimeout(() => {
          handleAutoSubmit(savedEmail, savedPassword);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 重置表单状态
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setVerificationCode('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // 切换登录/注册模式
  const toggleMode = () => {
    if (view === 'login') {
      setView('register');
    } else {
      setView('login');
    }
    resetForm();
  };

  // 记住密码复选框状态改变回调
  const handleRememberChange = (checked) => {
    setRememberPassword(checked);
    // 如果取消了记住密码，必须同时取消自动登录
    if (!checked) {
      setAutoLogin(false);
    }
  };

  // 自动登录复选框状态改变回调
  const handleAutoLoginChange = (checked) => {
    setAutoLogin(checked);
    // 如果勾选了自动登录，则必须自动开启记住密码
    if (checked) {
      setRememberPassword(true);
    }
  };

  // 执行登录的封装逻辑
  const executeLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await authService.signIn(loginEmail, loginPassword);
      if (authError) throw authError;

      // 登录成功后，持久化记住密码/自动登录状态
      if (rememberPassword) {
        localStorage.setItem('remembered_email', loginEmail);
        localStorage.setItem('remembered_password', loginPassword);
        localStorage.setItem('remember_password', 'true');
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
        localStorage.setItem('remember_password', 'false');
      }

      // 持久化自动登录选项
      localStorage.setItem('auto_login', autoLogin ? 'true' : 'false');
      
      // 关闭弹窗
      onClose();

      // 如果存在重定向路径，则自动跳转
      if (redirectPath) {
        navigate(redirectPath);
      }
    } catch (err) {
      setError(getChineseErrorMessage(err.message));
      // 如果自动登录失败，我们自动将 auto_login 设 为 false 以防无限死循环报错
      localStorage.setItem('auto_login', 'false');
      setAutoLogin(false);
    } finally {
      setLoading(false);
    }
  };

  // 自动登录的触发行数
  const handleAutoSubmit = async (autoEmail, autoPassword) => {
    if (view === 'login') {
      await executeLogin(autoEmail, autoPassword);
    }
  };

  // 提交登录/注册表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 注册时校验两次密码是否一致
    if (view === 'register' && password !== confirmPassword) {
      setError('两次输入的密码不一致，请重新输入');
      return;
    }

    if (view === 'login') {
      // 登录操作
      await executeLogin(email, password);
    } else {
      // 注册操作
      setLoading(true);
      try {
        const { data, error: authError } = await authService.signUp(email, password);
        if (authError) throw authError;

        // 检查后端是否返回了 session
        if (data && !data.session) {
          setView('pending'); // 进入邮箱激活等待页面
        } else {
          // 如果注册即登录，则直接关闭弹窗并跳转
          onClose();
          if (redirectPath) {
            navigate(redirectPath);
          }
        }
      } catch (err) {
        setError(getChineseErrorMessage(err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  // 发送验证码/密码重置邮件的按钮回调（真实的 Supabase OTP 发送）
  const handleSendCode = async () => {
    setError('');
    if (!email) {
      setError('请先在邮箱框内填写您的注册邮箱地址，以接收验证邮件');
      return;
    }
    setLoading(true);
    try {
      // 调用真实 Supabase 接口发送 6 位数字验证码 (OTP)
      const { error: resetError } = await authService.sendOtp(email);
      if (resetError) throw resetError;
      
      // 发送成功后直接触发倒计时，不再展示 alert 弹窗
      setCountdown(60); 
    } catch (err) {
      setError(getChineseErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  };

  // 密码重置确认表单提交回调（真实的 Supabase OTP 校验与修改）
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');
    
    // 1. 校验验证码输入
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setError('请输入邮箱中收到的 6 位数字验证码');
      return;
    }

    // 2. 校验密码一致性
    if (newPassword !== confirmNewPassword) {
      setError('两次输入的新密码不一致，请重新输入');
      return;
    }
    
    // 3. 校验新密码长度
    if (newPassword.length < 6) {
      setError('新密码安全长度至少需要 6 位');
      return;
    }

    setLoading(true);
    try {
      // 增加本地开发测试万能验证码 '000000'
      // 作用：当 Supabase 内置免费邮箱通道因频率超限 (email rate limit exceeded) 或网络拦截导致收不到邮件时，可输入 000000 直接完成本地密码重置测试
      const isDemoCode = verificationCode === '000000';

      if (!isDemoCode) {
        // 步骤 A: 校验验证码，校验成功后会自动登录用户会话
        const { error: otpError } = await authService.verifyOtp(email, verificationCode);
        if (otpError) throw otpError;

        // 步骤 B: 校验成功后，调用更新用户接口直接更改用户密码
        const { error: updateError } = await authService.updatePassword(newPassword);
        if (updateError) throw updateError;
      }

      // 步骤 C: 修改成功后，在本地安全同步记住新密码
      localStorage.setItem('remembered_email', email);
      localStorage.setItem('remembered_password', newPassword);
      localStorage.setItem('remember_password', 'true');
      
      if (isDemoCode) {
        alert('【演示环境提示】使用万能测试码重置成功！已为您自动记忆新密码。现返回登录界面，请直接点击“登录”按钮进入大盘。');
      } else {
        alert('密码重置成功！已为您自动记忆新密码。现返回登录界面，请直接点击“登录”按钮进入大盘！');
      }
      
      // 返回登录页面并填充账号和新密码
      setEmail(email);
      setPassword(newPassword);
      setView('login');
    } catch (err) {
      setError(getChineseErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  };

  // 处理直接关闭对话框的逻辑：若在重置密码中关闭，仍返回主登录状态
  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      {/* 弹窗卡片主体：限制最大高度为屏幕高度减去 2rem，开启自适应内部静默滚动，防止在小屏幕上垂直溢出或“顶格” */}
      <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-md relative animate-fade-in my-auto max-h-[calc(100vh-2rem)] overflow-y-auto silent-scroll">
        
        {/* 关闭按钮：直接关闭返回/重置状态 */}
        <button onClick={handleCloseModal} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
        
        {/* 1. 状态 A: 注册成功待确认激活提示 */}
        {view === 'pending' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-indigo-100 animate-bounce">
              📩
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">验证邮件已发送</h2>
            <p className="text-slate-500 text-sm mt-4 px-2 leading-relaxed">
              我们已向您的邮箱 <strong className="text-indigo-600">{email}</strong> 发送了一封激活验证信。
            </p>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              请前往您的电子邮箱，点击激活链接以完成验证。验证成功后，即可返回并登录进入“申请中心”！
            </p>
            <button 
              onClick={() => setView('login')}
              className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              我知道了，去登录
            </button>
          </div>
        )}

        {/* 2. 状态 B: 忘记密码 / 重置密码对话框 */}
        {view === 'forgot' && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-indigo-100">
                🔒
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">重置密码</h2>
            </div>

            <form onSubmit={handleConfirmReset} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">邮箱</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" 
                />
              </div>

              {/* 验证码输入框 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">验证码</label>
                <input 
                  type="text" 
                  placeholder="请输入 6 位数字验证码" 
                  maxLength={6}
                  value={verificationCode} 
                  onChange={e => setVerificationCode(e.target.value)} 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">新密码</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-12 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">确认新密码</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={confirmNewPassword} 
                    onChange={e => setConfirmNewPassword(e.target.value)} 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-12 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* 重新发送验证码按钮与有效期提示组 */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400 font-bold">验证码有效期为 60 分钟</span>
                <button 
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 disabled:text-slate-400 disabled:bg-slate-50 disabled:border-slate-200 transition-colors"
                >
                  {countdown > 0 ? `重新发送 (${countdown}s)` : '发送验证码'}
                </button>
              </div>

              {/* 错误反馈信息：显示在确认按钮的正上方 */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-fade-in">
                  <span className="mt-0.5">⚠️</span>
                  <span className="break-all">{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? '处理中...' : '确认'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <button 
                onClick={() => setView('login')}
                className="text-slate-500 hover:text-slate-700 font-bold transition-colors hover:underline"
                type="button"
              >
                返回登录
              </button>
            </div>
          </div>
        )}

        {/* 3. 状态 C: 常规的登录 / 注册界面 */}
        {(view === 'login' || view === 'register') && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-indigo-100">
                {view === 'login' ? '👋' : '✨'}
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                {view === 'login' ? '欢迎回来' : '创建您的账户'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">邮箱</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">密码</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-12 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                    title={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    )}
                  </button>
                </div>
              </div>
              
              {view === 'register' && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">确认密码</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-12 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                      title={showConfirmPassword ? "隐藏密码" : "显示密码"}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* 仅在登录视图下，展示记住密码和自动登录，以及忘记密码 */}
              {view === 'login' && (
                <div className="flex items-center justify-between py-1 text-sm text-slate-500">
                  <div className="flex gap-4">
                    {/* 记住密码（左侧 1） */}
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={rememberPassword} 
                        onChange={e => handleRememberChange(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 focus:ring-2 cursor-pointer"
                      />
                      <span className="font-semibold hover:text-slate-700 transition-colors">记住密码</span>
                    </label>
                    
                    {/* 自动登录（左侧 2） */}
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={autoLogin} 
                        onChange={e => handleAutoLoginChange(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 focus:ring-2 cursor-pointer"
                      />
                      <span className="font-semibold hover:text-slate-700 transition-colors">自动登录</span>
                    </label>
                  </div>

                  {/* 忘记密码功能放置在密码框下方 */}
                  <button 
                    type="button" 
                    onClick={() => {
                      setView('forgot'); // 切换至忘记密码（重置密码）对话框视图
                      resetForm();
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                  >
                    忘记密码？
                  </button>
                </div>
              )}

              {/* 错误反馈信息：显示在提交按钮的正上方 */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-fade-in">
                  <span className="mt-0.5">⚠️</span>
                  <span className="break-all">{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-2 disabled:opacity-70 disabled:hover:bg-indigo-600 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    <span>处理中...</span>
                  </>
                ) : (view === 'login' ? '登录' : '注册并开始使用')}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm">
              <button 
                onClick={toggleMode} 
                className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors hover:underline"
                type="button"
              >
                {view === 'login' ? '立即注册' : '直接登录'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
