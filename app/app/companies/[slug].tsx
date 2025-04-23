// app/companies/[slug].tsx
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

interface CompanyImage {
  id: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
  };
}

interface ContentBlock {
  __component: string;
  id: number;
  heading?: string;
  paragraph?: any[];
  image?: {
    data?: {
      attributes?: CompanyImage;
    };
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
  content?: ContentBlock[];
}

const CompanyDetailScreen = () => {
  const { slug } = useLocalSearchParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/companies', {
          params: {
            filters: { slug: { $eq: slug } },
            populate: ['logo', 'featured_image', 'content.image']
          }
        });

        console.log('API Response:', JSON.stringify(response.data, null, 2));

        if (!response.data?.data?.[0]) {
          throw new Error('Company not found');
        }

        const apiCompany = response.data.data[0];
        const transformedCompany: Company = {
          id: apiCompany.id,
          title: apiCompany.attributes?.title || apiCompany.title,
          slug: apiCompany.attributes?.slug || apiCompany.slug,
          short_description: apiCompany.attributes?.short_description || apiCompany.short_description,
          website_url: apiCompany.attributes?.website_url || apiCompany.website_url,
          established_year: apiCompany.attributes?.established_year || apiCompany.established_year,
          headquarters: apiCompany.attributes?.headquarters || apiCompany.headquarters,
          specialization: apiCompany.attributes?.specialization || apiCompany.specialization,
          number_of_facilities: apiCompany.attributes?.number_of_facilities || apiCompany.number_of_facilities,
          key_technologies: apiCompany.attributes?.key_technologies || apiCompany.key_technologies,
          logo: apiCompany.attributes?.logo?.data?.attributes || apiCompany.logo?.data?.attributes || apiCompany.logo,
          featured_image: apiCompany.attributes?.featured_image?.data?.attributes || apiCompany.featured_image?.data?.attributes || apiCompany.featured_image,
          content: apiCompany.attributes?.content || apiCompany.content
        };

        setCompany(transformedCompany);
      } catch (err) {
        console.error('Error fetching company:', err);
        setError(err.response?.data?.error?.message || 
                err.message || 
                'Failed to load company. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [slug]);

  const getImageUrl = (imageData?: CompanyImage | { attributes?: CompanyImage }): string | null => {
    // Handle both direct image data and data nested under attributes
    const actualImageData = (imageData as any)?.attributes || imageData;
    if (!actualImageData?.url) return null;
    
    const url = actualImageData.formats?.medium?.url || 
               actualImageData.formats?.small?.url || 
               actualImageData.url;
    
    // Ensure URL is absolute
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${axios.defaults.baseURL?.replace('/api', '')}${url}`;
    return `${axios.defaults.baseURL?.replace('/api', '')}/${url}`;
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this company: ${company?.title}`,
        url: company?.website_url || `https://yourapp.com/companies/${company?.slug}`,
        title: company?.title
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleWebsitePress = () => {
    if (company?.website_url) {
      Linking.openURL(company.website_url.startsWith('http') 
        ? company.website_url 
        : `https://${company.website_url}`);
    }
  };

  const renderContentBlock = (block: ContentBlock, index: number) => {
    const imageUrl = block.image?.data ? getImageUrl(block.image.data) : null;
    
    switch (block.__component) {
      case 'heading.heading':
        return (
          <Text key={`heading-${index}`} style={styles.heading}>
            {block.heading}
          </Text>
        );
        
      case 'paragraph.paragraph':
        return (
          <View key={`paragraph-${index}`} style={styles.paragraph}>
            {block.paragraph?.map((para, paraIndex) => (
              <Text key={`para-${paraIndex}`} style={styles.paragraphText}>
                {para.children?.[0]?.text}
              </Text>
            ))}
          </View>
        );
        
      case 'image.image':
        return imageUrl ? (
          <TouchableOpacity 
            key={`image-${index}`}
            onPress={() => WebBrowser.openBrowserAsync(imageUrl)}
            activeOpacity={0.8}
          >
            <View style={styles.imageContainer}>
              {isImageLoading && (
                <View style={styles.imagePlaceholder}>
                  <ActivityIndicator size="small" color="#2E7D32" />
                </View>
              )}
              <Image
                source={{ uri: imageUrl }}
                style={styles.contentImage}
                resizeMode="contain"
                onLoadEnd={() => setIsImageLoading(false)}
              />
              <Text style={styles.imageCaption}>Tap to view full image</Text>
            </View>
          </TouchableOpacity>
        ) : null;
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading Company...</Text>
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

  if (!company) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="business-outline" size={50} color="#6c757d" />
        <Text style={styles.emptyText}>Company not found</Text>
      </View>
    );
  }

  const featuredImageUrl = getImageUrl(company.featured_image);
  const logoUrl = getImageUrl(company.logo);
  const descriptionText = extractTextFromDescription(company.short_description);

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Featured Image Header */}
      <View style={styles.imageHeader}>
        {featuredImageUrl ? (
          <Image
            source={{ uri: featuredImageUrl }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.featuredImage, styles.featuredImagePlaceholder]}>
            <Ionicons name="business-outline" size={60} color="#6c757d" />
          </View>
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.gradientOverlay}
        />
        
        {/* Back and Share buttons */}
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
        
        {/* Company Logo */}
        {logoUrl && (
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: logoUrl }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
      
      {/* Company Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{company.title}</Text>
        
        {company.specialization && (
          <Text style={styles.specialization}>{company.specialization}</Text>
        )}
        
        <View style={styles.metaContainer}>
          {company.headquarters && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={18} color="#6c757d" />
              <Text style={styles.metaText}>{company.headquarters}</Text>
            </View>
          )}
          
          {company.established_year && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={18} color="#6c757d" />
              <Text style={styles.metaText}>Est. {company.established_year}</Text>
            </View>
          )}
          
          {company.number_of_facilities && (
            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={18} color="#6c757d" />
              <Text style={styles.metaText}>{company.number_of_facilities} facilities</Text>
            </View>
          )}
        </View>
        
        {company.website_url && (
          <TouchableOpacity 
            style={styles.websiteButton}
            onPress={handleWebsitePress}
          >
            <Ionicons name="globe-outline" size={18} color="#2E7D32" />
            <Text style={styles.websiteText}>Visit Website</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.divider} />
        
        {descriptionText && (
          <Text style={styles.description}>{descriptionText}</Text>
        )}
        
        {company.key_technologies && company.key_technologies.length > 0 && (
          <View style={styles.techContainer}>
            <Text style={styles.sectionTitle}>Key Technologies</Text>
            <View style={styles.techList}>
              {company.key_technologies.map((tech, index) => (
                <View key={`tech-${index}`} style={styles.techPill}>
                  <Text style={styles.techText}>{tech}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {company.content?.map((block, index) => renderContentBlock(block, index))}
        
        {/* Company Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Want to know more about {company.title}?</Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleWebsitePress}
          >
            <Text style={styles.contactButtonText}>Visit Their Website</Text>
          </TouchableOpacity>
        </View>
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
    height: 250,
    width: '100%',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  featuredImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
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
  logoContainer: {
    position: 'absolute',
    bottom: -40,
    left: 24,
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: '80%',
    height: '80%',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    color: '#212529',
    lineHeight: 34,
  },
  specialization: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '600',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
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
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  websiteText: {
    fontSize: 16,
    color: '#2E7D32',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4a4a',
    marginBottom: 24,
  },
  techContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#212529',
  },
  techList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techPill: {
    backgroundColor: '#e9f5eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  techText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 16,
    color: '#212529',
  },
  paragraph: {
    marginBottom: 16,
  },
  paragraphText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4a4a',
    marginBottom: 12,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  contentImage: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  imageCaption: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CompanyDetailScreen;