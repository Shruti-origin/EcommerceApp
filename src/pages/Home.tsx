import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import HeroSection from '../component/HeroSectionNative';
import BestSelling from '../component/BestSelling';
import OffsetPrintingNative from '../component/OffsetPrintingNative';
import ScrollingSectionNative from '../component/ScrollingSectionNative';

import Features from '../component/FeaturesNative';
import PrintingNative from '../component/PrintingNative';

// import TestimonialNative from '../component/TestimonialNative';
// import Testimonial from '../component/TestimonialNative';
import TestimonialNative from '../component/TestimonialNative';
import OffsetPrinting from '../component/OffsetPrintingNative';


const Home = ({ navigate }: { navigate?: (screen: string, params?: any) => void }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section Component */}

      {/* Best Selling Component */}
      <HeroSection /> 

      <BestSelling navigate={navigate} />

      {/* Scrolling brand section */}
      <ScrollingSectionNative navigate={navigate} />

       {/* Offset Printing Section */}
    {/*  */}
      <OffsetPrintingNative navigate={navigate} />


      
        {/* Testimonials Section */}
      <TestimonialNative />

      
      {/* Features Section */}
      <Features />




      {/* Additional home page content can be added below */}
      <View style={styles.content}>
        {/* Add more sections here */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
});

export default Home;
