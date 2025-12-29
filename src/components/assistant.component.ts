
import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="py-16 bg-brand-cream relative overflow-hidden">
      <!-- Decor element -->
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-brand-orange opacity-10 rounded-full blur-3xl"></div>

      <div class="max-w-4xl mx-auto px-4 relative z-10">
        <div class="bg-white rounded-2xl shadow-xl p-8 border border-brand-orange/10">
          <div class="text-center mb-6">
            <span class="bg-brand-orange/10 text-brand-orange text-xs font-bold px-3 py-1 rounded-full tracking-wide">POWERED BY GEMINI AI</span>
            <h3 class="text-2xl font-serif font-bold text-brand-brown mt-2">Bingung Mau Makan Apa?</h3>
            <p class="text-gray-600">Tanya asisten virtual kami untuk rekomendasi menu yang cocok buat kamu!</p>
          </div>

          <div class="space-y-4">
            <!-- Chat Area -->
            <div class="min-h-[150px] bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col gap-3">
              <!-- Bot Initial Message -->
              <div class="flex gap-3">
                <div class="w-8 h-8 rounded-full bg-brand-brown flex-shrink-0 flex items-center justify-center text-white text-xs">AI</div>
                <div class="bg-brand-brown text-white p-3 rounded-r-lg rounded-bl-lg text-sm max-w-[80%]">
                  {{ config().ai.initialMessage }}
                </div>
              </div>

              <!-- User & AI Messages -->
               @for (msg of chatHistory(); track $index) {
                 <div class="flex gap-3" [class.flex-row-reverse]="msg.role === 'user'">
                    <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
                         [class.bg-gray-300]="msg.role === 'user'"
                         [class.bg-brand-brown]="msg.role === 'ai'"
                         [class.text-gray-700]="msg.role === 'user'"
                         [class.text-white]="msg.role === 'ai'">
                      {{ msg.role === 'user' ? 'U' : 'AI' }}
                    </div>
                    <div class="p-3 rounded-lg text-sm max-w-[80%]"
                         [class.bg-gray-200]="msg.role === 'user'"
                         [class.text-gray-800]="msg.role === 'user'"
                         [class.rounded-l-lg]="msg.role === 'user'"
                         [class.rounded-br-none]="msg.role === 'user'"
                         [class.bg-brand-brown]="msg.role === 'ai'"
                         [class.text-white]="msg.role === 'ai'"
                         [class.rounded-r-lg]="msg.role === 'ai'"
                         [class.rounded-bl-none]="msg.role === 'ai'">
                      {{ msg.text }}
                    </div>
                 </div>
               }
               
               @if (isLoading()) {
                 <div class="flex gap-3">
                   <div class="w-8 h-8 rounded-full bg-brand-brown flex-shrink-0 flex items-center justify-center text-white text-xs">AI</div>
                   <div class="bg-brand-brown/50 text-white p-3 rounded-r-lg rounded-bl-lg text-sm animate-pulse">
                     Sedang mengetik...
                   </div>
                 </div>
               }
            </div>

            <!-- Input Area -->
            <div class="flex gap-2">
              <input 
                type="text" 
                [(ngModel)]="userInput" 
                (keyup.enter)="sendMessage()"
                placeholder="Contoh: Saya suka pedas dan daging kambing..." 
                class="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition"
                [disabled]="isLoading()"
              >
              <button 
                (click)="sendMessage()" 
                [disabled]="isLoading() || !userInput().trim()"
                class="bg-brand-orange text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <span>Kirim</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  `
})
export class AssistantComponent {
  geminiService = inject(GeminiService);
  configService = inject(ConfigService);
  config = this.configService.config;

  userInput = signal('');
  chatHistory = signal<{role: 'user'|'ai', text: string}[]>([]);
  isLoading = signal(false);

  async sendMessage() {
    const text = this.userInput().trim();
    if (!text) return;

    // Add user message
    this.chatHistory.update(history => [...history, {role: 'user', text}]);
    this.userInput.set('');
    this.isLoading.set(true);

    // Call Gemini
    const reply = await this.geminiService.getRecommendation(text);

    // Add AI reply
    this.chatHistory.update(history => [...history, {role: 'ai', text: reply}]);
    this.isLoading.set(false);
  }
}
