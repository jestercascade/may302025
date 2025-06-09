"use client";

import { UpdateUpsellAction } from "@/actions/upsells";
import { formatThousands, isValidRemoteImage } from "@/lib/utils/common";
import { useState, useEffect, useCallback } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, X, Pencil, Plus } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import Overlay from "@/ui/Overlay";
import { ReactSortable } from "react-sortablejs";
import { getProducts } from "@/actions/get/products";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useBodyOverflowStore } from "@/zustand/shared/bodyOverflowStore";

export function BasicDetailsButton({ className }: { className: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editUpsell.name);
  const overlayName = useOverlayStore((state) => state.pages.editUpsell.overlays.basicDetails.name);

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray ${className}`}
    >
      <Pencil size={18} strokeWidth={1.75} />
    </button>
  );
}

export function BasicDetailsOverlay({ data }: { data: DataType }) {
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [productId, setProductId] = useState<string>("");
  const [mainImage, setMainImage] = useState(data.mainImage || "");
  const [products, setProducts] = useState<ProductType[]>(data.products || []);
  const [basePrice, setBasePrice] = useState<number>(data.pricing.basePrice || 0);
  const [salePrice, setSalePrice] = useState<number>(data.pricing.salePrice || 0);
  const [discountPercentage, setDiscountPercentage] = useState<string>(
    data.pricing.discountPercentage?.toString() || ""
  );

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editUpsell.name);
  const overlayName = useOverlayStore((state) => state.pages.editUpsell.overlays.basicDetails.name);
  const isOverlayVisible = useOverlayStore((state) => state.pages.editUpsell.overlays.basicDetails.isVisible);
  const setPreventBodyOverflowChange = useBodyOverflowStore((state) => state.setPreventBodyOverflowChange);

  useEffect(() => {
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
      setPreventBodyOverflowChange(false);
    }

    return () => {
      if (!isOverlayVisible) {
        document.body.style.overflow = "visible";
        setPreventBodyOverflowChange(false);
      }
    };
  }, [isOverlayVisible, setPreventBodyOverflowChange]);

  useEffect(() => {
    const totalBasePrice = products.reduce((total, product) => {
      const price = typeof product.basePrice === "number" ? product.basePrice : parseFloat(product.basePrice);
      return isNaN(price) ? total : total + price;
    }, 0);

    // Round down to the nearest .99
    const roundedTotal = totalBasePrice === 0 ? 0 : Math.floor(totalBasePrice) + 0.99;

    // Format to two decimal places
    const formattedTotal = Number(roundedTotal.toFixed(2));

    setBasePrice(formattedTotal);
  }, [products]);

  const calculateSalePrice = useCallback(
    (discount: string) => {
      const discountValue = parseInt(discount, 10);

      if (isNaN(discountValue) || discountValue === 0) {
        setSalePrice(0);
      } else if (discountValue >= 0 && discountValue <= 100) {
        const rawSalePrice = basePrice * (1 - discountValue / 100);

        // Round down to the nearest .99
        const roundedSalePrice = rawSalePrice === 0 ? 0 : Math.floor(rawSalePrice) + 0.99;

        // Format to two decimal places
        const formattedSalePrice = Number(roundedSalePrice.toFixed(2));

        setSalePrice(formattedSalePrice);
      }
    },
    [basePrice]
  );

  useEffect(() => {
    calculateSalePrice(discountPercentage);
  }, [basePrice, discountPercentage, calculateSalePrice]);

  const handleDiscountPercentageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setDiscountPercentage(value);
      calculateSalePrice(value);
    }
  };

  const handleSave = async () => {
    setLoadingSave(true);

    const upsellData = {
      id: data.id,
      mainImage,
      pricing: {
        basePrice: basePrice,
        salePrice: salePrice > 0 ? salePrice : 0,
        discountPercentage: discountPercentage !== "" ? parseInt(discountPercentage, 10) : 0,
      },
      products: products.map(({ id, slug, name, images, basePrice }, index) => ({
        index: index + 1,
        id,
        slug,
        name,
        images,
        basePrice,
      })),
    };

    if (!upsellData.mainImage) {
      showAlert({
        message: "Main image is missing",
        type: ShowAlertType.ERROR,
      });
      setLoadingSave(false);
      setPreventBodyOverflowChange(true);
      return;
    }

    if (!isValidRemoteImage(upsellData.mainImage)) {
      showAlert({
        message: "Invalid main image URL. Try an image from Pinterest or your Firebase Storage.",
        type: ShowAlertType.ERROR,
      });
      setLoadingSave(false);
      setPreventBodyOverflowChange(true);
      return;
    }

    if (upsellData.products.length === 0) {
      showAlert({
        message: "At least one product is required",
        type: ShowAlertType.ERROR,
      });
      setLoadingSave(false);
      setPreventBodyOverflowChange(true);
      return;
    }

    if (upsellData.pricing.basePrice <= 0) {
      showAlert({
        message: "Base price must be greater than zero",
        type: ShowAlertType.ERROR,
      });
      setLoadingSave(false);
      setPreventBodyOverflowChange(true);
      return;
    }

    try {
      const result = await UpdateUpsellAction(upsellData);
      showAlert({
        message: result.message,
        type: result.type,
      });
    } catch {
      showAlert({
        message: "Failed to create upsell",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoadingSave(false);
      setPreventBodyOverflowChange(true);
    }
  };

  const handleProductIdInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setProductId(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      addProduct(productId);
    }
  };

  const handleButtonClick = () => {
    addProduct(productId);
  };

  const addProduct = async (productId: string) => {
    const trimmedProductId = productId.trim();

    if (!trimmedProductId) {
      showAlert({
        message: "Product ID cannot be empty",
        type: ShowAlertType.ERROR,
      });
      setPreventBodyOverflowChange(true);
      return;
    } else if (!/^\d{5}$/.test(trimmedProductId)) {
      showAlert({
        message: "Product ID must be a 5-digit number",
        type: ShowAlertType.ERROR,
      });
      setPreventBodyOverflowChange(true);
      return;
    }

    if (products.some((product) => product.id === trimmedProductId)) {
      showAlert({
        message: "Product already added",
        type: ShowAlertType.ERROR,
      });
      setPreventBodyOverflowChange(true);
      return;
    }

    setLoadingProduct(true);

    try {
      const fetchedProducts = await getProducts({
        ids: [trimmedProductId],
        fields: ["name", "slug", "images", "pricing"],
      });

      if (fetchedProducts?.length) {
        const { id, slug, name, images, pricing } = fetchedProducts[0];
        const newProduct = {
          index: products.length + 1,
          id,
          slug,
          name,
          images,
          basePrice: pricing?.basePrice ?? 0,
        };

        setProducts((prevProducts) => [...prevProducts, newProduct as ProductType]);
        setProductId("");
      } else {
        showAlert({
          message: "Product not found",
          type: ShowAlertType.ERROR,
        });
        setPreventBodyOverflowChange(true);
      }
    } catch {
      showAlert({
        message: "Failed to add product",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoadingProduct(false);
    }
  };

  const removeProduct = (productId: string) => {
    if (products.length === 1) {
      showAlert({
        message: "At least one product is required",
        type: ShowAlertType.ERROR,
      });
      setPreventBodyOverflowChange(true);
      return;
    }

    setProducts((prevProducts) => {
      const updatedProducts = prevProducts
        .filter((product) => product.id !== productId)
        .map((product, newIndex) => ({
          ...product,
          index: newIndex + 1,
        }));

      if (updatedProducts.length === 0) {
        setDiscountPercentage("");
      }

      return updatedProducts;
    });
  };

  const handleProductNameChange = (event: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const newName = event.target.value;
    setProducts((prevProducts) =>
      prevProducts.map((product) => (product.id === productId ? { ...product, name: newName } : product))
    );
  };

  const onHideOverlay = () => {
    hideOverlay({ pageName, overlayName });
    setProductId("");
    setMainImage(data.mainImage || "");
    setProducts(data.products || []);
    setBasePrice(data.pricing.basePrice || 0);
    setSalePrice(data.pricing.salePrice || 0);
    setDiscountPercentage(data.pricing.discountPercentage?.toString() || "");
    setPreventBodyOverflowChange(true);
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[480px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-16 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Edit upsell</h2>
                  <button
                    onClick={onHideOverlay}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <X color="#6c6c6c" size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={onHideOverlay}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                >
                  <ArrowLeft size={20} strokeWidth={2} className="-ml-1 stroke-blue" />
                  <span className="font-semibold text-sm text-blue">Edit upsell</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loadingSave}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loadingSave,
                      "hover:bg-neutral-600 active:bg-neutral-800": !loadingSave,
                    }
                  )}
                >
                  {loadingSave ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner color="white" />
                      <span className="text-white">Saving</span>
                    </div>
                  ) : (
                    <span className="text-white">Save</span>
                  )}
                </button>
              </div>
              <div className="w-full h-full mt-[60px] md:mt-0 p-5 flex flex-col gap-6 overflow-x-hidden overflow-y-auto invisible-scrollbar md:overflow-hidden">
                {/* Products Section */}
                <div className="flex flex-col gap-3.5">
                  <h3 className="text-xs font-semibold uppercase text-gray">Products ({products.length})</h3>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 max-w-56 h-9 rounded-full overflow-hidden flex items-center bg-neutral-50 border border-gray-200/60 focus-within:border-gray-300 focus-within:bg-white/90 transition-all duration-150">
                      <input
                        type="text"
                        value={productId}
                        onChange={handleProductIdInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste ID"
                        className="h-full w-full pl-4 pr-1.5 text-sm bg-transparent"
                      />
                      <div className="h-full pr-1.5 flex items-center justify-center">
                        <button
                          onClick={handleButtonClick}
                          disabled={loadingProduct}
                          className={clsx(
                            "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 ease-out",
                            {
                              "bg-[#404040] hover:bg-[#525252] active:scale-95 shadow-sm": !loadingProduct,
                              "bg-gray-300/80 cursor-not-allowed": loadingProduct,
                            }
                          )}
                        >
                          {loadingProduct ? (
                            <Spinner color="white" />
                          ) : (
                            <Plus strokeWidth={2} size={18} className="text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="w-full overflow-hidden">
                    {products.length > 0 && (
                      <ReactSortable
                        list={products}
                        setList={setProducts}
                        className="rounded-lg p-4 flex gap-3 flex-wrap justify-start border border-gray-200/50"
                        animation={200}
                        ghostClass="opacity-30"
                      >
                        {products.map(({ id, images, name, basePrice }) => (
                          <div key={id} className="w-[calc(50%-6px)] cursor-move">
                            <div className="w-full rounded-lg overflow-hidden shadow-sm border border-gray-200/40 hover:shadow-md transition-all duration-150">
                              <div className="w-full aspect-square relative bg-neutral-50/80">
                                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                  {images && isValidRemoteImage(images.main) && (
                                    <Image
                                      src={images.main}
                                      alt="Product"
                                      width={200}
                                      height={200}
                                      priority
                                      className="object-cover w-full h-full"
                                    />
                                  )}
                                </div>
                                <button
                                  onClick={() => removeProduct(id)}
                                  className="h-6 w-6 rounded-full flex items-center justify-center absolute top-1.5 right-1.5 bg-red-500/90 hover:bg-red-600 active:scale-95 shadow-sm transition-all duration-150 ease-out backdrop-blur-sm"
                                >
                                  <X color="#ffffff" strokeWidth={2} size={12} />
                                </button>
                              </div>
                              <div className="w-full h-9 border-t border-gray-100 overflow-hidden">
                                <input
                                  type="text"
                                  placeholder="Product name"
                                  value={name}
                                  onChange={(event) => handleProductNameChange(event, id)}
                                  className="h-full w-full px-2.5 text-sm bg-white"
                                />
                              </div>
                            </div>
                            <div className="mt-1.5 flex items-center justify-center w-full">
                              <span className="font-semibold text-sm text-gray-900">${formatThousands(basePrice)}</span>
                            </div>
                          </div>
                        ))}
                      </ReactSortable>
                    )}
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase text-gray">Pricing</h3>

                  <div className="bg-neutral-50 rounded-lg p-4 border border-gray-200/50 backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-5 mb-4">
                      <div>
                        <label className="text-xs text-gray mb-1.5 block">Base Price</label>
                        <div className="text-lg font-bold text-gray-900 -tracking-[0.02em]">
                          {basePrice > 0 ? `$${basePrice}` : "—"}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray mb-1.5 block">Sale Price</label>
                        <div className="text-lg font-bold text-green-600 -tracking-[0.02em]">
                          {salePrice > 0 ? `$${salePrice.toFixed(2)}` : "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray">Discount Percentage</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="discountPercentage"
                          placeholder="0"
                          value={discountPercentage}
                          onChange={handleDiscountPercentageChange}
                          className="w-full h-9 px-3 pr-7 rounded-lg transition-all duration-150 ease-out border border-gray-200/60 bg-white/90 focus:border-gray-300 text-sm"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Image Section */}
                <div className="flex flex-col gap-3.5">
                  <h3 className="text-xs font-semibold uppercase text-gray">Main image</h3>
                  <div className="w-full max-w-sm">
                    <div className="w-full bg-white/90 rounded-lg overflow-hidden shadow-sm border border-gray-200/40 backdrop-blur-sm">
                      <div
                        className={clsx("w-full aspect-square flex items-center justify-center overflow-hidden", {
                          "bg-white": mainImage && isValidRemoteImage(mainImage),
                        })}
                      >
                        {mainImage && isValidRemoteImage(mainImage) ? (
                          <Image src={mainImage} alt="Main upsell image" width={400} height={400} priority />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-lightgray text-gray/80 flex items-center justify-center mb-1.5">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                              </svg>
                            </div>
                            <span className="text-xs text-gray">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="w-full h-9 border-t border-gray-100 overflow-hidden">
                        <input
                          type="text"
                          name="mainImage"
                          placeholder="Paste image URL"
                          value={mainImage}
                          onChange={(e) => setMainImage(e.target.value)}
                          className="h-full w-full px-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent -tracking-[0.01em]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Save Button */}
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 bg-white">
              <button
                onClick={handleSave}
                disabled={loadingSave}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loadingSave,
                    "hover:bg-neutral-600 active:bg-neutral-800": !loadingSave,
                  }
                )}
              >
                {loadingSave ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner color="white" />
                    <span className="text-white">Saving</span>
                  </div>
                ) : (
                  <span className="text-white font-medium">Save</span>
                )}
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}

// -- Type Definitions --

type ProductType = {
  index: number;
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  images: {
    main: string;
    gallery: string[];
  };
};

type DataType = {
  id: string;
  mainImage: string;
  pricing: {
    basePrice: number;
    salePrice?: number;
    discountPercentage?: number;
  };
  products: ProductType[];
};
