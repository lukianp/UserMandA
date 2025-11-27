import type { Mock, MockInstance, MockedFunction, MockedFunctionDeep } from 'jest-mock';

export {};

declare global {
  interface Function {
    mockReturnValue: Mock['mockReturnValue'];
    mockReturnValueOnce: Mock['mockReturnValueOnce'];
    mockResolvedValue: Mock['mockResolvedValue'];
    mockResolvedValueOnce: Mock['mockResolvedValueOnce'];
    mockRejectedValue: Mock['mockRejectedValue'];
    mockRejectedValueOnce: Mock['mockRejectedValueOnce'];
    mockImplementation: Mock['mockImplementation'];
    mockImplementationOnce: Mock['mockImplementationOnce'];
    mockRestore: Mock['mockRestore'];
    mockReset: Mock['mockReset'];
    mockClear: Mock['mockClear'];
  }
}

export type JestMockedFunction<T extends (...args: any[]) => any> = MockedFunction<T>;
export type JestMockedFunctionDeep<T extends (...args: any[]) => any> = MockedFunctionDeep<T>;
export type JestMockInstance<TArgs extends any[] = any, TReturn = any> = MockInstance<TArgs, TReturn>;
