
import { Component, inject, signal, effect, CUSTOM_ELEMENTS_SCHEMA, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem, Branch, Testimonial, FirebaseConfig, PackageItem } from '../services/config.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <!-- Floating Admin Button -->
    <button 
      (click)="togglePanel()"
      class="fixed bottom-6 left-6 z-50 bg-gray-900 text-white p-3 rounded-full shadow-none hover:shadow-2xl opacity-10 hover:opacity-100 transition-all duration-500 hover:scale-110 border border-transparent hover:border-gray-500 group"
      title="Admin Panel"
    >
      @if (firestoreError()) {
        <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-gray-900 animate-ping"></span>
        <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-gray-900"></span>
      }
      <div class="absolute inset-0 rounded-full border border-white/20"></div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Upload Indicator -->
    @if (isUploading()) {
      <div class="fixed inset-0 z-[100] bg-black/80 backdrop-blur flex items-center justify-center flex-col text-white">
         <div class="w-16 h-16 border-4 border-t-brand-orange border-gray-600 rounded-full animate-spin mb-4"></div>
         <p class="font-bold tracking-widest uppercase">Mengunggah...</p>
      </div>
    }

    <!-- Panel Content -->
    @if (isOpen()) {
      <div class="fixed inset-0 z-[60] flex justify-end cursor-auto font-sans">
        <div (click)="togglePanel()" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
        
        <div class="relative w-full max-w-6xl bg-gray-50 h-full shadow-2xl flex flex-col animate-slide-in border-l border-gray-200">
          
          <!-- Top Bar -->
          <div class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
             <div class="flex items-center gap-4">
                <h2 class="text-xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h2>
                <div class="flex items-center gap-2 text-xs font-medium">
                  @if(firestoreError()) { 
                    <span class="text-red-600 bg-red-100 px-2 py-0.5 rounded">⚠ Offline</span> 
                  } @else { 
                    <span class="text-green-600 flex items-center gap-1"><span class="w-2 h-2 bg-green-500 rounded-full"></span> Online</span> 
                  }
                </div>
             </div>
             
             <div class="flex items-center gap-3">
                @if (isAuthenticated()) {
                  <button (click)="saveChanges()" class="bg-gray-900 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Simpan Perubahan
                  </button>
                  <button (click)="logout()" class="text-xs text-red-600 hover:text-red-800 font-bold px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 transition">Log Out</button>
                }
                <button (click)="togglePanel()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500">✕</button>
             </div>
          </div>

          <div class="flex-1 flex overflow-hidden">
            @if (!isAuthenticated()) {
               <div class="w-full flex flex-col items-center justify-center p-10 space-y-6">
                 <div class="w-16 h-16 bg-white rounded-2xl shadow flex items-center justify-center text-3xl">🔐</div>
                 <h2 class="text-2xl font-bold text-gray-800">Login Administrator</h2>
                 <div class="w-full max-w-sm space-y-4">
                    <input type="email" [(ngModel)]="emailInput" placeholder="Email Admin" class="input">
                    
                    <div class="relative">
                      <input 
                        [type]="showPassword() ? 'text' : 'password'" 
                        [(ngModel)]="passwordInput" 
                        placeholder="Password" 
                        class="input pr-10"
                      >
                      <button 
                        type="button" 
                        (click)="togglePassword()"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        title="Tampilkan Password"
                      >
                        @if (showPassword()) {
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        } @else {
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        }
                      </button>
                    </div>

                    <button (click)="login()" [disabled]="isLoggingIn()" class="w-full bg-blue-600 text-white p-3 rounded-lg font-bold shadow hover:bg-blue-700 transition disabled:opacity-50">
                      {{ isLoggingIn() ? 'Memproses...' : 'Masuk Dashboard' }}
                    </button>
                    <p class="text-red-500 text-xs font-bold text-center" *ngIf="loginError()">{{ loginError() }}</p>
                    <div class="mt-4 text-[10px] text-gray-400 text-center">
                       Sistem Terproteksi. IP Anda tercatat.
                    </div>
                 </div>
               </div>
            } @else {
               <!-- Sidebar Navigation -->
               <div class="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 flex flex-col">
                  <nav class="p-4 space-y-1">
                     <button *ngFor="let tab of tabs" (click)="currentTab.set(tab.id)"
                       class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                       [class.bg-gray-100]="currentTab() === tab.id"
                       [class.text-gray-900]="currentTab() === tab.id"
                       [class.text-gray-600]="currentTab() !== tab.id"
                       [class.hover:bg-gray-50]="currentTab() !== tab.id">
                        <span>{{ tab.icon }}</span>
                        {{ tab.label }}
                     </button>
                  </nav>

                  <!-- Quick Visibility Toggles -->
                  <div class="p-4 border-t mt-auto">
                     <h4 class="text-xs font-bold text-gray-500 uppercase mb-3">Visibility Control</h4>
                     <div class="space-y-2">
                        <label class="flex items-center justify-between text-sm">
                           <span>Hero</span>
                           <input type="checkbox" [(ngModel)]="config().features.showHero">
                        </label>
                        <label class="flex items-center justify-between text-sm">
                           <span>About</span>
                           <input type="checkbox" [(ngModel)]="config().features.showAbout">
                        </label>
                        <label class="flex items-center justify-between text-sm">
                           <span>Menu</span>
                           <input type="checkbox" [(ngModel)]="config().features.showMenu">
                        </label>
                         <label class="flex items-center justify-between text-sm">
                           <span>Paket</span>
                           <input type="checkbox" [(ngModel)]="config().features.showPackages">
                        </label>
                        <label class="flex items-center justify-between text-sm">
                           <span>Reservation</span>
                           <input type="checkbox" [(ngModel)]="config().features.showReservation">
                        </label>
                        <label class="flex items-center justify-between text-sm">
                           <span>Instagram Feed</span>
                           <input type="checkbox" [(ngModel)]="config().features.showGallery">
                        </label>
                     </div>
                  </div>
               </div>

               <!-- Main Content Area -->
               <div class="flex-1 overflow-y-auto p-8 bg-gray-50">
                  
                  <!-- TAB: GLOBAL -->
                  @if (currentTab() === 'global') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Identitas Website & SEO</h3>
                           <div class="grid grid-cols-2 gap-4">
                              <div>
                                 <label class="label">Nama Website / Logo Text</label>
                                 <input type="text" [(ngModel)]="config().global.logoText" class="input">
                                 <!-- Text Style Controls -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().global.logoStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().global.logoStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().global.logoStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div>
                                 <label class="label">Meta Description (SEO)</label>
                                 <textarea [(ngModel)]="config().global.metaDescription" class="input h-10" placeholder="Deskripsi untuk Google..."></textarea>
                                 <!-- Text Style Controls -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().global.metaStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().global.metaStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().global.metaStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div>
                                 <label class="label">Logo Image</label>
                                 <div class="flex gap-2">
                                    <input type="file" (change)="onFileSelected($event, 'logo')" class="input text-xs">
                                    <button *ngIf="config().global.logoImage" (click)="config().global.logoImage=''" class="text-red-500 text-xs font-bold">Hapus</button>
                                 </div>
                              </div>
                              <div>
                                 <label class="label">Favicon (Icon Browser)</label>
                                 <input type="file" (change)="onFileSelected($event, 'favicon')" class="input text-xs">
                                 <img *ngIf="config().global.favicon" [src]="config().global.favicon" class="h-6 w-6 mt-1">
                              </div>
                              <div>
                                 <label class="label">Google Analytics ID</label>
                                 <input type="text" [(ngModel)]="config().global.analyticsId" class="input" placeholder="G-XXXXXXXXXX">
                              </div>
                              <div class="flex items-center gap-2 mt-4">
                                <input type="checkbox" [(ngModel)]="config().features.enableCursor">
                                <label class="label mb-0 cursor-pointer">Aktifkan Custom Cursor (Aksesibilitas)</label>
                              </div>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Navbar Style & Dimensions</h3>
                           <div class="grid grid-cols-2 gap-4">
                              <div><label class="label">Warna Background</label><input type="color" [(ngModel)]="config().global.navbarColor" class="w-full h-10"></div>
                              <div><label class="label">Warna Teks</label><input type="color" [(ngModel)]="config().global.navbarTextColor" class="w-full h-10"></div>
                              <div><label class="label">Tinggi Navbar</label><input type="text" [(ngModel)]="config().global.navHeight" class="input" placeholder="80px"></div>
                              <div><label class="label">Tinggi Logo</label><input type="text" [(ngModel)]="config().global.navLogoHeight" class="input" placeholder="40px"></div>
                              <div><label class="label">Ukuran Font Link</label><input type="text" [(ngModel)]="config().global.navLinkFontSize" class="input" placeholder="16px"></div>
                              <div><label class="label">Jarak Antar Link</label><input type="text" [(ngModel)]="config().global.navLinkGap" class="input" placeholder="32px"></div>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Intro Screen (Loading)</h3>
                           <div class="flex items-center gap-2 mb-4">
                              <input type="checkbox" [(ngModel)]="config().intro.enabled" class="w-4 h-4">
                              <span class="font-bold text-sm">Aktifkan Video Intro</span>
                           </div>
                           @if (config().intro.enabled) {
                              <div class="grid grid-cols-2 gap-4">
                                 <div><label class="label">Video URL</label><input type="text" [(ngModel)]="config().intro.videoUrl" class="input"></div>
                                 <div><label class="label">Upload Video</label><input type="file" (change)="onFileSelected($event, 'introVideo')" class="input text-xs"></div>
                                 <div><label class="label">Durasi (Detik)</label><input type="number" [(ngModel)]="config().intro.duration" class="input"></div>
                                 <div>
                                    <label class="label">Efek Keluar</label>
                                    <select [(ngModel)]="config().intro.fadeOut" class="input bg-white">
                                       <option value="fade">Fade Out</option>
                                       <option value="slide-up">Slide Up</option>
                                       <option value="slide-down">Slide Down</option>
                                       <option value="zoom-out">Zoom Out</option>
                                       <option value="none">None</option>
                                    </select>
                                 </div>
                              </div>
                           }
                        </div>
                     </div>
                  }

                  <!-- TAB: HERO -->
                  @if (currentTab() === 'hero') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Konten Utama</h3>
                           <div class="space-y-4">
                              <div>
                                 <label class="label">Teks Badge (Atas)</label>
                                 <input type="text" [(ngModel)]="config().hero.badgeText" class="input">
                                 <!-- Badge Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().hero.badgeStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().hero.badgeStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().hero.badgeStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div>
                                 <label class="label">Judul Besar (Headline)</label>
                                 <input type="text" [(ngModel)]="config().hero.title" class="input text-lg font-bold">
                                 <!-- Title Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().hero.titleStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().hero.titleStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().hero.titleStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div>
                                 <label class="label">Teks Highlight (Warna Beda)</label>
                                 <input type="text" [(ngModel)]="config().hero.highlight" class="input text-orange-600 font-bold">
                                 <!-- Highlight Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().hero.highlightStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().hero.highlightStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().hero.highlightStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div>
                                 <label class="label">Sub Judul</label>
                                 <textarea [(ngModel)]="config().hero.subtitle" class="input h-20"></textarea>
                                 <!-- Subtitle Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().hero.subtitleStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().hero.subtitleStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().hero.subtitleStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div class="grid grid-cols-2 gap-4">
                                 <div>
                                    <label class="label">Teks Tombol 1</label>
                                    <input type="text" [(ngModel)]="config().hero.buttonText1" class="input">
                                    <!-- Button 1 Style -->
                                    <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                      <select [(ngModel)]="config().hero.button1Style.fontFamily" class="input text-xs w-20 bg-white py-1">
                                         @for (f of fontList; track f) {
                                            <option [value]="f">{{ f }}</option>
                                         }
                                      </select>
                                      <input type="text" [(ngModel)]="config().hero.button1Style.fontSize" class="input text-xs w-16 py-1" placeholder="Size">
                                      <input type="color" [(ngModel)]="config().hero.button1Style.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                    </div>
                                 </div>
                                 <div>
                                    <label class="label">Teks Tombol 2</label>
                                    <input type="text" [(ngModel)]="config().hero.buttonText2" class="input">
                                    <!-- Button 2 Style -->
                                    <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                      <select [(ngModel)]="config().hero.button2Style.fontFamily" class="input text-xs w-20 bg-white py-1">
                                         @for (f of fontList; track f) {
                                            <option [value]="f">{{ f }}</option>
                                         }
                                      </select>
                                      <input type="text" [(ngModel)]="config().hero.button2Style.fontSize" class="input text-xs w-16 py-1" placeholder="Size">
                                      <input type="color" [(ngModel)]="config().hero.button2Style.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                        
                        <div class="section-box">
                           <h3 class="section-title">Background & Style</h3>
                           <div class="mb-4">
                              <label class="label">Background Image / Video</label>
                              <input type="file" (change)="onFileSelected($event, 'heroBg')" class="input text-xs mb-2">
                              <input type="text" [(ngModel)]="config().hero.bgImage" class="input text-xs text-gray-400" placeholder="URL Gambar">
                           </div>
                           <div class="mb-4">
                              <label class="label flex justify-between">
                                <span>Overlay Opacity (Gelap/Terang)</span>
                                <span>{{ config().hero.overlayOpacity | percent }}</span>
                              </label>
                              <input type="range" min="0" max="1" step="0.1" [(ngModel)]="config().hero.overlayOpacity" class="w-full">
                           </div>
                           <div class="grid grid-cols-2 gap-4">
                              <div><label class="label">Background Color (Fallback)</label><input type="color" [(ngModel)]="config().hero.style.backgroundColor" class="w-full h-10"></div>
                              <div><label class="label">Text Color</label><input type="color" [(ngModel)]="config().hero.style.textColor" class="w-full h-10"></div>
                              <div><label class="label">Accent Color (Tombol/Highlight)</label><input type="color" [(ngModel)]="config().hero.style.accentColor" class="w-full h-10"></div>
                              <div>
                                 <label class="label">Font Family</label>
                                 <select [(ngModel)]="config().hero.style.fontFamily" class="input bg-white">
                                    @for (f of fontList; track f) {
                                       <option [value]="f">{{ f }}</option>
                                    }
                                 </select>
                              </div>
                           </div>
                           
                           <h4 class="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">Detail Ukuran</h4>
                           <div class="grid grid-cols-3 gap-4">
                             <div><label class="label">Ukuran Judul</label><input type="text" [(ngModel)]="config().hero.style.titleFontSize" class="input" placeholder="4.5rem"></div>
                             <div><label class="label">Ukuran Subjudul</label><input type="text" [(ngModel)]="config().hero.style.subtitleFontSize" class="input" placeholder="1.25rem"></div>
                             <div><label class="label">Radius Tombol</label><input type="text" [(ngModel)]="config().hero.style.buttonRadius" class="input" placeholder="50px"></div>
                             <div><label class="label">Padding X Tombol</label><input type="text" [(ngModel)]="config().hero.style.buttonPaddingX" class="input" placeholder="40px"></div>
                             <div><label class="label">Padding Y Tombol</label><input type="text" [(ngModel)]="config().hero.style.buttonPaddingY" class="input" placeholder="16px"></div>
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: ABOUT -->
                  @if (currentTab() === 'about') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Konten About</h3>
                           <div class="space-y-3">
                              <div>
                                <label class="label">Judul</label>
                                <input type="text" [(ngModel)]="config().about.title" class="input font-bold">
                                <!-- Title Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().about.titleStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().about.titleStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().about.titleStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div>
                                <label class="label">Deskripsi Lengkap</label>
                                <textarea [(ngModel)]="config().about.description" class="input h-32"></textarea>
                                <!-- Description Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().about.descriptionStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().about.descriptionStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().about.descriptionStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div><label class="label">Gambar / Video</label><input type="file" (change)="onFileSelected($event, 'aboutImage')" class="input text-xs"></div>
                              <div>
                                <label class="label">Posisi Gambar</label>
                                <select [(ngModel)]="config().about.imagePosition" class="input bg-white">
                                  <option value="left">Kiri (Teks Kanan)</option>
                                  <option value="right">Kanan (Teks Kiri)</option>
                                </select>
                              </div>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Style & Ukuran</h3>
                           <div class="grid grid-cols-2 gap-4">
                              <div><label class="label">Background Color</label><input type="color" [(ngModel)]="config().about.style.backgroundColor" class="w-full h-10"></div>
                              <div><label class="label">Text Color</label><input type="color" [(ngModel)]="config().about.style.textColor" class="w-full h-10"></div>
                              <div><label class="label">Accent Color</label><input type="color" [(ngModel)]="config().about.style.accentColor" class="w-full h-10"></div>
                              <div><label class="label">Font Family</label><select [(ngModel)]="config().about.style.fontFamily" class="input bg-white">
                                 @for (f of fontList; track f) {
                                    <option [value]="f">{{ f }}</option>
                                 }
                              </select></div>
                           </div>
                           <div class="grid grid-cols-3 gap-4 mt-4">
                              <div><label class="label">Ukuran Judul</label><input type="text" [(ngModel)]="config().about.style.titleFontSize" class="input" placeholder="3rem"></div>
                              <div><label class="label">Ukuran Deskripsi</label><input type="text" [(ngModel)]="config().about.style.bodyFontSize" class="input" placeholder="1.125rem"></div>
                              <div><label class="label">Radius Gambar</label><input type="text" [(ngModel)]="config().about.style.borderRadius" class="input" placeholder="16px"></div>
                              <div><label class="label">Padding Section Y</label><input type="text" [(ngModel)]="config().about.style.sectionPaddingY" class="input" placeholder="80px"></div>
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: MENU -->
                  @if (currentTab() === 'menu') {
                     <div class="space-y-6 h-full flex flex-col">
                        <div class="section-box">
                           <h3 class="section-title">Konfigurasi Tampilan Menu</h3>
                           <div class="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label class="label">Judul</label>
                                <input type="text" [(ngModel)]="config().menuPage.title" class="input">
                                <!-- Title Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().menuPage.titleStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().menuPage.titleStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().menuPage.titleStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div>
                                <label class="label">Sub Judul</label>
                                <input type="text" [(ngModel)]="config().menuPage.subtitle" class="input">
                                <!-- Subtitle Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().menuPage.subtitleStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().menuPage.subtitleStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().menuPage.subtitleStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                           </div>
                           <div class="grid grid-cols-4 gap-2">
                              <div><label class="label">BG Color</label><input type="color" [(ngModel)]="config().menuPage.style.backgroundColor" class="w-full h-8"></div>
                              <div><label class="label">Text Color</label><input type="color" [(ngModel)]="config().menuPage.style.textColor" class="w-full h-8"></div>
                              <div><label class="label">Accent Color</label><input type="color" [(ngModel)]="config().menuPage.style.accentColor" class="w-full h-8"></div>
                              <div><label class="label">Font</label><select [(ngModel)]="config().menuPage.style.fontFamily" class="input h-8 text-xs">
                                 @for (f of fontList; track f) {
                                    <option [value]="f">{{ f }}</option>
                                 }
                              </select></div>
                           </div>
                           
                           <h4 class="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">Detail Ukuran Card</h4>
                           <div class="grid grid-cols-3 gap-4">
                              <div><label class="label">Ukuran Judul Item</label><input type="text" [(ngModel)]="config().menuPage.itemTitleSize" class="input" placeholder="1.125rem"></div>
                              <div><label class="label">Ukuran Harga</label><input type="text" [(ngModel)]="config().menuPage.itemPriceSize" class="input" placeholder="0.875rem"></div>
                              <div><label class="label">Radius Card</label><input type="text" [(ngModel)]="config().menuPage.cardBorderRadius" class="input" placeholder="12px"></div>
                              <div><label class="label">Grid Gap</label><input type="text" [(ngModel)]="config().menuPage.gridGap" class="input" placeholder="24px"></div>
                              <div><label class="label">Ukuran Judul Hal</label><input type="text" [(ngModel)]="config().menuPage.style.titleFontSize" class="input" placeholder="3rem"></div>
                           </div>
                        </div>

                        <div class="flex-1 flex flex-col bg-white rounded-xl shadow border overflow-hidden">
                           <!-- Branch Tabs -->
                           <div class="flex border-b bg-gray-50 overflow-x-auto">
                              @for (branch of config().branches; track $index) {
                                 <button (click)="selectedBranchIndex.set($index)" 
                                    class="px-6 py-3 text-sm font-bold border-r hover:bg-white transition"
                                    [class.bg-white]="selectedBranchIndex() === $index"
                                    [class.text-blue-600]="selectedBranchIndex() === $index">
                                    {{ branch.name }}
                                 </button>
                              }
                           </div>
                           
                           <!-- Menu List -->
                           <div class="flex-1 overflow-y-auto p-4 space-y-3">
                              <div class="flex justify-between items-center mb-2">
                                 <h4 class="font-bold text-gray-500 text-xs uppercase">Daftar Item Menu</h4>
                                 <button (click)="addMenuItem()" class="bg-green-600 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-green-700">+ Tambah Item</button>
                              </div>
                              
                              @for (item of config().branches[selectedBranchIndex()].menu; track $index) {
                                 <div class="flex flex-col md:flex-row gap-4 p-3 border rounded-lg bg-gray-50 group hover:border-blue-300 transition items-start">
                                    <div class="w-20 h-20 bg-gray-200 rounded relative flex-shrink-0 cursor-pointer overflow-hidden">
                                       <img [src]="item.image" class="w-full h-full object-cover">
                                       <input type="file" (change)="onFileSelected($event, 'menuItem', $index)" class="absolute inset-0 opacity-0" title="Ubah Foto">
                                       @if(item.soldOut) {
                                         <div class="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">HABIS</div>
                                       }
                                    </div>
                                    <div class="flex-1 grid gap-2 w-full">
                                       <div class="flex gap-2">
                                          <input type="text" [(ngModel)]="item.name" class="input font-bold" placeholder="Nama">
                                          <input type="text" [(ngModel)]="item.price" class="input w-24 text-right" placeholder="Harga">
                                       </div>
                                       <div class="flex flex-wrap gap-2 items-center">
                                          <input type="text" [(ngModel)]="item.category" class="input text-xs w-24" placeholder="Kategori">
                                          
                                          <label class="flex items-center gap-1 cursor-pointer select-none bg-yellow-100 px-2 py-1 rounded">
                                             <input type="checkbox" [(ngModel)]="item.favorite">
                                             <span class="text-xs font-bold text-yellow-800">Favorite</span>
                                          </label>

                                          <label class="flex items-center gap-1 cursor-pointer select-none bg-red-100 px-2 py-1 rounded">
                                             <input type="checkbox" [(ngModel)]="item.soldOut">
                                             <span class="text-xs font-bold text-red-800">Habis (Sold Out)</span>
                                          </label>
                                          
                                          <select [(ngModel)]="item.spicyLevel" class="input text-xs w-20 py-1">
                                            <option [value]="0">Normal</option>
                                            <option [value]="1">Pedas 1</option>
                                            <option [value]="2">Pedas 2</option>
                                            <option [value]="3">Pedas 3</option>
                                          </select>
                                       </div>
                                       <textarea [(ngModel)]="item.desc" class="input text-xs h-10 resize-none" placeholder="Deskripsi"></textarea>
                                    </div>
                                    <button (click)="removeMenuItem($index)" class="self-start text-gray-300 hover:text-red-500 p-1">✕</button>
                                 </div>
                              }
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: PACKAGES -->
                  @if (currentTab() === 'packages') {
                     <div class="space-y-6 h-full flex flex-col">
                        <!-- Style Config -->
                        <div class="section-box">
                           <h3 class="section-title">Konfigurasi Halaman Paket</h3>
                           <div class="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label class="label">Judul Halaman</label>
                                <input type="text" [(ngModel)]="config().packagesPage.title" class="input">
                                <!-- Title Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().packagesPage.titleStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().packagesPage.titleStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().packagesPage.titleStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div>
                                <label class="label">Sub Judul</label>
                                <input type="text" [(ngModel)]="config().packagesPage.subtitle" class="input">
                                <!-- Subtitle Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().packagesPage.subtitleStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().packagesPage.subtitleStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().packagesPage.subtitleStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                           </div>
                           <div class="grid grid-cols-4 gap-2">
                              <div><label class="label">BG Color</label><input type="color" [(ngModel)]="config().packagesPage.style.backgroundColor" class="w-full h-8"></div>
                              <div><label class="label">Text Color</label><input type="color" [(ngModel)]="config().packagesPage.style.textColor" class="w-full h-8"></div>
                              <div><label class="label">Accent Color</label><input type="color" [(ngModel)]="config().packagesPage.style.accentColor" class="w-full h-8"></div>
                           </div>
                        </div>

                        <!-- Content Management -->
                        <div class="flex-1 flex flex-col bg-white rounded-xl shadow border overflow-hidden">
                           <!-- Branch Tabs -->
                           <div class="flex border-b bg-gray-50 overflow-x-auto">
                              @for (branch of config().branches; track $index) {
                                 <button (click)="selectedBranchIndex.set($index)" 
                                    class="px-6 py-3 text-sm font-bold border-r hover:bg-white transition"
                                    [class.bg-white]="selectedBranchIndex() === $index"
                                    [class.text-blue-600]="selectedBranchIndex() === $index">
                                    {{ branch.name }}
                                 </button>
                              }
                           </div>
                           
                           <!-- Package List -->
                           <div class="flex-1 overflow-y-auto p-4 space-y-4">
                              <div class="flex justify-between items-center mb-2">
                                 <h4 class="font-bold text-gray-500 text-xs uppercase">Daftar Paket {{ config().branches[selectedBranchIndex()].name }}</h4>
                                 <button (click)="addPackage()" class="bg-green-600 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-green-700">+ Tambah Paket</button>
                              </div>
                              
                              @if (!config().branches[selectedBranchIndex()].packages?.length) {
                                 <p class="text-center text-gray-400 py-10 text-sm">Belum ada paket di cabang ini.</p>
                              }

                              @for (pkg of config().branches[selectedBranchIndex()].packages; track $index) {
                                 <div class="border rounded-lg p-4 bg-gray-50 relative group">
                                    <button (click)="removePackage($index)" class="absolute top-2 right-2 z-20 bg-white/80 hover:bg-red-100 text-gray-500 hover:text-red-600 p-1.5 rounded-full shadow-sm transition-all" title="Hapus Paket">
                                       <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                    
                                    <div class="grid md:grid-cols-[120px_1fr] gap-4">
                                       <!-- Image -->
                                       <div class="w-full h-32 bg-gray-200 rounded overflow-hidden relative cursor-pointer">
                                          <img [src]="pkg.image || 'https://picsum.photos/200'" class="w-full h-full object-cover">
                                          <input type="file" (change)="onFileSelected($event, 'packageItem', $index)" class="absolute inset-0 opacity-0" title="Ubah Foto">
                                       </div>

                                       <!-- Details -->
                                       <div class="space-y-2">
                                          <div class="flex gap-2">
                                             <input type="text" [(ngModel)]="pkg.name" class="input font-bold" placeholder="Nama Paket">
                                             <input type="text" [(ngModel)]="pkg.price" class="input w-32 text-right" placeholder="Harga">
                                          </div>
                                          <input type="text" [(ngModel)]="pkg.description" class="input text-xs" placeholder="Deskripsi Singkat">
                                          
                                          <!-- Items List Logic -->
                                          <div>
                                             <label class="label">Isi Paket (Pisahkan dengan Enter atau Koma)</label>
                                             <textarea 
                                                [ngModel]="pkg.items.join(', ')" 
                                                (ngModelChange)="updatePackageItems(pkg, $event)"
                                                class="input text-xs h-16" 
                                                placeholder="Contoh: Nasi, Ayam, Tahu, Tempe"></textarea>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              }
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: RESERVATION -->
                  @if (currentTab() === 'reservation') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Halaman Reservasi</h3>
                           <div class="space-y-3">
                              <div>
                                 <label class="label">Judul</label>
                                 <input type="text" [(ngModel)]="config().reservation.title" class="input">
                                 <!-- Title Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().reservation.titleStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().reservation.titleStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().reservation.titleStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div>
                                 <label class="label">Sub Judul</label>
                                 <input type="text" [(ngModel)]="config().reservation.subtitle" class="input">
                                 <!-- Subtitle Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().reservation.subtitleStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().reservation.subtitleStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().reservation.subtitleStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Logika & WhatsApp</h3>
                           <div class="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                 <label class="label">Min. Pax (Reguler)</label>
                                 <input type="number" [(ngModel)]="config().reservation.minPaxRegular" class="input font-bold text-lg">
                              </div>
                              <div>
                                 <label class="label">Min. Pax (Puasa)</label>
                                 <input type="number" [(ngModel)]="config().reservation.minPaxRamadan" class="input font-bold text-lg">
                              </div>
                           </div>
                           <div>
                              <label class="label">Template Pesan WhatsApp</label>
                              <textarea [(ngModel)]="config().reservation.whatsappTemplate" class="input h-20 font-mono text-xs"></textarea>
                              <p class="text-xs text-gray-400 mt-1">Gunakan tag: &#123;name&#125;, &#123;pax&#125;, &#123;date&#125;, &#123;time&#125;</p>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Style & Ukuran</h3>
                           <div class="grid grid-cols-2 gap-4">
                              <div><label class="label">Background Color</label><input type="color" [(ngModel)]="config().reservation.style.backgroundColor" class="w-full h-10"></div>
                              <div><label class="label">Text Color</label><input type="color" [(ngModel)]="config().reservation.style.textColor" class="w-full h-10"></div>
                              <div><label class="label">Accent Color</label><input type="color" [(ngModel)]="config().reservation.style.accentColor" class="w-full h-10"></div>
                           </div>
                           <div class="grid grid-cols-3 gap-4 mt-4">
                              <div><label class="label">Tinggi Input</label><input type="text" [(ngModel)]="config().reservation.inputHeight" class="input" placeholder="42px"></div>
                              <div><label class="label">Radius Input</label><input type="text" [(ngModel)]="config().reservation.inputBorderRadius" class="input" placeholder="8px"></div>
                              <div><label class="label">Tinggi Tombol</label><input type="text" [(ngModel)]="config().reservation.buttonHeight" class="input" placeholder="48px"></div>
                              <div><label class="label">Radius Card</label><input type="text" [(ngModel)]="config().reservation.cardBorderRadius" class="input" placeholder="16px"></div>
                              <div><label class="label">Padding Section</label><input type="text" [(ngModel)]="config().reservation.style.sectionPaddingY" class="input" placeholder="40px"></div>
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: LOCATION -->
                  @if (currentTab() === 'location') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Halaman Lokasi</h3>
                           <div class="space-y-3">
                              <div>
                                 <label class="label">Judul</label>
                                 <input type="text" [(ngModel)]="config().locationPage.title" class="input">
                                 <!-- Title Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().locationPage.titleStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().locationPage.titleStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().locationPage.titleStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div>
                                 <label class="label">Sub Judul</label>
                                 <input type="text" [(ngModel)]="config().locationPage.subtitle" class="input">
                                 <!-- Subtitle Style -->
                                 <div class="flex gap-2 mt-2 bg-gray-100 p-2 rounded">
                                    <select [(ngModel)]="config().locationPage.subtitleStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                       @for (f of fontList; track f) {
                                          <option [value]="f">{{ f }}</option>
                                       }
                                    </select>
                                    <input type="text" [(ngModel)]="config().locationPage.subtitleStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().locationPage.subtitleStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                           </div>
                           <div class="grid grid-cols-4 gap-2 mt-4">
                              <div><label class="label">BG Color</label><input type="color" [(ngModel)]="config().locationPage.style.backgroundColor" class="w-full h-8"></div>
                              <div><label class="label">Text Color</label><input type="color" [(ngModel)]="config().locationPage.style.textColor" class="w-full h-8"></div>
                              <div><label class="label">Accent Color</label><input type="color" [(ngModel)]="config().locationPage.style.accentColor" class="w-full h-8"></div>
                           </div>
                           <div class="grid grid-cols-3 gap-4 mt-4">
                              <div><label class="label">Radius Card</label><input type="text" [(ngModel)]="config().locationPage.cardBorderRadius" class="input" placeholder="16px"></div>
                              <div><label class="label">Tinggi Peta</label><input type="text" [(ngModel)]="config().locationPage.mapHeight" class="input" placeholder="200px"></div>
                              <div><label class="label">Padding Section</label><input type="text" [(ngModel)]="config().locationPage.style.sectionPaddingY" class="input" placeholder="80px"></div>
                           </div>
                        </div>

                        <div class="section-box">
                           <div class="flex justify-between items-center mb-4">
                              <h3 class="section-title mb-0">Daftar Cabang</h3>
                              <div class="flex gap-2">
                                 <button (click)="addBranch()" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">+ Cabang Baru</button>
                                 <button (click)="removeBranch()" class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold">Hapus</button>
                              </div>
                           </div>

                           <div class="flex gap-2 mb-4 overflow-x-auto">
                              @for (branch of config().branches; track $index) {
                                 <button (click)="selectedBranchIndex.set($index)" 
                                    class="px-4 py-2 border rounded text-sm font-bold"
                                    [class.bg-gray-800]="selectedBranchIndex() === $index"
                                    [class.text-white]="selectedBranchIndex() === $index">
                                    {{ branch.name }}
                                 </button>
                              }
                           </div>

                           <div class="space-y-4 border-t pt-4">
                              <div><label class="label">Nama Cabang</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].name" class="input font-bold"></div>
                              <div><label class="label">Alamat Lengkap</label><textarea [(ngModel)]="config().branches[selectedBranchIndex()].address" class="input h-20"></textarea></div>
                              <div class="grid grid-cols-2 gap-4">
                                 <div><label class="label">No. Telepon</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].phone" class="input"></div>
                                 <div><label class="label">WhatsApp</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].whatsappNumber" class="input font-mono"></div>
                              </div>
                              
                              <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                 <label class="label text-blue-800">Social Media Cabang (Opsional)</label>
                                 <div class="space-y-2">
                                   <div><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].instagramLink" class="input text-xs" placeholder="Link Instagram"></div>
                                   <div><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].facebookLink" class="input text-xs" placeholder="Link Facebook"></div>
                                   <div><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].tiktokLink" class="input text-xs" placeholder="Link TikTok"></div>
                                 </div>
                              </div>

                              <div><label class="label">Jam Operasional</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].hours" class="input"></div>
                              <div><label class="label">Google Maps URL</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].googleMapsUrl" class="input text-blue-600"></div>
                              <div>
                                 <label class="label">Gambar Peta / Model 3D</label>
                                 <input type="file" (change)="onFileSelected($event, 'branchMap')" class="input text-xs">
                                 <div class="h-32 bg-gray-100 mt-2 rounded overflow-hidden">
                                    <img [src]="config().branches[selectedBranchIndex()].mapImage" class="w-full h-full object-cover">
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: MEDIA (Instagram & Gallery) -->
                  @if (currentTab() === 'media') {
                     <div class="space-y-6 max-w-3xl">
                        
                        <!-- NEW: Toggle Visibility -->
                        <div class="section-box flex items-center justify-between">
                           <div>
                              <h3 class="section-title mb-0">Tampilkan Section Instagram</h3>
                              <p class="text-xs text-gray-500">Tampilkan profil Instagram palsu di halaman beranda</p>
                           </div>
                           <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer"
                                [class.bg-green-500]="config().features.showGallery"
                                [class.bg-gray-300]="!config().features.showGallery"
                                (click)="config().features.showGallery = !config().features.showGallery">
                                <span class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200"
                                      [class.translate-x-6]="config().features.showGallery"></span>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Profil Instagram (Tampilan Web)</h3>
                           <div class="flex items-start gap-4 mb-4">
                              <div class="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 relative group border border-gray-300">
                                 <img [src]="config().instagramProfile.profilePic || 'https://ui-avatars.com/api/?name=IG'" class="w-full h-full object-cover">
                                 <input type="file" (change)="onFileSelected($event, 'logo')" class="absolute inset-0 opacity-0 cursor-pointer" title="Ganti Foto Profil">
                              </div>
                              <div class="flex-1 space-y-2">
                                 <div><label class="label">Username</label><input type="text" [(ngModel)]="config().instagramProfile.username" class="input font-bold"></div>
                              </div>
                           </div>
                           
                           <div class="grid grid-cols-3 gap-4 mb-3">
                              <div><label class="label">Posts</label><input type="text" [(ngModel)]="config().instagramProfile.postsCount" class="input text-center"></div>
                              <div><label class="label">Followers</label><input type="text" [(ngModel)]="config().instagramProfile.followersCount" class="input text-center"></div>
                              <div><label class="label">Following</label><input type="text" [(ngModel)]="config().instagramProfile.followingCount" class="input text-center"></div>
                           </div>
                           
                           <div class="mt-2"><label class="label">Bio</label><textarea [(ngModel)]="config().instagramProfile.bio" class="input h-24 whitespace-pre-wrap"></textarea></div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Galeri Foto Feed</h3>
                           <div class="mb-4 bg-blue-50 p-3 rounded text-sm text-blue-800">
                              Upload foto-foto makanan atau suasana untuk ditampilkan di Grid Instagram.
                           </div>
                           <input type="file" (change)="onFileSelected($event, 'gallery')" class="mb-4">
                           <div class="grid grid-cols-4 gap-2">
                              @for (img of config().gallery; track $index) {
                                 <div class="relative aspect-square group">
                                    <img [src]="img" class="w-full h-full object-cover rounded shadow-sm border">
                                    <button (click)="removeGalleryImage($index)" class="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-700">✕</button>
                                 </div>
                              }
                           </div>
                        </div>

                        <div class="section-box">
                           <div class="flex justify-between items-center mb-4">
                              <h3 class="section-title mb-0">Testimoni Pelanggan</h3>
                              <button (click)="addTestimonial()" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">+ Baru</button>
                           </div>
                           
                           <!-- NEW: Style Controls for Testimonials -->
                           <div class="mb-6 grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded border">
                              <div>
                                 <label class="label">Font Review</label>
                                 <select [(ngModel)]="config().testimonialStyles.reviewStyle.fontFamily" class="input text-[10px] w-full py-1 h-6 mb-1">
                                    @for (f of fontList; track f) {
                                       <option [value]="f">{{ f }}</option>
                                    }
                                 </select>
                                 <div class="flex gap-1">
                                    <input type="text" [(ngModel)]="config().testimonialStyles.reviewStyle.fontSize" class="input text-[10px] w-12 py-1 h-6" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().testimonialStyles.reviewStyle.color" class="w-6 h-6 p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div>
                                 <label class="label">Font Nama</label>
                                 <select [(ngModel)]="config().testimonialStyles.nameStyle.fontFamily" class="input text-[10px] w-full py-1 h-6 mb-1">
                                    @for (f of fontList; track f) {
                                       <option [value]="f">{{ f }}</option>
                                    }
                                 </select>
                                 <div class="flex gap-1">
                                    <input type="text" [(ngModel)]="config().testimonialStyles.nameStyle.fontSize" class="input text-[10px] w-12 py-1 h-6" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().testimonialStyles.nameStyle.color" class="w-6 h-6 p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                              <div>
                                 <label class="label">Font Role</label>
                                 <select [(ngModel)]="config().testimonialStyles.roleStyle.fontFamily" class="input text-[10px] w-full py-1 h-6 mb-1">
                                    @for (f of fontList; track f) {
                                       <option [value]="f">{{ f }}</option>
                                    }
                                 </select>
                                 <div class="flex gap-1">
                                    <input type="text" [(ngModel)]="config().testimonialStyles.roleStyle.fontSize" class="input text-[10px] w-12 py-1 h-6" placeholder="Size">
                                    <input type="color" [(ngModel)]="config().testimonialStyles.roleStyle.color" class="w-6 h-6 p-0 border-none cursor-pointer">
                                 </div>
                              </div>
                           </div>

                           <div class="space-y-4">
                              @for (t of config().testimonials; track $index) {
                                 <div class="border p-3 rounded bg-gray-50 relative">
                                    <button (click)="removeTestimonial($index)" class="absolute top-2 right-2 text-red-500 font-bold">✕</button>
                                    <div class="grid grid-cols-2 gap-2 mb-2">
                                       <input type="text" [(ngModel)]="t.name" class="input font-bold" placeholder="Nama">
                                       <input type="text" [(ngModel)]="t.role" class="input text-xs" placeholder="Role">
                                    </div>
                                    <textarea [(ngModel)]="t.text" class="input text-sm h-16" placeholder="Isi Testimoni"></textarea>
                                    <div class="flex items-center gap-2 mt-2">
                                       <span class="text-xs font-bold">Rating:</span>
                                       <input type="number" [(ngModel)]="t.rating" class="input w-16" min="1" max="5">
                                    </div>
                                 </div>
                              }
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: FOOTER -->
                  @if (currentTab() === 'footer') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Konten Footer</h3>
                           <div class="space-y-3">
                              <div>
                                <label class="label">Brand Text</label>
                                <input type="text" [(ngModel)]="config().global.logoText" class="input" readonly title="Diambil dari Global Settings">
                                <!-- Brand Style -->
                                <div class="flex gap-2 mt-1 bg-gray-100 p-2 rounded">
                                   <select [(ngModel)]="config().footer.brandStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                      @for (f of fontList; track f) {
                                         <option [value]="f">{{ f }}</option>
                                      }
                                   </select>
                                   <input type="text" [(ngModel)]="config().footer.brandStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                   <input type="color" [(ngModel)]="config().footer.brandStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                </div>
                              </div>
                              
                              <div>
                                <label class="label">Deskripsi Singkat</label>
                                <textarea [(ngModel)]="config().footer.description" class="input h-24"></textarea>
                                <!-- Description Style -->
                                <div class="flex gap-2 mt-1 bg-gray-100 p-2 rounded">
                                   <select [(ngModel)]="config().footer.descriptionStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                      @for (f of fontList; track f) {
                                         <option [value]="f">{{ f }}</option>
                                      }
                                   </select>
                                   <input type="text" [(ngModel)]="config().footer.descriptionStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                   <input type="color" [(ngModel)]="config().footer.descriptionStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                </div>
                              </div>

                              <div>
                                <label class="label">Copyright Text</label>
                                <input type="text" [(ngModel)]="config().footer.copyrightText" class="input">
                                <!-- Copyright Style -->
                                <div class="flex gap-2 mt-1 bg-gray-100 p-2 rounded">
                                   <select [(ngModel)]="config().footer.copyrightStyle.fontFamily" class="input text-xs w-28 bg-white py-1">
                                      @for (f of fontList; track f) {
                                         <option [value]="f">{{ f }}</option>
                                      }
                                   </select>
                                   <input type="text" [(ngModel)]="config().footer.copyrightStyle.fontSize" class="input text-xs w-20 py-1" placeholder="Size">
                                   <input type="color" [(ngModel)]="config().footer.copyrightStyle.color" class="w-8 h-8 rounded p-0 border-none cursor-pointer">
                                </div>
                              </div>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Style & Ukuran</h3>
                           <div class="grid grid-cols-2 gap-4">
                              <div><label class="label">Background Color</label><input type="color" [(ngModel)]="config().footer.style.backgroundColor" class="w-full h-10"></div>
                              <div><label class="label">Text Color (Default)</label><input type="color" [(ngModel)]="config().footer.style.textColor" class="w-full h-10"></div>
                              <div><label class="label">Accent Color (Link)</label><input type="color" [(ngModel)]="config().footer.style.accentColor" class="w-full h-10"></div>
                           </div>
                           <div class="grid grid-cols-3 gap-4 mt-4">
                              <div><label class="label">Padding Section</label><input type="text" [(ngModel)]="config().footer.style.sectionPaddingY" class="input" placeholder="60px"></div>
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: AI -->
                  @if (currentTab() === 'ai') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box bg-purple-50 border-purple-100">
                           <h3 class="section-title text-purple-900">Konfigurasi AI Assistant</h3>
                           <div class="space-y-4">
                              <div>
                                 <label class="label">Instruksi Sistem (Prompt Utama)</label>
                                 <textarea [(ngModel)]="config().ai.systemInstruction" class="input h-64 font-mono text-sm" placeholder="Contoh: Anda adalah Maya, asisten restoran yang ramah..."></textarea>
                                 <p class="text-xs text-gray-500 mt-2">Instruksi ini menentukan kepribadian AI dan bagaimana ia menjawab pertanyaan pelanggan.</p>
                              </div>
                              <div>
                                 <label class="label">Pesan Pembuka</label>
                                 <input type="text" [(ngModel)]="config().ai.initialMessage" class="input">
                              </div>
                           </div>
                           
                           <h4 class="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">Tampilan Chatbot</h4>
                           <div class="grid grid-cols-2 gap-4">
                              <div><label class="label">Warna Tombol/Header</label><input type="color" [(ngModel)]="config().ai.buttonColor" class="w-full h-10"></div>
                              <div><label class="label">Ukuran Tombol</label><input type="text" [(ngModel)]="config().ai.buttonSize" class="input" placeholder="56px"></div>
                              <div><label class="label">Lebar Jendela</label><input type="text" [(ngModel)]="config().ai.windowWidth" class="input" placeholder="340px"></div>
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: DATABASE (SECURE) -->
                  @if (currentTab() === 'database') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="bg-red-50 p-8 rounded-xl border border-red-200 shadow-sm">
                           <h3 class="text-xl font-bold mb-6 text-red-900">⚠ Konfigurasi Database (Banking Level Security)</h3>
                           <p class="text-sm text-red-800 mb-4">Area ini hanya untuk Super Admin. Mengubah ini akan memutus koneksi aplikasi.</p>
                           <div class="space-y-4">
                              <div><label class="label">API Key</label><input type="password" [(ngModel)]="tempConfig.apiKey" class="input bg-white font-mono"></div>
                              <div><label class="label">Auth Domain</label><input type="text" [(ngModel)]="tempConfig.authDomain" class="input bg-white font-mono"></div>
                              <div><label class="label">Project ID</label><input type="text" [(ngModel)]="tempConfig.projectId" class="input bg-white font-mono font-bold text-blue-600"></div>
                              <div><label class="label">Storage Bucket</label><input type="text" [(ngModel)]="tempConfig.storageBucket" class="input bg-white font-mono"></div>
                              <div><label class="label">Messaging Sender ID</label><input type="text" [(ngModel)]="tempConfig.messagingSenderId" class="input bg-white font-mono"></div>
                              <div><label class="label">App ID</label><input type="text" [(ngModel)]="tempConfig.appId" class="input bg-white font-mono"></div>
                           </div>
                           <div class="flex gap-4 pt-6 mt-6 border-t border-red-200">
                              <button (click)="saveFirebaseSetup()" class="bg-red-600 text-white font-bold py-2 px-6 rounded shadow hover:bg-red-700">Simpan Konfigurasi Kritis</button>
                           </div>
                        </div>
                     </div>
                  }

               </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .label { display: block; font-size: 0.7rem; font-weight: 800; color: #6b7280; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.6rem; font-size: 0.9rem; transition: all 0.2s; }
    .input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .section-box { background: white; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #e5e7eb; margin-bottom: 1.5rem; }
    .section-title { font-weight: 800; font-size: 1rem; color: #1f2937; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f3f4f6; }
    .animate-slide-in { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class AdminComponent {
  configService = inject(ConfigService);
  toastService = inject(ToastService);
  config = this.configService.config;
  isAuthenticated = this.configService.isAdmin;
  firestoreError = this.configService.firestoreError;
  
  isOpen = signal(false);
  emailInput = signal('');
  passwordInput = signal('');
  showPassword = signal(false);
  isLoggingIn = signal(false);
  isUploading = signal(false);
  loginError = signal('');
  
  currentTab = signal('global');
  selectedBranchIndex = signal(0);
  
  fontSearch = signal('');
  
  tabs = [
    { id: 'global', label: 'Global & Intro', icon: '🌍' },
    { id: 'hero', label: 'Hero / Utama', icon: '🏠' },
    { id: 'about', label: 'About Us', icon: '📖' },
    { id: 'menu', label: 'Menu Makanan', icon: '🍱' },
    { id: 'packages', label: 'Paket Hemat', icon: '🎁' },
    { id: 'reservation', label: 'Reservasi', icon: '📅' },
    { id: 'location', label: 'Lokasi', icon: '📍' },
    { id: 'media', label: 'Instagram Feed', icon: '📸' },
    { id: 'footer', label: 'Footer', icon: '🔗' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
    { id: 'database', label: 'Database (Secure)', icon: '🔥' },
  ];
  
  // 10 Curated Fonts (Performance Optimized)
  fontList = [
    'Playfair Display', 
    'Lato', 
    'Montserrat', 
    'Oswald', 
    'Merriweather', 
    'Great Vibes', 
    'Dancing Script', 
    'Open Sans', 
    'Roboto', 
    'Lora'
  ].sort();

  filteredFonts = computed(() => {
    const term = this.fontSearch().toLowerCase();
    return this.fontList.filter(f => f.toLowerCase().includes(term));
  });
  
  tempConfig: FirebaseConfig = { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };

  constructor() {
    const current = this.configService.getStoredFirebaseConfig();
    if (current) this.tempConfig = {...current};
  }

  togglePanel() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) document.body.classList.add('admin-mode');
    else document.body.classList.remove('admin-mode');
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async login() {
    if (!this.emailInput() || !this.passwordInput()) return;
    this.isLoggingIn.set(true);
    this.loginError.set('');
    try {
      await this.configService.loginAdmin(this.emailInput(), this.passwordInput());
      this.currentTab.set('global');
      this.toastService.show('Akses Admin Diberikan. Keamanan Aktif.', 'success');
    } catch (err: any) {
      this.loginError.set("Akses Ditolak: " + err.message);
      this.toastService.show('Gagal login.', 'error');
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  async logout() { 
    await this.configService.logoutAdmin(); 
    this.toastService.show('Sesi Berakhir.', 'info');
  }

  async saveChanges() { 
    try {
      await this.configService.updateConfig({...this.config()});
      this.toastService.show('Perubahan Tersimpan Aman.', 'success');
    } catch(e) {
      this.toastService.show('Gagal menyimpan.', 'error');
    }
  }

  saveFirebaseSetup() { 
    this.configService.saveStoredFirebaseConfig(this.tempConfig);
    this.toastService.show('Konfigurasi DB Diperbarui.', 'success');
  }
  resetFirebaseSetup() { 
    if(confirm('Reset ke default?')) {
      this.configService.resetStoredFirebaseConfig();
      this.toastService.show('Konfigurasi reset.', 'info');
    }
  }

  async onFileSelected(event: any, type: string, index?: number) {
     const file = event.target.files[0];
     if(!file) return;
     if (file.size > 5 * 1024 * 1024) {
       this.toastService.show('File terlalu besar! Max 5MB.', 'error');
       return;
     }

     this.isUploading.set(true); 
     try {
       const url = await this.configService.uploadFile(file);
       const c = this.config();
       
       if (type === 'logo') {
           if (this.currentTab() === 'media') c.instagramProfile.profilePic = url;
           else c.global.logoImage = url;
       }
       if (type === 'favicon') c.global.favicon = url;
       if (type === 'heroBg') c.hero.bgImage = url;
       if (type === 'aboutImage') c.about.image = url;
       if (type === 'introVideo') c.intro.videoUrl = url;
       
       if (type === 'branchMap') c.branches[this.selectedBranchIndex()].mapImage = url;
       if (type === 'menuItem' && typeof index === 'number') c.branches[this.selectedBranchIndex()].menu[index].image = url;
       if (type === 'packageItem' && typeof index === 'number') {
           const pkgs = c.branches[this.selectedBranchIndex()].packages;
           if(pkgs && pkgs[index]) pkgs[index].image = url;
       }
       if (type === 'gallery') { if(!c.gallery) c.gallery = []; c.gallery.push(url); }
       
       this.config.set({...c});
       this.toastService.show('Upload berhasil!', 'success');
     } catch (err: any) { 
        this.toastService.show("Error upload: " + err.message, 'error');
     } 
     finally { this.isUploading.set(false); }
  }

  addMenuItem() {
    this.config().branches[this.selectedBranchIndex()].menu.unshift({ name: 'Menu Baru', desc: '', price: 'Rp 0', category: 'Umum', image: 'https://picsum.photos/200', favorite: false, soldOut: false, spicyLevel: 0 });
    this.toastService.show('Item menu ditambahkan.', 'info');
  }
  removeMenuItem(i: number) { 
    if(confirm('Hapus menu?')) {
      this.config().branches[this.selectedBranchIndex()].menu.splice(i, 1);
      this.toastService.show('Item menu dihapus.', 'info');
    }
  }

  addPackage() {
    if (!this.config().branches[this.selectedBranchIndex()].packages) {
        this.config().branches[this.selectedBranchIndex()].packages = [];
    }
    this.config().branches[this.selectedBranchIndex()].packages?.unshift({
        name: 'Paket Baru',
        price: 'Rp 0',
        description: 'Deskripsi...',
        image: 'https://picsum.photos/300/200',
        items: ['Item 1']
    });
    this.toastService.show('Paket ditambahkan.', 'info');
  }
  removePackage(i: number) {
    if(confirm('Hapus paket ini?')) {
        const c = this.config();
        c.branches[this.selectedBranchIndex()].packages?.splice(i, 1);
        this.config.set({...c});
        this.toastService.show('Paket dihapus.', 'info');
    }
  }
  updatePackageItems(pkg: PackageItem, value: string) {
    pkg.items = value.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
  }

  removeGalleryImage(i: number) { if(confirm('Hapus foto?')) this.config().gallery.splice(i, 1); }
  
  addTestimonial() { 
     if(!this.config().testimonials) this.config.update(c => ({...c, testimonials: []}));
     this.config().testimonials.push({ name: 'User', text: 'Review...', rating: 5, role: 'Customer' }); 
  }
  removeTestimonial(i: number) { if(confirm('Hapus testimoni?')) this.config().testimonials.splice(i, 1); }
  
  addBranch() {
    this.config().branches.push({ id: 'b-'+Date.now(), name: 'Baru', address: '', googleMapsUrl: '', phone: '', whatsappNumber: '', hours: '', mapImage: '', menu: [], packages: [] });
    this.selectedBranchIndex.set(this.config().branches.length - 1);
    this.toastService.show('Cabang baru dibuat.', 'success');
  }
  removeBranch() { if(confirm('Hapus cabang?')) { this.config().branches.splice(this.selectedBranchIndex(), 1); this.selectedBranchIndex.set(0); } }
}
