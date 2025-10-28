import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Knowledge base article data model
 */
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived' | 'review_required';
  author: string;
  reviewers: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  viewCount: number;
  helpfulVotes: number;
  totalVotes: number;
  attachments: ArticleAttachment[];
  relatedArticles: string[]; // article IDs
  metadata: ArticleMetadata;
}

/**
 * Article attachment data model
 */
export interface ArticleAttachment {
  id: string;
  fileName: string;
  fileType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  description?: string;
}

/**
 * Article metadata
 */
export interface ArticleMetadata {
  estimatedReadTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  audience: string[];
  prerequisites?: string[];
  relatedLinks: Array<{ title: string; url: string }>;
  version: string;
  lastReviewed?: string;
}

/**
 * Knowledge category data model
 */
export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  color: string;
  icon?: string;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
  subcategories: KnowledgeCategory[];
}

/**
 * FAQ entry data model
 */
export interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  viewCount: number;
  helpfulCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  relatedArticles: string[];
}

/**
 * Search result data model
 */
export interface SearchResult {
  articles: KnowledgeArticle[];
  faqs: FAQEntry[];
  totalResults: number;
  searchTime: number;
  facets: SearchFacet[];
}

/**
 * Search facet for filtering
 */
export interface SearchFacet {
  field: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}

/**
 * User feedback data model
 */
export interface ArticleFeedback {
  id: string;
  articleId: string;
  userId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  helpful: boolean;
  submittedAt: string;
  userAgent?: string;
}

/**
 * Knowledge base analytics
 */
export interface KnowledgeAnalytics {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  averageRating: number;
  topViewedArticles: Array<{ article: KnowledgeArticle; views: number }>;
  topRatedArticles: Array<{ article: KnowledgeArticle; rating: number }>;
  categoryDistribution: { [category: string]: number };
  monthlyViews: Array<{ month: string; views: number }>;
  searchQueryTrends: Array<{ query: string; count: number }>;
  userEngagement: {
    averageSessionDuration: number;
    bounceRate: number;
    returnVisitorRate: number;
  };
}

/**
 * Custom hook for knowledge base logic
 */
export const useKnowledgeBaseLogic = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [faqs, setFaqs] = useState<FAQEntry[]>([]);
  const [feedback, setFeedback] = useState<ArticleFeedback[]>([]);
  const [analytics, setAnalytics] = useState<KnowledgeAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Create new knowledge article
   */
  const createArticle = useCallback(async (articleData: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'helpfulVotes' | 'totalVotes'>) => {
    try {
      const newArticle: KnowledgeArticle = {
        ...articleData,
        id: `article-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 0,
        helpfulVotes: 0,
        totalVotes: 0,
      };

      setArticles(prev => [...prev, newArticle]);
      console.info('[KnowledgeBase] Created article:', newArticle.id);
      return newArticle;
    } catch (err: any) {
      console.error('[KnowledgeBase] Failed to create article:', err);
      setError(`Failed to create article: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Update existing article
   */
  const updateArticle = useCallback(async (id: string, updates: Partial<KnowledgeArticle>) => {
    try {
      setArticles(prev => prev.map(article =>
        article.id === id ? { ...article, ...updates, updatedAt: new Date().toISOString() } : article
      ));

      console.info('[KnowledgeBase] Updated article:', id);
    } catch (err: any) {
      console.error('[KnowledgeBase] Failed to update article:', err);
      setError(`Failed to update article: ${err.message}`);
    }
  }, []);

  /**
   * Publish article
   */
  const publishArticle = useCallback(async (id: string) => {
    await updateArticle(id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
    });
  }, [updateArticle]);

  /**
   * Archive article
   */
  const archiveArticle = useCallback(async (id: string) => {
    await updateArticle(id, { status: 'archived' });
  }, [updateArticle]);

  /**
   * Create knowledge category
   */
  const createCategory = useCallback(async (categoryData: Omit<KnowledgeCategory, 'id' | 'createdAt' | 'updatedAt' | 'articleCount' | 'subcategories'>) => {
    try {
      const newCategory: KnowledgeCategory = {
        ...categoryData,
        id: `category-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        articleCount: 0,
        subcategories: [],
      };

      setCategories(prev => [...prev, newCategory]);
      console.info('[KnowledgeBase] Created category:', newCategory.id);
      return newCategory;
    } catch (err: any) {
      console.error('[KnowledgeBase] Failed to create category:', err);
      setError(`Failed to create category: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Update category
   */
  const updateCategory = useCallback(async (id: string, updates: Partial<KnowledgeCategory>) => {
    try {
      setCategories(prev => prev.map(category =>
        category.id === id ? { ...category, ...updates, updatedAt: new Date().toISOString() } : category
      ));

      console.info('[KnowledgeBase] Updated category:', id);
    } catch (err: any) {
      console.error('[KnowledgeBase] Failed to update category:', err);
      setError(`Failed to update category: ${err.message}`);
    }
  }, []);

  /**
   * Create FAQ entry
   */
  const createFAQ = useCallback(async (faqData: Omit<FAQEntry, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'helpfulCount'>) => {
    try {
      const newFAQ: FAQEntry = {
        ...faqData,
        id: `faq-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 0,
        helpfulCount: 0,
      };

      setFaqs(prev => [...prev, newFAQ]);
      console.info('[KnowledgeBase] Created FAQ:', newFAQ.id);
      return newFAQ;
    } catch (err: any) {
      console.error('[KnowledgeBase] Failed to create FAQ:', err);
      setError(`Failed to create FAQ: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Update FAQ entry
   */
  const updateFAQ = useCallback(async (id: string, updates: Partial<FAQEntry>) => {
    try {
      setFaqs(prev => prev.map(faq =>
        faq.id === id ? { ...faq, ...updates, updatedAt: new Date().toISOString() } : faq
      ));

      console.info('[KnowledgeBase] Updated FAQ:', id);
    } catch (err: any) {
      console.error('[KnowledgeBase] Failed to update FAQ:', err);
      setError(`Failed to update FAQ: ${err.message}`);
    }
  }, []);

  /**
   * Submit feedback for article
   */
  const submitFeedback = useCallback(async (articleId: string, feedbackData: Omit<ArticleFeedback, 'id' | 'articleId' | 'submittedAt'>) => {
    try {
      const newFeedback: ArticleFeedback = {
        ...feedbackData,
        id: `feedback-${Date.now()}`,
        articleId,
        submittedAt: new Date().toISOString(),
      };

      setFeedback(prev => [...prev, newFeedback]);

      // Update article helpful votes
      setArticles(prev => prev.map(article => {
        if (article.id !== articleId) return article;
        return {
          ...article,
          helpfulVotes: feedbackData.helpful ? article.helpfulVotes + 1 : article.helpfulVotes,
          totalVotes: article.totalVotes + 1,
        };
      }));

      console.info('[KnowledgeBase] Submitted feedback for article:', articleId);
      return newFeedback;
    } catch (err: any) {
      console.error('[KnowledgeBase] Failed to submit feedback:', err);
      setError(`Failed to submit feedback: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Search knowledge base
   */
  const search = useCallback(async (query: string, filters?: { category?: string; tags?: string[]; status?: KnowledgeArticle['status'] }) => {
    try {
      let filteredArticles = articles.filter(article => {
        const matchesQuery = query === '' ||
          (article.title ?? '').toLowerCase().includes(query.toLowerCase()) ||
          (article.content ?? '').toLowerCase().includes(query.toLowerCase()) ||
          article.tags.some(tag => (tag ?? '').toLowerCase().includes(query.toLowerCase()));

        const matchesCategory = !filters?.category || article.category === filters.category;
        const matchesStatus = !filters?.status || article.status === filters.status;
        const matchesTags = !filters?.tags?.length || filters.tags.some(tag => article.tags.includes(tag));

        return matchesQuery && matchesCategory && matchesStatus && matchesTags;
      });

      let filteredFAQs = faqs.filter(faq => {
        const matchesQuery = query === '' ||
          (faq.question ?? '').toLowerCase().includes(query.toLowerCase()) ||
          (faq.answer ?? '').toLowerCase().includes(query.toLowerCase());

        const matchesCategory = !filters?.category || faq.category === filters.category;

        return matchesQuery && matchesCategory;
      });

      // Sort by relevance (simplified)
      filteredArticles.sort((a, b) => {
        const aScore = ((a.title ?? '').toLowerCase().includes(query.toLowerCase()) ? 3 : 0) +
                      (a.tags.some(tag => (tag ?? '').toLowerCase().includes(query.toLowerCase())) ? 2 : 0) +
                      a.viewCount * 0.1;
        const bScore = ((b.title ?? '').toLowerCase().includes(query.toLowerCase()) ? 3 : 0) +
                      (b.tags.some(tag => (tag ?? '').toLowerCase().includes(query.toLowerCase())) ? 2 : 0) +
                      b.viewCount * 0.1;
        return bScore - aScore;
      });

      const facets: SearchFacet[] = [
        {
          field: 'category',
          values: filteredArticles.reduce((acc, article) => {
            acc[article.category] = (acc[article.category] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number }),
        },
        {
          field: 'status',
          values: filteredArticles.reduce((acc, article) => {
            acc[article.status] = (acc[article.status] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number }),
        },
      ].map(facet => ({
        field: facet.field,
        values: Object.entries(facet.values).map(([value, count]) => ({ value, count })),
      }));

      // Increment view count for viewed articles
      filteredArticles.forEach(article => {
        setArticles(prev => prev.map(a =>
          a.id === article.id ? { ...a, viewCount: a.viewCount + 1 } : a
        ));
      });

      const result: SearchResult = {
        articles: filteredArticles,
        faqs: filteredFAQs,
        totalResults: filteredArticles.length + filteredFAQs.length,
        searchTime: Math.floor(Math.random() * 500) + 50, // Mock search time
        facets,
      };

      console.info(`[KnowledgeBase] Search completed: ${result.totalResults} results`);
      return result;
    } catch (err: any) {
      console.error('[KnowledgeBase] Search failed:', err);
      setError(`Search failed: ${err.message}`);
      return null;
    }
  }, [articles, faqs]);

  /**
   * Calculate knowledge base analytics
   */
  const calculateAnalytics = useCallback((articles: KnowledgeArticle[], feedback: ArticleFeedback[]): KnowledgeAnalytics => {
    const publishedArticles = articles.filter(a => a.status === 'published').length;
    const totalViews = articles.reduce((sum, article) => sum + article.viewCount, 0);
    const averageRating = feedback.length > 0
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
      : 0;

    const topViewedArticles = articles
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10)
      .map(article => ({ article, views: article.viewCount }));

    const topRatedArticles = articles
      .filter(a => a.totalVotes > 0)
      .sort((a, b) => (b.helpfulVotes / b.totalVotes) - (a.helpfulVotes / a.totalVotes))
      .slice(0, 10)
      .map(article => ({
        article,
        rating: article.totalVotes > 0 ? article.helpfulVotes / article.totalVotes : 0
      }));

    const categoryDistribution = articles.reduce((dist, article) => {
      dist[article.category] = (dist[article.category] || 0) + 1;
      return dist;
    }, {} as { [category: string]: number });

    return {
      totalArticles: articles.length,
      publishedArticles,
      totalViews,
      averageRating: Math.round(averageRating * 10) / 10,
      topViewedArticles,
      topRatedArticles,
      categoryDistribution,
      monthlyViews: generateMonthlyViews(),
      searchQueryTrends: generateSearchTrends(),
      userEngagement: {
        averageSessionDuration: 180 + Math.floor(Math.random() * 300), // 3-8 minutes
        bounceRate: 0.2 + Math.random() * 0.3, // 20-50%
        returnVisitorRate: 0.3 + Math.random() * 0.4, // 30-70%
      },
    };
  }, [articles, feedback]);

  /**
   * Load knowledge base data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockArticles = generateMockArticles();
      const mockCategories = generateMockCategories();
      const mockFAQs = generateMockFAQs();
      const mockFeedback = generateMockFeedback();

      const calculatedAnalytics = calculateAnalytics(mockArticles, mockFeedback);

      setArticles(mockArticles);
      setCategories(mockCategories);
      setFaqs(mockFAQs);
      setFeedback(mockFeedback);
      setAnalytics(calculatedAnalytics);

      console.info('[KnowledgeBase] Loaded knowledge base data');
    } catch (err: any) {
      const errorMsg = `Failed to load knowledge base data: ${err.message}`;
      console.error('[KnowledgeBase] Error:', err);
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

    console.info('[KnowledgeBase] Started real-time updates');
  }, [loadData]);

  /**
   * Stop real-time updates
   */
  const stopRealTimeUpdates = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.info('[KnowledgeBase] Stopped real-time updates');
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
   * Get articles by category
   */
  const getArticlesByCategory = useCallback((category: string) => {
    return articles.filter(article => article.category === category);
  }, [articles]);

  /**
   * Get articles by status
   */
  const getArticlesByStatus = useCallback((status: KnowledgeArticle['status']) => {
    return articles.filter(article => article.status === status);
  }, [articles]);

  /**
   * Get related articles
   */
  const getRelatedArticles = useCallback((articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return [];

    return articles.filter(a =>
      a.id !== articleId &&
      (a.category === article.category ||
       a.tags.some(tag => article.tags.includes(tag)) ||
       article.relatedArticles.includes(a.id))
    ).slice(0, 5);
  }, [articles]);

  /**
   * Export knowledge base
   */
  const exportKnowledgeBase = useCallback(async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const exportData = {
        articles: articles.filter(a => a.status === 'published'),
        categories,
        faqs,
        exportedAt: new Date().toISOString(),
        format,
      };

      // Mock export - in real implementation would generate actual file
      console.info(`[KnowledgeBase] Exported knowledge base in ${format} format`);
      return exportData;
    } catch (err: any) {
      console.error('[KnowledgeBase] Failed to export knowledge base:', err);
      setError(`Failed to export knowledge base: ${err.message}`);
      return null;
    }
  }, [articles, categories, faqs]);

  return {
    articles,
    categories,
    faqs,
    feedback,
    analytics,
    isLoading,
    error,
    createArticle,
    updateArticle,
    publishArticle,
    archiveArticle,
    createCategory,
    updateCategory,
    createFAQ,
    updateFAQ,
    submitFeedback,
    search,
    getArticlesByCategory,
    getArticlesByStatus,
    getRelatedArticles,
    exportKnowledgeBase,
    refreshData: loadData,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  };
};

/**
 * Generate mock articles for development
 */
function generateMockArticles(): KnowledgeArticle[] {
  const categories = ['Getting Started', 'Troubleshooting', 'Best Practices', 'API Reference', 'Security'];
  const difficulties: KnowledgeArticle['metadata']['difficulty'][] = ['beginner', 'intermediate', 'advanced'];
  const statuses: KnowledgeArticle['status'][] = ['draft', 'published', 'review_required'];

  return Array.from({ length: 25 }, (_, index) => ({
    id: `article-${index + 1}`,
    title: `How to ${['Configure SSO', 'Troubleshoot Network Issues', 'Optimize Performance', 'Use the API', 'Secure Your Account'][index % 5]} ${Math.floor(index / 5) + 1}`,
    content: `Detailed content for article ${index + 1}. This article covers important information about ${categories[index % categories.length].toLowerCase()}.`,
    summary: `Summary of article ${index + 1} explaining the key points.`,
    category: categories[index % categories.length],
    tags: ['guide', 'tutorial', 'help'].slice(0, Math.floor(Math.random() * 3) + 1),
    status: statuses[index % statuses.length],
    author: 'knowledge-admin@company.com',
    reviewers: ['reviewer1@company.com', 'reviewer2@company.com'],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: index % 3 !== 0 ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    viewCount: Math.floor(Math.random() * 1000) + 50,
    helpfulVotes: Math.floor(Math.random() * 50) + 10,
    totalVotes: Math.floor(Math.random() * 80) + 20,
    attachments: index % 4 === 0 ? [
      {
        id: `attachment-${index + 1}`,
        fileName: 'diagram.png',
        fileType: 'image/png',
        size: 102400,
        uploadedBy: 'knowledge-admin@company.com',
        uploadedAt: new Date().toISOString(),
        url: '/attachments/diagram.png',
        description: 'Process flow diagram',
      },
    ] : [],
    relatedArticles: [`article-${(index + 1) % 25 + 1}`, `article-${(index + 2) % 25 + 1}`],
    metadata: {
      estimatedReadTime: 5 + Math.floor(Math.random() * 15),
      difficulty: difficulties[index % difficulties.length],
      audience: ['administrators', 'developers', 'end-users'][index % 3] ? ['administrators'] : ['end-users'],
      prerequisites: index % 3 === 0 ? ['Basic knowledge of the system'] : undefined,
      relatedLinks: [
        { title: 'Related Documentation', url: 'https://docs.company.com' },
      ],
      version: '1.0',
      lastReviewed: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
  }));
}

/**
 * Generate mock categories for development
 */
function generateMockCategories(): KnowledgeCategory[] {
  return [
    {
      id: 'category-1',
      name: 'Getting Started',
      description: 'Articles to help new users get started',
      color: '#4CAF50',
      icon: 'rocket',
      articleCount: 8,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      subcategories: [],
    },
    {
      id: 'category-2',
      name: 'Troubleshooting',
      description: 'Solutions to common problems',
      color: '#FF9800',
      icon: 'wrench',
      articleCount: 12,
      createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      subcategories: [
        {
          id: 'subcategory-1',
          name: 'Network Issues',
          description: 'Network-related troubleshooting',
          parentId: 'category-2',
          color: '#FF9800',
          articleCount: 5,
          createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          subcategories: [],
        },
      ],
    },
  ];
}

/**
 * Generate mock FAQs for development
 */
function generateMockFAQs(): FAQEntry[] {
  const categories = ['General', 'Technical', 'Billing', 'Security'];

  return Array.from({ length: 15 }, (_, index) => ({
    id: `faq-${index + 1}`,
    question: `How do I ${['reset my password', 'configure two-factor authentication', 'export my data', 'contact support', 'update my profile'][index % 5]}?`,
    answer: `To ${['reset your password', 'configure two-factor authentication', 'export your data', 'contact support', 'update your profile'][index % 5]}, follow these steps...`,
    category: categories[index % categories.length],
    tags: ['faq', 'common'].slice(0, Math.floor(Math.random() * 2) + 1),
    viewCount: Math.floor(Math.random() * 500) + 20,
    helpfulCount: Math.floor(Math.random() * 100) + 10,
    createdBy: 'support@company.com',
    createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    relatedArticles: [`article-${Math.floor(Math.random() * 25) + 1}`],
  }));
}

/**
 * Generate mock feedback for development
 */
function generateMockFeedback(): ArticleFeedback[] {
  return Array.from({ length: 50 }, (_, index) => ({
    id: `feedback-${index + 1}`,
    articleId: `article-${Math.floor(Math.random() * 25) + 1}`,
    userId: `user-${Math.floor(Math.random() * 100) + 1}`,
    rating: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
    comment: index % 3 === 0 ? 'This article was very helpful!' : undefined,
    helpful: Math.random() > 0.3,
    submittedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }));
}

/**
 * Generate mock monthly views for development
 */
function generateMonthlyViews(): Array<{ month: string; views: number }> {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({
      month: date.toISOString().substring(0, 7),
      views: Math.floor(Math.random() * 5000) + 1000,
    });
  }
  return months;
}

/**
 * Generate mock search trends for development
 */
function generateSearchTrends(): Array<{ query: string; count: number }> {
  const queries = ['password reset', 'api documentation', 'troubleshooting', 'getting started', 'configuration'];
  return queries.map(query => ({
    query,
    count: Math.floor(Math.random() * 200) + 50,
  }));
}