import { customAlphabet } from "nanoid";
import { REMOTE_PATTERNS } from "../config";

export function createNonLinkableEmail(email: string): React.ReactNode {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    console.warn("Invalid email format:", email);
    return email;
  }

  const [localPart, domain] = email.split("@");
  const domainParts = domain.split(".");

  const splitPreservingSpecialChars = (str: string): string[] => {
    const specialChars = /[._-]/;
    const parts: string[] = [];
    let currentPart = "";

    for (const char of str) {
      if (specialChars.test(char)) {
        if (currentPart) {
          parts.push(currentPart);
          currentPart = "";
        }
        parts.push(char);
      } else {
        currentPart += char;
      }
    }
    if (currentPart) {
      parts.push(currentPart);
    }
    return parts;
  };

  const localParts = splitPreservingSpecialChars(localPart);

  return (
    <>
      {localParts.map((part, index) => (
        <span key={`local-${index}`}>{part}</span>
      ))}
      <span>@</span>
      {domainParts.map((part, index) => (
        <>
          <span key={`domain-${index}`}>{part}</span>
          {index < domainParts.length - 1 && <span>.</span>}
        </>
      ))}
    </>
  );
}

export function createNonLinkableAddress(address: string): React.ReactNode {
  if (typeof address !== "string" || !address.trim()) {
    console.warn("Invalid address format:", address);
    return address;
  }

  // Split address into components while preserving commas and spaces
  const splitAddressComponents = (addr: string): string[] => {
    const components: string[] = [];
    let currentComponent = "";
    let currentNumber = "";

    const processCurrentParts = () => {
      if (currentNumber) {
        components.push(currentNumber);
        currentNumber = "";
      }
      if (currentComponent) {
        components.push(currentComponent);
        currentComponent = "";
      }
    };

    for (let i = 0; i < addr.length; i++) {
      const char = addr[i];

      if (/\d/.test(char)) {
        // If we were building a word, push it first
        if (currentComponent) {
          processCurrentParts();
        }
        currentNumber += char;
      } else if (char === "," || char === " ") {
        processCurrentParts();
        components.push(char);
      } else {
        // If we were building a number, push it first
        if (currentNumber) {
          processCurrentParts();
        }
        currentComponent += char;
      }
    }

    // Push any remaining parts
    processCurrentParts();

    return components.filter((comp) => comp !== "");
  };

  const components = splitAddressComponents(address);

  return (
    <>
      {components.map((component, index) => {
        // Skip rendering extra spaces
        if (
          component === " " &&
          (index === 0 || index === components.length - 1)
        ) {
          return null;
        }

        // Use zero-width spaces between components that might form recognizable patterns
        const needsZeroWidthSpace =
          /^\d/.test(component) || // Numbers
          /^(?:St|Ave|Rd|Blvd|Ln|Dr|Ct|Pl|Ter|Way)\.?$/i.test(component) || // Street types
          /^(?:NY|CA|TX|FL|IL|PA|OH|MI|GA|NC|NJ)$/i.test(component); // State abbreviations

        return (
          <span key={`addr-${index}`}>
            {needsZeroWidthSpace ? `${component}\u200B` : component}
          </span>
        );
      })}
    </>
  );
}

export function generateId() {
  const nanoid = customAlphabet("1234567890", 5);
  return nanoid();
}

export function isValidRemoteImage(url: string) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:") {
      return false;
    }

    const isRemote = REMOTE_PATTERNS.some((pattern) => {
      const patternProtocol = pattern.protocol.replace(":", "");
      const parsedProtocol = parsedUrl.protocol.replace(":", "");
      return (
        patternProtocol === parsedProtocol &&
        pattern.hostname === parsedUrl.hostname
      );
    });

    return isRemote;
  } catch {
    return false;
  }
}

export function capitalizeFirstLetter(text: string) {
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }

  const lowercaseText = text.toLowerCase();
  return lowercaseText.charAt(0).toUpperCase() + lowercaseText.slice(1);
}

export function titleCase(text: string) {
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }

  return text
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
}

export function currentTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
}

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatThousands(num: string | number): string {
  const numString = typeof num === "number" ? num.toString() : num;

  if (!/^-?\d*\.?\d*$/.test(numString)) {
    return numString;
  }

  const numWithoutCommas = numString.replace(/,/g, "");

  const parsedNum = parseFloat(numWithoutCommas);

  if (isNaN(parsedNum)) {
    return numString;
  }

  const formattedNumber = parsedNum.toLocaleString("en-US", {
    minimumFractionDigits: 2,
  });

  return formattedNumber;
}

export function isGifImage(url: string) {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.toLowerCase();
    return pathname.endsWith(".gif");
  } catch {
    return false;
  }
}

/**
 * Shuffle an array of products using the Fisher-Yates algorithm.
 *
 * @param {ProductWithUpsellType[]} products - The array of products to shuffle.
 * @returns {ProductWithUpsellType[]} A shuffled array of products.
 */
export function shuffleDiscoveryProducts(
  products: ProductWithUpsellType[]
): ProductWithUpsellType[] {
  // Shuffle the products using the Fisher-Yates algorithm
  const shuffledProducts = [...products];
  for (let i = shuffledProducts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledProducts[i], shuffledProducts[j]] = [
      shuffledProducts[j],
      shuffledProducts[i],
    ];
  }
  return shuffledProducts;
}

export const productInternationalSizes = {
  Size: ["S", "M", "L", "XL", "XXL"],
  US: ["4", "6", "8/10", "12", "14"],
  EU: ["36", "38", "40/42", "44", "46"],
  UK: ["8", "10", "12/14", "16", "18"],
  NZ: ["8", "10", "12/14", "16", "18"],
  AU: ["8", "10", "12/14", "16", "18"],
  DE: ["36", "38", "40/42", "44", "46"],
  CA: ["4", "6", "8/10", "12", "14"],
  FR: ["36", "38", "40/42", "44", "46"],
  NL: ["36", "38", "40/42", "44", "46"],
  ES: ["36", "38", "40/42", "44", "46"],
  IT: ["40", "42", "44/46", "48", "50"],
  MX: ["4", "6", "8/10", "12", "14"],
  PT: ["36", "38", "40/42", "44", "46"],
  PL: ["36", "38", "40/42", "44", "46"],
  SE: ["36", "38", "40/42", "44", "46"],
  CH: ["36", "38", "40/42", "44", "46"],
  JP: ["S", "M", "L", "XL", "XXL"],
  KR: ["S", "M", "L", "XL", "XXL"],
  BR: ["S", "M", "L", "XL", "XXL"],
  Asian: ["L", "XL", "2XL/3XL", "4XL", "5XL"],
  ZA: ["66", "77", "88", "99", "110"],
  SA: ["P", "M", "L", "XL", "XXL"],
  BH: ["L", "XL", "2XL/3XL", "4XL", "5XL"],
  AE: ["32", "34", "36/38", "40", "42"],
  KW: ["S", "M", "L", "XL", "XXL"],
  QA: ["S", "M", "L", "XL", "XXL"],
  JO: ["S", "M", "L", "XL", "XXL"],
  OM: ["S", "M", "L", "XL", "XXL"],
};
