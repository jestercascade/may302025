"use server";

import { adminDb } from "@/lib/firebase/admin";

/**
 * Retrieve categories from the database, optionally filtered by visibility.
 *
 * @example Get all categories
 * const categories = await getCategories();
 *
 * @example Get visible categories
 * const visibleCategories = await getCategories({ visibility: "visible" });
 *
 * @param {VisibilityFilterType} [filter] - Optional filter to restrict categories by visibility.
 * @returns {Promise<StoreCategoriesType | null>} The categories object or `null` if no categories are found.
 */
export async function getCategories(
  filter?: VisibilityFilterType
): Promise<StoreCategoriesType | null> {
  const categoriesRef = adminDb.collection("categories").doc("storeCategories");
  const categoriesDoc = await categoriesRef.get();

  if (!categoriesDoc.exists) {
    return createDefaultCategories(categoriesRef);
  }

  const data = categoriesDoc.data() as StoreCategoriesType;
  let existingCategories = [...data.categories];

  existingCategories = addMissingDefaultCategories(existingCategories);

  const categoriesToUpdate = getCategoriesToUpdate(existingCategories);

  if (
    categoriesToUpdate.length > 0 ||
    existingCategories.length !== defaultCategories.length
  ) {
    existingCategories = updateCategories(
      existingCategories,
      categoriesToUpdate
    );
    await categoriesRef.set({
      showOnPublicSite: data.showOnPublicSite,
      categories: existingCategories,
    });
  }

  if (existingCategories.length === 0) {
    return null;
  }

  return {
    showOnPublicSite: data.showOnPublicSite,
    categories: filter?.visibility
      ? existingCategories.filter(
          (category) => category.visibility === filter.visibility
        )
      : existingCategories,
  };
}

// -- Logic & Utilities --

async function createDefaultCategories(
  categoriesRef: FirebaseFirestore.DocumentReference
): Promise<StoreCategoriesType> {
  const currentTimestamp = new Date().toISOString();
  const newCategoriesDoc: StoreCategoriesType = {
    showOnPublicSite: false,
    categories: defaultCategories.map(
      (category): CategoryType => ({
        ...category,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      })
    ),
  };
  await categoriesRef.set(newCategoriesDoc);
  return newCategoriesDoc;
}

function addMissingDefaultCategories(
  existingCategories: CategoryType[]
): CategoryType[] {
  const currentTimestamp = new Date().toISOString();
  const existingNames = new Set(
    existingCategories.map((category) => category.name)
  );
  const categoriesToAdd = defaultCategories
    .filter((category) => !existingNames.has(category.name))
    .map(
      (category): CategoryType => ({
        ...category,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      })
    );
  return [...existingCategories, ...categoriesToAdd];
}

function getCategoriesToUpdate(
  existingCategories: CategoryType[]
): CategoryType[] {
  return defaultCategories
    .filter((defaultCategory) => {
      const existingCategory = existingCategories.find(
        (cat) => cat.name === defaultCategory.name
      );
      return (
        existingCategory &&
        (existingCategory.index !== defaultCategory.index ||
          existingCategory.image !== defaultCategory.image)
      );
    })
    .map((defaultCategory): CategoryType => {
      const existingCategory = existingCategories.find(
        (cat) => cat.name === defaultCategory.name
      )!;
      return {
        ...defaultCategory,
        createdAt: existingCategory.createdAt,
        updatedAt: existingCategory.updatedAt,
      };
    });
}

function updateCategories(
  existingCategories: CategoryType[],
  categoriesToUpdate: CategoryType[]
): CategoryType[] {
  const currentTimestamp = new Date().toISOString();
  const updatedCategories = existingCategories.filter(
    (category) =>
      !categoriesToUpdate.some(
        (updateCategory) => updateCategory.name === category.name
      )
  );

  const mergedCategories = [
    ...updatedCategories,
    ...categoriesToUpdate.map((cat) => ({
      ...cat,
      createdAt:
        existingCategories.find((c) => c.name === cat.name)?.createdAt ||
        cat.createdAt,
      updatedAt: currentTimestamp,
    })),
  ];
  return mergedCategories.sort((a, b) => a.index - b.index);
}

// -- Default Categories --

const defaultCategories: DefaultCategory[] = [
  { index: 0, name: "Dresses", image: "dresses.png", visibility: "HIDDEN" },
  { index: 1, name: "Tops", image: "tops.png", visibility: "HIDDEN" },
  { index: 2, name: "Bottoms", image: "bottoms.png", visibility: "HIDDEN" },
  { index: 3, name: "Outerwear", image: "outerwear.png", visibility: "HIDDEN" },
  { index: 4, name: "Shoes", image: "shoes.png", visibility: "HIDDEN" },
  {
    index: 5,
    name: "Accessories",
    image: "accessories.png",
    visibility: "HIDDEN",
  },
  { index: 6, name: "Men", image: "men.png", visibility: "HIDDEN" },
  { index: 7, name: "Catch-All", image: "catch-all.png", visibility: "HIDDEN" },
];

// -- Type Definitions --

type VisibilityFilterType = {
  visibility?: "VISIBLE" | "HIDDEN";
};

type StoreCategoriesType = {
  showOnPublicSite: boolean;
  categories: CategoryType[];
};

type DefaultCategory = Omit<CategoryType, "createdAt" | "updatedAt">;
