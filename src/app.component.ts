
import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar.component';
import { FooterComponent } from './components/footer.component';
import { AdminComponent } from './components/admin.component';
import { CursorComponent } from './components/cursor.component';
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
    CursorComponent
  ],
  template: `
    <app-cursor></app-cursor>
    
    <!-- Intro Video Overlay -->
    @if (showIntro()) {
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
            autoplay 
            muted 
            playsinline 
            class="w-full h-full object-cover"
            (ended)="closeIntro()"
          >
             <source [src]="config().intro.videoUrl" type="video/mp4">
          </video>
        } @else {
           <!-- Fallback if enabled but no video -->
           <div class="text-white animate-pulse">Loading...</div>
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
    @if (!showIntro()) {
      <div class="flex flex-col min-h-screen">
        <app-navbar></app-navbar>
        <main class="flex-grow">
          <router-outlet></router-outlet>
        </main>
        <app-footer></app-footer>
      </div>
      <app-admin></app-admin>
    }
  `
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
