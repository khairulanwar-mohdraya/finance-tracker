import { CATEGORY_MAPPINGS } from '../constants/categories';

export const determineCategory = (details, description) => {
  // Combine and uppercase both details and description for searching
  const searchText = `${details || ''} ${description || ''}`.toUpperCase();
  console.log('Searching in text:', searchText); // Debug log
  
  for (const [category, { keywords }] of Object.entries(CATEGORY_MAPPINGS)) {
    // Convert each keyword to uppercase and check
    const found = keywords.some(keyword => {
      const upperKeyword = keyword.toUpperCase();
      const isFound = searchText.includes(upperKeyword);
      console.log(`Checking ${category} - ${upperKeyword}:`, isFound); // Debug log
      return isFound;
    });
    
    if (found) {
      return category;
    }
  }
  
  return 'OTHERS';
};