import { Injectable, inject } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { ConfigService } from './config.service';

// NEW: Interface for structured AI response
export interface AIResponse {
  intent: 'MENU_RECOMMENDATION' | 'LOCATION_INFO' | 'OPERATIONAL_HOURS' | 'RESERVATION_INQUIRY' | 'GENERAL_FAQ' | 'UNKNOWN';
  response: string;
  actionableLink?: string;
  linkText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private configService = inject(ConfigService);
  
  private lastCallTime = 0;
  private MIN_INTERVAL_MS = 3000;

  constructor() {
    this.initAI();
  }

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

  // NEW: Helper to get branch context
  private getBranchContext(): string {
    const branches = this.configService.config().branches;
    return branches.map(b => 
      `- Cabang: ${b.name}\n  Alamat: ${b.address}\n  Jam Buka: ${b.hours}\n  Link Google Maps: ${b.googleMapsUrl}`
    ).join('\n');
  }

  // NEW: Helper to get reservation context
  private getReservationContext(): string {
    const branches = this.configService.config().branches;
    return branches.map(b => 
      `- Cabang ${b.name}: Reservasi reguler min. ${b.minPaxRegular} orang, Buka Puasa min. ${b.minPaxRamadan} orang.`
    ).join('\n');
  }

  // UPGRADED: Method now returns a structured AIResponse object
  async getRecommendation(query: string): Promise<AIResponse> {
    const now = Date.now();
    if (now - this.lastCallTime < this.MIN_INTERVAL_MS) {
       return { intent: 'UNKNOWN', response: "Mohon tunggu sebentar sebelum mengirim pesan lagi ya..." };
    }
    this.lastCallTime = now;

    if (!this.ai) {
       return { intent: 'UNKNOWN', response: "Maaf, sistem AI sedang tidak tersedia saat ini." };
    }

    try {
      const config = this.configService.config();
      const menuList = this.configService.getMenuContext();
      const branchInfo = this.getBranchContext();
      const reservationInfo = this.getReservationContext();
      
      const systemInstruction = `
        Anda adalah asisten virtual Sate Maranggi Hj. Maya yang cerdas dan multi-fungsi.
        Tugas Anda adalah memahami niat pelanggan dan memberikan respons yang akurat dalam format JSON.

        ATURAN PENTING:
        1. JANGAN PERNAH menyebutkan stok (sisa porsi, tersedia/tidak). Anggap semua menu di list tersedia.
        2. Jawab dengan ramah, singkat, dan sopan dalam Bahasa Indonesia.
        3. Gunakan data yang diberikan di bawah ini sebagai SATU-SATUNYA sumber kebenaran.
        4. Jika pertanyaan di luar konteks (misal: cuaca, politik), setel intent ke 'UNKNOWN'.

        DATA RESTORAN:
        ---
        [DATA MENU]
        ${menuList}
        ---
        [DATA LOKASI & JAM OPERASIONAL]
        ${branchInfo}
        ---
        [DATA RESERVASI]
        ${reservationInfo}
        ---
        [FAQ UMUM]
        - Halal: Ya, semua makanan dan minuman kami 100% Halal.
        - Parkir: Tersedia area parkir yang luas untuk mobil dan motor.
        - Pembayaran: Kami menerima tunai, QRIS, debit, dan kartu kredit.
        ---

        INSTRUKSI TUGAS:
        Analisis pertanyaan pelanggan dan identifikasi niatnya. Kemudian, bentuk respons JSON berdasarkan skema yang ditentukan.
        - Jika pelanggan bertanya tentang menu, rekomendasi, atau harga: set 'intent' ke 'MENU_RECOMMENDATION'.
        - Jika pelanggan bertanya tentang lokasi, alamat, atau jam buka: set 'intent' ke 'LOCATION_INFO' atau 'OPERATIONAL_HOURS'. Jika relevan, sertakan Google Maps link di 'actionableLink'.
        - Jika pelanggan bertanya tentang booking, reservasi, atau pesan tempat: set 'intent' ke 'RESERVATION_INQUIRY'. Berikan informasi minimal pax dan arahkan ke halaman reservasi dengan 'actionableLink' ke '/reservation'.
        - Jika pertanyaan umum (halal, parkir, dll.): set 'intent' ke 'GENERAL_FAQ'.
        - Jika tidak relevan: set 'intent' ke 'UNKNOWN'.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          intent: { type: Type.STRING, enum: ['MENU_RECOMMENDATION', 'LOCATION_INFO', 'OPERATIONAL_HOURS', 'RESERVATION_INQUIRY', 'GENERAL_FAQ', 'UNKNOWN'] },
          response: { type: Type.STRING, description: "Jawaban teks yang ramah untuk pelanggan." },
          actionableLink: { type: Type.STRING, description: "URL relevan jika ada (misal: link Google Maps atau halaman reservasi '/reservation'). Kosongkan jika tidak ada." },
          linkText: { type: Type.STRING, description: "Teks untuk tombol/link (misal: 'Buka Google Maps', 'Reservasi di Sini'). Kosongkan jika tidak ada link." }
        },
        required: ["intent", "response"]
      };

      const prompt = `Pelanggan bertanya: "${query}"`;

      const geminiResponse: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      });

      const text = geminiResponse.text;
      if (!text) {
         throw new Error("Empty response from AI.");
      }
      
      // Parse the JSON response
      const parsedResponse: AIResponse = JSON.parse(text);
      return parsedResponse;

    } catch (error) {
      console.error('Gemini Error:', error);
      return { 
        intent: 'UNKNOWN', 
        response: "Waduh, koneksi ke dapur AI terputus. Silakan coba lagi atau pilih menu Sate Sapi saja, pasti enak!" 
      };
    }
  }
}
