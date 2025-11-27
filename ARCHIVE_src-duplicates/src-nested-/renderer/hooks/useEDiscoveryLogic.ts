import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * E-discovery case data model
 */
export interface EDiscoveryCase {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  custodian: string;
  legalHoldDate?: string;
  deadline?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dataSources: DataSource[];
  searchQueries: SearchQuery[];
  reviewSets: ReviewSet[];
  productions: Production[];
}

/**
 * Data source for e-discovery
 */
export interface DataSource {
  id: string;
  name: string;
  type: 'email' | 'file_share' | 'database' | 'cloud_storage' | 'social_media' | 'other';
  location: string;
  custodian: string;
  collectionDate?: string;
  status: 'identified' | 'collected' | 'processed' | 'error';
  size: number; // in bytes
  itemCount: number;
  metadata: { [key: string]: any };
}

/**
 * Search query data model
 */
export interface SearchQuery {
  id: string;
  name: string;
  query: string;
  type: 'keyword' | 'boolean' | 'proximity' | 'regex';
  createdBy: string;
  createdAt: string;
  lastExecuted?: string;
  resultsCount: number;
  estimatedCost: number;
  custodian?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  filters: SearchFilter[];
}

/**
 * Search filter data model
 */
export interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between';
  value: any;
  caseSensitive?: boolean;
}

/**
 * Review set data model
 */
export interface ReviewSet {
  id: string;
  name: string;
  description: string;
  caseId: string;
  queryId: string;
  reviewer: string;
  status: 'created' | 'in_review' | 'completed' | 'exported';
  itemCount: number;
  reviewedCount: number;
  createdAt: string;
  deadline?: string;
  tags: string[];
  codingFields: CodingField[];
}

/**
 * Coding field for document review
 */
export interface CodingField {
  id: string;
  name: string;
  type: 'text' | 'single_select' | 'multi_select' | 'date' | 'boolean';
  required: boolean;
  options?: string[]; // for select types
  validation?: string; // regex pattern
}

/**
 * Production data model
 */
export interface Production {
  id: string;
  name: string;
  description: string;
  caseId: string;
  reviewSetId: string;
  producedBy: string;
  producedAt: string;
  format: 'native' | 'tiff' | 'pdf' | 'text';
  volume: number; // in pages/items
  recipient: string;
  trackingNumber?: string;
  status: 'draft' | 'produced' | 'delivered' | 'acknowledged';
  metadata: { [key: string]: any };
}

/**
 * Document data model for e-discovery
 */
export interface EDiscoveryDocument {
  id: string;
  caseId: string;
  dataSourceId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  size: number;
  createdDate: string;
  modifiedDate: string;
  author: string;
  subject?: string;
  content?: string;
  extractedText?: string;
  hash: string; // for deduplication
  reviewStatus: 'not_reviewed' | 'reviewed' | 'coded' | 'produced';
  reviewer?: string;
  tags: string[];
  coding: { [fieldId: string]: any };
  relevanceScore?: number;
  confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
}

/**
 * Search result data model
 */
export interface SearchResult {
  queryId: string;
  totalHits: number;
  documents: EDiscoveryDocument[];
  executionTime: number; // in milliseconds
  cost: number;
  facets: SearchFacet[];
}

/**
 * Search facet for filtering results
 */
export interface SearchFacet {
  field: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}

/**
 * Analytics data for e-discovery
 */
export interface EDiscoveryAnalytics {
  totalCases: number;
  activeCases: number;
  totalDocuments: number;
  reviewedDocuments: number;
  productionsCount: number;
  averageReviewTime: number; // in minutes
  costByCase: { [caseId: string]: number };
  custodianWorkload: { [custodian: string]: number };
  dataVolumeByType: { [type: string]: number };
}

/**
 * Custom hook for e-discovery logic
 */
export const useEDiscoveryLogic = () => {
  const [cases, setCases] = useState<EDiscoveryCase[]>([]);
  const [documents, setDocuments] = useState<EDiscoveryDocument[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [analytics, setAnalytics] = useState<EDiscoveryAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Create new e-discovery case
   */
  const createCase = useCallback(async (caseData: Omit<EDiscoveryCase, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      const newCase: EDiscoveryCase = {
        ...caseData,
        id: `case-${Date.now()}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCases(prev => [...prev, newCase]);
      console.info('[EDiscovery] Created e-discovery case:', newCase.id);
      return newCase;
    } catch (err: any) {
      console.error('[EDiscovery] Failed to create case:', err);
      setError(`Failed to create case: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Update existing e-discovery case
   */
  const updateCase = useCallback(async (id: string, updates: Partial<EDiscoveryCase>) => {
    try {
      setCases(prev => prev.map(caseItem =>
        caseItem.id === id ? { ...caseItem, ...updates, updatedAt: new Date().toISOString() } : caseItem
      ));

      console.info('[EDiscovery] Updated e-discovery case:', id);
    } catch (err: any) {
      console.error('[EDiscovery] Failed to update case:', err);
      setError(`Failed to update case: ${err.message}`);
    }
  }, []);

  /**
   * Add data source to case
   */
  const addDataSource = useCallback(async (caseId: string, dataSource: Omit<DataSource, 'id'>) => {
    try {
      setCases(prev => prev.map(caseItem => {
        if (caseItem.id !== caseId) return caseItem;
        const newDataSource: DataSource = {
          ...dataSource,
          id: `datasource-${Date.now()}`,
        };
        return {
          ...caseItem,
          dataSources: [...caseItem.dataSources, newDataSource],
          updatedAt: new Date().toISOString(),
        };
      }));

      console.info('[EDiscovery] Added data source to case:', caseId);
    } catch (err: any) {
      console.error('[EDiscovery] Failed to add data source:', err);
      setError(`Failed to add data source: ${err.message}`);
    }
  }, []);

  /**
   * Create search query
   */
  const createSearchQuery = useCallback(async (caseId: string, queryData: Omit<SearchQuery, 'id' | 'createdAt' | 'resultsCount' | 'estimatedCost'>) => {
    try {
      const newQuery: SearchQuery = {
        ...queryData,
        id: `query-${Date.now()}`,
        createdAt: new Date().toISOString(),
        resultsCount: 0,
        estimatedCost: Math.floor(Math.random() * 1000) + 100, // Mock cost calculation
      };

      setCases(prev => prev.map(caseItem => {
        if (caseItem.id !== caseId) return caseItem;
        return {
          ...caseItem,
          searchQueries: [...caseItem.searchQueries, newQuery],
          updatedAt: new Date().toISOString(),
        };
      }));

      console.info('[EDiscovery] Created search query for case:', caseId);
      return newQuery;
    } catch (err: any) {
      console.error('[EDiscovery] Failed to create search query:', err);
      setError(`Failed to create search query: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Execute search query
   */
  const executeSearch = useCallback(async (queryId: string) => {
    try {
      // Mock search execution
      const mockResults: SearchResult = {
        queryId,
        totalHits: Math.floor(Math.random() * 1000) + 100,
        documents: generateMockDocuments(queryId, 50),
        executionTime: Math.floor(Math.random() * 5000) + 1000,
        cost: Math.floor(Math.random() * 500) + 50,
        facets: [
          {
            field: 'fileType',
            values: [
              { value: 'pdf', count: 25 },
              { value: 'docx', count: 15 },
              { value: 'email', count: 10 },
            ],
          },
        ],
      };

      setSearchResults(prev => [...prev.filter(r => r.queryId !== queryId), mockResults]);

      // Update query with execution results
      setCases(prev => prev.map(caseItem => ({
        ...caseItem,
        searchQueries: caseItem.searchQueries.map(query =>
          query.id === queryId
            ? { ...query, lastExecuted: new Date().toISOString(), resultsCount: mockResults.totalHits }
            : query
        ),
        updatedAt: new Date().toISOString(),
      })));

      console.info('[EDiscovery] Executed search query:', queryId);
      return mockResults;
    } catch (err: any) {
      console.error('[EDiscovery] Failed to execute search:', err);
      setError(`Failed to execute search: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Create review set from search results
   */
  const createReviewSet = useCallback(async (caseId: string, queryId: string, setData: Omit<ReviewSet, 'id' | 'caseId' | 'queryId' | 'createdAt' | 'reviewedCount'>) => {
    try {
      const newSet: ReviewSet = {
        ...setData,
        id: `reviewset-${Date.now()}`,
        caseId,
        queryId,
        createdAt: new Date().toISOString(),
        reviewedCount: 0,
      };

      setCases(prev => prev.map(caseItem => {
        if (caseItem.id !== caseId) return caseItem;
        return {
          ...caseItem,
          reviewSets: [...caseItem.reviewSets, newSet],
          updatedAt: new Date().toISOString(),
        };
      }));

      console.info('[EDiscovery] Created review set:', newSet.id);
      return newSet;
    } catch (err: any) {
      console.error('[EDiscovery] Failed to create review set:', err);
      setError(`Failed to create review set: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Update document coding
   */
  const updateDocumentCoding = useCallback(async (documentId: string, coding: { [fieldId: string]: any }) => {
    try {
      setDocuments(prev => prev.map(doc =>
        doc.id === documentId
          ? { ...doc, coding: { ...doc.coding, ...coding }, reviewStatus: 'coded' }
          : doc
      ));

      console.info('[EDiscovery] Updated document coding:', documentId);
    } catch (err: any) {
      console.error('[EDiscovery] Failed to update document coding:', err);
      setError(`Failed to update document coding: ${err.message}`);
    }
  }, []);

  /**
   * Create production
   */
  const createProduction = useCallback(async (productionData: Omit<Production, 'id' | 'producedAt' | 'status'>) => {
    try {
      const newProduction: Production = {
        ...productionData,
        id: `production-${Date.now()}`,
        producedAt: new Date().toISOString(),
        status: 'draft',
      };

      setCases(prev => prev.map(caseItem => {
        if (caseItem.id !== productionData.caseId) return caseItem;
        return {
          ...caseItem,
          productions: [...caseItem.productions, newProduction],
          updatedAt: new Date().toISOString(),
        };
      }));

      console.info('[EDiscovery] Created production:', newProduction.id);
      return newProduction;
    } catch (err: any) {
      console.error('[EDiscovery] Failed to create production:', err);
      setError(`Failed to create production: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Calculate e-discovery analytics
   */
  const calculateAnalytics = useCallback((cases: EDiscoveryCase[], documents: EDiscoveryDocument[]): EDiscoveryAnalytics => {
    const activeCases = cases.filter(c => c.status === 'active').length;
    const reviewedDocuments = documents.filter(d => d.reviewStatus !== 'not_reviewed').length;
    const productionsCount = cases.reduce((sum, caseItem) => sum + caseItem.productions.length, 0);

    const costByCase = cases.reduce((costs, caseItem) => {
      costs[caseItem.id] = caseItem.searchQueries.reduce((sum, query) => sum + query.estimatedCost, 0);
      return costs;
    }, {} as { [caseId: string]: number });

    const custodianWorkload = cases.reduce((workload, caseItem) => {
      workload[caseItem.custodian] = (workload[caseItem.custodian] || 0) + caseItem.dataSources.length;
      return workload;
    }, {} as { [custodian: string]: number });

    const dataVolumeByType = documents.reduce((volumes, doc) => {
      volumes[doc.fileType] = (volumes[doc.fileType] || 0) + doc.size;
      return volumes;
    }, {} as { [type: string]: number });

    return {
      totalCases: cases.length,
      activeCases,
      totalDocuments: documents.length,
      reviewedDocuments,
      productionsCount,
      averageReviewTime: 45 + Math.floor(Math.random() * 30), // Mock average
      costByCase,
      custodianWorkload,
      dataVolumeByType,
    };
  }, [cases, documents]);

  /**
   * Load e-discovery data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockCases = generateMockEDiscoveryCases();
      const mockDocuments = generateMockDocuments('', 200);

      const calculatedAnalytics = calculateAnalytics(mockCases, mockDocuments);

      setCases(mockCases);
      setDocuments(mockDocuments);
      setAnalytics(calculatedAnalytics);

      console.info('[EDiscovery] Loaded e-discovery data');
    } catch (err: any) {
      const errorMsg = `Failed to load e-discovery data: ${err.message}`;
      console.error('[EDiscovery] Error:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [calculateAnalytics]);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Set up real-time refresh
   */
  const startRealTimeUpdates = useCallback((intervalMs: number = 60000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      loadData();
    }, intervalMs);

    console.info('[EDiscovery] Started real-time updates');
  }, [loadData]);

  /**
   * Stop real-time updates
   */
  const stopRealTimeUpdates = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.info('[EDiscovery] Stopped real-time updates');
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopRealTimeUpdates();
    };
  }, [stopRealTimeUpdates]);

  /**
   * Get cases by status
   */
  const getCasesByStatus = useCallback((status: EDiscoveryCase['status']) => {
    return cases.filter(caseItem => caseItem.status === status);
  }, [cases]);

  /**
   * Get documents by review status
   */
  const getDocumentsByReviewStatus = useCallback((status: EDiscoveryDocument['reviewStatus']) => {
    return documents.filter(doc => doc.reviewStatus === status);
  }, [documents]);

  /**
   * Export case data
   */
  const exportCase = useCallback(async (caseId: string, format: 'csv' | 'json' | 'xml') => {
    try {
      const caseItem = cases.find(c => c.id === caseId);
      if (!caseItem) throw new Error('Case not found');

      const exportData = {
        case: caseItem,
        documents: documents.filter(d => d.caseId === caseId),
        searchResults: searchResults.filter(r => caseItem.searchQueries.some(q => q.id === r.queryId)),
      };

      // Mock export - in real implementation would generate actual file
      console.info(`[EDiscovery] Exported case ${caseId} in ${format} format`);
      return exportData;
    } catch (err: any) {
      console.error('[EDiscovery] Failed to export case:', err);
      setError(`Failed to export case: ${err.message}`);
      return null;
    }
  }, [cases, documents, searchResults]);

  return {
    cases,
    documents,
    searchResults,
    analytics,
    isLoading,
    error,
    createCase,
    updateCase,
    addDataSource,
    createSearchQuery,
    executeSearch,
    createReviewSet,
    updateDocumentCoding,
    createProduction,
    getCasesByStatus,
    getDocumentsByReviewStatus,
    exportCase,
    refreshData: loadData,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  };
};

/**
 * Generate mock e-discovery cases for development
 */
function generateMockEDiscoveryCases(): EDiscoveryCase[] {
  const custodians = ['john.doe@company.com', 'jane.smith@company.com', 'bob.johnson@company.com'];
  const priorities: EDiscoveryCase['priority'][] = ['low', 'medium', 'high', 'critical'];

  return Array.from({ length: 5 }, (_, index) => ({
    id: `case-${index + 1}`,
    title: `Case ${index + 1}: ${['Contract Dispute', 'IP Investigation', 'Compliance Review', 'Employee Misconduct', 'M&A Due Diligence'][index]}`,
    description: `E-discovery case for ${['contract review', 'intellectual property investigation', 'regulatory compliance', 'HR investigation', 'merger review'][index]}`,
    status: ['draft', 'active', 'completed'][index % 3] as EDiscoveryCase['status'],
    priority: priorities[index % priorities.length],
    custodian: custodians[index % custodians.length],
    legalHoldDate: index < 3 ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    deadline: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin@company.com',
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    dataSources: [
      {
        id: `datasource-${index + 1}-1`,
        name: 'Primary Email Account',
        type: 'email',
        location: '/mailboxes/user@company.com',
        custodian: custodians[index % custodians.length],
        collectionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'processed',
        size: 1024 * 1024 * 500, // 500MB
        itemCount: Math.floor(Math.random() * 10000) + 1000,
        metadata: { server: 'exchange.company.com' },
      },
    ],
    searchQueries: [
      {
        id: `query-${index + 1}-1`,
        name: 'Initial keyword search',
        query: 'confidential OR secret',
        type: 'keyword',
        createdBy: 'admin@company.com',
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastExecuted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        resultsCount: Math.floor(Math.random() * 1000) + 100,
        estimatedCost: Math.floor(Math.random() * 500) + 50,
        custodian: custodians[index % custodians.length],
        dateRange: {
          start: '2023-01-01',
          end: '2024-12-31',
        },
        filters: [
          {
            field: 'fileType',
            operator: 'equals',
            value: 'email',
          },
        ],
      },
    ],
    reviewSets: index > 1 ? [
      {
        id: `reviewset-${index + 1}-1`,
        name: 'Initial Review Set',
        description: 'Documents requiring initial review',
        caseId: `case-${index + 1}`,
        queryId: `query-${index + 1}-1`,
        reviewer: 'reviewer@company.com',
        status: 'in_review',
        itemCount: Math.floor(Math.random() * 500) + 50,
        reviewedCount: Math.floor(Math.random() * 300) + 10,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        deadline: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['priority', 'confidential'],
        codingFields: [
          {
            id: 'responsive',
            name: 'Responsive',
            type: 'boolean',
            required: true,
          },
          {
            id: 'privilege',
            name: 'Privilege',
            type: 'single_select',
            required: true,
            options: ['Not Privileged', 'Attorney-Client', 'Work Product'],
          },
        ],
      },
    ] : [],
    productions: index > 2 ? [
      {
        id: `production-${index + 1}-1`,
        name: 'Initial Production',
        description: 'First production of responsive documents',
        caseId: `case-${index + 1}`,
        reviewSetId: `reviewset-${index + 1}-1`,
        producedBy: 'admin@company.com',
        producedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        format: 'tiff',
        volume: Math.floor(Math.random() * 1000) + 100,
        recipient: 'opposing_counsel@lawfirm.com',
        trackingNumber: `PROD-${String(index + 1).padStart(4, '0')}`,
        status: 'delivered',
        metadata: { batesStart: '000001', batesEnd: '001000' },
      },
    ] : [],
  }));
}

/**
 * Generate mock documents for development
 */
function generateMockDocuments(queryId: string, count: number): EDiscoveryDocument[] {
  const fileTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'msg', 'txt'];
  const authors = ['john.doe@company.com', 'jane.smith@company.com', 'bob.johnson@company.com'];

  return Array.from({ length: count }, (_, index) => ({
    id: `doc-${queryId}-${index + 1}`,
    caseId: 'case-1', // Mock case ID
    dataSourceId: 'datasource-1-1',
    fileName: `document_${index + 1}.${fileTypes[index % fileTypes.length]}`,
    filePath: `/documents/${Math.floor(index / 10) + 1}/document_${index + 1}.${fileTypes[index % fileTypes.length]}`,
    fileType: fileTypes[index % fileTypes.length],
    size: Math.floor(Math.random() * 1024 * 1024) + 1024, // 1KB to 1MB
    createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    author: authors[index % authors.length],
    subject: index % 3 === 0 ? `Important document ${index + 1}` : undefined,
    content: index % 5 === 0 ? 'This is confidential information that may be relevant to the case.' : undefined,
    extractedText: 'Sample extracted text from the document content...',
    hash: `hash_${index + 1}_${Date.now()}`,
    reviewStatus: ['not_reviewed', 'reviewed', 'coded'][index % 3] as EDiscoveryDocument['reviewStatus'],
    reviewer: index % 3 === 1 ? 'reviewer@company.com' : undefined,
    tags: index % 4 === 0 ? ['confidential', 'priority'] : [],
    coding: index % 3 === 2 ? { responsive: true, privilege: 'Not Privileged' } : {},
    relevanceScore: Math.random(),
    confidentiality: ['public', 'internal', 'confidential'][index % 3] as EDiscoveryDocument['confidentiality'],
  }));
}