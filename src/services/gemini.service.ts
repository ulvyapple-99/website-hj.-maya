
import { Injectable, inject } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private configService = inject(ConfigService);

  constructor() {
    let apiKey = '';
    try {
      // Safety check for browser environments where process might not be defined
      apiKey = process.env['API_KEY'] || '';
    } catch (e) {
      console.warn('Environment variable process.env.API_KEY not found.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async getRecommendation(query: string): Promise<string> {
    try {
      let apiKey = '';
      try { apiKey = process.env['API_KEY'] || ''; } catch (e) {}
      
      if (!apiKey) {
        return "Maaf, sistem AI sedang offline (API Key missing). Silakan tanya pelayan kami langsung!";
      }

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
