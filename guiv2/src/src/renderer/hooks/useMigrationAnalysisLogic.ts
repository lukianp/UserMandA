/**
 * Migration Analysis Logic Hook
 * Handles complexity analysis for migration planning
 */

import { useState, useCallback } from 'react';

import type { ComplexityScore, MigrationAnalysis } from '../types/models/migration';

export interface MigrationAnalysisState {
  complexityScores: Map<string, ComplexityScore>;
  isAnalyzing: boolean;
  error: string | null;
  lastAnalyzed: Date | null;
}

export const useMigrationAnalysisLogic = () => {
  const [complexityScores, setComplexityScores] = useState<Map<string, ComplexityScore>>(new Map());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  /**
   * Analyze complexity for multiple users
   */
  const analyzeUsers = useCallback(async (userIds: string[]): Promise<void> => {
    if (userIds.length === 0) {
      setError('No users selected for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log(`Analyzing complexity for ${userIds.length} users...`);

      // Call IPC handler to analyze each user
      const results = await Promise.all(
        userIds.map(async (userId) => {
          try {
            const result = await window.electronAPI.invoke('logicEngine:analyzeMigrationComplexity', userId);

            if (result.success) {
              return { userId, score: result.data as ComplexityScore };
            } else {
              console.error(`Failed to analyze user ${userId}:`, result.error);
              return {
                userId,
                score: {
                  score: 0,
                  level: 'Low' as const,
                  factors: [`Analysis failed: ${result.error}`]
                }
              };
            }
          } catch (err: any) {
            console.error(`Exception analyzing user ${userId}:`, err);
            return {
              userId,
              score: {
                score: 0,
                level: 'Low' as const,
                factors: [`Analysis exception: ${err.message}`]
              }
            };
          }
        })
      );

      // Update complexity scores map
      const newScores = new Map(complexityScores);
      results.forEach(({ userId, score }) => {
        newScores.set(userId, score);
      });

      setComplexityScores(newScores);
      setLastAnalyzed(new Date());

      console.log(`Complexity analysis complete: ${results.length} users analyzed`);
    } catch (err: any) {
      const errorMsg = `Complexity analysis failed: ${err.message}`;
      console.error(errorMsg, err);
      setError(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  }, [complexityScores]);

  /**
   * Analyze a single user
   */
  const analyzeSingleUser = useCallback(async (userId: string): Promise<ComplexityScore | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await window.electronAPI.invoke('logicEngine:analyzeMigrationComplexity', userId);

      if (result.success) {
        const score = result.data as ComplexityScore;

        // Update map
        const newScores = new Map(complexityScores);
        newScores.set(userId, score);
        setComplexityScores(newScores);
        setLastAnalyzed(new Date());

        return score;
      } else {
        setError(result.error || 'Analysis failed');
        return null;
      }
    } catch (err: any) {
      const errorMsg = `Failed to analyze user: ${err.message}`;
      setError(errorMsg);
      console.error(errorMsg, err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [complexityScores]);

  /**
   * Get complexity score for a specific user
   */
  const getComplexityScore = useCallback((userId: string): ComplexityScore | undefined => {
    return complexityScores.get(userId);
  }, [complexityScores]);

  /**
   * Get complexity statistics
   */
  const getComplexityStats = useCallback(() => {
    const scores = Array.from(complexityScores.values());

    return {
      total: scores.length,
      low: scores.filter(s => s.level === 'Low').length,
      medium: scores.filter(s => s.level === 'Medium').length,
      high: scores.filter(s => s.level === 'High').length,
      averageScore: scores.length > 0
        ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
        : 0
    };
  }, [complexityScores]);

  /**
   * Clear all complexity scores
   */
  const clearAnalysis = useCallback(() => {
    setComplexityScores(new Map());
    setError(null);
    setLastAnalyzed(null);
  }, []);

  /**
   * Get users by complexity level
   */
  const getUsersByComplexity = useCallback((level: 'Low' | 'Medium' | 'High'): string[] => {
    const userIds: string[] = [];

    complexityScores.forEach((score, userId) => {
      if (score.level === level) {
        userIds.push(userId);
      }
    });

    return userIds;
  }, [complexityScores]);

  /**
   * Check if user has been analyzed
   */
  const isUserAnalyzed = useCallback((userId: string): boolean => {
    return complexityScores.has(userId);
  }, [complexityScores]);

  return {
    // State
    complexityScores,
    isAnalyzing,
    error,
    lastAnalyzed,

    // Actions
    analyzeUsers,
    analyzeSingleUser,
    getComplexityScore,
    getComplexityStats,
    clearAnalysis,
    getUsersByComplexity,
    isUserAnalyzed
  };
};
