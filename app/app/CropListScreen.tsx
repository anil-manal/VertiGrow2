// app/CropListScreen.tsx
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

interface CropImage {
  id: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
  };
}

interface Crop {
  id: number;
  name: string;
  slug: string;
  scientificName?: string;
  description?: any[];
  growthTime?: number;
  difficultyLevel?: string;
  lightRequirements?: string;
  waterRequirements?: string;
  nutrientRequirements?: string;
  harvestTips?: any[];
  yieldPerSquareFoot?: number;
  mainImage?: CropImage;
}

const CropListScreen = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCrops = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await axios.get('/crops', {
        params: {
          populate: ['mainImage'],
          sort: 'name:asc',
          'pagination[page]': isRefreshing ? 1 : page,
          'pagination[pageSize]': 10,
          publicationState: 'live'
        }
      });

      console.log('API Response:', JSON.stringify(response.data, null, 2));

      if (!response.data?.data) {
        throw new Error('API response missing data field');
      }

      const cropsData = Array.isArray(response.data.data) 
        ? response.data.data 
        : [response.data.data];

      const transformedCrops = cropsData
        .filter(apiCrop => validateCropData(apiCrop))
        .map(apiCrop => ({
          id: apiCrop.id,
          name: apiCrop.name?.trim() || 'Unnamed Crop',
          slug: apiCrop.slug || '',
          scientificName: apiCrop.scientificName,
          description: apiCrop.description,
          growthTime: apiCrop.growthTime || 0,
          difficultyLevel: apiCrop.difficultyLevel || 'Medium',
          lightRequirements: apiCrop.lightRequirements,
          waterRequirements: apiCrop.waterRequirements,
          nutrientRequirements: apiCrop.nutrientRequirements,
          harvestTips: apiCrop.harvestTips,
          yieldPerSquareFoot: apiCrop.yieldPerSquareFoot,
          mainImage: apiCrop.mainImage
        }));

      if (transformedCrops.length === 0) {
        if (cropsData.length > 0) {
          throw new Error('Crops exist but are missing required fields');
        }
        setCrops([]);
        return;
      }

      if (isRefreshing || page === 1) {
        setCrops(transformedCrops);
      } else {
        setCrops(prev => [...prev, ...transformedCrops]);
      }

      setTotalPages(response.data.meta?.pagination?.pageCount || 1);
    } catch (err) {
      console.error('API Error:', {
        message: err.message,
        response: err.response?.data,
        config: err.config
      });
      setError(err.response?.data?.error?.message || 
               err.message || 
               'Failed to load crops. Please try again.');
      if (isRefreshing || page === 1) {
        setCrops([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const validateCropData = (crop: any): boolean => {
    if (!crop?.name) {
      console.warn('Invalid crop data - missing name:', crop.id);
      return false;
    }
    if (!crop?.slug) {
      console.warn('Invalid crop data - missing slug:', crop.id);
      return false;
    }
    return true;
  };

  useEffect(() => {
    fetchCrops();
  }, [page, retryCount]);

  const onRefresh = () => {
    fetchCrops(true);
  };

  const loadMoreCrops = () => {
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

  const renderCropItem = ({ item }: { item: Crop }) => {
    const descriptionText = extractTextFromDescription(item.description);
    const imageUrl = item.mainImage?.formats?.thumbnail?.url || item.mainImage?.url;
    const fullImageUrl = imageUrl?.startsWith('http') 
      ? imageUrl 
      : `${axios.defaults.baseURL?.replace('/api', '')}${imageUrl}`;

    return (
      <Link href={`/crops/${item.slug}`} asChild>
        <TouchableOpacity style={styles.cropCard}>
          {fullImageUrl ? (
            <Image
              source={{ uri: fullImageUrl }}
              style={styles.cropImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cropImage, styles.imagePlaceholder]}>
              <Ionicons name="leaf-outline" size={24} color="#6c757d" />
            </View>
          )}
          <View style={styles.cropContent}>
            <Text style={styles.cropName}>{item.name}</Text>
            {item.scientificName && (
              <Text style={styles.scientificName}>{item.scientificName}</Text>
            )}
            {descriptionText ? (
              <Text style={styles.cropDescription} numberOfLines={2}>
                {descriptionText}
              </Text>
            ) : null}
            <View style={styles.cropMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#6c757d" />
                <Text style={styles.metaText}>
                  {item.growthTime || 'N/A'} days
                </Text>
              </View>
              <View style={[
                styles.difficultyBadge,
                { 
                  backgroundColor: 
                    item.difficultyLevel === 'Easy' ? '#e6f7e6' :
                    item.difficultyLevel === 'Medium' ? '#fff8e6' :
                    '#ffebee'
                }
              ]}>
                <Text style={[
                  styles.difficultyText,
                  { 
                    color: 
                      item.difficultyLevel === 'Easy' ? '#2E7D32' :
                      item.difficultyLevel === 'Medium' ? '#ff9800' :
                      '#f44336'
                  }
                ]}>
                  {item.difficultyLevel}
                </Text>
              </View>
            </View>
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
        <Text style={styles.loadingText}>Loading crops...</Text>
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

  if (crops.length === 0 && !loading) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="leaf-outline" size={50} color="#6c757d" />
        <Text style={styles.emptyText}>No crops available</Text>
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
      data={crops}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderCropItem}
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
      onEndReached={loadMoreCrops}
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
  cropCard: {
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
  cropImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropContent: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    color: '#212529',
  },
  scientificName: {
    fontStyle: 'italic',
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  cropMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
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

export default CropListScreen;