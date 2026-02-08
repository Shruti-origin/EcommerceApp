import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { wp, hp } from '../utils/responsive';
import SaleBannerNative from '../component/SaleBannerNative';
import ProductGridNative from '../component/ProductGridNative';
import {CategorySections}  from '../component/CategoryProductsGrid';

const Categories: React.FC<{ navigate?: (screen: string, params?: any) => void }> = ({ navigate }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SaleBannerNative />
      <ProductGridNative />

      {/* Render the prepared sections (assets imported inside the component file) */}
      <CategorySections navigate={navigate} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: hp(3),
  },
});

export default Categories;
