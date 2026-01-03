import { Injectable, inject } from '@angular/core';
// FIX: Imported GenerateContentResponse for proper response typing.
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private configService = inject(ConfigService);
  
  // Rate Limiting
  private lastCallTime = 0;
  private MIN_INTERVAL_MS = 3000; // 3 seconds delay

  constructor() {
    this.initAI();
  }

  // FIX: Refactored to remove hardcoded API key and rely solely on process.env as per guidelines.
  private initAI() {
    try {
      if (typeof process !== 'undefined' && process.env && process.env['API_KEY']) {
        this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
      } else {
        console.warn("Gemini API key not found in process.env.API_KEY. AI features will be disabled.");
      }
    } catch (e) {
      console.error("Error initializing Gemini AI:", e);
    }
  }

  async getRecommendation(query: string): Promise<string> {
    // Rate Limit Check
    const now = Date.now();
    if (now - this.lastCallTime < this.MIN_INTERVAL_MS) {
       return "Mohon tunggu sebentar sebelum mengirim pesan lagi ya...";
    }
    this.lastCallTime = now;

    // FIX: Simplified AI availability check to provide a generic user-friendly message.
    if (!this.ai) {
       return "Maaf, sistem AI sedang tidak tersedia saat ini.";
    }

    try {
      const config = this.configService.config();
      const menuList = this.configService.getMenuContext();

      // INSTRUCTION TO PREVENT STOCK HALLUCINATION
      const strictRules = `
        ATURAN PENTING:
        1. JANGAN PERNAH menyebutkan stok (sisa porsi, tersedia/tidak). Anggap semua menu di list tersedia kecuali tertulis [HABIS].
        2. Fokus pada rekomendasi rasa, bahan, dan kecocokan menu.
        3. Jawab dengan ramah dan singkat.
      `;

      const prompt = `
        ${strictRules}
        ${config.ai.systemInstruction}
        
        DATA MENU RESTORAN KAMI (Gunakan data ini untuk rekomendasi):
        ${menuList}
        
        Pelanggan bertanya: "${query}"
      `;

      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      // FIX: Use the response.text getter and provide a fallback for empty strings.
      const text = response.text;
      return text || "Maaf, saya sedang berpikir keras tapi tidak menemukan jawaban. Coba tanya lagi ya!";
    } catch (error) {
      console.error('Gemini Error:', error);
      return "Waduh, koneksi ke dapur AI terputus. Silakan pilih menu Sate Sapi saja, pasti enak!";
    }
  }
}
