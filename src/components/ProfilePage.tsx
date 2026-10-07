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
    <div className="min-h-screen bg-transparent text-[#241A15] font-inter selection:bg-[#E6D5B8] selection:text-[#241A15]">
      {/* Header */}
      <div className="border-b border-[#D8C6A8]/60 bg-[#FBF8F2]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-[#756457] hover:text-[#241A15] transition-colors cursor-pointer text-xs sm:text-sm uppercase tracking-wider font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-[#8E6E2F]" />
            <span>Back</span>
          </button>

          <h1 className="font-podium text-xl uppercase tracking-wider text-[#241A15]">My Profile</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#8E6E2F]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-[#FBF8F2] border border-[#D8C6A8] rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-6 mb-8">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#B8944A]/60 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#DCC39A] to-[#E6D5B8] text-[#241A15] font-extrabold flex items-center justify-center text-3xl shadow-md">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h2 className="font-podium text-2xl uppercase text-[#241A15] mb-1">{fullName}</h2>
                  <p className="text-[#756457] text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#8E6E2F]" />
                    {email}
                  </p>
                </div>
              </div>

              {/* Role Section */}
              <div className="border-t border-[#D8C6A8]/40 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-[#8E6E2F]" />
                  <h3 className="font-bold text-lg uppercase tracking-wider text-[#241A15]">Account Role</h3>
                </div>

                <p className="text-[#756457] text-xs mb-4">
                  Change your account role to access different features. Admin role gives you access to the admin dashboard.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Customer Role */}
                  <button
                    onClick={() => setRole('customer')}
                    className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                      role === 'customer'
                        ? 'border-[#B8944A] bg-[#E6D5B8]/30'
                        : 'border-[#D8C6A8]/60 bg-[#FAF6EE] hover:border-[#D8C6A8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <User className="w-6 h-6 text-[#8E6E2F]" />
                      {role === 'customer' && (
                        <Check className="w-5 h-5 text-[#8E6E2F]" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-[#241A15] mb-1">Customer</div>
                      <div className="text-xs text-[#756457]">Browse and order gifts</div>
                    </div>
                  </button>

                  {/* Admin Role */}
                  <button
                    onClick={() => setRole('admin')}
                    className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'border-[#B8944A] bg-[#E6D5B8]/30'
                        : 'border-[#D8C6A8]/60 bg-[#FAF6EE] hover:border-[#D8C6A8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="w-6 h-6 text-[#8E6E2F]" />
                      {role === 'admin' && (
                        <Check className="w-5 h-5 text-[#8E6E2F]" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-[#241A15] mb-1">Admin</div>
                      <div className="text-xs text-[#756457]">Full dashboard access</div>
                    </div>
                  </button>
                </div>

                {message && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4 flex items-center gap-2 text-emerald-800 text-sm">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{message}</span>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-800 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleSaveRole}
                  disabled={saving || role === profile?.role}
                  className="w-full bg-[#241A15] hover:bg-[#3A2A20] disabled:bg-[#D8C6A8]/40 disabled:text-[#756457] text-[#FBF8F2] font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-md"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E6D5B8]" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#E6D5B8]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-[#FAF6EE] border border-[#D8C6A8] rounded-xl p-4 text-sm text-[#3A2A20]">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-[#8E6E2F] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1 text-[#241A15]">Database Setup Required</p>
                  <p className="text-[#756457] text-xs leading-relaxed">
                    To use role management, make sure you've created the profiles table in Supabase. 
                    Check <code className="bg-[#E6D5B8]/40 px-1 py-0.5 rounded text-[#241A15]">SUPABASE_SETUP.md</code> for instructions.
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
