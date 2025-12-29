
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md border-b border-brand-orange/20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <!-- Logo -->
          <div routerLink="/" class="flex-shrink-0 flex items-center gap-2 cursor-pointer">
             @if (config().branding.logoImage) {
               @if (isVideo(config().branding.logoImage)) {
                  <video [src]="config().branding.logoImage" class="h-10 w-auto object-contain" autoplay muted loop></video>
               } @else {
                  <img [src]="config().branding.logoImage" class="h-10 w-auto object-contain" alt="Logo">
               }
             } @else {
               <div class="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center text-white font-serif font-bold text-lg">
                 {{ config().branding.logoText.charAt(0) }}
               </div>
             }
             <span class="font-serif font-bold text-xl text-brand-brown tracking-wide">{{ config().branding.logoText }}</span>
          </div>

          <!-- Desktop Menu -->
          <div class="hidden md:flex space-x-8">
            <a routerLink="/" routerLinkActive="text-brand-orange font-bold" [routerLinkActiveOptions]="{exact: true}" class="text-brand-brown hover:text-brand-orange transition-colors font-medium cursor-pointer">Beranda</a>
            <a routerLink="/about" routerLinkActive="text-brand-orange font-bold" class="text-brand-brown hover:text-brand-orange transition-colors font-medium cursor-pointer">Tentang</a>
            <a routerLink="/menu" routerLinkActive="text-brand-orange font-bold" class="text-brand-brown hover:text-brand-orange transition-colors font-medium cursor-pointer">Menu</a>
            <a routerLink="/reservation" routerLinkActive="text-brand-orange font-bold" class="text-brand-brown hover:text-brand-orange transition-colors font-medium cursor-pointer">Reservasi</a>
            <a routerLink="/location" routerLinkActive="text-brand-orange font-bold" class="text-brand-brown hover:text-brand-orange transition-colors font-medium cursor-pointer">Lokasi</a>
          </div>

          <!-- Mobile Button -->
          <div class="md:hidden flex items-center">
            <button (click)="toggleMenu()" class="text-brand-brown hover:text-brand-orange focus:outline-none">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                @if (!isOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (isOpen()) {
        <div class="md:hidden bg-white border-t border-gray-100">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a routerLink="/" (click)="closeMenu()" routerLinkActive="bg-brand-cream text-brand-orange" [routerLinkActiveOptions]="{exact: true}" class="block px-3 py-2 text-brand-brown hover:bg-brand-cream hover:text-brand-orange rounded-md text-base font-medium">Beranda</a>
            <a routerLink="/about" (click)="closeMenu()" routerLinkActive="bg-brand-cream text-brand-orange" class="block px-3 py-2 text-brand-brown hover:bg-brand-cream hover:text-brand-orange rounded-md text-base font-medium">Tentang</a>
            <a routerLink="/menu" (click)="closeMenu()" routerLinkActive="bg-brand-cream text-brand-orange" class="block px-3 py-2 text-brand-brown hover:bg-brand-cream hover:text-brand-orange rounded-md text-base font-medium">Menu</a>
            <a routerLink="/reservation" (click)="closeMenu()" routerLinkActive="bg-brand-cream text-brand-orange" class="block px-3 py-2 text-brand-brown hover:bg-brand-cream hover:text-brand-orange rounded-md text-base font-medium">Reservasi</a>
            <a routerLink="/location" (click)="closeMenu()" routerLinkActive="bg-brand-cream text-brand-orange" class="block px-3 py-2 text-brand-brown hover:bg-brand-cream hover:text-brand-orange rounded-md text-base font-medium">Lokasi</a>
          </div>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  
  isOpen = signal(false);

  toggleMenu() {
    this.isOpen.update(v => !v);
  }
  
  closeMenu() {
    this.isOpen.set(false);
  }

  isVideo(url: string) {
    return this.configService.isVideo(url);
  }
}
