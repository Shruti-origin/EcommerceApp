declare interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  children?: Category[];
  productCount?: number;
  isActive?: boolean;
  parentId?: string | null;
}

declare class CategoriesService {
  static testConnection(): Promise<any>;
  static getAllCategories(includeInactive?: boolean): Promise<Category[] | any>;
  static getCategoryTree(): Promise<Category[]>;
  static getCategoryById(id: string): Promise<Category | any>;
  static createCategory(categoryData: any): Promise<any>;
  static updateCategory(id: string, categoryData: any): Promise<any>;
  static deleteCategory(id: string): Promise<any>;
  static getFallbackCategories(): Category[];
  static getFallbackCategoryTree(): Category[];
}

declare const _default: typeof CategoriesService;
export default _default;
