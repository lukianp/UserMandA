import React from 'react';
import { Info, Package, Code, Globe, Mail, ExternalLink, Shield, Zap } from 'lucide-react';

import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';

export const AboutView: React.FC = () => {
  const appInfo = {
    name: 'M&A Discovery Suite',
    version: '2.0.0',
    buildDate: '2025-10-04',
    buildNumber: '2025.10.04.1',
    environment: process.env.NODE_ENV || 'production',
    electronVersion: process.versions.electron || 'N/A',
    chromeVersion: process.versions.chrome || 'N/A',
    nodeVersion: process.versions.node || 'N/A',
    platform: process.platform,
    architecture: process.arch,
  };

  const features = [
    { icon: Zap, title: 'Lightning Fast', description: 'Built with Electron and React for maximum performance' },
    { icon: Shield, title: 'Enterprise Security', description: 'Role-based access control and audit logging' },
    { icon: Globe, title: 'Multi-Cloud Support', description: 'Azure AD, AWS, Google Workspace discovery' },
    { icon: Code, title: 'PowerShell Integration', description: 'Native PowerShell module execution' },
  ];

  const dependencies = [
    { name: 'Electron', version: '38.2.0', license: 'MIT' },
    { name: 'React', version: '18.3.1', license: 'MIT' },
    { name: 'TypeScript', version: '4.5.4', license: 'Apache-2.0' },
    { name: 'Zustand', version: '5.0.8', license: 'MIT' },
    { name: 'AG Grid', version: '34.2.0', license: 'Commercial' },
    { name: 'Tailwind CSS', version: '3.4.18', license: 'MIT' },
    { name: 'Recharts', version: '3.2.1', license: 'MIT' },
    { name: 'Lucide React', version: '0.544.0', license: 'ISC' },
  ];

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto" data-testid="about-view" data-cy="about-view">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
            <Package className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{appInfo.name}</h1>
            <p className="text-blue-100">Enterprise Migration & Discovery Platform</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Badge variant="default" className="bg-white/20 text-white">
            Version {appInfo.version}
          </Badge>
          <Badge variant="default" className="bg-white/20 text-white">
            Build {appInfo.buildNumber}
          </Badge>
          <Badge variant="default" className="bg-white/20 text-white">
            {appInfo.environment}
          </Badge>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">System Information</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Electron Version</div>
              <div className="font-mono text-gray-900 dark:text-white">{appInfo.electronVersion}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Chrome Version</div>
              <div className="font-mono text-gray-900 dark:text-white">{appInfo.chromeVersion}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Node.js Version</div>
              <div className="font-mono text-gray-900 dark:text-white">{appInfo.nodeVersion}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Platform</div>
              <div className="font-mono text-gray-900 dark:text-white">{appInfo.platform} ({appInfo.architecture})</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Build Date</div>
              <div className="font-mono text-gray-900 dark:text-white">{appInfo.buildDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dependencies */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Core Dependencies</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  License
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {dependencies.map((dep, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {dep.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {dep.version}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant="info">{dep.license}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Links */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Resources</h2>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Globe />}>
            Documentation
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="secondary" icon={<Code />}>
            GitHub Repository
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="secondary" icon={<Mail />}>
            Support
          </Button>
          <Button variant="secondary" icon={<Info />}>
            Release Notes
          </Button>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p>© 2024-2025 M&A Discovery Suite. All rights reserved.</p>
        <p className="mt-1">Built with ❤️ using Electron, React, and TypeScript</p>
      </div>
    </div>
  );
};


export default AboutView;
