import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '@/types';

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
};

const STORAGE_KEYS = {
  CURRENT_ROLE: '@app:current_role',
  HAS_ONBOARDED: '@app:has_onboarded',
  BUSINESS_PROFILE: '@app:business_profile',
  USER_EMAIL: '@app:user_email',
  USER_NAME: '@app:user_name',
} as const;

export const [AppProvider, useApp] = createContextHook(() => {
  const [appState, setAppState] = useState<AppState>({
    currentRole: null,
    hasCompletedOnboarding: false,
    businessProfile: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPersistedState();
  }, []);

  const loadPersistedState = async () => {
    try {
      console.log('[AppProvider] Loading persisted state');
      const [role, hasOnboarded, businessProfile] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ROLE),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.BUSINESS_PROFILE),
      ]);

      setAppState({
        currentRole: role as UserRole | null,
        hasCompletedOnboarding: hasOnboarded === 'true',
        businessProfile: businessProfile ? JSON.parse(businessProfile) : null,
      });
      console.log('[AppProvider] State loaded:', { role, hasOnboarded });
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
        STORAGE_KEYS.USER_EMAIL,
        STORAGE_KEYS.USER_NAME,
      ]);
      setAppState({
        currentRole: null,
        hasCompletedOnboarding: false,
        businessProfile: null,
      });
    } catch (error) {
      console.error('[AppProvider] Error resetting app:', error);
    }
  }, []);

  return useMemo(
    () => ({
      currentRole: appState.currentRole,
      hasCompletedOnboarding: appState.hasCompletedOnboarding,
      businessProfile: appState.businessProfile,
      isLoading,
      setRole,
      setBusinessProfile,
      resetApp,
    }),
    [appState, isLoading, setRole, setBusinessProfile, resetApp]
  );
});
