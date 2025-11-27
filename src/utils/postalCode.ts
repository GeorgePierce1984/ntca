export interface PostalCodeInfo {
  label: string;
  placeholder: string;
  required: boolean;
  pattern?: string;
  maxLength?: number;
}

// Map of country codes to postal code information
const postalCodeByCountry: Record<string, PostalCodeInfo> = {
  // United States
  US: {
    label: "ZIP Code",
    placeholder: "12345 or 12345-6789",
    required: false,
    pattern: "^\\d{5}(-\\d{4})?$",
    maxLength: 10,
  },
  // United Kingdom
  GB: {
    label: "Postcode",
    placeholder: "SW1A 1AA",
    required: false,
    pattern: "^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$",
    maxLength: 8,
  },
  // Canada
  CA: {
    label: "Postal Code",
    placeholder: "K1A 0B1",
    required: false,
    pattern: "^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$",
    maxLength: 7,
  },
  // Australia
  AU: {
    label: "Postcode",
    placeholder: "2000",
    required: false,
    pattern: "^\\d{4}$",
    maxLength: 4,
  },
  // India
  IN: {
    label: "PIN Code",
    placeholder: "110001",
    required: false,
    pattern: "^\\d{6}$",
    maxLength: 6,
  },
  // Germany
  DE: {
    label: "Postleitzahl",
    placeholder: "10115",
    required: false,
    pattern: "^\\d{5}$",
    maxLength: 5,
  },
  // France
  FR: {
    label: "Code Postal",
    placeholder: "75001",
    required: false,
    pattern: "^\\d{5}$",
    maxLength: 5,
  },
  // Russia
  RU: {
    label: "Почтовый индекс",
    placeholder: "101000",
    required: false,
    pattern: "^\\d{6}$",
    maxLength: 6,
  },
  // China
  CN: {
    label: "邮政编码",
    placeholder: "100000",
    required: false,
    pattern: "^\\d{6}$",
    maxLength: 6,
  },
  // Japan
  JP: {
    label: "郵便番号",
    placeholder: "100-0001",
    required: false,
    pattern: "^\\d{3}-?\\d{4}$",
    maxLength: 8,
  },
  // Kazakhstan
  KZ: {
    label: "Postal Index",
    placeholder: "050000",
    required: false,
    pattern: "^\\d{6}$",
    maxLength: 6,
  },
  // UAE - No postal codes, use PO Box
  AE: {
    label: "PO Box",
    placeholder: "PO Box 12345",
    required: false,
  },
  // Ireland - Introduced Eircode in 2015
  IE: {
    label: "Eircode",
    placeholder: "D02 X285",
    required: false,
    pattern: "^[A-Z]\\d{2} ?[A-Z\\d]{4}$",
    maxLength: 8,
  },
};

// Default for countries not in the list
const defaultPostalCode: PostalCodeInfo = {
  label: "Postal / ZIP Code",
  placeholder: "Enter postal code if applicable",
  required: false,
};

/**
 * Get postal code information for a specific country
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')
 * @returns PostalCodeInfo object with label, placeholder, and validation rules
 */
export function getPostalCodeInfo(countryCode: string): PostalCodeInfo {
  const upperCountryCode = countryCode?.toUpperCase();
  return postalCodeByCountry[upperCountryCode] || defaultPostalCode;
}

/**
 * Validate a postal code based on country-specific rules
 * @param postalCode - The postal code to validate
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns true if valid or empty (when not required), false otherwise
 */
export function validatePostalCode(
  postalCode: string,
  countryCode: string
): boolean {
  if (!postalCode || postalCode.trim() === "") {
    return true; // Empty is valid since postal codes are optional
  }

  const info = getPostalCodeInfo(countryCode);
  if (!info.pattern) {
    return true; // No pattern to validate against
  }

  const regex = new RegExp(info.pattern, "i");
  return regex.test(postalCode.trim());
}

/**
 * Format a postal code according to country-specific rules
 * @param postalCode - The postal code to format
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Formatted postal code
 */
export function formatPostalCode(
  postalCode: string,
  countryCode: string
): string {
  if (!postalCode) return "";

  const trimmed = postalCode.trim().toUpperCase();
  const upperCountryCode = countryCode?.toUpperCase();

  switch (upperCountryCode) {
    case "GB":
      // UK postcodes: Add space before last 3 characters if not present
      if (trimmed.length >= 5 && !trimmed.includes(" ")) {
        return trimmed.slice(0, -3) + " " + trimmed.slice(-3);
      }
      break;
    case "CA":
      // Canadian postal codes: Add space in middle if not present
      if (trimmed.length === 6 && !trimmed.includes(" ")) {
        return trimmed.slice(0, 3) + " " + trimmed.slice(3);
      }
      break;
    case "US":
      // US ZIP codes: Format as 12345-6789 if 9 digits
      if (trimmed.length === 9 && !trimmed.includes("-")) {
        return trimmed.slice(0, 5) + "-" + trimmed.slice(5);
      }
      break;
    case "JP":
      // Japanese postal codes: Add hyphen if not present
      if (trimmed.length === 7 && !trimmed.includes("-")) {
        return trimmed.slice(0, 3) + "-" + trimmed.slice(3);
      }
      break;
  }

  return trimmed;
}

/**
 * Get a list of countries that don't use postal codes
 * @returns Array of country codes
 */
export function getCountriesWithoutPostalCodes(): string[] {
  return [
    "AO", // Angola
    "AG", // Antigua and Barbuda
    "AW", // Aruba
    "BS", // Bahamas
    "BZ", // Belize
    "BJ", // Benin
    "BW", // Botswana
    "BF", // Burkina Faso
    "BI", // Burundi
    "CM", // Cameroon
    "CF", // Central African Republic
    "KM", // Comoros
    "CG", // Congo
    "CD", // Democratic Republic of the Congo
    "DJ", // Djibouti
    "DM", // Dominica
    "GQ", // Equatorial Guinea
    "ER", // Eritrea
    "FJ", // Fiji
    "GM", // Gambia
    "GH", // Ghana
    "GD", // Grenada
    "GN", // Guinea
    "GY", // Guyana
    "HK", // Hong Kong (uses districts instead)
    "KI", // Kiribati
    "MO", // Macau
    "MW", // Malawi
    "ML", // Mali
    "MR", // Mauritania
    "NR", // Nauru
    "NU", // Niue
    "KP", // North Korea
    "PA", // Panama (introduced in 2007 but not widely used)
    "QA", // Qatar (uses zones/areas instead)
    "RW", // Rwanda
    "KN", // Saint Kitts and Nevis
    "LC", // Saint Lucia
    "ST", // São Tomé and Príncipe
    "SC", // Seychelles
    "SL", // Sierra Leone
    "SB", // Solomon Islands
    "SO", // Somalia
    "SR", // Suriname
    "SY", // Syria
    "TL", // Timor-Leste
    "TG", // Togo
    "TO", // Tonga
    "TV", // Tuvalu
    "UG", // Uganda
    "VU", // Vanuatu
    "YE", // Yemen
    "ZW", // Zimbabwe
  ];
}
