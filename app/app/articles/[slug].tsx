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

interface ArticleImage {
  id: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
  };
}

interface Article {
  id: number;
  title: string;
  slug: string;
  publishedBy: string;
  publishedDate: string;
  mainImage?: ArticleImage;
  content?: Array<{
    __component: string;
    id: number;
    heading?: string;
    paragraph?: any[];
    image?: {
      data?: ArticleImage;
    };
  }>;
}

const ArticleDetailScreen = () => {
  const { slug } = useLocalSearchParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/articles', {
          params: {
            filters: { slug: { $eq: slug } },
            populate: ['mainImage', 'content.image']
          }
        });

        if (!response.data?.data?.[0]) {
          throw new Error('Article not found');
        }

        const apiArticle = response.data.data[0];
        const transformedArticle: Article = {
          id: apiArticle.id,
          title: apiArticle.title,
          slug: apiArticle.slug,
          publishedBy: apiArticle.publishedBy,
          publishedDate: apiArticle.publishedDate,
          mainImage: apiArticle.mainImage,
          content: apiArticle.content?.map(item => ({
            ...item,
            image: item.image ? { data: item.image } : undefined
          }))
        };

        setArticle(transformedArticle);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err.response?.data?.error?.message || 
                err.message || 
                'Failed to load article. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const getImageUrl = (imageData?: ArticleImage) => {
    if (!imageData?.url) return null;
    const url = imageData.formats?.medium?.url || 
               imageData.formats?.small?.url || 
               imageData.url;
    return url.startsWith('http') ? url : `${axios.defaults.baseURL?.replace('/api', '')}${url}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${article?.title}`,
        url: `https://yourapp.com/articles/${article?.slug}`,
        title: article?.title
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleImagePress = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  const renderTextContent = (text: string) => {
    // Simple implementation for rendering text with basic formatting
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check for bold text (surrounded by **)
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return (
          <Text key={`bold-${index}`} style={styles.boldText}>
            {paragraph.slice(2, -2)}
          </Text>
        );
      }
      
      // Check for links (basic implementation)
      if (paragraph.startsWith('[') && paragraph.includes('](')) {
        const linkText = paragraph.match(/\[(.*?)\]/)?.[1];
        const linkUrl = paragraph.match(/\((.*?)\)/)?.[1];
        
        if (linkText && linkUrl) {
          return (
            <Text key={`link-${index}`}>
              <Text 
                style={styles.linkText}
                onPress={() => Linking.openURL(linkUrl)}
              >
                {linkText}
              </Text>
            </Text>
          );
        }
      }
      
      // Regular paragraph
      return (
        <Text key={`para-${index}`} style={styles.paragraphText}>
          {paragraph}
        </Text>
      );
    });
  };

  const renderContent = () => {
    if (!article?.content) return null;

    return article.content.map((component, index) => {
      switch (component.__component) {
        case 'heading.heading':
          return (
            <Text key={`heading-${index}`} style={styles.heading}>
              {component.heading}
            </Text>
          );

        case 'paragraph.paragraph':
          return (
            <View key={`paragraph-${index}`} style={styles.paragraph}>
              {component.paragraph?.map((para, paraIndex) => {
                if (para.type === 'paragraph') {
                  const textContent = para.children?.[0]?.text || '';
                  return (
                    <View key={`para-${paraIndex}`}>
                      {renderTextContent(textContent)}
                    </View>
                  );
                } else if (para.type === 'list') {
                  return (
                    <View key={`list-${paraIndex}`} style={styles.listContainer}>
                      {para.children?.map((item, itemIndex) => (
                        <View key={`item-${itemIndex}`} style={styles.listItem}>
                          <View style={styles.bulletPoint} />
                          <Text style={styles.listText}>
                            {item.children?.[0]?.text}
                          </Text>
                        </View>
                      ))}
                    </View>
                  );
                }
                return null;
              })}
            </View>
          );

        case 'image.image':
          const imageUrl = getImageUrl(component.image?.data);
          return imageUrl ? (
            <TouchableOpacity 
              key={`image-${index}`}
              onPress={() => handleImagePress(imageUrl)}
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
                  resizeMode="cover"
                  onLoadEnd={() => setIsImageLoading(false)}
                  defaultSource={require('../../assets/placeholder-image.png')}
                />
              </View>
              <Text style={styles.imageCaption}>Tap to view full image</Text>
            </TouchableOpacity>
          ) : null;

        default:
          return null;
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading Article...</Text>
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

  if (!article) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document-text-outline" size={50} color="#6c757d" />
        <Text style={styles.emptyText}>Article not found</Text>
      </View>
    );
  }

  const mainImageUrl = getImageUrl(article.mainImage);

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Image with Gradient Overlay */}
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
            source={require('../../assets/placeholder-image.png')}
            style={styles.mainImage}
            resizeMode="cover"
          />
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
      </View>
      
      {/* Article Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{article.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.authorContainer}>
            <Ionicons name="person-circle-outline" size={16} color="#6c757d" />
            <Text style={styles.author}>{article.publishedBy}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#6c757d" />
            <Text style={styles.date}>
              {new Date(article.publishedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {renderContent()}

        {/* Article Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Enjoyed this article?</Text>
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.footerButton}>
              <Ionicons name="thumbs-up-outline" size={18} color="#2E7D32" />
              <Text style={styles.footerButtonText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={18} color="#2E7D32" />
              <Text style={styles.footerButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
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
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
    marginLeft: 6,
  },
  date: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 24,
    color: '#2E7D32',
    lineHeight: 30,
  },
  paragraph: {
    marginBottom: 24,
  },
  paragraphText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4a4a',
    marginBottom: 16,
  },
  boldText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4a4a',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  linkText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2E7D32',
    textDecorationLine: 'underline',
    marginBottom: 16,
  },
  listContainer: {
    marginLeft: 8,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4a4a',
    flex: 1,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
    backgroundColor: '#f8f9fa',
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
    marginTop: -8,
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
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  footerButtonText: {
    marginLeft: 8,
    color: '#2E7D32',
    fontWeight: '500',
  },
});

export default ArticleDetailScreen;