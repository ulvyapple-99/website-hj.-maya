import { Component, signal, inject, ViewChild, ElementRef, AfterViewChecked, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, AIResponse, ChatMessage } from '../services/gemini.service';
import { ConfigService } from '../services/config.service';

// NEW: Updated interface for chat history
interface ChatMessageWithLink extends ChatMessage {
  link?: string;
  linkText?: string;
}

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Speed Dial Container -->
    @if (!isChatOpen()) {
      <div class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        
        <!-- Sub-buttons that appear when menu is open -->
        <div 
          class="flex flex-col items-end gap-3 transition-all duration-300 ease-out"
          [class.opacity-0]="!isFabMenuOpen()"
          [class.pointer-events-none]="!isFabMenuOpen()"
          [class.-translate-y-4]="!isFabMenuOpen()"
        >
            <!-- WhatsApp Branch Buttons -->
            @for (branch of config().branches; track branch.id) {
              @if(branch.whatsappNumber) {
                <div class="flex items-center gap-3 justify-end w-full animate-fade-in">
                    <span class="text-white text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-lg shadow-md backdrop-blur-sm">{{ branch.name }}</span>
                    <a [href]="'https://wa.me/' + configService.formatPhoneNumber(branch.whatsappNumber)" 
                        target="_blank"
                        (click)="isFabMenuOpen.set(false)"
                        class="bg-green-500 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 border-2 border-white"
                        [title]="'Chat WhatsApp ' + branch.name">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.506-.669-.514-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.084 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    </a>
                </div>
              }
            }

            <!-- AI Chat Button -->
            <div class="flex items-center gap-3 justify-end w-full animate-fade-in">
              <span class="text-white text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-lg shadow-md backdrop-blur-sm">Asisten AI</span>
              <button 
                  (click)="openChat()"
                  class="text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 border-2 border-white"
                  [style.backgroundColor]="config().ai.buttonColor || brandColor"
                  title="Chat dengan AI">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
              </button>
            </div>
        </div>

        <!-- Main FAB Toggle Button -->
        <button 
          (click)="toggleFabMenu()"
          class="rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group border-2 border-white"
          [style.backgroundColor]="isFabMenuOpen() ? '#4B5563' : (config().ai.buttonColor || brandColor)"
          style="width: 60px; height: 60px;"
          title="Buka Kontak"
        >
          <!-- Icon changes from Plus to X -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white transition-transform duration-300" 
               [class.rotate-45]="isFabMenuOpen()"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    }

    <!-- Chat Window Widget -->
    @if (isChatOpen()) {
      <div 
        class="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-gray-200 font-sans"
        style="height: 500px; max-height: 70vh;"
        [style.width]="config().ai.windowWidth"
      >
        <!-- Header -->
        <div class="p-4 flex items-center justify-between text-white shadow-md relative z-10"
             [style.backgroundColor]="config().ai.buttonColor || brandColor">
           <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                 </svg>
              </div>
              <div>
                <h3 class="font-bold text-sm tracking-wide">CS / AI Assistant</h3>
                <p class="text-[10px] opacity-90 flex items-center gap-1.5 font-medium">
                   <span class="w-2 h-2 rounded-full bg-green-400 block shadow-[0_0_5px_rgba(74,222,128,0.8)]"></span> Online
                </p>
              </div>
           </div>
           
           <div class="flex items-center gap-1">
             <button (click)="clearChat()" class="p-1.5 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white" title="Hapus Chat">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
               </svg>
             </button>
             <button (click)="closeChatWindow()" class="p-1.5 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white" title="Tutup">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
               </svg>
             </button>
           </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F0F2F5]" #scrollContainer>
           <!-- Initial Greeting -->
           <div class="flex gap-2">
              <div class="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm border border-gray-200">AI</div>
              <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm text-gray-800 max-w-[85%] leading-relaxed">
                 {{ config().ai.initialMessage }}
              </div>
           </div>

           <!-- Chat History -->
           @for (msg of chatHistory(); track $index) {
             <div class="flex gap-2 animate-fade-in" [class.flex-row-reverse]="msg.role === 'user'">
                <!-- Avatar -->
                <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm border border-white"
                     [class.bg-gray-300]="msg.role === 'ai'"
                     [class.text-gray-600]="msg.role === 'ai'"
                     [style.backgroundColor]="msg.role === 'user' ? (config().ai.buttonColor || brandColor) : ''"
                     [class.text-white]="msg.role === 'user'">
                   {{ msg.role === 'user' ? 'U' : 'AI' }}
                </div>
                
                <!-- Bubble with potential action button -->
                <div class="max-w-[85%]">
                  <div class="p-3 rounded-2xl text-sm shadow-sm leading-relaxed inline-block"
                       [class.rounded-tl-none]="msg.role === 'ai'"
                       [class.rounded-tr-none]="msg.role === 'user'"
                       [class.bg-white]="msg.role === 'ai'"
                       [class.text-gray-800]="msg.role === 'ai'"
                       [class.text-white]="msg.role === 'user'"
                       [style.backgroundColor]="msg.role === 'user' ? (config().ai.buttonColor || brandColor) : ''">
                    {{ msg.text }}
                  </div>
                  
                  <!-- NEW: Actionable Link Button -->
                  @if (msg.link && msg.linkText) {
                    <div class="mt-2" [class.text-right]="msg.role === 'user'">
                      <a [href]="msg.link.startsWith('/') ? '#' + msg.link : msg.link" 
                         [target]="msg.link.startsWith('/') ? '_self' : '_blank'"
                         (click)="isChatOpen.set(false)"
                         class="inline-block bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition transform hover:scale-105 active:scale-95">
                         {{ msg.linkText }}
                      </a>
                    </div>
                  }
                </div>
             </div>
           }

           @if (isLoading()) {
              <div class="flex gap-2 animate-fade-in">
                 <div class="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm">AI</div>
                 <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm text-gray-500 max-w-[85%] flex items-center gap-1.5 h-10">
                    <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                 </div>
              </div>
           }
        </div>

        <!-- Input Area -->
        <div class="p-3 bg-white border-t border-gray-200">
           <div class="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-3xl border border-transparent focus-within:bg-white focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-opacity-20 transition-all shadow-inner"
                [style.caretColor]="config().ai.buttonColor || brandColor"
                [style.--tw-ring-color]="config().ai.buttonColor || brandColor">
              <input 
                type="text" 
                [(ngModel)]="userInput" 
                (keyup.enter)="sendMessage()"
                placeholder="Tanya menu atau rekomendasi..." 
                class="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                [disabled]="isLoading()"
              >
              <button 
                (click)="sendMessage()" 
                [disabled]="isLoading() || !userInput().trim()"
                class="p-1.5 rounded-full transition disabled:opacity-30 hover:scale-110 active:scale-95"
                [style.color]="userInput().trim() ? (config().ai.buttonColor || brandColor) : '#9CA3AF'"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                 </svg>
              </button>
           </div>
           <div class="text-[10px] text-center text-gray-400 mt-2 font-medium flex justify-center items-center gap-1">
             <span>⚡ Powered by Gemini AI</span>
           </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    
    @keyframes slideUp {
       from { opacity: 0; transform: translateY(40px) scale(0.9); }
       to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AssistantComponent implements AfterViewChecked {
  geminiService = inject(GeminiService);
  configService = inject(ConfigService);
  config = this.configService.config;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isFabMenuOpen = signal(false);
  isChatOpen = signal(false);
  userInput = signal('');
  chatHistory = signal<ChatMessageWithLink[]>([]);
  isLoading = signal(false);
  
  brandColor = '#D84315'; 

  constructor() {
     try {
       const saved = localStorage.getItem('ai_chat_history');
       if(saved) this.chatHistory.set(JSON.parse(saved));
     } catch(e) {}

     effect(() => {
        try {
          localStorage.setItem('ai_chat_history', JSON.stringify(this.chatHistory()));
        } catch(e) {}
     });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch(err) { }
    }
  }

  toggleFabMenu() {
    this.isFabMenuOpen.update(v => !v);
  }

  openChat() {
    this.isFabMenuOpen.set(false);
    this.isChatOpen.set(true);
  }

  closeChatWindow() {
    this.isChatOpen.set(false);
  }

  clearChat() {
    this.chatHistory.set([]);
  }

  async sendMessage() {
    const text = this.userInput().trim();
    if (!text) return;

    // Add user message
    this.chatHistory.update(history => [...history, {role: 'user', text}]);
    this.userInput.set('');
    this.isLoading.set(true);

    // Call Gemini for a structured response, now with history
    const reply: AIResponse = await this.geminiService.getRecommendation(text, this.chatHistory());

    // Add structured AI reply to history
    this.chatHistory.update(history => [...history, {
      role: 'ai', 
      text: reply.response,
      link: reply.actionableLink,
      linkText: reply.linkText
    }]);
    this.isLoading.set(false);
  }
}