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
    <div className="min-h-screen bg-transparent flex font-inter text-[#241A15] selection:bg-[#E6D5B8] selection:text-[#241A15]">
      {/* Left Side: Brand Imagery with Smooth Center Fade */}
      <div 
        className="hidden lg:flex w-1/2 relative overflow-hidden bg-transparent"
        style={{
          maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
        }}
      >
        <img
          src="/login img.png"
          alt="MBM Gifts Luxury Collection"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95"
        />
        {/* Soft atmospheric gradient overlays blending with champagne */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#241A15]/70 via-transparent to-[#241A15]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#241A15]/40" />

        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <a href="/" className="inline-flex items-center gap-2 text-[#241A15] hover:text-[#3A2A20] bg-[#FBF8F2]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#D8C6A8] transition-all cursor-pointer text-xs uppercase tracking-wider font-bold w-fit shadow-md hover:border-[#B8944A]">
            <ArrowLeft className="w-4 h-4 text-[#B8944A]" />
            Back to Shop
          </a>

          <div>
            <div className="mb-4">
              <img src="/brand_logo_alt.png" alt="MBM Gifts" referrerPolicy="no-referrer" className="h-12 sm:h-16 lg:h-20 w-auto object-contain drop-shadow-md transform origin-left" />
            </div>
            <p className="text-sm text-[#F7F1E7] max-w-md font-light leading-relaxed bg-[#241A15]/80 backdrop-blur-md p-4 rounded-2xl border border-[#D8C6A8]/30 shadow-xl">
              Curating unforgettable moments. Sign in or create an account to access your bespoke gifts and track your orders.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Back Button */}
        <a href="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-[#756457] hover:text-[#241A15] transition-colors cursor-pointer text-xs uppercase tracking-wider font-bold">
          <ArrowLeft className="w-4 h-4 text-[#B8944A]" />
          Back
        </a>

        <div className="max-w-md w-full mt-8 lg:mt-0 bg-[#FBF8F2] border border-[#D8C6A8] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/brand_logo_alt.png" alt="MBM Gifts" referrerPolicy="no-referrer" className="h-12 sm:h-16 w-auto object-contain drop-shadow-md" />
          </div>

          {isFromCart && (
            <div className="bg-[#E6D5B8]/30 border border-[#D8C6A8] rounded-xl p-4 mb-6 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#8E6E2F] flex-shrink-0" />
              <p className="text-[#3A2A20] text-xs leading-relaxed">
                <strong className="font-bold text-[#8E6E2F]">Almost there!</strong> Please sign up or log in to complete your gift order.
              </p>
            </div>
          )}

          {/* Form Tabs: Sign In / Sign Up */}
          <div className="flex border-b border-[#D8C6A8]/40 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setMessage('');
                setError('');
              }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${isLogin
                ? 'border-[#B8944A] text-[#8E6E2F]'
                : 'border-transparent text-[#756457] hover:text-[#241A15]'
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
                ? 'border-[#B8944A] text-[#8E6E2F]'
                : 'border-transparent text-[#756457] hover:text-[#241A15]'
                }`}
            >
              Sign Up
            </button>
          </div>

          <h2 className="font-podium text-2xl uppercase tracking-wider mb-1 text-[#241A15]">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-[#756457] text-xs mb-6">
            {isLogin ? 'Sign in to manage your gift orders and saved preferences.' : 'Join MBM Gifts for quick checkout and order tracking.'}
          </p>

          <div className="space-y-5">
            {/* Google OAuth Button */}
            <div className="relative w-full">
              <div id="google-official-btn" className="w-full flex justify-center bg-white rounded-lg overflow-hidden [&>div]:w-full border border-[#D8C6A8]/60 shadow-sm"></div>
              {loadingGoogle && (
                <div className="absolute inset-0 bg-white text-gray-900 font-bold flex items-center justify-center gap-3 rounded-lg z-10 shadow-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-900" />
                  <span className="text-xs uppercase tracking-wider">Connecting...</span>
                </div>
              )}
            </div>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-[#D8C6A8]/40"></div>
              <span className="flex-shrink-0 mx-3 text-[#756457] text-[10px] uppercase tracking-widest font-bold">Or with email</span>
              <div className="flex-grow border-t border-[#D8C6A8]/40"></div>
            </div>

            {/* Success Message Callout */}
            {message ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center animate-scale-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-emerald-800 text-sm font-bold">{message}</p>
                {redirectPath && redirectPath !== '/' && (
                  <p className="text-emerald-700 text-xs mt-2">
                    Once verified, you will be returned to finish your order.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-3.5">

                {!isLogin && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#756457] font-bold mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#756457] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        required={!isLogin}
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#FAF6EE] border border-[#D8C6A8] rounded-lg py-3 pl-10 pr-4 text-xs text-[#241A15] placeholder-[#756457]/50 focus:outline-none focus:border-[#B8944A] transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#756457] font-bold mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#756457] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#FAF6EE] border border-[#D8C6A8] rounded-lg py-3 pl-10 pr-4 text-xs text-[#241A15] placeholder-[#756457]/50 focus:outline-none focus:border-[#B8944A] transition-colors"
                    />
                  </div>
                </div>

                {authMethod === 'password' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] uppercase tracking-widest text-[#756457] font-bold">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#756457] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        required={authMethod === 'password'}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#FAF6EE] border border-[#D8C6A8] rounded-lg py-3 pl-10 pr-4 text-xs text-[#241A15] placeholder-[#756457]/50 focus:outline-none focus:border-[#B8944A] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Switch authentication type (Password / Magic Link) */}
                <div className="flex justify-between items-center text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMethod(authMethod === 'password' ? 'otp' : 'password')}
                    className="text-[#8E6E2F] hover:text-[#241A15] underline transition-colors cursor-pointer"
                  >
                    {authMethod === 'password' ? 'Use Magic Link instead' : 'Use Password instead'}
                  </button>
                </div>

                {error && (
                  <p className="text-red-700 text-xs text-center font-bold bg-red-100 py-2.5 px-3 rounded border border-red-300">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || loadingGoogle}
                  className="w-full bg-[#241A15] hover:bg-[#3A2A20] text-[#FBF8F2] font-bold py-3.5 text-xs tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#E6D5B8]" />
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

          <div className="mt-8 text-center text-[10px] text-[#756457] uppercase tracking-widest leading-relaxed">
            By continuing, you agree to MBM Gifts'<br />
            <button type="button" onClick={() => setLegalModal('terms')} className="underline hover:text-[#241A15] transition-colors cursor-pointer">Terms of Service</button> and <button type="button" onClick={() => setLegalModal('privacy')} className="underline hover:text-[#241A15] transition-colors cursor-pointer">Privacy Policy</button>.
          </div>
        </div>
      </div>

      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </div>
  );
};

