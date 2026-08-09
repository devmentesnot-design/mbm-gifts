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

  // Helper to generate hashed nonce for Google ID token verification
  const generateNoncePair = async (): Promise<{ rawNonce: string; hashedNonce: string }> => {
    const rawNonce = crypto.randomUUID();
    const encoder = new TextEncoder();
    const data = encoder.encode(rawNonce);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return { rawNonce, hashedNonce };
  };

  const handleGoogleCredentialResponse = async (response: any, rawNonce?: string) => {
    setLoadingGoogle(true);
    setError('');

    try {
      if (!response?.credential) {
        throw new Error('No credential received from Google.');
      }

      // Authenticate with Supabase using the Google ID Token & matching raw nonce
      const { data, error: idTokenErr } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
        nonce: rawNonce,
      });

      if (idTokenErr) {
        setError(idTokenErr.message);
      } else if (data?.user) {
        localStorage.setItem(`mbm_user_role_${data.user.id}`, role);
        localStorage.setItem('mbm_global_role', role);
        const targetUrl = role === 'admin' ? '/admin' : (redirectPath === '/login' ? '/' : redirectPath);
        window.location.href = targetUrl;
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  React.useEffect(() => {
    const googleClientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId && (window as any).google?.accounts?.id) {
      generateNoncePair().then(({ rawNonce, hashedNonce }) => {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            nonce: hashedNonce,
            callback: (response: any) => handleGoogleCredentialResponse(response, rawNonce),
          });

          const btnContainer = document.getElementById('google-official-btn');
          if (btnContainer) {
            (window as any).google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              width: btnContainer.clientWidth || 384
            });
          }
        } catch (e) {
          console.warn('Google Identity Services initialization warning:', e);
        }
      });
    }
  }, []);

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
            <div className="relative w-full">
              <div id="google-official-btn" className="w-full flex justify-center bg-white rounded-lg overflow-hidden [&>div]:w-full"></div>
              {loadingGoogle && (
                <div className="absolute inset-0 bg-white text-gray-900 font-bold flex items-center justify-center gap-3 rounded-lg z-10 shadow-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-900" />
                  <span className="text-xs uppercase tracking-wider">Connecting...</span>
                </div>
              )}
            </div>

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

