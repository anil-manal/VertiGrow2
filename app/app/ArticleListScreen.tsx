import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { Link } from 'expo-router';
import axios from '../utils/axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ArticleImage {
  id: number;
  attributes: {
    url: string;
    formats?: {
      thumbnail?: {
        url: string;
      };
      small?: {
        url: string;
      };
      medium?: {
        url: string;
      };
    };
  };
}

interface Article {
    id: number;
    title: string;
    slug: string;
    publishedBy: string;
    publishedDate: string;
    mainImage?: {
      id: number;
      url: string;
      formats?: {
        thumbnail?: {
          url: string;
        };
        small?: {
          url: string;
        };
      };
    };
}

const ArticleListScreen = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await axios.get('/articles', {
        params: {
          populate: '*',
          sort: 'publishedDate:desc',
          'pagination[page]': isRefreshing ? 1 : page,
          'pagination[pageSize]': 10,
          publicationState: 'live'
        }
      });
  
      console.log('API Response:', JSON.stringify(response.data, null, 2));
  
      if (!response.data?.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid API response structure');
      }
  
      const transformedArticles = response.data.data
        .filter(apiArticle => apiArticle?.title) // Check for title at root level
        .map((apiArticle) => ({
          id: apiArticle.id,
          title: apiArticle.title || 'Untitled Article',
          slug: apiArticle.slug || '',
          publishedBy: apiArticle.publishedBy || 'Unknown Author',
          publishedDate: apiArticle.publishedDate || new Date().toISOString(),
          mainImage: apiArticle.mainImage
        }));
  
      if (transformedArticles.length === 0) {
        throw new Error('No articles found');
      }
  
      if (isRefreshing || page === 1) {
        setArticles(transformedArticles);
      } else {
        setArticles(prev => [...prev, ...transformedArticles]);
      }
  
      setTotalPages(response.data.meta?.pagination?.pageCount || 1);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.error?.message || 
               err.message || 
               'Failed to load articles. Please try again.');
      if (isRefreshing || page === 1) {
        setArticles([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page]);

  const onRefresh = () => {
    fetchArticles(true);
  };

  const loadMoreArticles = () => {
    if (page < totalPages && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const renderArticleItem = ({ item }: { item: Article }) => {
    if (!item) return null;
  
    let imageUrl;
    if (item.mainImage) {
      imageUrl = item.mainImage.formats?.small?.url || 
                item.mainImage.url;
    }
  
    return (
      <Link href={`/articles/${item.slug || ''}`} asChild>
        <TouchableOpacity style={styles.articleCard}>
          {imageUrl ? (
            <Image
              source={{ 
                uri: imageUrl.startsWith('http') 
                  ? imageUrl 
                  : `${axios.defaults.baseURL?.replace('/api', '')}${imageUrl}`
              }}
              style={styles.articleImage}
              resizeMode="cover"
              defaultSource={require('../assets/placeholder-image.png')}
            />
          ) : (
            <Image
              source={require('../assets/placeholder-image.png')}
              style={styles.articleImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.articleContent}>
            <Text style={styles.articleTitle}>{item.title || 'Untitled Article'}</Text>
            <Text style={styles.articleAuthor}>{item.publishedBy || 'Unknown Author'}</Text>
            <Text style={styles.articleDate}>
              {item.publishedDate ? 
                new Date(item.publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Date not available'}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#2E7D32" />
      </View>
    );
  };

  if (loading && page === 1 && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading articles...</Text>
      </View>
    );
  }

  if (error && articles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning-outline" size={40} color="#dc3545" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchArticles(true)}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (articles.length === 0 && !loading) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="newspaper-outline" size={50} color="#6c757d" />
        <Text style={styles.emptyText}>No articles found</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderArticleItem}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2E7D32']}
          tintColor="#2E7D32"
        />
      }
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListFooterComponent={renderFooter}
      onEndReached={loadMoreArticles}
      onEndReachedThreshold={0.5}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#2E7D32',
    fontSize: 16,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginVertical: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    marginTop: 16,
  },
  refreshButton: {
    borderWidth: 1,
    borderColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 16,
  },
  refreshButtonText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 80 : 60,
  },
  articleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  articleImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  articleContent: {
    padding: 16,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#212529',
  },
  articleAuthor: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  articleDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  separator: {
    height: 16,
  },
  footer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ArticleListScreen;