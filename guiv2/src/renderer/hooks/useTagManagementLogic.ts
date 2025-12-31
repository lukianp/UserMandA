/**
 * Tag Management Logic Hook
 *
 * Manages data classification tags, custom metadata, and tagging policies
 * for organizational data governance and classification systems.
 */

import { useState, useEffect, useCallback } from 'react';

export interface DataTag {
  id: string;
  name: string;
  description: string;
  color: string;
  category: 'classification' | 'sensitivity' | 'retention' | 'compliance' | 'custom';
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  autoApply: boolean;
  rules: TaggingRule[];
  appliedCount: number;
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
}

export interface TaggingRule {
  id: string;
  type: 'content-pattern' | 'file-type' | 'location' | 'metadata' | 'user-group';
  condition: 'contains' | 'matches' | 'starts-with' | 'ends-with' | 'equals';
  value: string;
  caseSensitive: boolean;
  enabled: boolean;
}

export interface TaggedItem {
  id: string;
  type: 'file' | 'folder' | 'mailbox' | 'site' | 'database';
  name: string;
  path: string;
  tags: string[];
  size?: number;
  lastModified: Date;
  owner: string;
  permissions: string[];
}

export interface TagPolicy {
  id: string;
  name: string;
  description: string;
  requiredTags: string[];
  forbiddenCombinations: string[][];
  inheritanceEnabled: boolean;
  enforceOnCreation: boolean;
  scope: 'global' | 'department' | 'project';
  exceptions: string[];
  createdBy: string;
  createdAt: Date;
}

export interface TagManagementState {
  tags: DataTag[];
  taggedItems: TaggedItem[];
  policies: TagPolicy[];
  isLoading: boolean;
  selectedTag: DataTag | null;
  selectedItem: TaggedItem | null;
  selectedPolicy: TagPolicy | null;
  searchTerm: string;
  categoryFilter: DataTag['category'] | 'all';
  levelFilter: DataTag['level'] | 'all';
  sortBy: 'name' | 'category' | 'level' | 'appliedCount' | 'lastModified';
  sortOrder: 'asc' | 'desc';
  error: string | null;
}

const initialState: TagManagementState = {
  tags: [],
  taggedItems: [],
  policies: [],
  isLoading: false,
  selectedTag: null,
  selectedItem: null,
  selectedPolicy: null,
  searchTerm: '',
  categoryFilter: 'all',
  levelFilter: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
  error: null,
};

export const useTagManagementLogic = () => {
  const [state, setState] = useState<TagManagementState>(initialState);

  // Load tags and related data
  const loadTagData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const mockTags: DataTag[] = [
        {
          id: 'tag-1',
          name: 'Confidential',
          description: 'Sensitive business information requiring protection',
          color: '#dc3545',
          category: 'classification',
          level: 'confidential',
          autoApply: true,
          rules: [
            {
              id: 'rule-1',
              type: 'content-pattern',
              condition: 'contains',
              value: 'CONFIDENTIAL',
              caseSensitive: false,
              enabled: true
            }
          ],
          appliedCount: 1247,
          createdBy: 'admin@contoso.com',
          createdAt: new Date('2024-01-01'),
          lastModified: new Date('2024-01-15')
        },
        {
          id: 'tag-2',
          name: 'PII',
          description: 'Contains personally identifiable information',
          color: '#ffc107',
          category: 'compliance',
          level: 'restricted',
          autoApply: true,
          rules: [
            {
              id: 'rule-2',
              type: 'content-pattern',
              condition: 'matches',
              value: '\\d{3}-\\d{2}-\\d{4}', // SSN pattern
              caseSensitive: false,
              enabled: true
            }
          ],
          appliedCount: 89,
          createdBy: 'compliance@contoso.com',
          createdAt: new Date('2024-01-05'),
          lastModified: new Date('2024-01-18')
        },
        {
          id: 'tag-3',
          name: '7-Year Retention',
          description: 'Legal hold - retain for 7 years',
          color: '#17a2b8',
          category: 'retention',
          level: 'internal',
          autoApply: false,
          rules: [],
          appliedCount: 523,
          createdBy: 'legal@contoso.com',
          createdAt: new Date('2024-01-10'),
          lastModified: new Date('2024-01-10')
        }
      ];

      const mockPolicies: TagPolicy[] = [
        {
          id: 'policy-1',
          name: 'Financial Data Policy',
          description: 'All financial documents must be tagged appropriately',
          requiredTags: ['Confidential', 'Financial'],
          forbiddenCombinations: [['Public', 'Confidential']],
          inheritanceEnabled: true,
          enforceOnCreation: true,
          scope: 'department',
          exceptions: ['finance-team@contoso.com'],
          createdBy: 'admin@contoso.com',
          createdAt: new Date('2024-01-01')
        }
      ];

      setState(prev => ({
        ...prev,
        tags: mockTags,
        policies: mockPolicies,
        isLoading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load tag data'
      }));
    }
  }, []);

  // Create new tag
  const createTag = useCallback(async (tagData: Omit<DataTag, 'id' | 'appliedCount' | 'createdAt' | 'lastModified'>) => {
    try {
      const newTag: DataTag = {
        ...tagData,
        id: `tag-${Date.now()}`,
        appliedCount: 0,
        createdAt: new Date(),
        lastModified: new Date()
      };

      setState(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));

      return { success: true, tag: newTag };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create tag');
    }
  }, []);

  // Update tag
  const updateTag = useCallback(async (tagId: string, updates: Partial<DataTag>) => {
    try {
      setState(prev => ({
        ...prev,
        tags: prev.tags.map(tag =>
          tag.id === tagId
            ? { ...tag, ...updates, lastModified: new Date() }
            : tag
        )
      }));

      return { success: true };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update tag');
    }
  }, []);

  // Delete tag
  const deleteTag = useCallback(async (tagId: string) => {
    try {
      setState(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag.id !== tagId),
        selectedTag: prev.selectedTag?.id === tagId ? null : prev.selectedTag
      }));

      return { success: true };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete tag');
    }
  }, []);

  // Apply tags to items
  const applyTags = useCallback(async (itemIds: string[], tagIds: string[]) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update applied counts
      setState(prev => ({
        ...prev,
        tags: prev.tags.map(tag =>
          tagIds.includes(tag.id)
            ? { ...tag, appliedCount: tag.appliedCount + itemIds.length }
            : tag
        )
      }));

      return { success: true, itemCount: itemIds.length, tagCount: tagIds.length };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to apply tags');
    }
  }, []);

  // Remove tags from items
  const removeTags = useCallback(async (itemIds: string[], tagIds: string[]) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      setState(prev => ({
        ...prev,
        tags: prev.tags.map(tag =>
          tagIds.includes(tag.id)
            ? { ...tag, appliedCount: Math.max(0, tag.appliedCount - itemIds.length) }
            : tag
        )
      }));

      return { success: true, itemCount: itemIds.length, tagCount: tagIds.length };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to remove tags');
    }
  }, []);

  // Selection methods
  const selectTag = useCallback((tag: DataTag | null) => {
    setState(prev => ({ ...prev, selectedTag: tag }));
  }, []);

  const selectItem = useCallback((item: TaggedItem | null) => {
    setState(prev => ({ ...prev, selectedItem: item }));
  }, []);

  const selectPolicy = useCallback((policy: TagPolicy | null) => {
    setState(prev => ({ ...prev, selectedPolicy: policy }));
  }, []);

  // Filter methods
  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setCategoryFilter = useCallback((category: DataTag['category'] | 'all') => {
    setState(prev => ({ ...prev, categoryFilter: category }));
  }, []);

  const setLevelFilter = useCallback((level: DataTag['level'] | 'all') => {
    setState(prev => ({ ...prev, levelFilter: level }));
  }, []);

  const setSorting = useCallback((sortBy: TagManagementState['sortBy'], sortOrder: TagManagementState['sortOrder']) => {
    setState(prev => ({ ...prev, sortBy, sortOrder }));
  }, []);

  // Computed filtered tags
  const filteredTags = state.tags.filter(tag => {
    if (state.categoryFilter !== 'all' && tag.category !== state.categoryFilter) return false;
    if (state.levelFilter !== 'all' && tag.level !== state.levelFilter) return false;
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      return (tag.name ?? '').toLowerCase().includes(searchLower) ||
             (tag.description ?? '').toLowerCase().includes(searchLower);
    }
    return true;
  }).sort((a, b) => {
    let aVal: any, bVal: any;

    switch (state.sortBy) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'category':
        aVal = a.category;
        bVal = b.category;
        break;
      case 'level':
        aVal = a.level;
        bVal = b.level;
        break;
      case 'appliedCount':
        aVal = a.appliedCount;
        bVal = b.appliedCount;
        break;
      case 'lastModified':
        aVal = a.lastModified.getTime();
        bVal = b.lastModified.getTime();
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return state.sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return state.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Load data on mount
  useEffect(() => {
    loadTagData();
  }, [loadTagData]);

  return {
    // State
    ...state,

    // Computed
    filteredTags,

    // Actions
    loadTagData,
    createTag,
    updateTag,
    deleteTag,
    applyTags,
    removeTags,
    selectTag,
    selectItem,
    selectPolicy,
    setSearchTerm,
    setCategoryFilter,
    setLevelFilter,
    setSorting,
  };
};

export default useTagManagementLogic;

