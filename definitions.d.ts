type VisibilityType = "DRAFT" | "PUBLISHED" | "HIDDEN";

type SizeChartType = {
  centimeters?: {
    columns: Array<{
      label: string;
      order: number;
    }>;
    rows: Array<{
      [key: string]: string;
    }>;
  };
  inches?: {
    columns: Array<{
      label: string;
      order: number;
    }>;
    rows: Array<{
      [key: string]: string;
    }>;
  };
};

type OptionGroupType = {
  id: number;
  name: string;
  displayOrder: number;
  values: Array<{
    id: number;
    value: string;
    isActive: boolean;
  }>;
  sizeChart?: SizeChartType;
};

type ProductOptionsType = {
  groups: Array<OptionGroupType>;
  config: {
    chaining: {
      enabled: boolean;
      relationships: Array<{
        parentGroupId: number;
        childGroupId: number;
        constraints: {
          [parentOptionId: string]: number[];
        };
      }>;
    };
  };
};

type CollectionProductType = {
  index: number;
  id: string;
};

type CollectionType = {
  id: string;
  index: number;
  title: string;
  slug: string;
  campaignDuration: {
    startDate: string;
    endDate: string;
  };
  collectionType: string;
  bannerImages?: {
    desktopImage: string;
    mobileImage: string;
  };
  products: Array<CollectionProductType>;
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
};

type UpsellType = {
  id: string;
  mainImage: string;
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
  pricing: {
    basePrice: number;
    salePrice: number;
    discountPercentage: number;
  };
  products: Array<{
    index: number;
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    images: {
      main: string;
      gallery: string[];
    };
    options: ProductOptionsType;
  }>;
};

type ProductType = {
  id: string;
  name: string;
  slug: string;
  description: string;
  highlights: {
    headline: string;
    keyPoints: Array<{
      index: number;
      text: string;
    }>;
  };
  pricing: {
    basePrice: number;
    salePrice: number;
    discountPercentage: number;
  };
  images: {
    main: string;
    gallery: string[];
  };
  options: ProductOptionsType;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
  sourceInfo: {
    platform: string;
    platformUrl: string;
    store: string;
    storeId: string;
    storeUrl: string;
    productUrl: string;
  };
  upsell: string | UpsellType;
  averageOrderValueBooster?: {
    name: string;
    promotionalMessage: string;
    quantityBreaks?: Array<{
      quantity: number;
      discount: number;
      pricePerItem: number;
      totalPrice: number;
    }>;
  };
  frequentlyBoughtTogether?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
};

type ProductWithUpsellType = {
  id: string;
  name: string;
  slug: string;
  description: string;
  highlights: {
    headline: string;
    keyPoints: Array<{
      index: number;
      text: string;
    }>;
  };
  pricing: {
    basePrice: number;
    salePrice: number;
    discountPercentage: number;
  };
  images: {
    main: string;
    gallery: string[];
  };
  options: ProductOptionsType;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
  sourceInfo: {
    platform: string;
    platformUrl: string;
    store: string;
    storeId: string;
    storeUrl: string;
    productUrl: string;
  };
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      basePrice: number;
      salePrice: number;
      discountPercentage: number;
    };
    visibility: VisibilityType;
    createdAt: string;
    updatedAt: string;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      images: {
        main: string;
        gallery: string[];
      };
      options: ProductOptionsType;
    }>;
  };
  averageOrderValueBooster?: {
    name: string;
    promotionalMessage: string;
    quantityBreaks?: Array<{
      quantity: number;
      discount: number;
      pricePerItem: number;
      totalPrice: number;
    }>;
  };
  frequentlyBoughtTogether?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
};

type UpsellReviewProductType = {
  id: string;
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      basePrice: number;
      salePrice: number;
      discountPercentage: number;
    };
    visibility: VisibilityType;
    createdAt: string;
    updatedAt: string;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      images: {
        main: string;
        gallery: string[];
      };
      options: ProductOptionsType;
    }>;
  };
};

type NewsletterType = {
  id: string;
  emailSubject: string;
  content: string;
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
  lastSentAt: string;
};

type SubscriberType = {
  email: string;
  status: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
};

type CartProductItemType = {
  type: "product";
  baseProductId: string;
  selectedOptions: Record<string, SelectedOptionType>;
  variantId: string;
  index: number;
};

type CartType = {
  id: string;
  device_identifier: string;
  items: CartProductItemType[];
  createdAt: string;
  updatedAt: string;
};

type OrderType = {
  id: string;
  timestamp: string;
  status: string;
  payer: {
    email: string;
    payerId: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
  amount: {
    value: string;
    currency: string;
  };
  shipping: {
    name: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  transactionId: string;
  items: Array<
    | {
        type: "product";
        baseProductId: string;
        name: string;
        slug: string;
        pricing: {
          basePrice: number;
          salePrice: number;
          discountPercentage: number;
        };
        mainImage: string;
        variantId: string;
        selectedOptions: Record<string, { value: string; optionDisplayOrder: number; groupDisplayOrder: number }>;
        index: number;
      }
    | {
        type: "upsell";
        baseUpsellId: string;
        variantId: string;
        index: number;
        mainImage: string;
        pricing: {
          basePrice: number;
          salePrice: number;
          discountPercentage: number;
        };
        products: Array<{
          id: string;
          slug: string;
          name: string;
          mainImage: string;
          basePrice: number;
          selectedOptions: Record<string, { value: string; optionDisplayOrder: number; groupDisplayOrder: number }>;
        }>;
      }
  >;
  invoiceId: string;
  emails: {
    confirmed: {
      sentCount: number;
      maxAllowed: number;
      lastSent: string | null;
    };
    shipped: {
      sentCount: number;
      maxAllowed: number;
      lastSent: string | null;
    };
    delivered: {
      sentCount: number;
      maxAllowed: number;
      lastSent: string | null;
    };
  };
  tracking: {
    currentStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "COMPLETED";
    statusHistory: Array<{
      status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "COMPLETED";
      timestamp: string;
      message?: string;
    }>;
    trackingNumber?: string;
    estimatedDeliveryDate?: {
      start: string;
      end: string;
    };
    lastUpdated: string;
  };
};

type ConfigType = {
  APP_NAME: string;
  BASE_URL: string;
  SEO: {
    TITLE: string;
    DESCRIPTION: string;
    IMAGE: string;
    SITE_NAME: string;
    URL: string;
    TWITTER_HANDLE: string;
  };
  STRUCTURED_DATA: {
    name: string;
    logo: string;
    socialLinks: string[];
  };
  REMOTE_PATTERNS: Array<{ protocol: string; hostname: string }>;
  FIREBASE: {
    CLIENT: {
      API_KEY: string | undefined;
      AUTH_DOMAIN: string | undefined;
      PROJECT_ID: string | undefined;
      STORAGE_BUCKET: string | undefined;
      MESSAGING_SENDER_ID: string | undefined;
      APP_ID: string | undefined;
      MEASUREMENT_ID: string | undefined;
    };
    ADMIN: {
      PRIVATE_KEY: string | undefined;
      CLIENT_EMAIL: string | undefined;
      PROJECT_ID: string | undefined;
    };
  };
  PAYPAL: {
    CLIENT_ID: string | undefined;
    CLIENT_SECRET: string | undefined;
    API_BASE: string;
  };
  RESEND: {
    API_KEY: string | undefined;
  };
  ADMIN: {
    EMAIL: string | undefined;
    ENTRY_KEY: string | undefined;
  };
};
