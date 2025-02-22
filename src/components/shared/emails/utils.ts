import React from "react";

export type ContentType = "react" | "html";

// Define proper types for element props
type ElementProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  [key: string]: any;
};

// Utility to convert React styles to inline string styles
export function convertStyleToString(style: React.CSSProperties): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
      return `${cssKey}: ${value};`;
    })
    .join(" ");
}

// Utility to convert component to desired format
export function convertContent(
  content: React.ReactElement,
  contentType: ContentType
): string | React.ReactElement {
  if (contentType === "react") return content;

  const convertElement = (element: React.ReactElement): string => {
    const { type, props } = element;

    if (typeof type === "string") {
      // Type assertion for props to ensure type safety
      const elementProps = props as ElementProps;

      const attributes = Object.keys(elementProps)
        .filter((key) => key !== "children" && key !== "style")
        .map((key) => {
          const value = elementProps[key];
          return `${key}="${value}"`;
        })
        .join(" ");

      const styleString = elementProps.style
        ? ` style="${convertStyleToString(elementProps.style)}"`
        : "";

      const allAttributes = `${attributes}${styleString}`;

      const children =
        React.Children.map(elementProps.children, (child) => {
          if (typeof child === "string") return child;
          if (React.isValidElement(child)) return convertElement(child);
          return "";
        })?.join("") || "";

      return `<${type}${
        allAttributes ? ` ${allAttributes}` : ""
      }>${children}</${type}>`;
    }

    return "";
  };

  return convertElement(content);
}
