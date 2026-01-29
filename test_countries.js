// Test script to check if countries API integration is working
// This script simulates the API call to verify the endpoint and data structure

const testCountriesAPI = async () => {
  try {
    console.log('Testing countries API integration...');
    
    // Test local API endpoint (adjust URL as needed)
    const apiUrl = 'http://localhost:3000/api/countries'; // Change this to your actual API endpoint
    
    console.log('Fetching from:', apiUrl);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('Raw API Response:', data);
    console.log('Response type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    
    // Test different response structures
    const countriesData = data.data || data.countries || data;
    
    if (Array.isArray(countriesData)) {
      console.log('✅ Valid array structure detected');
      console.log('Total countries:', countriesData.length);
      
      if (countriesData.length > 0) {
        console.log('First country sample:', countriesData[0]);
        
        // Test mapping function
        const formattedCountries = countriesData.map((country, index) => ({
          id: country.id || country._id || country.code || index,
          name: country.name || country.country_name || country.title,
          code: country.code || country.country_code || country.iso_code || country.id
        }));
        
        console.log('✅ Formatted countries sample:');
        console.log(formattedCountries.slice(0, 3));
        
        return formattedCountries;
      } else {
        console.log('⚠️ Empty countries array');
      }
    } else {
      console.log('❌ Invalid data structure - not an array');
    }
    
  } catch (error) {
    console.log('❌ API Error:', error.message);
    
    // Test fallback countries
    console.log('Testing fallback countries...');
    const fallbackCountries = [
      { id: 'IN', name: 'India', code: 'IN' },
      { id: 'US', name: 'United States', code: 'US' },
      { id: 'UK', name: 'United Kingdom', code: 'UK' },
      { id: 'CA', name: 'Canada', code: 'CA' },
      { id: 'AU', name: 'Australia', code: 'AU' }
    ];
    
    console.log('✅ Fallback countries loaded:', fallbackCountries.length);
    return fallbackCountries;
  }
};

// Test REST Countries API as fallback
const testRestCountriesAPI = async () => {
  try {
    console.log('Testing REST Countries API fallback...');
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag');
    const data = await response.json();
    
    console.log('REST Countries API response length:', data.length);
    
    const countryList = data
      .map((c) => ({
        id: c.cca2,
        name: c.name.common,
        code: c.cca2,
        flag: c.flag || '🏳️',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    console.log('✅ REST Countries API working');
    console.log('Sample countries:', countryList.slice(0, 3));
    
    return countryList;
  } catch (error) {
    console.log('❌ REST Countries API Error:', error.message);
  }
};

// Run tests
console.log('=== Countries API Integration Test ===');
console.log('');

// Test your API first
testCountriesAPI().then(() => {
  console.log('');
  // Then test fallback API
  return testRestCountriesAPI();
}).then(() => {
  console.log('');
  console.log('=== Test Complete ===');
}).catch(error => {
  console.log('Test failed:', error);
});