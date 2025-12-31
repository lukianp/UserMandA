/**
 * PowerShell Execution Dialog
 * Displays PowerShell script execution output with controls
 * Inspired by GUI/Windows/PowerShellWindow.xaml
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Copy, Trash2, X, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../atoms/Button';

export interface PowerShellLog {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export interface PowerShellExecutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scriptName: string;
  scriptDescription?: string;
  logs: PowerShellLog[];
  isRunning: boolean;
  isCancelling: boolean;
  progress?: {
    percentage: number;
    message: string;
  };
  onStart?: () => void;
  onStop?: () => void;
  onClear?: () => void;
  showStartButton?: boolean;
}

export const PowerShellExecutionDialog: React.FC<PowerShellExecutionDialogProps> = ({
  isOpen,
  onClose,
  scriptName,
  scriptDescription,
  logs,
  isRunning,
  isCancelling,
  progress,
  onStart,
  onStop,
  onClear,
  showStartButton = false,
}) => {
  const outputRef = useRef<HTMLDivElement>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Handle scroll - disable auto-scroll if user scrolls up
  const handleScroll = () => {
    if (outputRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = outputRef.current;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      setAutoScroll(isAtBottom);
    }
  };

  // Copy all output to clipboard
  const handleCopyAll = async () => {
    const text = logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Export logs to file
  const handleExport = () => {
    const text = logs.map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scriptName.replace(/\s+/g, '_')}_${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-5xl h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {isRunning ? (
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {scriptName}
            </h2>
            {scriptDescription && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {scriptDescription}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="w-5 h-5" />}
            disabled={isRunning}
          />
        </div>

        {/* Progress Bar */}
        {isRunning && progress && (
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">{progress.message}</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {progress.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Output Area */}
        <div
          ref={outputRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto p-4 bg-gray-900 dark:bg-black font-mono text-sm"
          style={{ scrollBehavior: 'smooth' }}
        >
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                {showStartButton
                  ? 'Click "Start Discovery" to begin execution...'
                  : 'Waiting for output...'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.level === 'error'
                      ? 'text-red-400'
                      : log.level === 'warning'
                      ? 'text-yellow-400'
                      : log.level === 'success'
                      ? 'text-green-400'
                      : 'text-gray-300'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-2">
            {showStartButton && !isRunning && onStart && (
              <Button
                variant="primary"
                size="sm"
                onClick={onStart}
                icon={<Play className="w-4 h-4" />}
              >
                Start Discovery
              </Button>
            )}
            {isRunning && onStop && (
              <Button
                variant="danger"
                size="sm"
                onClick={onStop}
                disabled={isCancelling}
                loading={isCancelling}
                icon={<Square className="w-4 h-4" />}
              >
                {isCancelling ? 'Stopping...' : 'Stop'}
              </Button>
            )}
            {!isRunning && logs.length > 0 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyAll}
                  icon={copyFeedback ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {copyFeedback ? 'Copied!' : 'Copy All'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExport}
                  icon={<Download className="w-4 h-4" />}
                >
                  Export
                </Button>
                {onClear && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onClear}
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    Clear
                  </Button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {logs.length} log entries
            </div>
            {!autoScroll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAutoScroll(true);
                  if (outputRef.current) {
                    outputRef.current.scrollTop = outputRef.current.scrollHeight;
                  }
                }}
              >
                ↓ Scroll to Bottom
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerShellExecutionDialog;


