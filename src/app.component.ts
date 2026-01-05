import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar.component';
import { FooterComponent } from './components/footer.component';
import { AdminComponent } from './components/admin.component';
import { CursorComponent } from './components/cursor.component';
import { ToastComponent } from './components/toast.component';
import { MusicPlayerComponent } from './components/music-player.component';
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
    ToastComponent,
    MusicPlayerComponent
  ],
  template: `
    <app-cursor></app-cursor>
    <app-toast></app-toast>
    <app-music-player></app-music-player>
    
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
    
    <!-- Always keep Admin Panel accessible -->
    <app-admin></app-admin>
  `,
  styles: [`
    @keyframes bounce-slow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .animate-bounce-slow { animation: bounce-slow 3s infinite; }

    /* Page Transition Animation */
    :host ::ng-deep router-outlet + * {
      display: block;
      animation: route-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes route-enter {
      from { 
        opacity: 0; 
        transform: translateY(10px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0);
      }
    }
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
