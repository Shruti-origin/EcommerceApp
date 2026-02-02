import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, StyleSheet, Image, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, ActivityIndicator, Text, Alert } from 'react-native';
import { categoryService, vendorService } from '../services/api';

interface VendorImage {
  imageUrl: string;
  vendorId: string;
  vendorName: string;
}

const ScrollingSectionNative: React.FC<{ navigate?: (name: string, params?: any) => void }> = ({ navigate }) => {
  const { width: windowWidth } = useWindowDimensions();
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const [singleWidth, setSingleWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});
  const innerRef = useRef<View | null>(null);
  const [vendorImages, setVendorImages] = useState<VendorImage[]>([]);

  // Static fallback images
  const FALLBACK_IMAGES = [
    require('../../assets/scrolling-img-1.png'),
    require('../../assets/scrolling-img-2.png'),
    require('../../assets/scrolling-img-3.png'),
    require('../../assets/scrolling-img-4.png'),
    require('../../assets/scrolling-img-5.png'),
  ];

  // Fetch images from backend
  useEffect(() => {
    let mounted = true;
    const fetchImages = async () => {
      try {
        setLoading(true);
        
        // Set fallback images immediately so something always shows
        const fallbackImageData = FALLBACK_IMAGES.map((img, index) => ({
          imageUrl: '', // Will use require() source instead
          vendorId: '',
          vendorName: `Brand ${index + 1}`
        }));
        
        if (mounted) setVendorImages(fallbackImageData);
        
        // Try to fetch from vendors with shop images
        console.log('Fetching vendors with status: approved and active: true');
        const vendorResponse = await vendorService.getAll({ status: 'active' });
        const vendors = vendorResponse?.data || vendorResponse || [];
        
        console.log('Vendors fetched:', vendors?.length || 0);
        
        const vendorImagesData: VendorImage[] = [];
        
        if (Array.isArray(vendors) && vendors.length > 0) {
          vendors.forEach((vendor: any) => {
            // Try multiple possible locations for vendor images
            let vendorImagesList: string[] = [];
            
            // Check different image sources
            if (vendor.shopImages?.length > 0) {
              vendorImagesList = vendor.shopImages;
            } else if (vendor.images?.length > 0) {
              vendorImagesList = vendor.images;
            } else if (vendor.vendorProfile?.images?.length > 0) {
              vendorImagesList = vendor.vendorProfile.images;
            } else if (vendor.profileImage) {
              vendorImagesList = [vendor.profileImage];
            } else if (vendor.logo) {
              vendorImagesList = [vendor.logo];
            }
            
            if (vendorImagesList.length > 0) {
              vendorImagesList.forEach((imageUrl: string) => {
                if (imageUrl?.trim()) {
                  const fullImageUrl = imageUrl.startsWith('http') 
                    ? imageUrl 
                    : `https://backend.originplatforms.co${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                  
                  vendorImagesData.push({
                    imageUrl: fullImageUrl,
                    vendorId: vendor.id,
                    vendorName: vendor.businessName || vendor.name || 'Vendor'
                  });
                }
              });
            }
          });
        }
        
        if (!mounted) return;

        // If we got vendor images, use them; otherwise keep fallback images
        if (vendorImagesData.length > 0) {
          console.log('Using vendor images:', vendorImagesData.length);
          const shuffledImages = [...vendorImagesData].sort(() => Math.random() - 0.5);
          setVendorImages(shuffledImages.slice(0, 15));
        } else {
          console.log('Using fallback images');
          // Keep the fallback images we already set
        }
      } catch (error) {
        console.error('Failed to fetch vendor images:', error);
        // Ensure fallback images are set on error
        const fallbackImageData = FALLBACK_IMAGES.map((img, index) => ({
          imageUrl: '', // Will use require() source instead
          vendorId: '',
          vendorName: `Brand ${index + 1}`
        }));
        if (mounted) setVendorImages(fallbackImageData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchImages();
    return () => { mounted = false; };
  }, []);

  // Handle click on vendor image
  const handleVendorClick = (vendorImage: VendorImage) => {
    // Use the registered route name in App: 'VendorShop' (or fallback to vendor listing)
    if (vendorImage.vendorId) {
      navigate?.('VendorShop', { 
        vendorId: vendorImage.vendorId, 
        vendorName: vendorImage.vendorName 
      });
    } else {
      // No vendorId available (fallback images) - open vendors listing / shop page
      navigate?.('VendorShop');
    }
  };

  // Duplicate items so we can seamlessly loop; use vendorImages when available
  const items = vendorImages.length > 0 
    ? [...vendorImages, ...vendorImages, ...vendorImages, ...vendorImages, ...vendorImages, ...vendorImages, ...vendorImages, ...vendorImages] 
    : [];

  // Card dimensions: 50% width with 9px margin
  const cardsPerView = 15; // Show multiple cards in scrolling animation
  
  // Card dimensions based on viewport width and desired cards per view (matching CSS media queries)
  const cardWidth = 120; // Fixed width 120px to show multiple cards
  const cardHeight = windowWidth >= 1024 ? 160 : windowWidth >= 768 ? 136 : windowWidth >= 640 ? 120 : 96;

  useEffect(() => {
    if (!singleWidth || items.length === 0) return;

    // Log for debugging
    console.log('[ScrollingSectionNative] singleWidth:', singleWidth, 'windowWidth:', windowWidth, 'items:', items.length, 'cardsPerView:', cardsPerView, 'cardWidth:', cardWidth);
    
    let rafId: number | null = null;
    const perf = (globalThis as any).performance;
    const hasPerf = perf && typeof perf.now === 'function';
    let last = hasPerf ? perf.now() : Date.now();
    let x = 0; // current translateX value
    const speedPxPerSec = 40; // pixels per second, slower speed for longer scrolling time

    const step = (time?: number) => {
      const now = (typeof time === 'number' && time > 0) ? time : (hasPerf ? perf.now() : Date.now());
      const dt = now - last;
      last = now;

      if (!isPaused) {
        x -= (speedPxPerSec * dt) / 1000;
        // Wrap without visual jump
        if (singleWidth > 0 && Math.abs(x) >= singleWidth) {
          x += singleWidth;
        }
        // Directly set Animated.Value for smooth rendering
        scrollAnim.setValue(x);
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [singleWidth, isPaused, scrollAnim, windowWidth, items.length]);

  // Pause on interaction
  const onPressIn = () => setIsPaused(true);
  const onPressOut = () => setIsPaused(false);

  // When layout happens compute width of single set of images
  const onInnerLayout = (e: any) => {
    const total = e.nativeEvent.layout.width || 0;
    // singleWidth = width of one complete set of items (1/8th of duplicated content)
    setSingleWidth(Math.floor(total / 8));
  };

  if (loading) {
    return (
      <View style={styles.loadingSection}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.loadingText}>Loading brand images...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={[styles.innerWrap, { width: Math.round(windowWidth * 2.2), alignSelf: 'center' }]}>
        <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
          <Animated.View
            onLayout={onInnerLayout}
            ref={innerRef}
            style={[styles.track, { 
              transform: [{ translateX: scrollAnim }],
              paddingVertical: 8, // matches CSS padding: 0.5rem 0
            }]}
          >
            {items.map((vendorImage, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.85}
                onPress={() => {
                  console.log('Card pressed:', vendorImage.vendorName, 'id:', vendorImage.vendorId);
                  if (vendorImage.vendorId) {
                    handleVendorClick(vendorImage);
                  } else {
                    // fallback behavior for items without vendorId (fallback images)
                    Alert.alert(vendorImage.vendorName || 'Vendor', 'Vendor details not available', [
                      { text: 'OK' },
                      { text: 'Open Vendor Page', onPress: () => handleVendorClick(vendorImage) }
                    ]);
                  }
                }}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={[styles.brandCard, { 
                  width: cardWidth, 
                  height: cardHeight,
                  marginRight: 16, // matches CSS gap: 1rem
                }]}
              >
                <Image
                  source={
                    failedIndices[i] || !vendorImage.imageUrl
                      ? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length] 
                      : { uri: vendorImage.imageUrl }
                  }
                  style={[styles.brandImage, { 
                    width: '100%',
                    height: '100%',
                  }]}
                  resizeMode="cover"
                  onError={() => {
                    console.log('Image failed to load, using fallback for index:', i);
                    setFailedIndices(prev => ({ ...prev, [i]: true }));
                  }}
                />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#e85b5b',
    paddingVertical: 12,
  },
  loadingSection: {
    backgroundColor: '#e85b5b',
    paddingVertical: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 96,
    paddingHorizontal: 16,
  },
  loadingText: {
    marginLeft: 12,
    color: '#fff',
    fontSize: 14,
  },
  // matches CSS .scroll-viewport
  innerWrap: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%', // Ensure full width
    minHeight: 100, // Ensure container has height
  },
  // matches CSS .scroll-inner
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap handled by marginRight on cards
    // padding handled inline
    // transform handled inline
  },
  // matches CSS .brand-card with responsive sizing
  brandCard: {
    backgroundColor: '#fff',
    // marginHorizontal removed - using marginRight for gap
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 50, // circular container
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    // width and height set dynamically
  },
  // matches CSS .brand-card img
  brandImage: {
    // width and height: 100% set inline
    borderRadius: 50, // circular image (will be adjusted based on container size)
    padding: 8, // matches CSS padding: 8px
    // objectFit: 'cover' handled by resizeMode="cover"
  },
});

export default ScrollingSectionNative;
