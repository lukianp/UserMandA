/**
 * About View Logic Hook
 *
 * Manages application information and system details.
 */

import { useState, useEffect } from 'react';

export interface AboutInfo {
  appName: string;
  appVersion: string;
  electronVersion: string;
  nodeVersion: string;
  chromeVersion: string;
  buildDate: string;
  author: string;
  description: string;
  license: string;
  homepage: string;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  osVersion: string;
  totalMemory: string;
  freeMemory: string;
  cpuCount: number;
}

export function useAboutLogic() {
  const [aboutInfo, setAboutInfo] = useState<AboutInfo>({
    appName: 'Enterprise Discovery Suite',
    appVersion: '2.0.0',
    electronVersion: process.versions.electron || 'N/A',
    nodeVersion: process.versions.node || 'N/A',
    chromeVersion: process.versions.chrome || 'N/A',
    buildDate: new Date().toISOString().split('T')[0],
    author: 'Enterprise Discovery Suite Team',
    description: 'M&A Intelligence & Integration Platform - Comprehensive IT Discovery, Due Diligence & Migration Execution',
    license: 'Enterprise License',
    homepage: 'https://github.com/enterprise/discovery-suite',
  });

  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppVersion();
    loadSystemInfo();
  }, []);

  const loadAppVersion = async () => {
    try {
      if (window.electronAPI?.getAppVersion) {
        const version = await window.electronAPI.getAppVersion();
        setAboutInfo(prev => ({ ...prev, appVersion: version }));
      }
    } catch (error) {
      console.error('Failed to load app version:', error);
    }
  };

  const loadSystemInfo = async () => {
    try {
      setIsLoading(true);

      // Get system info from main process if available
      // For now, use browser info
      const info: SystemInfo = {
        platform: navigator.platform,
        arch: navigator.userAgent.includes('x64') ? 'x64' : 'x86',
        osVersion: navigator.userAgent,
        totalMemory: `${(performance as any).memory?.jsHeapSizeLimit ?
          Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024) : 'N/A'} MB`,
        freeMemory: `${(performance as any).memory?.usedJSHeapSize ?
          Math.round(((performance as any).memory.jsHeapSizeLimit - (performance as any).memory.usedJSHeapSize) / 1024 / 1024) : 'N/A'} MB`,
        cpuCount: navigator.hardwareConcurrency || 1,
      };

      setSystemInfo(info);
    } catch (error) {
      setError('Failed to load system information');
      console.error('Failed to load system info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openHomepage = () => {
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(aboutInfo.homepage);
    }
  };

  const copySystemInfo = () => {
    const info = {
      ...aboutInfo,
      ...systemInfo,
    };
    navigator.clipboard.writeText(JSON.stringify(info, null, 2));
  };

  return {
    aboutInfo,
    systemInfo,
    isLoading,
    error,
    openHomepage,
    copySystemInfo,
    refresh: loadSystemInfo,
  };
}
