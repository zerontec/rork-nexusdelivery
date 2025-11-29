import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type BusinessProfile = {
  id: string;
  businessName: string;
  businessType: string;
  phone: string;
  email: string;
  address: string;
  isApproved: boolean;
};

type AppState = {
  currentRole: UserRole | null;
  hasCompletedOnboarding: boolean;
  businessProfile: BusinessProfile | null;
  session: Session | null;
  user: User | null;
};

const STORAGE_KEYS = {
  CURRENT_ROLE: '@app:current_role',
  HAS_ONBOARDED: '@app:has_onboarded',
  BUSINESS_PROFILE: '@app:business_profile',
} as const;

export const [AppProvider, useApp] = createContextHook(() => {
  const [appState, setAppState] = useState<AppState>({
    currentRole: null,
    hasCompletedOnboarding: false,
    businessProfile: null,
    session: null,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AppProvider] Auth state changed:', _event);

      if (session?.user) {
        // Check metadata first for immediate role availability
        const metadataRole = session.user.user_metadata?.role;

        if (metadataRole) {
          console.log('[AppProvider] Found role in metadata:', metadataRole);

          let businessProfileData: BusinessProfile | null = null;
          if (metadataRole === 'business') {
            const { data: business } = await supabase
              .from('businesses')
              .select('*')
              .eq('owner_id', session.user.id)
              .single();

            if (business) {
              businessProfileData = {
                id: business.id,
                businessName: business.name,
                businessType: business.type,
                phone: business.phone || '',
                email: business.email || '',
                address: business.location?.address || '',
                isApproved: true, // Assuming true for now
              };
            }
          }

          // Map 'customer' to 'client' for backward compatibility
          const role = metadataRole === 'customer' ? 'client' : metadataRole;

          setAppState(prev => ({
            ...prev,
            session,
            user: session.user,
            currentRole: role as UserRole,
            businessProfile: businessProfileData || prev.businessProfile,
          }));
        } else {
          // Fallback to fetching profile if not in metadata
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profile?.role) {
            let businessProfileData: BusinessProfile | null = null;
            if (profile.role === 'business') {
              const { data: business } = await supabase
                .from('businesses')
                .select('*')
                .eq('owner_id', session.user.id)
                .single();

              if (business) {
                businessProfileData = {
                  id: business.id,
                  businessName: business.name,
                  businessType: business.type,
                  phone: business.phone || '',
                  email: business.email || '',
                  address: business.location?.address || '',
                  isApproved: true,
                };
              }
            }

            // Map 'customer' to 'client' for backward compatibility
            const role = profile.role === 'customer' ? 'client' : profile.role;

            setAppState(prev => ({
              ...prev,
              session,
              user: session.user,
              currentRole: role as UserRole,
              businessProfile: businessProfileData || prev.businessProfile,
            }));
          } else {
            setAppState(prev => ({ ...prev, session, user: session.user }));
          }
        }
      } else {
        setAppState(prev => ({
          ...prev,
          session: null,
          user: null,
          currentRole: null // Reset role on logout
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadState = async () => {
    try {
      console.log('[AppProvider] Loading state');
      const [role, hasOnboarded, businessProfile] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ROLE),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.BUSINESS_PROFILE),
      ]);

      // Check for active session
      const { data: { session } } = await supabase.auth.getSession();

      setAppState(prev => ({
        ...prev,
        currentRole: (role as UserRole) || prev.currentRole,
        hasCompletedOnboarding: hasOnboarded === 'true',
        businessProfile: businessProfile ? JSON.parse(businessProfile) : null,
        session,
        user: session?.user || null,
      }));

    } catch (error) {
      console.error('[AppProvider] Error loading state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setRole = useCallback(async (role: UserRole) => {
    console.log('[AppProvider] Setting role:', role);
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role),
        AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, 'true'),
      ]);

      // If logged in, update profile in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({ id: user.id, role, updated_at: new Date() });

        if (error) console.error('[AppProvider] Error updating profile role:', error);
      }

      setAppState((prev) => ({
        ...prev,
        currentRole: role,
        hasCompletedOnboarding: true,
      }));
    } catch (error) {
      console.error('[AppProvider] Error setting role:', error);
    }
  }, []);

  const setBusinessProfile = useCallback(async (profile: BusinessProfile) => {
    console.log('[AppProvider] Setting business profile:', profile);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BUSINESS_PROFILE, JSON.stringify(profile));

      // If logged in, update business in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Assuming business table is linked to user
        const { error } = await supabase
          .from('businesses')
          .upsert({
            owner_id: user.id,
            name: profile.businessName,
            type: profile.businessType,
            // ... map other fields
          });
        if (error) console.error('[AppProvider] Error updating business profile:', error);
      }

      setAppState((prev) => ({
        ...prev,
        businessProfile: profile,
      }));
    } catch (error) {
      console.error('[AppProvider] Error setting business profile:', error);
    }
  }, []);

  const resetApp = useCallback(async () => {
    console.log('[AppProvider] Resetting app');
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CURRENT_ROLE,
        STORAGE_KEYS.HAS_ONBOARDED,
        STORAGE_KEYS.BUSINESS_PROFILE,
      ]);
      await supabase.auth.signOut();

      setAppState({
        currentRole: null,
        hasCompletedOnboarding: false,
        businessProfile: null,
        session: null,
        user: null,
      });
    } catch (error) {
      console.error('[AppProvider] Error resetting app:', error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    console.log('[AppProvider] Refreshing profile...');
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch profile to get role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        let role = profile?.role || session.user.user_metadata?.role;
        // Map 'customer' to 'client' for backward compatibility
        if (role === 'customer') role = 'client';

        if (role === 'business') {
          const { data: business } = await supabase
            .from('businesses')
            .select('*')
            .eq('owner_id', session.user.id)
            .single();

          if (business) {
            const businessProfileData = {
              id: business.id,
              businessName: business.name,
              businessType: business.type,
              phone: business.phone || '',
              email: business.email || '',
              address: business.location?.address || '',
              isApproved: true,
            };

            await AsyncStorage.setItem(STORAGE_KEYS.BUSINESS_PROFILE, JSON.stringify(businessProfileData));

            setAppState(prev => ({
              ...prev,
              session,
              user: session.user,
              currentRole: role as UserRole,
              businessProfile: businessProfileData,
            }));
            return;
          }
        }

        setAppState(prev => ({
          ...prev,
          session,
          user: session.user,
          currentRole: role as UserRole,
        }));
      }
    } catch (error) {
      console.error('[AppProvider] Error refreshing profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return useMemo(
    () => ({
      currentRole: appState.currentRole,
      hasCompletedOnboarding: appState.hasCompletedOnboarding,
      businessProfile: appState.businessProfile,
      session: appState.session,
      user: appState.user,
      isLoading,
      setRole,
      setBusinessProfile,
      resetApp,
      refreshProfile,
    }),
    [appState, isLoading, setRole, setBusinessProfile, resetApp, refreshProfile]
  );
});
