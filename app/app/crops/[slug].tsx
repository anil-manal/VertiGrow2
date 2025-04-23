import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Share,
  Linking
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from '../../utils/axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';

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
  content?: any[];
}

const CropDetailScreen = () => {
  const { slug } = useLocalSearchParams();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/crops', {
          params: {
            filters: { slug: { $eq: slug } },
            populate: ['mainImage', 'content']
          }
        });

        if (!response.data?.data?.[0]) {
          throw new Error('Crop not found');
        }

        const apiCrop = response.data.data[0];
        setCrop({
          id: apiCrop.id,
          name: apiCrop.name,
          slug: apiCrop.slug,
          scientificName: apiCrop.scientificName,
          description: apiCrop.description,
          growthTime: apiCrop.growthTime,
          difficultyLevel: apiCrop.difficultyLevel,
          lightRequirements: apiCrop.lightRequirements,
          waterRequirements: apiCrop.waterRequirements,
          nutrientRequirements: apiCrop.nutrientRequirements,
          harvestTips: apiCrop.harvestTips,
          yieldPerSquareFoot: apiCrop.yieldPerSquareFoot,
          mainImage: apiCrop.mainImage,
          content: apiCrop.content
        });
      } catch (err) {
        console.error('Error fetching crop:', err);
        setError(err.response?.data?.error?.message || 
                err.message || 
                'Failed to load crop. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCrop();
  }, [slug]);

  const getImageUrl = (imageData?: CropImage) => {
    if (!imageData?.url) return null;
    const url = imageData.formats?.medium?.url || 
               imageData.formats?.small?.url || 
               imageData.url;
    return url.startsWith('http') ? url : `${axios.defaults.baseURL?.replace('/api', '')}${url}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this crop: ${crop?.name}`,
        url: `https://yourapp.com/crops/${crop?.slug}`,
        title: crop?.name
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleImagePress = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  const renderTextContent = (content: any[]) => {
    return content?.map((block, index) => {
      if (block.type === 'paragraph' && block.children) {
        return (
          <Text key={`para-${index}`} style={styles.paragraphText}>
            {block.children.map((child, childIndex) => (
              <Text key={`child-${childIndex}`}>
                {child.text}
              </Text>
            ))}
          </Text>
        );
      }
      return null;
    });
  };

  const renderDynamicZone = (content: any[]) => {
    return content?.map((item, index) => {
      switch (item.__component) {
        case 'video.video':
          return (
            <View key={`video-${index}`} style={styles.videoContainer}>
              <Text style={styles.videoTitle}>{item.title}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
                <Text style={styles.videoLink}>Watch Video</Text>
              </TouchableOpacity>
            </View>
          );
        
        case 'paragraph.paragraph':
          return (
            <View key={`paragraph-${index}`} style={styles.paragraphContainer}>
              <Text style={styles.paragraphText}>{item.text}</Text>
            </View>
          );
        
        case 'image.image':
          const imageUrl = item.image?.url?.startsWith('http') 
            ? item.image.url 
            : `${axios.defaults.baseURL?.replace('/api', '')}${item.image.url}`;
          
          return (
            <TouchableOpacity 
              key={`image-${index}`} 
              onPress={() => imageUrl && handleImagePress(imageUrl)}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.contentImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          );
        
        case 'heading.heading':
          return (
            <Text key={`heading-${index}`} style={[
              styles.headingText,
              item.level === 'h1' && styles.heading1,
              item.level === 'h2' && styles.heading2,
              item.level === 'h3' && styles.heading3,
            ]}>
              {item.text}
            </Text>
          );
        
        default:
          console.warn('Unknown component type:', item.__component);
          return null;
      }
    });
  };

  const mainImageUrl = getImageUrl(crop?.mainImage);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading Crop...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning-outline" size={50} color="#dc3545" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!crop) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="leaf-outline" size={50} color="#6c757d" />
        <Text style={styles.emptyText}>Crop not found</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageHeader}>
        {mainImageUrl ? (
          <Image
            source={{ uri: mainImageUrl }}
            style={styles.mainImage}
            resizeMode="cover"
            onLoadEnd={() => setIsImageLoading(false)}
          />
        ) : (
          <Image
            source={require('../../assets/images/partial-react-logo.png')}
            style={styles.mainImage}
            resizeMode="cover"
          />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.gradientOverlay}
        />
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => window.history.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{crop.name}</Text>
        
        {crop.scientificName && (
          <Text style={styles.scientificName}>{crop.scientificName}</Text>
        )}

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#6c757d" />
            <Text style={styles.metaText}>{crop.growthTime} days to harvest</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="speedometer-outline" size={16} color="#6c757d" />
            <Text style={styles.metaText}>{crop.difficultyLevel}</Text>
          </View>
          {crop.yieldPerSquareFoot && (
            <View style={styles.metaItem}>
              <Ionicons name="stats-chart-outline" size={16} color="#6c757d" />
              <Text style={styles.metaText}>{crop.yieldPerSquareFoot} kg/ft²</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {crop.content && (
          <View style={styles.section}>
            {renderDynamicZone(crop.content)}
          </View>
        )}

        {crop.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            {renderTextContent(crop.description)}
          </View>
        )}

        {crop.lightRequirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Light Requirements</Text>
            <Text style={styles.paragraphText}>{crop.lightRequirements}</Text>
          </View>
        )}

        {crop.waterRequirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Water Requirements</Text>
            <Text style={styles.paragraphText}>{crop.waterRequirements}</Text>
          </View>
        )}

        {crop.nutrientRequirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrient Requirements</Text>
            <Text style={styles.paragraphText}>{crop.nutrientRequirements}</Text>
          </View>
        )}

        {crop.harvestTips && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Harvest Tips</Text>
            {renderTextContent(crop.harvestTips)}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    color: '#6c757d',
    fontSize: 16,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 18,
    marginVertical: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    marginTop: 16,
  },
  imageHeader: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 150,
  },
  headerActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 24,
    marginTop: -40,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
    color: '#212529',
    lineHeight: 34,
  },
  scientificName: {
    fontStyle: 'italic',
    color: '#6c757d',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#2E7D32',
  },
  paragraphText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4a4a',
    marginBottom: 16,
  },
  videoContainer: {
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoLink: {
    color: '#2E7D32',
    textDecorationLine: 'underline',
  },
  paragraphContainer: {
    marginBottom: 16,
  },
  contentImage: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  headingText: {
    fontWeight: 'bold',
    marginVertical: 12,
  },
  heading1: {
    fontSize: 24,
  },
  heading2: {
    fontSize: 20,
  },
  heading3: {
    fontSize: 18,
  },
});

export default CropDetailScreen;