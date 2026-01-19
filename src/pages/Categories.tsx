import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import SaleBannerNative from '../component/SaleBannerNative';
import ProductGridNative from '../component/ProductGridNative';
import { CategorySections } from '../component/CategoryProductsGrid';

const Categories: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SaleBannerNative />
      <ProductGridNative />

      {/* Render the prepared sections (assets imported inside the component file) */}
      <CategorySections />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 24,
  },
});

export default Categories;
