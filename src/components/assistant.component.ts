
import { Component, signal, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Toggle Button -->
    <button 
      (click)="toggleChat()"
      class="fixed bottom-24 right-6 z-40 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group border-2 border-white"
      [style.backgroundColor]="config().ai.buttonColor || brandColor"
      [style.width]="config().ai.buttonSize"
      [style.height]="config().ai.buttonSize"
      title="Chat dengan AI"
    >
      @if (!isOpen()) {
        <!-- Chat Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="w-1/2 h-1/2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      } @else {
        <!-- Close Icon (Chevron down) -->
        <svg xmlns="http://www.w3.org/2000/svg" class="w-1/2 h-1/2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      }
      
      <!-- Notification Ring -->
      @if (!isOpen() && chatHistory().length === 0) {
        <span class="absolute -top-1 -right-1 flex h-4 w-4">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
        </span>
      }
    </button>

    <!-- Chat Window Widget -->
    @if (isOpen()) {
      <div 
        class="fixed bottom-40 right-6 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-gray-200 font-sans"
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
             <button (click)="toggleChat()" class="p-1.5 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white" title="Tutup">
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
                
                <!-- Bubble -->
                <div class="p-3 rounded-2xl text-sm max-w-[85%] shadow-sm leading-relaxed"
                     [class.rounded-tl-none]="msg.role === 'ai'"
                     [class.rounded-tr-none]="msg.role === 'user'"
                     [class.bg-white]="msg.role === 'ai'"
                     [class.text-gray-800]="msg.role === 'ai'"
                     [class.text-white]="msg.role === 'user'"
                     [style.backgroundColor]="msg.role === 'user' ? (config().ai.buttonColor || brandColor) : ''">
                  {{ msg.text }}
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

  isOpen = signal(false);
  userInput = signal('');
  chatHistory = signal<{role: 'user'|'ai', text: string}[]>([]);
  isLoading = signal(false);
  
  // Brand color fallback
  brandColor = '#D84315'; // Default Orange

  constructor() {
     // Try to sync with config if possible (simple effect)
     // Not critical as we have a good fallback
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

  toggleChat() {
    this.isOpen.update(v => !v);
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

    // Call Gemini
    const reply = await this.geminiService.getRecommendation(text);

    // Add AI reply
    this.chatHistory.update(history => [...history, {role: 'ai', text: reply}]);
    this.isLoading.set(false);
  }
}
