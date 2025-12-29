
import { Component, inject } from '@angular/core';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-brand-brown text-brand-cream py-8 border-t border-white/10">
      <div class="max-w-6xl mx-auto px-4 text-center">
        <h3 class="font-serif font-bold text-xl mb-4 text-white">{{ config().branding.logoText }}</h3>
        
        <div class="flex justify-center gap-6 mb-6 text-sm font-medium">
           <a href="https://www.instagram.com/satemaranggihjmayacimahi/" target="_blank" class="hover:text-brand-orange transition">Instagram</a>
           <span class="opacity-30">|</span>
           <span class="hover:text-brand-orange transition cursor-default">Facebook</span>
           <span class="opacity-30">|</span>
           <span class="hover:text-brand-orange transition cursor-default">TikTok</span>
        </div>

        <div class="text-xs opacity-50">
          &copy; {{ year }} {{ config().branding.logoText }}. All Rights Reserved.
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  year = new Date().getFullYear();
}
