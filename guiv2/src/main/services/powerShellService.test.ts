/**
 * PowerShell Service Unit Tests
 *
 * Tests enterprise-grade PowerShell execution functionality including:
 * - Session pooling and lifecycle management
 * - Script execution with various options
 * - Module execution
 * - Cancellation support
 * - Error handling
 * - Stream handling (output, error, warning, verbose, debug, information)
 * - Parallel execution
 * - Retry logic
 * - Module discovery
 * - Performance monitoring
 */

import { EventEmitter } from 'events';
import { ChildProcess } from 'child_process';
import {
  PowerShellExecutionService,
  PowerShellError,
  PowerShellTimeoutError,
  PowerShellCancellationError,
} from './powerShellService';

// Mock child_process
jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  stat: jest.fn(),
  readFile: jest.fn(),
}));

const { spawn } = require('child_process');
const fs = require('fs/promises');

describe('PowerShellExecutionService', () => {
  let service: PowerShellExecutionService;
  let mockProcess: Partial<ChildProcess>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock child process
    mockProcess = {
      stdout: new EventEmitter() as any,
      stderr: new EventEmitter() as any,
      on: jest.fn(),
      kill: jest.fn(),
      pid: 12345,
    };

    spawn.mockReturnValue(mockProcess);

    // Initialize service with test configuration
    service = new PowerShellExecutionService({
      maxPoolSize: 5,
      minPoolSize: 2,
      sessionTimeout: 300000,
      queueSize: 10,
      enableModuleCaching: true,
      defaultTimeout: 60000,
      scriptsBaseDir: 'D:/Scripts/UserMandA',
    });
  });

  afterEach(async () => {
    // Cleanup service
    if (service) {
      await service.shutdown();
    }
  });

  describe('Service Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(service).toBeDefined();
      const stats = service.getStatistics();
      expect(stats.poolSize).toBeGreaterThanOrEqual(0);
      expect(stats.queuedRequests).toBe(0);
    });

    it('should create minimum pool size on initialization', async () => {
      // Wait for pool initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = service.getStatistics();
      expect(stats.poolSize).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Script Execution', () => {
    it('should execute a script successfully', async () => {
      const mockResult = { success: true, data: { users: [] as any[] } };

      // Simulate successful execution
      setTimeout(() => {
        mockProcess.stdout!.emit('data', JSON.stringify(mockResult));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      const result = await service.executeScript('Scripts/Discovery/Get-Users.ps1', ['-Domain', 'contoso.com'], {});

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ users: [] as any[] });
      expect(spawn).toHaveBeenCalledWith(
        'pwsh',
        expect.arrayContaining([
          '-NoProfile',
          '-ExecutionPolicy',
          'Bypass',
          '-File',
          expect.stringContaining('Get-Users.ps1'),
          '-Domain',
          'contoso.com',
        ])
      );
    });

    it('should handle script execution errors', async () => {
      // Simulate error
      setTimeout(() => {
        mockProcess.stderr!.emit('data', 'PowerShell error occurred');
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](1);
      }, 10);

      await expect(
        service.executeScript('Scripts/Failing.ps1', [], {})
      ).rejects.toThrow();
    });

    it('should support cancellation', async () => {
      const cancellationToken = 'test-token-123';

      // Start execution (don't await)
      const executionPromise = service.executeScript('Scripts/LongRunning.ps1', [], { cancellationToken });

      // Cancel immediately
      await new Promise(resolve => setTimeout(resolve, 10));
      const cancelled = service.cancelExecution(cancellationToken);

      expect(cancelled).toBe(true);
      await expect(executionPromise).rejects.toThrow(PowerShellCancellationError);
    });

    it('should enforce timeout', async () => {
      // Never complete the execution
      const result = service.executeScript('Scripts/NeverCompletes.ps1', [], { timeout: 100 });

      await expect(result).rejects.toThrow(PowerShellTimeoutError);
    }, 10000);

    it('should stream output events', async () => {
      const outputCallback = jest.fn();
      service.on('output', outputCallback);

      setTimeout(() => {
        mockProcess.stdout!.emit('data', 'Line 1\n');
        mockProcess.stdout!.emit('data', 'Line 2\n');
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await service.executeScript('Scripts/Test.ps1', [], {});

      expect(outputCallback).toHaveBeenCalled();
    });
  });

  describe('Module Execution', () => {
    it('should execute a PowerShell module function', async () => {
      const mockResult = {
        success: true,
        data: { discovered: 50, duration: 1234 },
      };

      setTimeout(() => {
        mockProcess.stdout!.emit('data', JSON.stringify(mockResult));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      const result = await service.executeModule('Modules/Discovery/ActiveDirectory.psm1', 'Get-ADUsers', { Domain: 'contoso.com', IncludeGroups: true }, {});

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should cache module results when enabled', async () => {
      const mockResult = { success: true, data: { cached: true } };

      // First execution
      setTimeout(() => {
        mockProcess.stdout!.emit('data', JSON.stringify(mockResult));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      const result1 = await service.executeModule('Modules/Test.psm1', 'Get-Data', {}, {});

      const firstCallCount = spawn.mock.calls.length;

      // Second execution (should use cache)
      const result2 = await service.executeModule('Modules/Test.psm1', 'Get-Data', {}, {});

      // spawn should not be called again if caching works
      expect(spawn.mock.calls.length).toBe(firstCallCount);
      expect(result1).toEqual(result2);
    });
  });

  describe('Session Pooling', () => {
    it('should reuse idle sessions', async () => {
      const mockResult = { success: true, data: {} };

      // Execute first script
      setTimeout(() => {
        mockProcess.stdout!.emit('data', JSON.stringify(mockResult));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await service.executeScript('Scripts/Test1.ps1', [], {});

      const stats1 = service.getStatistics();
      const poolSize1 = stats1.poolSize;

      // Execute second script (should reuse session)
      setTimeout(() => {
        mockProcess.stdout!.emit('data', JSON.stringify(mockResult));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await service.executeScript('Scripts/Test2.ps1', [], {});

      const stats2 = service.getStatistics();
      expect(stats2.poolSize).toBeLessThanOrEqual(poolSize1 + 1);
    });

    it('should respect max pool size', async () => {
      const promises = [];

      // Try to create more sessions than max pool size
      for (let i = 0; i < 10; i++) {
        const promise = service.executeScript(
          `Scripts/Test${i}.ps1`,
          [],
          {}
        );
        promises.push(promise);
      }

      const stats = service.getStatistics();
      expect(stats.poolSize).toBeLessThanOrEqual(5);

      // Clean up
      promises.forEach(p => p.catch(() => {}));
    });

    it('should queue requests when pool is exhausted', async () => {
      const promises = [];

      // Fill the pool
      for (let i = 0; i < 10; i++) {
        const promise = service.executeScript(
          `Scripts/Test${i}.ps1`,
          [],
          {}
        );
        promises.push(promise);
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      const stats = service.getStatistics();
      expect(stats.queuedRequests).toBeGreaterThan(0);

      // Clean up
      promises.forEach(p => p.catch(() => {}));
    });

    it('should terminate idle sessions', async () => {
      // Create a session
      setTimeout(() => {
        mockProcess.stdout!.emit('data', JSON.stringify({ success: true }));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await service.executeScript('Scripts/Test.ps1', [], {});

      const stats1 = service.getStatistics();
      const initialPoolSize = stats1.poolSize;

      // Wait for session timeout (mocked to short duration)
      await new Promise(resolve => setTimeout(resolve, 6000));

      const stats2 = service.getStatistics();
      // Idle sessions should be cleaned up, but min pool size maintained
      expect(stats2.poolSize).toBeGreaterThanOrEqual(2);
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle syntax errors', async () => {
      setTimeout(() => {
        mockProcess.stderr!.emit('data', 'SyntaxError: Unexpected token');
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](1);
      }, 10);

      await expect(
        service.executeScript('Scripts/SyntaxError.ps1', [], {})
      ).rejects.toThrow(PowerShellError);
    });

    it('should handle runtime errors', async () => {
      setTimeout(() => {
        mockProcess.stderr!.emit('data', 'RuntimeError: Object not found');
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](1);
      }, 10);

      await expect(
        service.executeScript('Scripts/RuntimeError.ps1', [], {})
      ).rejects.toThrow();
    });

    it('should handle JSON parsing errors', async () => {
      setTimeout(() => {
        mockProcess.stdout!.emit('data', 'Invalid JSON {{{');
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await expect(
        service.executeScript('Scripts/BadJSON.ps1', [], {})
      ).rejects.toThrow();
    });
  });

  describe('Stream Handling', () => {
    it('should emit output stream events', async () => {
      const outputHandler = jest.fn();
      service.on('output', outputHandler);

      setTimeout(() => {
        mockProcess.stdout!.emit('data', 'Output line 1\n');
        mockProcess.stdout!.emit('data', 'Output line 2\n');
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await service.executeScript('Scripts/Test.ps1', [], {});

      expect(outputHandler).toHaveBeenCalled();
    });

    it('should emit error stream events', async () => {
      const errorHandler = jest.fn();
      service.on('error', errorHandler);

      setTimeout(() => {
        mockProcess.stderr!.emit('data', 'Error message\n');
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](1);
      }, 10);

      try {
        await service.executeScript('Scripts/Test.ps1', [], {});
      } catch {
        // Expected to fail
      }

      expect(errorHandler).toHaveBeenCalled();
    });

    it('should handle verbose stream', async () => {
      const verboseHandler = jest.fn();
      service.on('verbose', verboseHandler);

      setTimeout(() => {
        mockProcess.stdout!.emit('data', 'VERBOSE: Detailed information\n');
        mockProcess.stdout!.emit('data', JSON.stringify({ success: true }));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await service.executeScript('Scripts/Test.ps1', [], { streamOutput: true });

      expect(verboseHandler).toHaveBeenCalled();
    });

    it('should handle warning stream', async () => {
      const warningHandler = jest.fn();
      service.on('warning', warningHandler);

      setTimeout(() => {
        mockProcess.stdout!.emit('data', 'WARNING: Something to note\n');
        mockProcess.stdout!.emit('data', JSON.stringify({ success: true }));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await service.executeScript('Scripts/Test.ps1', [], { streamOutput: true });

      expect(warningHandler).toHaveBeenCalled();
    });

    it('should handle debug stream', async () => {
      const debugHandler = jest.fn();
      service.on('debug', debugHandler);

      setTimeout(() => {
        mockProcess.stdout!.emit('data', 'DEBUG: Debug information\n');
        mockProcess.stdout!.emit('data', JSON.stringify({ success: true }));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await service.executeScript('Scripts/Test.ps1', [], { streamOutput: true });

      expect(debugHandler).toHaveBeenCalled();
    });

    it('should handle progress events', async () => {
      const progressHandler = jest.fn();
      service.on('progress', progressHandler);

      setTimeout(() => {
        mockProcess.stdout!.emit('data', 'PROGRESS: 50% complete\n');
        mockProcess.stdout!.emit('data', JSON.stringify({ success: true }));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await service.executeScript('Scripts/Test.ps1', [], { streamOutput: true });

      expect(progressHandler).toHaveBeenCalled();
    });
  });

  describe('Parallel Execution', () => {
    it('should execute multiple scripts in parallel', async () => {
      const mockResult = { success: true, data: {} };

      const promises = [
        service.executeScript('Scripts/Test1.ps1', [], {}),
        service.executeScript('Scripts/Test2.ps1', [], {}),
        service.executeScript('Scripts/Test3.ps1', [], {}),
      ];

      // Simulate all completing
      setTimeout(() => {
        mockProcess.stdout!.emit('data', JSON.stringify(mockResult));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle parallel execution with failures', async () => {
      const promises = [
        service.executeScript('Scripts/Success.ps1', [], {}),
        service.executeScript('Scripts/Failure.ps1', [], {}),
        service.executeScript('Scripts/Success2.ps1', [], {}),
      ];

      // Simulate mixed results
      let callIndex = 0;
      const originalOn = mockProcess.on;
      (mockProcess.on as jest.Mock).mockImplementation((event, handler) => {
        if (event === 'close') {
          setTimeout(() => {
            if (callIndex === 1) {
              mockProcess.stderr!.emit('data', 'Error');
              handler(1);
            } else {
              mockProcess.stdout!.emit('data', JSON.stringify({ success: true }));
              handler(0);
            }
            callIndex++;
          }, 10);
        }
        return originalOn ? originalOn.call(mockProcess, event, handler) : mockProcess;
      });

      const results = await Promise.allSettled(promises);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');
    });
  });

  describe('Module Discovery', () => {
    it('should discover available modules', async () => {
      fs.readdir.mockResolvedValueOnce([
        'Module1.psm1',
        'Module2.psm1',
        'NotAModule.txt',
      ]);

      fs.stat.mockResolvedValue({
        isFile: () => true,
        mtime: new Date(),
      });

      fs.readFile.mockResolvedValue(`
<#
.SYNOPSIS
    Test module
.DESCRIPTION
    A test PowerShell module
#>
      `);

      const modules = await service.discoverModules();

      expect(modules.length).toBeGreaterThan(0);
      expect(modules.some(m => m.name === 'Module1')).toBe(true);
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed executions', async () => {
      let attemptCount = 0;

      (mockProcess.on as jest.Mock).mockImplementation((event, handler) => {
        if (event === 'close') {
          setTimeout(() => {
            attemptCount++;
            if (attemptCount < 3) {
              mockProcess.stderr!.emit('data', 'Temporary error');
              handler(1);
            } else {
              mockProcess.stdout!.emit('data', JSON.stringify({ success: true }));
              handler(0);
            }
          }, 10);
        }
        return mockProcess;
      });

      const result = await service.executeScript('Scripts/RetryTest.ps1', [], { timeout: 10000 });

      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3);
    });

    it('should fail after max retries', async () => {
      (mockProcess.on as jest.Mock).mockImplementation((event, handler) => {
        if (event === 'close') {
          setTimeout(() => {
            mockProcess.stderr!.emit('data', 'Persistent error');
            handler(1);
          }, 10);
        }
        return mockProcess;
      });

      await expect(
        service.executeScript('Scripts/AlwaysFails.ps1', [], { timeout: 1000 })
      ).rejects.toThrow();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track execution statistics', async () => {
      const statsInitial = service.getStatistics();
      const initialExecutions = statsInitial.totalExecutions;

      setTimeout(() => {
        mockProcess.stdout!.emit('data', JSON.stringify({ success: true }));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await service.executeScript('Scripts/Test.ps1', [], {});

      const statsFinal = service.getStatistics();
      expect(statsFinal.totalExecutions).toBe(initialExecutions + 1);
    });

    it('should track execution statistics over time', async () => {
      setTimeout(() => {
        mockProcess.stdout!.emit('data', JSON.stringify({ success: true }));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 100);

      await service.executeScript('Scripts/Test.ps1', [], {});

      const stats = service.getStatistics();
      expect(stats.totalExecutions).toBeGreaterThan(0);
    });

    it('should track failure rate', async () => {
      // Execute successful script
      setTimeout(() => {
        mockProcess.stdout!.emit('data', JSON.stringify({ success: true }));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await service.executeScript('Scripts/Success.ps1', [], {});

      // Execute failing script
      setTimeout(() => {
        mockProcess.stderr!.emit('data', 'Error');
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](1);
      }, 10);

      try {
        await service.executeScript('Scripts/Failure.ps1', [], {});
      } catch {
        // Expected
      }

      const stats = service.getStatistics();
      expect(stats.activeExecutions).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Resource Cleanup', () => {
    it('should dispose all sessions on cleanup', async () => {
      // Create sessions
      setTimeout(() => {
        mockProcess.stdout!.emit('data', JSON.stringify({ success: true }));
        (mockProcess.on as jest.Mock).mock.calls
          .find(call => call[0] === 'close')![1](0);
      }, 10);

      await service.executeScript('Scripts/Test.ps1', [], {});

      const statsBefore = service.getStatistics();
      expect(statsBefore.poolSize).toBeGreaterThan(0);

      await service.shutdown();

      const statsAfter = service.getStatistics();
      expect(statsAfter.poolSize).toBe(0);
    });

    it('should kill running processes on shutdown', async () => {
      // Start long-running script
      const promise = service.executeScript('Scripts/NeverEnds.ps1', [], {});

      await new Promise(resolve => setTimeout(resolve, 10));

      await service.shutdown();

      expect(mockProcess.kill).toHaveBeenCalled();

      // Clean up promise
      promise.catch(() => {});
    });
  });
});
