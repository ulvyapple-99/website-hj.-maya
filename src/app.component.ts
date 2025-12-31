
import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar.component';
import { FooterComponent } from './components/footer.component';
import { AdminComponent } from './components/admin.component';
import { CursorComponent } from './components/cursor.component';
import { ToastComponent } from './components/toast.component';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    AdminComponent,
    CursorComponent,
    ToastComponent
  ],
  template: `
    <app-cursor></app-cursor>
    <app-toast></app-toast>
    
    <!-- Maintenance Overlay -->
    @if (config().global.maintenanceMode) {
       <div class="fixed inset-0 z-[5000] bg-gray-900 flex flex-col items-center justify-center text-white text-center p-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-yellow-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 class="text-4xl font-bold mb-4 font-serif">Website Under Maintenance</h1>
          <p class="text-xl opacity-80 max-w-lg">Kami sedang melakukan perbaikan untuk meningkatkan pelayanan. Silakan kembali lagi nanti.</p>
       </div>
    }

    <!-- Intro Video Overlay -->
    @if (showIntro() && !config().global.maintenanceMode) {
      <div 
        class="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center transition-all duration-1000 ease-in-out"
        [class.opacity-0]="isClosing() && (config().intro.fadeOut === 'fade' || config().intro.fadeOut === 'zoom-out')"
        [class.-translate-y-full]="isClosing() && config().intro.fadeOut === 'slide-up'"
        [class.translate-y-full]="isClosing() && config().intro.fadeOut === 'slide-down'"
        [class.scale-0]="isClosing() && config().intro.fadeOut === 'zoom-out'"
        [class.pointer-events-none]="isClosing()"
      >
        @if (config().intro.videoUrl) {
          <video 
            [src]="config().intro.videoUrl"
            autoplay 
            muted 
            playsinline 
            class="w-full h-full object-cover"
            (ended)="closeIntro()"
          ></video>
        } @else {
           <div class="text-white animate-pulse">Loading Intro...</div>
        }
        
        <button 
          (click)="closeIntro()"
          class="absolute bottom-10 right-10 bg-white/20 hover:bg-white/40 backdrop-blur border border-white text-white px-6 py-2 rounded-full z-50 transition"
        >
          Skip Intro
        </button>
      </div>
    }

    <!-- Main Content -->
    @if (!showIntro() && !config().global.maintenanceMode) {
      <div class="flex flex-col min-h-screen">
        <app-navbar></app-navbar>
        <main class="flex-grow">
          <router-outlet></router-outlet>
        </main>
        <app-footer></app-footer>
      </div>
    }
    
    <!-- Global Floating WhatsApp (Blind Spot 5) -->
    @if (!config().global.maintenanceMode && config().global.floatingWhatsapp) {
       <a [href]="'https://wa.me/' + configService.formatPhoneNumber(config().global.floatingWhatsapp)" 
          target="_blank"
          class="fixed bottom-6 right-6 z-40 bg-green-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 border-2 border-white animate-bounce-slow"
          title="Chat WhatsApp">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.506-.669-.514-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.084 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
       </a>
    }

    <!-- Always keep Admin Panel accessible -->
    <app-admin></app-admin>
  `,
  styles: [`
    @keyframes bounce-slow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .animate-bounce-slow { animation: bounce-slow 3s infinite; }
  `]
})
export class AppComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  showIntro = signal(false);
  isClosing = signal(false);

  constructor() {
    // Initialize state logic for Intro
    const c = this.configService.config();
    if (c.intro.enabled && c.intro.videoUrl) {
      this.showIntro.set(true);
      
      // Auto close after duration
      setTimeout(() => {
        this.closeIntro();
      }, (c.intro.duration || 10) * 1000);
    }
  }

  closeIntro() {
    // If it's already closing, do nothing
    if (this.isClosing()) return;

    // Check fade out setting
    const fadeOutType = this.config().intro.fadeOut;

    if (fadeOutType === 'none') {
      this.showIntro.set(false);
      return;
    }

    // Trigger Animation
    this.isClosing.set(true);

    // Wait for animation to finish (1s matches CSS duration-1000)
    setTimeout(() => {
      this.showIntro.set(false);
      this.isClosing.set(false);
    }, 1000);
  }
}
