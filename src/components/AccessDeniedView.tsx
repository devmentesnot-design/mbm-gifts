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
    <div className="min-h-screen w-full bg-[#FAF6EE] text-[#241A15] font-inter flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-[#FBF8F2] border border-[#D8C6A8] rounded-2xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Decorative Champagne Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#E6D5B8]/40 rounded-full blur-2xl pointer-events-none" />

        {/* Shield Icon */}
        <div className="w-20 h-20 rounded-2xl bg-[#E6D5B8] border border-[#D8C6A8] flex items-center justify-center mx-auto mb-5 shadow-md">
          <ShieldAlert className="w-10 h-10 text-[#8E6E2F]" />
        </div>

        <h1 className="font-podium text-2xl sm:text-3xl font-bold tracking-wider text-[#241A15] uppercase mb-2">
          Admin Role Required
        </h1>

        <p className="text-[#756457] text-xs sm:text-sm font-light mb-6 leading-relaxed">
          The route <code className="bg-[#FAF6EE] border border-[#D8C6A8]/60 px-2 py-1 rounded text-[#8E6E2F] font-mono text-xs">/admin</code> is strictly restricted to accounts with the <strong className="text-[#241A15] font-bold">"admin"</strong> role in the database.
        </p>

        {/* Current Account Card */}
        <div className="bg-[#FAF6EE] border border-[#D8C6A8] rounded-xl p-4 text-left mb-6 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#756457]">Current Account:</span>
            <span className="text-[#241A15] font-semibold truncate max-w-[200px]">{userEmail}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#756457]">Database Role:</span>
            <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
              Customer / Standard
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Grant Admin Access button for site owner */}
          <button
            onClick={onPromoteToAdmin}
            className="w-full py-3 px-4 bg-[#241A15] hover:bg-[#3A2A20] text-[#FBF8F2] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-[#E6D5B8]" />
            <span>Enable Admin Role For This Account</span>
          </button>

          <button
            onClick={() => onNavigate('/login?redirect=/admin')}
            className="w-full py-2.5 px-4 bg-[#E6D5B8]/50 hover:bg-[#E6D5B8]/80 border border-[#D8C6A8] text-[#241A15] font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Key className="w-4 h-4 text-[#8E6E2F]" />
            <span>Switch / Login as Admin</span>
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="w-full py-2.5 px-4 bg-transparent hover:bg-[#E6D5B8]/20 text-[#756457] hover:text-[#241A15] text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Store Front</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[#D8C6A8]/40 flex justify-between items-center text-[11px]">
          <span className="text-[#756457]">MBM GIFTS Security</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
