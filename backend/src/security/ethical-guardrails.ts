import { config } from "../config";
import { logger } from "../monitoring/logger";

export class EthicalGuardrails {
  private ethicalRules: string[] = [
    "Ne pas générer de contenu haineux, discriminatoire ou violent.",
    "Ne pas générer de contenu sexuellement explicite.",
    "Ne pas promouvoir d'activités illégales.",
    "Ne pas inciter à l'automutilation ou au suicide.",
    "Ne pas divulguer d'informations personnelles identifiables (PII) sans consentement explicite.",
    "Ne pas générer de désinformation ou de fausses nouvelles intentionnellement.",
    "Toujours privilégier la sécurité et le bien-être des utilisateurs.",
  ];

  constructor() {
    // Load custom ethical rules from config if available
    if (config.security.customEthicalRules) {
      this.ethicalRules = this.ethicalRules.concat(config.security.customEthicalRules);
    }
  }

  async evaluatePrompt(prompt: string): Promise<{ passed: boolean; reason?: string }> {
    // In a real-world scenario, this would involve a dedicated LLM or a rule-based system
    // to evaluate the prompt against ethical guidelines.
    // For now, we'll do a basic keyword check as a placeholder.
    const lowerCasePrompt = prompt.toLowerCase();
    for (const rule of this.ethicalRules) {
      // This is a very basic check and needs to be replaced by a more sophisticated mechanism
      if (lowerCasePrompt.includes("hate speech") || lowerCasePrompt.includes("violence") || lowerCasePrompt.includes("illegal")) {
        logger.warn(`Ethical guardrail violation detected in prompt: ${prompt}`);
        return { passed: false, reason: rule };
      }
    }
    return { passed: true };
  }

  async evaluateResponse(response: string): Promise<{ passed: boolean; reason?: string }> {
    // Similar to evaluatePrompt, this would involve an LLM or rule-based system.
    const lowerCaseResponse = response.toLowerCase();
    for (const rule of this.ethicalRules) {
      // This is a very basic check and needs to be replaced by a more sophisticated mechanism
      if (lowerCaseResponse.includes("hate speech") || lowerCaseResponse.includes("violence") || lowerCaseResponse.includes("illegal")) {
        logger.warn(`Ethical guardrail violation detected in response: ${response}`);
        return { passed: false, reason: rule };
      }
    }
    return { passed: true };
  }
}

export const ethicalGuardrails = new EthicalGuardrails();
