/**
 * Settings View Logic Hook
 * Application settings and preferences management
 */

import { useState, useEffect, useCallback } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { ApplicationSettings } from '../types/models/discovery';

export const useSettingsLogic = () => {
  const { theme, setTheme } = useThemeStore();

  const [settings, setSettings] = useState<ApplicationSettings>({
    theme: {
      isDarkTheme: theme === 'dark',
      accentColor: '#3B82F6',
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      useAnimations: true,
      windowOpacity: 1.0,
    },
    autoRefreshDashboard: true,
    refreshInterval: 30,
    enableNotifications: true,
    defaultExportFormat: 'CSV',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await window.electronAPI.getConfig('applicationSettings');
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  const updateSetting = useCallback(<K extends keyof ApplicationSettings>(
    key: K,
    value: ApplicationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

  const updateThemeSetting = useCallback(<K extends keyof ApplicationSettings['theme']>(
    key: K,
    value: ApplicationSettings['theme'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      theme: { ...prev.theme, [key]: value },
    }));
    setHasChanges(true);
    setSaveSuccess(false);

    // Apply theme changes immediately
    if (key === 'isDarkTheme') {
      setTheme(value ? 'dark' : 'light');
    }
  }, [setTheme]);

  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await window.electronAPI.setConfig('applicationSettings', settings);
      setHasChanges(false);
      setSaveSuccess(true);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const resetSettings = useCallback(() => {
    const defaultSettings: ApplicationSettings = {
      theme: {
        isDarkTheme: false,
        accentColor: '#3B82F6',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        useAnimations: true,
        windowOpacity: 1.0,
      },
      autoRefreshDashboard: true,
      refreshInterval: 30,
      enableNotifications: true,
      defaultExportFormat: 'CSV',
    };
    setSettings(defaultSettings);
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

  return {
    settings,
    updateSetting,
    updateThemeSetting,
    saveSettings,
    resetSettings,
    isSaving,
    hasChanges,
    saveSuccess,
  };
};
