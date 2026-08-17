import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Shield, Check, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfilePageProps {
  session: any;
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ session, onNavigate }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');

  useEffect(() => {
    if (session?.user) {
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (fetchError) {
        console.error('Profile fetch error:', fetchError);
        setError('Failed to load profile');
      } else if (data) {
        setProfile(data);
        setRole(data.role || 'customer');
      }
    } catch (err: any) {
      console.error('Profile load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async () => {
    try {
      setSaving(true);
      setMessage('');
      setError('');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', session.user.id);

      if (updateError) {
        setError('Failed to update role: ' + updateError.message);
      } else {
        setMessage('Role updated successfully! Refresh the page to see changes.');
        // Update localStorage for immediate effect
        localStorage.setItem(`mbm_user_role_${session.user.id}`, role);
        localStorage.setItem('mbm_global_role', role);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const avatar = session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture;
  const fullName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || 'User';
  const email = session?.user?.email;

  return (
    <div className="min-h-screen bg-transparent text-[#FFF8ED] font-inter selection:bg-[#D9A514] selection:text-[#2B0005]">
      {/* Header */}
      <div className="border-b border-[#D9A514]/20 bg-[#2B0005]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer text-xs sm:text-sm uppercase tracking-wider font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-amber-300" />
            <span>Back</span>
          </button>

          <h1 className="font-podium text-xl uppercase tracking-wider text-[#FFF8ED]">My Profile</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="luxury-satin-card border border-[#D9A514]/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-6 mb-8">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-400/50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-[#8c1119] font-extrabold flex items-center justify-center text-3xl">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h2 className="font-podium text-2xl uppercase text-white mb-1">{fullName}</h2>
                  <p className="text-white/60 text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {email}
                  </p>
                </div>
              </div>

              {/* Role Section */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-lg uppercase tracking-wider">Account Role</h3>
                </div>

                <p className="text-white/60 text-xs mb-4">
                  Change your account role to access different features. Admin role gives you access to the admin dashboard.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Customer Role */}
                  <button
                    onClick={() => setRole('customer')}
                    className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                      role === 'customer'
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-white/10 bg-black/20 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <User className="w-6 h-6 text-amber-300" />
                      {role === 'customer' && (
                        <Check className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white mb-1">Customer</div>
                      <div className="text-xs text-white/60">Browse and order gifts</div>
                    </div>
                  </button>

                  {/* Admin Role */}
                  <button
                    onClick={() => setRole('admin')}
                    className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-white/10 bg-black/20 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="w-6 h-6 text-amber-300" />
                      {role === 'admin' && (
                        <Check className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white mb-1">Admin</div>
                      <div className="text-xs text-white/60">Full dashboard access</div>
                    </div>
                  </button>
                </div>

                {message && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4 flex items-center gap-2 text-emerald-300 text-sm">
                    <Check className="w-4 h-4" />
                    <span>{message}</span>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-300 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleSaveRole}
                  disabled={saving || role === profile?.role}
                  className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-white/10 disabled:text-white/40 text-[#8c1119] font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-blue-200">
                  <p className="font-bold mb-1">Database Setup Required</p>
                  <p className="text-blue-200/80 text-xs leading-relaxed">
                    To use role management, make sure you've created the profiles table in Supabase. 
                    Check <code className="bg-black/30 px-1 py-0.5 rounded">SUPABASE_SETUP.md</code> for instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
