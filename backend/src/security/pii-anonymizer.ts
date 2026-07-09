import { config } from "../config";

export class PIIAnonymizer {
  private piiPatterns: { regex: RegExp; replacement: string }[] = [
    { regex: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, replacement: "[SSN_ANONYMIZED]" }, // Social Security Number
    { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: "[EMAIL_ANONYMIZED]" }, // Email
    { regex: /\b\d{10}\b/g, replacement: "[PHONE_ANONYMIZED]" }, // 10-digit phone number
    { regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g, replacement: "[IP_ANONYMIZED]" }, // IP Address
    // Add more patterns as needed
  ];

  constructor() {
    // Load custom PII patterns from config if available
    if (config.security.customPiiPatterns) {
      this.piiPatterns = this.piiPatterns.concat(config.security.customPiiPatterns.map(p => ({
        regex: new RegExp(p.regex, "g"),
        replacement: p.replacement
      })));
    }
  }

  anonymize(text: string): string {
    if (!config.security.enablePiiAnonymization) {
      return text;
    }

    let anonymizedText = text;
    for (const pattern of this.piiPatterns) {
      anonymizedText = anonymizedText.replace(pattern.regex, pattern.replacement);
    }
    return anonymizedText;
  }
}

export const piiAnonymizer = new PIIAnonymizer();
