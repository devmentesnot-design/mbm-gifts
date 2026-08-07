import React from 'react';
import { ShieldAlert, ArrowLeft, Key, UserCheck, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AccessDeniedViewProps {
  session: any;
  onNavigate: (path: string) => void;
  onPromoteToAdmin: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  session,
  onNavigate,
  onPromoteToAdmin,
}) => {
  const userEmail = session?.user?.email || 'Logged In User';

  return (
    <div className="min-h-screen w-full bg-[#170204] text-white font-inter flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-[#2a0407] border border-amber-400/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Decorative Gold Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Shield Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-red-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-5 shadow-lg">
          <ShieldAlert className="w-10 h-10 text-amber-300" />
        </div>

        <h1 className="font-podium text-2xl sm:text-3xl font-bold tracking-wider text-white uppercase mb-2">
          Admin Role Required
        </h1>

        <p className="text-amber-200/80 text-xs sm:text-sm font-light mb-6 leading-relaxed">
          The route <code className="bg-black/50 px-2 py-1 rounded text-amber-300 font-mono text-xs">/admin</code> is strictly restricted to accounts with the <strong className="text-amber-300 font-bold">"admin"</strong> role in the database.
        </p>

        {/* Current Account Card */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-left mb-6 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50">Current Account:</span>
            <span className="text-white font-medium truncate max-w-[200px]">{userEmail}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50">Database Role:</span>
            <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
              Customer / Standard
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Grant Admin Access button for site owner */}
          <button
            onClick={onPromoteToAdmin}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#8c1119] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Enable Admin Role For This Account</span>
          </button>

          <button
            onClick={() => onNavigate('/login?redirect=/admin')}
            className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Key className="w-4 h-4 text-amber-300" />
            <span>Switch / Login as Admin</span>
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="w-full py-2.5 px-4 bg-transparent hover:bg-white/5 text-white/70 hover:text-white text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Store Front</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[11px]">
          <span className="text-white/40">MBM GIFTS Security</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
