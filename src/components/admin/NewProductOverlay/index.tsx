"use client";

import { CreateProductAction } from "@/actions/products";
import { capitalizeFirstLetter, isValidRemoteImage } from "@/lib/utils/common";
import { useState, useEffect, useRef } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { useNavbarMenuStore } from "@/zustand/admin/navbarMenuStore";
import { ArrowLeft, X, ChevronDown } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import Overlay from "@/ui/Overlay";
import { getCategories } from "@/actions/get/categories";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useAlertStore } from "@/zustand/shared/alertStore";
import styles from "./styles.module.css";
import { useBodyOverflowStore } from "@/zustand/shared/bodyOverflowStore";

export function NewProductMenuButton({ closeMenu }: NewProductMenuButtonType) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const setNavbarMenu = useNavbarMenuStore((state) => state.setNavbarMenu);
  const pageName = useOverlayStore((state) => state.pages.products.name);
  const overlayName = useOverlayStore((state) => state.pages.products.overlays.newProduct.name);

  const openOverlay = () => {
    setNavbarMenu(false);
    showOverlay({ pageName, overlayName });
    closeMenu();
  };

  return (
    <button
      type="button"
      className="h-10 w-max text-lg font-medium rounded-full flex items-center md:h-9 md:w-[calc(100%-10px)] md:mx-auto md:px-3 md:text-sm md:font-semibold md:rounded-md md:cursor-pointer md:transition md:active:bg-lightgray md:hover:bg-lightgray"
      onClick={openOverlay}
    >
      New product
    </button>
  );
}

export function NewProductEmptyGridButton() {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const setNavbarMenu = useNavbarMenuStore((state) => state.setNavbarMenu);
  const pageName = useOverlayStore((state) => state.pages.products.name);
  const overlayName = useOverlayStore((state) => state.pages.products.overlays.newProduct.name);

  const openOverlay = () => {
    setNavbarMenu(false);
    showOverlay({ pageName, overlayName });
  };

  return (
    <button
      type="button"
      className="h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue active:bg-blue-dimmed lg:hover:bg-blue-dimmed"
      onClick={openOverlay}
    >
      New product
    </button>
  );
}

export function NewProductOverlay() {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Select");
  const [categories, setCategories] = useState<CategoryType[] | undefined>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    basePrice: "",
    mainImage: "",
  });

  const categoryRef = useRef(null);

  useEffect(() => {
    (async () => {
      const categories = await getCategories();
      setCategories(categories?.categories);
    })();
  }, []);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.products.name);
  const overlayName = useOverlayStore((state) => state.pages.products.overlays.newProduct.name);
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.products.overlays.newProduct.isVisible
  );
  const setPreventBodyOverflowChange = useBodyOverflowStore(
    (state) => state.setPreventBodyOverflowChange
  );

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
    function handleClickOutside(event: MouseEvent) {
      if (!categoryRef.current || !(event.target instanceof Node)) {
        return;
      }
      const targetNode = categoryRef.current as Node;
      if (!targetNode.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
    setFormData((prevData) => ({
      ...prevData,
      category: capitalizeFirstLetter(category),
    }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    let sanitizedValue = value;

    if (name === "slug") {
      sanitizedValue = value
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^a-z0-9-]+/g, "") // Remove all except letters, numbers, hyphens
        .replace(/--+/g, "-") // Replace multiple hyphens with one
        .replace(/^-+/, "") // Remove leading hyphens
        .replace(/-+$/, ""); // Remove trailing hyphens
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: sanitizedValue,
    }));
  };

  const handleSave = async () => {
    if (!formData.category) {
      showAlert({
        message: "Please select a category",
        type: ShowAlertType.ERROR,
      });
      setPreventBodyOverflowChange(true);
      return;
    }
    if (!formData.name.trim() || formData.name.length < 3) {
      showAlert({
        message: "Product name must be at least 3 characters long",
        type: ShowAlertType.ERROR,
      });
      setPreventBodyOverflowChange(true);
      return;
    }
    if (!formData.slug.trim() || formData.slug.length < 3) {
      showAlert({
        message: "Slug must be at least 3 characters long",
        type: ShowAlertType.ERROR,
      });
      setPreventBodyOverflowChange(true);
      return;
    }
    if (!formData.basePrice.trim()) {
      showAlert({
        message: "Please enter a base price",
        type: ShowAlertType.ERROR,
      });
      setPreventBodyOverflowChange(true);
      return;
    }
    if (!isValidRemoteImage(formData.mainImage)) {
      showAlert({
        message: "Invalid main image URL. Try an image from Pinterest or your Firebase Storage.",
        type: ShowAlertType.ERROR,
      });
      setPreventBodyOverflowChange(true);
      return;
    }

    setLoading(true);

    try {
      const result = await CreateProductAction(formData);
      showAlert({
        message: result.message,
        type: result.type,
      });
      if (result.type === ShowAlertType.SUCCESS) {
        onHideOverlay();
      }
    } catch {
      showAlert({
        message: "Failed to create product",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
      setPreventBodyOverflowChange(true);
    }
  };

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
    setSelectedCategory("Select");
    setFormData({
      category: "",
      name: "",
      slug: "",
      basePrice: "",
      mainImage: "",
    });
  };

  const handleCategoryDropdownClick = () => {
    if (categories?.length === 0) {
      showAlert({
        message: "No published categories found. Edit categories in the storefront tab.",
        type: ShowAlertType.ERROR,
      });
    } else {
      setIsCategoryDropdownOpen((prevState) => !prevState);
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">New product</h2>
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
                  <span className="font-semibold text-sm text-blue">New product</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "hover:bg-neutral-600 active:bg-neutral-800": !loading,
                    }
                  )}
                >
                  {loading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner color="white" />
                      <span className="text-white">Saving</span>
                    </div>
                  ) : (
                    <span className="text-white">Save</span>
                  )}
                </button>
              </div>
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xs text-gray">Category</h2>
                  <div ref={categoryRef} className="w-full h-9 relative">
                    <button
                      onClick={handleCategoryDropdownClick}
                      type="button"
                      className="h-9 w-full px-3 rounded-md flex items-center justify-between transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                    >
                      <span
                        className={clsx({
                          "text-gray": selectedCategory === "Select",
                        })}
                      >
                        {selectedCategory}
                      </span>
                      <ChevronDown className="-mr-[4px] stroke-gray" size={18} strokeWidth={2} />
                    </button>
                    <div
                      className={clsx("w-full absolute top-10 z-10", {
                        hidden: !isCategoryDropdownOpen,
                        block: isCategoryDropdownOpen,
                      })}
                    >
                      <div
                        className={`overflow-hidden h-full max-h-[228px] overflow-x-hidden overflow-y-visible w-full py-[6px] rounded-md shadow-dropdown bg-white ${styles.customScrollbar}`}
                      >
                        {categories?.map((category, index) => (
                          <div
                            key={index}
                            className="w-full h-9 flex items-center px-[12px] cursor-pointer transition duration-300 ease-in-out hover:bg-lightgray"
                            onClick={() => handleCategorySelect(category.name)}
                          >
                            {category.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs text-gray">
                    Name
                  </label>
                  <div className="w-full h-9 relative">
                    <input
                      type="text"
                      name="name"
                      placeholder="Denim Mini Skirt"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="slug" className="text-xs text-gray">
                    Slug
                  </label>
                  <div className="w-full h-9 relative">
                    <input
                      type="text"
                      name="slug"
                      placeholder="denim-mini-skirt"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="basePrice" className="text-xs text-gray">
                    Base price
                  </label>
                  <div className="w-full h-9 relative">
                    <input
                      type="text"
                      name="basePrice"
                      placeholder="34.99"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="mainImage" className="text-xs text-gray">
                    Main image
                  </label>
                  <div>
                    <div className="w-full max-w-[383px] border rounded-md overflow-hidden">
                      <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
                        {formData.mainImage && isValidRemoteImage(formData.mainImage) && (
                          <Image
                            src={formData.mainImage}
                            alt={formData.name || "mainImage"}
                            width={383}
                            height={383}
                            priority
                          />
                        )}
                      </div>
                      <div className="w-full h-9 border-t overflow-hidden">
                        <input
                          type="text"
                          name="mainImage"
                          placeholder="Paste image URL"
                          value={formData.mainImage}
                          onChange={handleInputChange}
                          className="h-full w-full px-3 text-sm text-gray"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 bg-white">
              <button
                onClick={handleSave}
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loading,
                    "hover:bg-neutral-600 active:bg-neutral-800": !loading,
                  }
                )}
              >
                {loading ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner color="white" />
                    <span className="text-white">Saving</span>
                  </div>
                ) : (
                  <span className="text-white">Save</span>
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

type NewProductMenuButtonType = {
  closeMenu: () => void;
};

type CategoryType = {
  index: number;
  name: string;
  image: string;
  visibility: "VISIBLE" | "HIDDEN";
};
