import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DatabaseDebugProps {
  session: any;
}

export const DatabaseDebug: React.FC<DatabaseDebugProps> = ({ session }) => {
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    const newStatus: any = {};

    try {
      // Check profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');
      
      newStatus.profiles = {
        exists: !profileError,
        count: profiles?.length || 0,
        myProfile: profiles?.find(p => p.id === session?.user?.id),
        error: profileError?.message
      };

      // Check packages
      const { data: packages, error: pkgError } = await supabase
        .from('prepared_packages')
        .select('*');
      
      newStatus.packages = {
        exists: !pkgError,
        count: packages?.length || 0,
        error: pkgError?.message
      };

      // Check custom items
      const { data: items, error: itemError } = await supabase
        .from('custom_box_options')
        .select('*');
      
      newStatus.customItems = {
        exists: !itemError,
        count: items?.length || 0,
        error: itemError?.message
      };

      // Check orders
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('*');
      
      newStatus.orders = {
        exists: !orderError,
        count: orders?.length || 0,
        error: orderError?.message
      };

      // Check categories
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');
      
      newStatus.categories = {
        exists: !catError,
        count: categories?.length || 0,
        error: catError?.message
      };

      // Check gift boxes
      const { data: boxes, error: boxError } = await supabase
        .from('gift_boxes')
        .select('*');
      
      newStatus.giftBoxes = {
        exists: !boxError,
        count: boxes?.length || 0,
        error: boxError?.message
      };

    } catch (err: any) {
      console.error('Debug check error:', err);
    }

    setStatus(newStatus);
    setLoading(false);
  };

  const createProfile = async () => {
    if (!session?.user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
          role: 'admin'
        }]);
      
      if (error) {
        console.error('Profile creation error:', error);
        alert('Error creating profile: ' + error.message);
      } else {
        alert('Profile created successfully!');
        checkStatus();
      }
    } catch (err) {
      console.error('Profile creation error:', err);
    }
  };

  useEffect(() => {
    if (session) {
      checkStatus();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
        <p className="text-blue-200 text-sm">Please sign in first to view database status</p>
      </div>
    );
  }

  const StatusIcon = ({ condition }: { condition: boolean }) => (
    condition ? (
      <CheckCircle className="w-4 h-4 text-emerald-400" />
    ) : (
      <XCircle className="w-4 h-4 text-red-400" />
    )
  );

  return (
    <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Database Debug</h3>
        <button
          onClick={checkStatus}
          disabled={loading}
          className="flex items-center gap-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 px-2 py-1 rounded text-purple-200 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <StatusIcon condition={status.profiles?.exists && status.profiles?.myProfile} />
          <span className="text-white/80">My Profile: {status.profiles?.myProfile ? '✓' : '✗'}</span>
        </div>

        <div className="flex items-center gap-2">
          <StatusIcon condition={status.packages?.count > 0} />
          <span className="text-white/80">Packages: {status.packages?.count || 0}</span>
        </div>

        <div className="flex items-center gap-2">
          <StatusIcon condition={status.customItems?.count > 0} />
          <span className="text-white/80">Items: {status.customItems?.count || 0}</span>
        </div>

        <div className="flex items-center gap-2">
          <StatusIcon condition={status.orders?.exists} />
          <span className="text-white/80">Orders: {status.orders?.count || 0}</span>
        </div>

        <div className="flex items-center gap-2">
          <StatusIcon condition={status.categories?.count > 0} />
          <span className="text-white/80">Categories: {status.categories?.count || 0}</span>
        </div>

        <div className="flex items-center gap-2">
          <StatusIcon condition={status.giftBoxes?.count > 0} />
          <span className="text-white/80">Gift Boxes: {status.giftBoxes?.count || 0}</span>
        </div>
      </div>

      {!status.profiles?.myProfile && status.profiles?.exists && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 text-xs font-semibold mb-1">Profile Not Found</p>
              <p className="text-red-200/80 text-xs mb-2">
                Your profile doesn't exist in the database. This means the trigger didn't fire.
              </p>
              <button
                onClick={createProfile}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-1 rounded text-xs transition-colors"
              >
                Create Profile Manually
              </button>
            </div>
          </div>
        </div>
      )}

      {Object.values(status).some((s: any) => s?.error) && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
          <p className="text-yellow-300 text-xs font-semibold mb-1">Errors Detected:</p>
          {Object.entries(status).map(([key, value]: [string, any]) => 
            value?.error && (
              <p key={key} className="text-yellow-200/80 text-xs">
                {key}: {value.error}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
};