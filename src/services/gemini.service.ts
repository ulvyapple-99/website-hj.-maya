
import { Injectable, inject } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private configService = inject(ConfigService);
  
  // GANTI DENGAN API KEY GOOGLE AI STUDIO ANDA JIKA 'process.env' ERROR DI DEPLOYMENT
  private HARDCODED_API_KEY = ''; 
  
  // Rate Limiting
  private lastCallTime = 0;
  private MIN_INTERVAL_MS = 3000; // 3 seconds delay

  constructor() {
    this.initAI();
  }

  private initAI() {
    let apiKey = this.HARDCODED_API_KEY;
    
    // Try to get from env if available (local dev)
    try {
      if (!apiKey && typeof process !== 'undefined' && process.env) {
        apiKey = process.env['API_KEY'] || '';
      }
    } catch (e) {
      // Ignore env errors
    }

    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async getRecommendation(query: string): Promise<string> {
    // Rate Limit Check
    const now = Date.now();
    if (now - this.lastCallTime < this.MIN_INTERVAL_MS) {
       return "Mohon tunggu sebentar sebelum mengirim pesan lagi ya...";
    }
    this.lastCallTime = now;

    if (!this.ai) {
      this.initAI(); // Try to init again
      if (!this.ai) {
         return "Maaf, sistem AI belum dikonfigurasi (API Key Missing). Silakan hubungi admin.";
      }
    }

    try {
      const config = this.configService.config();
      const menuList = this.configService.getMenuContext();

      const prompt = `
        ${config.ai.systemInstruction}
        
        DATA MENU RESTORAN KAMI SAAT INI (Gunakan data ini untuk rekomendasi):
        ${menuList}
        
        Pelanggan bertanya: "${query}"
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Maaf, saya sedang berpikir keras tapi tidak menemukan jawaban. Coba tanya lagi ya!";
    } catch (error) {
      console.error('Gemini Error:', error);
      return "Waduh, koneksi ke dapur AI terputus. Silakan pilih menu Sate Sapi saja, pasti enak!";
    }
  }
}
