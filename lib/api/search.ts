import { apiFetch } from "./client";

/**
 * Course Search/Filtering API client
 * Handle backend search, level/category filtering, pagination, and sorting
 */

export type CourseSearchResult = {
  id: string;
  title: string;
  level: string;
  desc: string;
  lessons: number;
  students: number;
  price: string;
  duration?: string;
  image?: string;
  category?: string;
  teacher?: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating?: number;
  reviewCount?: number;
  discountPercent?: number;
  language: string;
  featured: boolean;
};

export type SearchFilters = {
  query?: string;
  level?: string;
  category?: string;
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  teacherId?: string;
  hasDiscount?: boolean;
  featured?: boolean;
  minRating?: number;
};

export type SearchSortOption = "relevance" | "price_asc" | "price_desc" | "rating" | "popularity" | "newest";

export type SearchResults = {
  courses: CourseSearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: {
    levels: { value: string; count: number }[];
    categories: { value: string; count: number }[];
    languages: { value: string; count: number }[];
    priceRanges: { label: string; min: number; max: number; count: number }[];
  };
};

type ApiRecord = Record<string, unknown>;

function value(record: ApiRecord, ...keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function text(record: ApiRecord, ...keys: string[]): string {
  const result = value(record, ...keys);
  return typeof result === "string"
    ? result
    : result == null
      ? ""
      : String(result);
}

function numberValue(record: ApiRecord, ...keys: string[]): number {
  const n = Number(value(record, ...keys) ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizeCourseSearchResult(raw: unknown, index: number): CourseSearchResult | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "courseId", "CourseId");
  const title = text(record, "title", "Title");
  if (!title) return null;

  const teacher = value(record, "teacher", "Teacher") as ApiRecord | undefined;
  
  return {
    id: id || `course-${index}`,
    title,
    level: text(record, "level", "Level"),
    desc: text(record, "desc", "Desc", "description", "Description"),
    lessons: numberValue(record, "lessons", "Lessons", "lessonCount", "LessonCount"),
    students: numberValue(record, "students", "Students", "studentCount", "StudentCount"),
    price: text(record, "price", "Price", "formattedPrice", "FormattedPrice"),
    duration: text(record, "duration", "Duration") || undefined,
    image: text(record, "image", "Image", "imageUrl", "ImageUrl") || undefined,
    category: text(record, "category", "Category") || undefined,
    teacher: teacher ? {
      id: text(teacher, "id", "Id", "teacherId", "TeacherId"),
      name: text(teacher, "name", "Name", "fullName", "FullName"),
      avatar: text(teacher, "avatar", "Avatar") || undefined,
    } : undefined,
    rating: value(record, "rating", "Rating") as number | undefined,
    reviewCount: numberValue(record, "reviewCount", "ReviewCount"),
    discountPercent: numberValue(record, "discountPercent", "DiscountPercent"),
    language: text(record, "language", "Language"),
    featured: Boolean(value(record, "featured", "Featured")),
  };
}

function unwrapList<T>(
  response: unknown,
  normalize: (raw: unknown, index: number) => T | null,
): T[] {
  if (Array.isArray(response)) {
    return response.map(normalize).filter((x): x is T => x != null);
  }
  const record = (response ?? {}) as ApiRecord;
  const nested = value(record, "items", "Items", "data", "Data", "courses", "Courses");
  if (Array.isArray(nested)) {
    return nested.map(normalize).filter((x): x is T => x != null);
  }
  return [];
}

/**
 * GET /api/courses/search
 * Search courses with filters and pagination
 */
export async function searchCourses(params: {
  filters?: SearchFilters;
  page?: number;
  pageSize?: number;
  sort?: SearchSortOption;
  lang?: string;
}): Promise<SearchResults> {
  const queryParams = new URLSearchParams();
  
  if (params.filters?.query) queryParams.set("q", params.filters.query);
  if (params.filters?.level) queryParams.set("level", params.filters.level);
  if (params.filters?.category) queryParams.set("category", params.filters.category);
  if (params.filters?.language) queryParams.set("language", params.filters.language);
  if (params.filters?.minPrice) queryParams.set("minPrice", String(params.filters.minPrice));
  if (params.filters?.maxPrice) queryParams.set("maxPrice", String(params.filters.maxPrice));
  if (params.filters?.teacherId) queryParams.set("teacherId", params.filters.teacherId);
  if (params.filters?.hasDiscount) queryParams.set("hasDiscount", "true");
  if (params.filters?.featured) queryParams.set("featured", "true");
  if (params.filters?.minRating) queryParams.set("minRating", String(params.filters.minRating));
  
  if (params.page) queryParams.set("page", String(params.page));
  if (params.pageSize) queryParams.set("pageSize", String(params.pageSize));
  if (params.sort) queryParams.set("sort", params.sort);
  if (params.lang) queryParams.set("lang", params.lang);
  
  const query = queryParams.toString();
  const data = await apiFetch<unknown>(`/api/courses/search${query ? `?${query}` : ""}`);
  const record = (data ?? {}) as ApiRecord;
  
  const facets = (value(record, "facets", "Facets") as ApiRecord) || {};
  const levels = (value(facets, "levels", "Levels") as unknown[]) || [];
  const categories = (value(facets, "categories", "Categories") as unknown[]) || [];
  const languages = (value(facets, "languages", "Languages") as unknown[]) || [];
  const priceRanges = (value(facets, "priceRanges", "PriceRanges") as unknown[]) || [];
  
  return {
    courses: unwrapList(data, normalizeCourseSearchResult),
    total: numberValue(record, "total", "Total", "totalCount", "TotalCount"),
    page: numberValue(record, "page", "Page") || 1,
    pageSize: numberValue(record, "pageSize", "PageSize") || 20,
    totalPages: numberValue(record, "totalPages", "TotalPages") || 1,
    facets: {
      levels: levels.map((item: unknown) => {
        const r = (item ?? {}) as ApiRecord;
        return { value: text(r, "value", "Value"), count: numberValue(r, "count", "Count") };
      }),
      categories: categories.map((item: unknown) => {
        const r = (item ?? {}) as ApiRecord;
        return { value: text(r, "value", "Value"), count: numberValue(r, "count", "Count") };
      }),
      languages: languages.map((item: unknown) => {
        const r = (item ?? {}) as ApiRecord;
        return { value: text(r, "value", "Value"), count: numberValue(r, "count", "Count") };
      }),
      priceRanges: priceRanges.map((item: unknown) => {
        const r = (item ?? {}) as ApiRecord;
        return {
          label: text(r, "label", "Label"),
          min: numberValue(r, "min", "Min"),
          max: numberValue(r, "max", "Max"),
          count: numberValue(r, "count", "Count"),
        };
      }),
    },
  };
}

/**
 * GET /api/courses/suggestions
 * Get search suggestions (autocomplete)
 */
export async function getSearchSuggestions(query: string, lang?: string): Promise<{
  courses: { id: string; title: string; category?: string }[];
  queries: string[];
}> {
  const params = new URLSearchParams();
  params.set("q", query);
  if (lang) params.set("lang", lang);
  
  const data = await apiFetch<unknown>(`/api/courses/suggestions?${params.toString()}`);
  const record = (data ?? {}) as ApiRecord;
  
  const courses = (value(record, "courses", "Courses") as unknown[]) || [];
  const queries = (value(record, "queries", "Queries") as string[]) || [];
  
  return {
    courses: courses.map((item: unknown) => {
      const r = (item ?? {}) as ApiRecord;
      return {
        id: text(r, "id", "Id"),
        title: text(r, "title", "Title"),
        category: text(r, "category", "Category") || undefined,
      };
    }),
    queries,
  };
}

/**
 * GET /api/courses/filters
 * Get available filter options
 */
export async function getCourseFilters(lang?: string): Promise<{
  levels: string[];
  categories: string[];
  languages: string[];
  teachers: { id: string; name: string; avatar?: string }[];
  priceRanges: { label: string; min: number; max: number }[];
}> {
  const query = lang ? `?lang=${lang}` : "";
  const data = await apiFetch<unknown>(`/api/courses/filters${query}`);
  const record = (data ?? {}) as ApiRecord;
  
  const levels = (value(record, "levels", "Levels") as string[]) || [];
  const categories = (value(record, "categories", "Categories") as string[]) || [];
  const languages = (value(record, "languages", "Languages") as string[]) || [];
  const teachers = (value(record, "teachers", "Teachers") as unknown[]) || [];
  const priceRanges = (value(record, "priceRanges", "PriceRanges") as unknown[]) || [];
  
  return {
    levels,
    categories,
    languages,
    teachers: teachers.map((item: unknown) => {
      const r = (item ?? {}) as ApiRecord;
      return {
        id: text(r, "id", "Id"),
        name: text(r, "name", "Name"),
        avatar: text(r, "avatar", "Avatar") || undefined,
      };
    }),
    priceRanges: priceRanges.map((item: unknown) => {
      const r = (item ?? {}) as ApiRecord;
      return {
        label: text(r, "label", "Label"),
        min: numberValue(r, "min", "Min"),
        max: numberValue(r, "max", "Max"),
      };
    }),
  };
}

/**
 * GET /api/courses/featured
 * Get featured courses
 */
export async function getFeaturedCourses(lang?: string, limit?: number): Promise<CourseSearchResult[]> {
  const params = new URLSearchParams();
  if (lang) params.set("lang", lang);
  if (limit) params.set("limit", String(limit));
  
  const query = params.toString();
  const data = await apiFetch<unknown>(`/api/courses/featured${query ? `?${query}` : ""}`);
  return unwrapList(data, normalizeCourseSearchResult);
}

/**
 * GET /api/courses/trending
 * Get trending courses
 */
export async function getTrendingCourses(lang?: string, limit?: number): Promise<CourseSearchResult[]> {
  const params = new URLSearchParams();
  if (lang) params.set("lang", lang);
  if (limit) params.set("limit", String(limit));
  
  const query = params.toString();
  const data = await apiFetch<unknown>(`/api/courses/trending${query ? `?${query}` : ""}`);
  return unwrapList(data, normalizeCourseSearchResult);
}

/**
 * GET /api/courses/similar/{courseId}
 * Get similar courses
 */
export async function getSimilarCourses(courseId: string, lang?: string, limit?: number): Promise<CourseSearchResult[]> {
  const params = new URLSearchParams();
  if (lang) params.set("lang", lang);
  if (limit) params.set("limit", String(limit));
  
  const query = params.toString();
  const data = await apiFetch<unknown>(`/api/courses/similar/${courseId}${query ? `?${query}` : ""}`);
  return unwrapList(data, normalizeCourseSearchResult);
}
