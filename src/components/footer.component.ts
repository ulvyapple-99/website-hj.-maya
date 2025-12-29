
import { Component, inject } from '@angular/core';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="py-8 border-t transition-colors duration-500"
      [style.backgroundColor]="config().footer.style.backgroundColor"
      [style.color]="config().footer.style.textColor"
      [style.borderColor]="config().footer.style.textColor + '20'"
      [style.fontFamily]="config().footer.style.fontFamily"
    >
      <div class="max-w-6xl mx-auto px-4 text-center">
        <h3 class="font-bold text-xl mb-4">{{ config().global.logoText }}</h3>
        
        <div class="flex justify-center gap-6 mb-6 text-sm font-medium">
           @if (config().footer.instagramLink) {
             <a [href]="config().footer.instagramLink" target="_blank" class="hover:opacity-80 transition" [style.color]="config().footer.style.accentColor">Instagram</a>
           }
           @if (config().footer.facebookLink) {
             <span class="opacity-30">|</span>
             <a [href]="config().footer.facebookLink" target="_blank" class="hover:opacity-80 transition" [style.color]="config().footer.style.accentColor">Facebook</a>
           }
           @if (config().footer.tiktokLink) {
             <span class="opacity-30">|</span>
             <a [href]="config().footer.tiktokLink" target="_blank" class="hover:opacity-80 transition" [style.color]="config().footer.style.accentColor">TikTok</a>
           }
        </div>

        <div class="text-xs opacity-50">
          &copy; {{ year }} {{ config().global.logoText }}. All Rights Reserved.
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
