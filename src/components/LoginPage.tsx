import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, CheckCircle2, ArrowLeft, Loader2, User, Lock, Sparkles } from 'lucide-react';
import { LegalModal } from './LegalModal';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  // Extract redirect path from URL query params, default to /
  const searchParams = new URLSearchParams(window.location.search);
  const redirectPath = searchParams.get('redirect') || '/';
  const isFromCart = redirectPath === '/cart';

  const [role, setRole] = useState<'customer' | 'admin'>('customer');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (authMethod === 'otp') {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            data: { full_name: fullName, role },
            emailRedirectTo: `${window.location.origin}${redirectPath}`,
          },
        });

        if (otpError) {
          setError(otpError.message);
        } else {
          setMessage('Check your email for the magic login link!');
        }
      } else {
        // Password Auth
        if (isLogin) {
          const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (loginErr) {
            setError(loginErr.message);
          } else {
            if (loginData?.user) {
              localStorage.setItem(`mbm_user_role_${loginData.user.id}`, role);
              localStorage.setItem('mbm_global_role', role);
            }
            const targetUrl = role === 'admin' ? '/admin' : (redirectPath === '/login' ? '/' : redirectPath);
            window.location.href = targetUrl;
          }
        } else {
          // Sign Up
          const { data, error: signUpErr } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                role: role,
              },
              emailRedirectTo: `${window.location.origin}${role === 'admin' ? '/admin' : redirectPath}`,
            },
          });

          if (signUpErr) {
            setError(signUpErr.message);
          } else if (data?.session) {
            localStorage.setItem(`mbm_user_role_${data.session.user.id}`, role);
            localStorage.setItem('mbm_global_role', role);
            const targetUrl = role === 'admin' ? '/admin' : (redirectPath === '/login' ? '/' : redirectPath);
            window.location.href = targetUrl;
          } else {
            setMessage('Account created! Please check your email to confirm or log in.');
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdminAccess = () => {
    localStorage.setItem('mbm_global_role', 'admin');
    window.location.href = '/admin';
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in is currently unavailable. Please sign in with email.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1f0305] flex font-inter text-white">
      {/* Left Side: Brand Imagery */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0a0102] overflow-hidden">
        <img
          src="/login img.png"
          alt="MBM Gifts Luxury Collection"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0102] via-[#0a0102]/20 to-[#0a0102]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#1f0305]/80"></div>

        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <a href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 transition-all cursor-pointer text-xs uppercase tracking-wider font-bold w-fit shadow-lg hover:border-amber-400/50">
            <ArrowLeft className="w-4 h-4 text-amber-300" />
            Back to Shop
          </a>

          <div>
            <div className="mb-4">
              <img src="/logo.png" alt="MBM Gifts" referrerPolicy="no-referrer" className="h-14 sm:h-16 w-auto object-contain drop-shadow-xl scale-[3.4] origin-left" />
            </div>
            <p className="text-lg text-white/90 max-w-md font-light leading-relaxed bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
              Curating unforgettable moments. Sign in or create an account to access your bespoke gifts and track your orders.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Back Button */}
        <a href="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer text-xs uppercase tracking-wider font-bold">
          <ArrowLeft className="w-4 h-4" />
          Back
        </a>

        <div className="max-w-md w-full mt-8 lg:mt-0">
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/logo.png" alt="MBM Gifts" referrerPolicy="no-referrer" className="h-12 sm:h-14 w-auto object-contain drop-shadow-md scale-[1.3] origin-left" />
          </div>

          {isFromCart && (
            <div className="bg-amber-400/15 border border-amber-400/40 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0" />
              <p className="text-amber-200 text-xs leading-relaxed">
                <strong className="font-bold text-amber-300">Almost there!</strong> Please sign up or log in to complete your gift order.
              </p>
            </div>
          )}

          {/* Form Tabs: Sign In / Sign Up */}
          <div className="flex border-b border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setMessage('');
                setError('');
              }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${isLogin
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-white/50 hover:text-white'
                }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setMessage('');
                setError('');
              }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${!isLogin
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-white/50 hover:text-white'
                }`}
            >
              Sign Up
            </button>
          </div>

          <h2 className="font-podium text-2xl uppercase tracking-wider mb-1 text-white">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-white/60 text-xs mb-6">
            {isLogin ? 'Sign in to manage your gift orders and saved preferences.' : 'Join MBM Gifts for quick checkout and order tracking.'}
          </p>

          <div className="space-y-5">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loadingGoogle || loading}
              className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs uppercase tracking-wider"
            >
              {loadingGoogle ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.7 17.58V20.34H19.26C21.34 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                  <path d="M12 23C14.97 23 17.46 22.02 19.26 20.34L15.7 17.58C14.73 18.23 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.1H2.17V16.94C3.98 20.53 7.7 23 12 23Z" fill="#34A853" />
                  <path d="M5.84 14.1C5.62 13.45 5.49 12.74 5.49 12C5.49 11.26 5.62 10.55 5.84 9.9V7.06H2.17C1.43 8.55 1 10.23 1 12C1 13.77 1.43 15.45 2.17 16.94L5.84 14.1Z" fill="#FBBC05" />
                  <path d="M12 5.38C13.62 5.38 15.07 5.94 16.22 7.03L19.34 3.91C17.46 2.16 14.97 1 12 1C7.7 1 3.98 3.47 2.17 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-3 text-white/40 text-[10px] uppercase tracking-widest font-bold">Or with email</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Success Message Callout */}
            {message ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center animate-scale-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-emerald-300 text-sm font-bold">{message}</p>
                {redirectPath && redirectPath !== '/' && (
                  <p className="text-emerald-300/70 text-xs mt-2">
                    Once verified, you will be returned to finish your order.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-3.5">

                {!isLogin && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        required={!isLogin}
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-black/40 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-black/40 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                {authMethod === 'password' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] uppercase tracking-widest text-white/50 font-bold">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        required={authMethod === 'password'}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/40 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Switch authentication type (Password / Magic Link) */}
                <div className="flex justify-between items-center text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMethod(authMethod === 'password' ? 'otp' : 'password')}
                    className="text-amber-300/80 hover:text-amber-300 underline transition-colors cursor-pointer"
                  >
                    {authMethod === 'password' ? 'Use Magic Link instead' : 'Use Password instead'}
                  </button>
                </div>

                {error && (
                  <p className="text-red-400 text-xs text-center font-bold bg-red-400/10 py-2.5 px-3 rounded border border-red-400/20">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || loadingGoogle}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold py-3.5 text-xs tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : authMethod === 'otp' ? (
                    'Send Magic Link'
                  ) : isLogin ? (
                    'Log In'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 text-center text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
            By continuing, you agree to MBM Gifts'<br />
            <button type="button" onClick={() => setLegalModal('terms')} className="underline hover:text-amber-300 transition-colors cursor-pointer">Terms of Service</button> and <button type="button" onClick={() => setLegalModal('privacy')} className="underline hover:text-amber-300 transition-colors cursor-pointer">Privacy Policy</button>.
          </div>
        </div>
      </div>

      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </div>
  );
};

