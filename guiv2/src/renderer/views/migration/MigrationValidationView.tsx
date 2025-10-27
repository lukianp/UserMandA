import React from 'react';
import { CheckCircle2, XCircle, PlayCircle, Download, Shield } from 'lucide-react';

import { useMigrationValidationLogic } from '../../hooks/useMigrationValidationLogic';
import { Button } from '../../components/atoms/Button';

const MigrationValidationView: React.FC = () => {
  const logic = useMigrationValidationLogic();

  return (
    <div className="h-full flex flex-col" data-cy="validation-view" data-testid="validation-view">
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900">
        <div><h1 className="text-2xl font-bold">Pre-Migration Validation</h1></div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Download />} onClick={logic.handleExportReport} disabled={!logic.hasResults}>Export</Button>
          <Button icon={<PlayCircle />} onClick={logic.handleRunValidation} disabled={!logic.hasWaveSelected} loading={logic.isLoading}>Validate</Button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {!logic.hasWaveSelected ? (
          <div className="h-full flex items-center justify-center"><Shield className="w-16 h-16 opacity-50" /></div>
        ) : !logic.hasResults ? (
          <div className="h-full flex items-center justify-center"><p>Click Validate</p></div>
        ) : (
          <div>
            {logic.filteredChecks.map((c: any, i: number) => (
              <div key={i} className="p-4 mb-2 border rounded">
                {c.passed ? <CheckCircle2 /> : <XCircle />}
                <h3>{c.name}</h3>
                <p>{c.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationValidationView;
