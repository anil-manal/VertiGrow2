// app/CompanyListScreen.tsx
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

interface CompanyImage {
  id: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
  };
}

interface Company {
  id: number;
  title: string;
  slug: string;
  short_description: string | any[];
  website_url?: string;
  established_year?: number;
  headquarters?: string;
  specialization?: string;
  number_of_facilities?: number;
  key_technologies?: string[];
  logo?: CompanyImage;
  featured_image?: CompanyImage;
}

const CompanyListScreen = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCompanies = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await axios.get('/companies', {
        params: {
          populate: ['logo', 'featured_image'],
          sort: 'title:asc',
          'pagination[page]': isRefreshing ? 1 : page,
          'pagination[pageSize]': 10,
          publicationState: 'live'
        }
      });

      if (!response.data?.data) {
        throw new Error('API response missing data field');
      }

      const companiesData = Array.isArray(response.data.data) 
        ? response.data.data 
        : [response.data.data];

      const transformedCompanies = companiesData
        .filter(apiCompany => apiCompany?.title)
        .map(apiCompany => ({
          id: apiCompany.id,
          title: apiCompany.title.trim(),
          slug: apiCompany.slug,
          short_description: apiCompany.short_description,
          website_url: apiCompany.website_url,
          established_year: apiCompany.established_year,
          headquarters: apiCompany.headquarters,
          specialization: apiCompany.specialization,
          number_of_facilities: apiCompany.number_of_facilities,
          key_technologies: apiCompany.key_technologies,
          logo: apiCompany.logo?.data?.attributes || apiCompany.logo,
          featured_image: apiCompany.featured_image?.data?.attributes || apiCompany.featured_image
        }));

      if (transformedCompanies.length === 0) {
        if (companiesData.length > 0) {
          throw new Error('Companies exist but are missing titles');
        }
        setCompanies([]);
        return;
      }

      if (isRefreshing || page === 1) {
        setCompanies(transformedCompanies);
      } else {
        setCompanies(prev => [...prev, ...transformedCompanies]);
      }

      setTotalPages(response.data.meta?.pagination?.pageCount || 1);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.error?.message || 
               err.message || 
               'Failed to load companies. Please try again.');
      if (isRefreshing || page === 1) {
        setCompanies([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, retryCount]);

  const onRefresh = () => {
    fetchCompanies(true);
  };

  const loadMoreCompanies = () => {
    if (page < totalPages && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const extractTextFromDescription = (description: any): string => {
    if (typeof description === 'string') return description;
    if (!Array.isArray(description)) return '';
    
    return description
      .map(item => {
        if (item.type === 'paragraph' && item.children) {
          return item.children.map(child => child.text).join(' ');
        }
        return '';
      })
      .filter(text => text)
      .join('\n\n');
  };

  const renderCompanyItem = ({ item }: { item: Company }) => {
    const descriptionText = extractTextFromDescription(item.short_description);
    const logoUrl = item.logo?.formats?.thumbnail?.url || item.logo?.url;
    const fullLogoUrl = logoUrl?.startsWith('http') 
      ? logoUrl 
      : `${axios.defaults.baseURL?.replace('/api', '')}${logoUrl}`;

    return (
      <Link href={`/companies/${item.slug}`} asChild>
        <TouchableOpacity style={styles.companyCard}>
          {fullLogoUrl ? (
            <Image
              source={{ uri: fullLogoUrl }}
              style={styles.companyLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.companyLogo, styles.logoPlaceholder]}>
              <Ionicons name="business-outline" size={24} color="#6c757d" />
            </View>
          )}
          <View style={styles.companyContent}>
            <Text style={styles.companyTitle}>{item.title}</Text>
            {item.specialization && (
              <Text style={styles.companySpecialization}>{item.specialization}</Text>
            )}
            {descriptionText ? (
              <Text style={styles.companyDescription} numberOfLines={2}>
                {descriptionText}
              </Text>
            ) : null}
            {item.headquarters && (
              <Text style={styles.companyLocation}>
                <Ionicons name="location-outline" size={14} color="#6c757d" />
                {item.headquarters}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6c757d" />
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
        <Text style={styles.loadingText}>Loading companies...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning-outline" size={40} color="#dc3545" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (companies.length === 0 && !loading) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="business-outline" size={50} color="#6c757d" />
        <Text style={styles.emptyText}>No companies available</Text>
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
      data={companies}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderCompanyItem}
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
      onEndReached={loadMoreCompanies}
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
  companyCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  logoPlaceholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyContent: {
    flex: 1,
  },
  companyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#212529',
  },
  companySpecialization: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  companyDescription: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  companyLocation: {
    fontSize: 12,
    color: '#6c757d',
  },
  separator: {
    height: 12,
  },
  footer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CompanyListScreen;