
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
    <!-- Trigger Button -->
    <button 
      (click)="togglePanel()"
      class="fixed bottom-6 left-6 z-50 bg-gray-900 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition-all border-2 border-white/20 group"
      title="Admin Dashboard"
    >
      @if (firestoreError()) {
        <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
      }
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Upload Loading Overlay -->
    @if (isUploading()) {
      <div class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center flex-col text-white">
         <div class="w-16 h-16 border-4 border-t-orange-500 border-gray-600 rounded-full animate-spin mb-4"></div>
         <p class="font-bold tracking-widest uppercase">Mengunggah...</p>
      </div>
    }

    <!-- MAIN PANEL -->
    @if (isOpen()) {
      <div class="fixed inset-0 z-[60] bg-[#F3F4F6] font-sans text-gray-800 flex overflow-hidden animate-fade-in">
        
        <!-- LOGIN OVERLAY -->
        @if (!isAuthenticated()) {
           <div class="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm p-4">
              <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                  <div class="bg-orange-600 p-8 text-center">
                    <h2 class="text-2xl font-bold text-white">Admin Portal</h2>
                    <p class="text-orange-100 text-sm">Masuk untuk mengelola website</p>
                  </div>
                  <div class="p-8 space-y-6">
                    <div class="space-y-4">
                        <div>
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                          <input type="email" [(ngModel)]="emailInput" class="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition">
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                          <input type="password" [(ngModel)]="passwordInput" class="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition">
                        </div>
                    </div>
                    <button (click)="login()" [disabled]="isLoggingIn()" class="w-full bg-gray-900 text-white font-bold py-3.5 rounded-lg hover:bg-black transition disabled:opacity-50">
                       {{ isLoggingIn() ? 'Memproses...' : 'Masuk' }}
                    </button>
                    @if (loginError()) { <p class="text-red-500 text-center text-sm">{{ loginError() }}</p> }
                    <button (click)="togglePanel()" class="w-full text-sm text-gray-500 hover:underline text-center">Batal</button>
                  </div>
              </div>
           </div>
        } 
        
        <!-- DASHBOARD CONTENT -->
        @else {
          <!-- SIDEBAR -->
          <aside class="w-72 bg-[#111827] text-gray-400 flex flex-col h-full flex-shrink-0 border-r border-gray-800">
             <div class="h-16 flex items-center px-6 border-b border-gray-800 bg-[#0B0F19]">
                <span class="font-bold text-white text-lg tracking-wide">CMS Panel</span>
             </div>
             
             <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                @for (tab of tabs; track tab.id) {
                   <button (click)="currentTab.set(tab.id)"
                     class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                     [class.bg-orange-600]="currentTab() === tab.id"
                     [class.text-white]="currentTab() === tab.id"
                     [class.hover:bg-gray-800]="currentTab() !== tab.id"
                     [class.shadow-lg]="currentTab() === tab.id">
                      <span class="text-xl w-6">{{ tab.icon }}</span>
                      <span>{{ tab.label }}</span>
                   </button>
                }
             </nav>

             <div class="p-4 border-t border-gray-800">
                <button (click)="logout()" class="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold transition">
                   Log Out
                </button>
             </div>
          </aside>

          <!-- MAIN AREA -->
          <main class="flex-1 flex flex-col h-full overflow-hidden bg-[#F9FAFB] relative">
             <!-- HEADER -->
             <header class="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-8 z-10">
                <div>
                  <h1 class="text-xl font-bold text-gray-900">{{ getActiveTabLabel() }}</h1>
                  <p class="text-xs text-gray-500">Kelola pengaturan website Anda secara real-time</p>
                </div>
                
                <div class="flex items-center gap-3">
                   <button (click)="saveChanges()" class="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                      Simpan
                   </button>
                   <button (click)="togglePanel()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold text-xl">✕</button>
                </div>
             </header>

             <!-- CONTENT SCROLL -->
             <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div class="max-w-6xl mx-auto space-y-8 pb-24">

                   <!-- ==========================
                        TAB: GLOBAL & INTRO
                        ========================== -->
                   @if (currentTab() === 'global') {
                      <section class="space-y-4">
                        <div class="flex items-center gap-2 mb-2">
                           <span class="text-2xl">🎬</span>
                           <h2 class="text-lg font-bold text-gray-800">Intro Loading Screen</h2>
                        </div>
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                           <div class="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                              <div><h3 class="font-bold text-gray-900">Aktifkan Intro Video</h3><p class="text-sm text-gray-500">Tampilkan video saat website pertama kali dibuka.</p></div>
                              <label class="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" [(ngModel)]="config().intro.enabled" class="sr-only peer">
                                 <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-orange-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                              </label>
                           </div>
                           @if (config().intro.enabled) {
                              <div class="grid md:grid-cols-12 gap-6">
                                 <div class="md:col-span-5">
                                    <label class="form-label">Upload Video (.mp4)</label>
                                    <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition relative group min-h-[160px] flex flex-col justify-center items-center cursor-pointer">
                                       <input type="file" (change)="onFileSelected($event, 'introVideo')" accept="video/*" class="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full">
                                       <div class="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                       </div>
                                       <span class="text-sm font-bold text-gray-600">Klik upload video</span>
                                    </div>
                                    @if (config().intro.videoUrl) { <div class="mt-2 text-xs text-green-600 font-bold">✓ Video Terupload</div> }
                                 </div>
                                 <div class="md:col-span-7 space-y-4">
                                    <div class="grid grid-cols-2 gap-4">
                                       <div><label class="form-label">Durasi (Detik)</label><input type="number" [(ngModel)]="config().intro.duration" class="form-input"></div>
                                       <div><label class="form-label">Efek Animasi</label>
                                          <select [(ngModel)]="config().intro.fadeOut" class="form-select">
                                             <option value="fade">Fade Out</option><option value="slide-up">Slide Up</option><option value="slide-down">Slide Down</option><option value="zoom-out">Zoom Out</option>
                                          </select>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           }
                        </div>
                      </section>
                      <section class="space-y-4">
                        <div class="flex items-center gap-2 mb-2"><span class="text-2xl">🆔</span><h2 class="text-lg font-bold text-gray-800">Identitas & Style</h2></div>
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                           <div class="grid md:grid-cols-2 gap-6">
                              <div><label class="form-label">Nama Brand</label><input type="text" [(ngModel)]="config().global.logoText" class="form-input font-bold text-lg"></div>
                              <div class="grid grid-cols-2 gap-4">
                                 <div><label class="form-label">Warna Navbar</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().global.navbarColor" class="h-10 w-12 rounded cursor-pointer border"><input type="text" [(ngModel)]="config().global.navbarColor" class="form-input"></div></div>
                                 <div><label class="form-label">Warna Teks</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().global.navbarTextColor" class="h-10 w-12 rounded cursor-pointer border"><input type="text" [(ngModel)]="config().global.navbarTextColor" class="form-input"></div></div>
                              </div>
                           </div>
                           <div class="grid md:grid-cols-3 gap-6 pt-4 border-t">
                              <div><label class="form-label">Font Logo</label><select [(ngModel)]="config().global.logoStyle.fontFamily" class="form-select"><option value="Oswald">Oswald</option><option value="Playfair Display">Playfair</option><option value="Great Vibes">Great Vibes</option><option value="Lato">Lato</option></select></div>
                              <div><label class="form-label">Size Logo</label><input type="text" [(ngModel)]="config().global.logoStyle.fontSize" class="form-input"></div>
                              <div><label class="form-label">Warna Logo</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().global.logoStyle.color" class="h-10 w-12 rounded cursor-pointer border"><input type="text" [(ngModel)]="config().global.logoStyle.color" class="form-input"></div></div>
                           </div>
                        </div>
                      </section>
                   }

                   <!-- ==========================
                        TAB: HERO (COMPLETELY REVAMPED & ROBUST)
                        ========================== -->
                   @if (currentTab() === 'hero') {
                      
                      <!-- Header Switch -->
                      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex justify-between items-center mb-6">
                         <div class="flex items-center gap-3">
                            <span class="text-2xl">🏠</span>
                            <div>
                               <h3 class="font-bold text-gray-900">Hero Section</h3>
                               <p class="text-xs text-gray-500">Banner utama di halaman depan</p>
                            </div>
                         </div>
                         <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" [(ngModel)]="config().features.showHero" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-orange-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            <span class="ml-3 text-sm font-bold text-gray-700">Tampilkan</span>
                         </label>
                      </div>

                      @if (config().features.showHero) {
                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                           
                           <!-- COL 1: LAYOUT & MEDIA (Span 4) -->
                           <div class="lg:col-span-4 space-y-6">
                              <!-- Layout Control -->
                              <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                 <div class="bg-gray-50 px-4 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">1. Layout & Alignment</div>
                                 <div class="p-5">
                                    <label class="form-label">Text Alignment</label>
                                    <div class="flex bg-gray-100 rounded-lg p-1">
                                       <button (click)="config().hero.textAlign = 'left'" [class.bg-white]="config().hero.textAlign === 'left'" [class.shadow]="config().hero.textAlign === 'left'" class="flex-1 py-2 rounded text-sm font-bold transition">Left</button>
                                       <button (click)="config().hero.textAlign = 'center'" [class.bg-white]="!config().hero.textAlign || config().hero.textAlign === 'center'" [class.shadow]="!config().hero.textAlign || config().hero.textAlign === 'center'" class="flex-1 py-2 rounded text-sm font-bold transition">Center</button>
                                       <button (click)="config().hero.textAlign = 'right'" [class.bg-white]="config().hero.textAlign === 'right'" [class.shadow]="config().hero.textAlign === 'right'" class="flex-1 py-2 rounded text-sm font-bold transition">Right</button>
                                    </div>
                                 </div>
                              </div>

                              <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                 <div class="bg-gray-50 px-4 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">2. Media & Background</div>
                                 <div class="p-5 space-y-5">
                                    <!-- Media Preview & Upload -->
                                    <div class="space-y-2">
                                       <label class="form-label">Background Image / Video</label>
                                       <div class="aspect-[9/16] md:aspect-video bg-gray-900 rounded-lg overflow-hidden relative group border border-gray-300 shadow-inner">
                                          @if (isVideo(config().hero.bgImage)) {
                                             <video [src]="config().hero.bgImage" class="w-full h-full object-cover opacity-80" muted autoplay loop></video>
                                          } @else {
                                             <img [src]="config().hero.bgImage" class="w-full h-full object-cover opacity-80">
                                          }
                                          <label class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition duration-300">
                                             <span class="font-bold text-xs uppercase tracking-widest">Ganti Media</span>
                                             <input type="file" (change)="onFileSelected($event, 'heroBg')" class="hidden">
                                          </label>
                                       </div>
                                    </div>

                                    <!-- Overlay Control -->
                                    <div>
                                       <div class="flex justify-between items-center mb-1">
                                          <label class="form-label mb-0">Overlay Opacity</label>
                                          <span class="text-xs font-mono bg-gray-100 px-1 rounded">{{ config().hero.overlayOpacity }}</span>
                                       </div>
                                       <input type="range" min="0" max="1" step="0.1" [(ngModel)]="config().hero.overlayOpacity" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600">
                                    </div>

                                    <!-- Base Background Color -->
                                    <div>
                                       <label class="form-label">Base Background Color</label>
                                       <div class="flex gap-2">
                                          <input type="color" [(ngModel)]="config().hero.style.backgroundColor" class="h-10 w-12 rounded cursor-pointer border shadow-sm">
                                          <input type="text" [(ngModel)]="config().hero.style.backgroundColor" class="form-input font-mono uppercase">
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <!-- COL 2: TYPOGRAPHY & CONTENT (Span 8) -->
                           <div class="lg:col-span-8 space-y-6">
                              
                              <!-- BADGE SETTINGS -->
                              <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                 <div class="bg-gray-50 px-4 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">3. Badge (Label Atas)</div>
                                 <div class="p-5 grid md:grid-cols-2 gap-6">
                                    <div class="col-span-2 md:col-span-1">
                                       <label class="form-label">Teks Badge</label>
                                       <input type="text" [(ngModel)]="config().hero.badgeText" class="form-input">
                                    </div>
                                    <div class="col-span-2 md:col-span-1 grid grid-cols-2 gap-3">
                                       <div>
                                          <label class="form-label">Warna</label>
                                          <div class="flex gap-2"><input type="color" [(ngModel)]="config().hero.badgeStyle.color" class="h-9 w-9 rounded border cursor-pointer"><input type="text" [(ngModel)]="config().hero.badgeStyle.color" class="form-input px-2 py-1 text-xs"></div>
                                       </div>
                                       <div>
                                          <label class="form-label">Ukuran</label>
                                          <input type="text" [(ngModel)]="config().hero.badgeStyle.fontSize" class="form-input px-2 py-1.5" placeholder="0.875rem">
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <!-- MAIN TITLE SETTINGS -->
                              <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                                 <div class="bg-gray-50 px-4 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">4. Judul Utama (Headline)</div>
                                 <div class="p-5 space-y-6">
                                    <!-- Main Title Text -->
                                    <div class="grid md:grid-cols-12 gap-4">
                                       <div class="md:col-span-8">
                                          <label class="form-label">Teks Judul Utama</label>
                                          <input type="text" [(ngModel)]="config().hero.title" class="form-input font-bold text-lg">
                                       </div>
                                       <div class="md:col-span-4">
                                          <label class="form-label">Warna Judul</label>
                                          <div class="flex gap-2"><input type="color" [(ngModel)]="config().hero.titleStyle.color" class="h-10 w-full rounded border cursor-pointer"><input type="text" [(ngModel)]="config().hero.titleStyle.color" class="form-input w-20"></div>
                                       </div>
                                    </div>

                                    <!-- Typography Grid -->
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                       <div>
                                          <label class="form-label">Font Family</label>
                                          <select [(ngModel)]="config().hero.titleStyle.fontFamily" class="form-select text-xs">
                                             <option value="Oswald">Oswald</option><option value="Playfair Display">Playfair</option><option value="Great Vibes">Great Vibes</option><option value="Lato">Lato</option>
                                          </select>
                                       </div>
                                       <div>
                                          <label class="form-label">Font Size</label>
                                          <input type="text" [(ngModel)]="config().hero.titleStyle.fontSize" class="form-input text-xs" placeholder="4.5rem">
                                       </div>
                                       <!-- Highlight Text -->
                                       <div class="col-span-2">
                                          <label class="form-label text-orange-600">Highlight Text (Aksen)</label>
                                          <div class="flex gap-2">
                                             <input type="text" [(ngModel)]="config().hero.highlight" class="form-input text-xs font-bold text-orange-600">
                                             <input type="color" [(ngModel)]="config().hero.highlightStyle.color" class="h-9 w-9 flex-shrink-0 rounded border cursor-pointer">
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <!-- SUBTITLE SETTINGS -->
                              <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                 <div class="bg-gray-50 px-4 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">5. Sub-Judul (Deskripsi)</div>
                                 <div class="p-5 grid md:grid-cols-12 gap-6">
                                    <div class="md:col-span-8">
                                       <label class="form-label">Teks Deskripsi</label>
                                       <textarea [(ngModel)]="config().hero.subtitle" class="form-input h-24 text-sm leading-relaxed"></textarea>
                                    </div>
                                    <div class="md:col-span-4 space-y-3">
                                       <div>
                                          <label class="form-label">Warna Teks</label>
                                          <div class="flex gap-2"><input type="color" [(ngModel)]="config().hero.subtitleStyle.color" class="h-9 w-10 rounded border cursor-pointer"><input type="text" [(ngModel)]="config().hero.subtitleStyle.color" class="form-input px-2 py-1 text-xs"></div>
                                       </div>
                                       <div>
                                          <label class="form-label">Ukuran Font</label>
                                          <input type="text" [(ngModel)]="config().hero.subtitleStyle.fontSize" class="form-input px-2 py-1 text-xs">
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <!-- ACTION BUTTONS -->
                              <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                 <div class="bg-gray-50 px-4 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">6. Tombol Aksi (Buttons)</div>
                                 <div class="p-5 space-y-6">
                                    <!-- Global Button Style -->
                                    <div class="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-dashed border-gray-200">
                                       <div><label class="form-label">Accent Color (Bg Tombol 1)</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().hero.style.accentColor" class="h-9 w-full rounded border cursor-pointer"><input type="text" [(ngModel)]="config().hero.style.accentColor" class="form-input text-xs"></div></div>
                                       <div><label class="form-label">Border Radius</label><input type="text" [(ngModel)]="config().hero.style.buttonRadius" class="form-input text-xs" placeholder="50px"></div>
                                       <div><label class="form-label">Padding (Vertical)</label><input type="text" [(ngModel)]="config().hero.style.buttonPaddingY" class="form-input text-xs" placeholder="16px"></div>
                                    </div>

                                    <div class="grid md:grid-cols-2 gap-8">
                                       <!-- Button 1 -->
                                       <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                          <h4 class="font-bold text-xs uppercase mb-3 text-gray-500">Tombol Utama (Solid)</h4>
                                          <div class="space-y-3">
                                             <div><label class="form-label">Teks Tombol</label><input type="text" [(ngModel)]="config().hero.buttonText1" class="form-input font-bold"></div>
                                             <div><label class="form-label">Link Tujuan (Internal)</label><input type="text" [(ngModel)]="config().hero.button1Link" class="form-input text-xs" placeholder="/menu"></div>
                                             <div><label class="form-label">Warna Teks</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().hero.button1Style.color" class="h-8 w-10 rounded border cursor-pointer"><input type="text" [(ngModel)]="config().hero.button1Style.color" class="form-input text-xs"></div></div>
                                          </div>
                                       </div>

                                       <!-- Button 2 -->
                                       <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                          <h4 class="font-bold text-xs uppercase mb-3 text-gray-500">Tombol Kedua (Outline)</h4>
                                          <div class="space-y-3">
                                             <div><label class="form-label">Teks Tombol</label><input type="text" [(ngModel)]="config().hero.buttonText2" class="form-input font-bold"></div>
                                             <div><label class="form-label">Link Tujuan (Internal)</label><input type="text" [(ngModel)]="config().hero.button2Link" class="form-input text-xs" placeholder="/reservation"></div>
                                             <div><label class="form-label">Warna Teks & Border</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().hero.button2Style.color" class="h-8 w-10 rounded border cursor-pointer"><input type="text" [(ngModel)]="config().hero.button2Style.color" class="form-input text-xs"></div></div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                           </div> <!-- End Col 8 -->
                        </div>
                      }
                   }

                   <!-- ==========================
                        TAB: MENU
                        ========================== -->
                   @if (currentTab() === 'menu') {
                      <div class="space-y-6">
                         <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div class="flex overflow-x-auto border-b border-gray-200">
                               @for (branch of config().branches; track $index) {
                                  <button (click)="selectedBranchIndex.set($index)" 
                                    class="px-6 py-4 font-bold text-sm border-b-2 transition whitespace-nowrap hover:bg-gray-50"
                                    [class.border-orange-500]="selectedBranchIndex() === $index"
                                    [class.text-orange-600]="selectedBranchIndex() === $index"
                                    [class.border-transparent]="selectedBranchIndex() !== $index">
                                    {{ branch.name }}
                                  </button>
                               }
                            </div>
                            
                            <div class="p-4 bg-gray-50 flex justify-between items-center">
                               <h3 class="font-bold text-gray-700">Daftar Menu: {{ config().branches[selectedBranchIndex()].name }}</h3>
                               <button (click)="addMenuItem()" class="bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-700 transition">+ Tambah Menu</button>
                            </div>

                            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                               @for (item of config().branches[selectedBranchIndex()].menu; track $index) {
                                  <div class="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition group">
                                     <div class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                        <img [src]="item.image" class="w-full h-full object-cover">
                                        <label class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition">
                                           Ubah
                                           <input type="file" (change)="onFileSelected($event, 'menuItem', $index)" class="hidden">
                                        </label>
                                     </div>
                                     <div class="flex-1 space-y-2">
                                        <div class="flex gap-2">
                                           <input type="text" [(ngModel)]="item.name" class="form-input font-bold" placeholder="Nama Menu">
                                           <input type="text" [(ngModel)]="item.price" class="form-input w-24 text-right" placeholder="Harga">
                                        </div>
                                        <textarea [(ngModel)]="item.desc" class="form-input text-xs min-h-[40px]" placeholder="Deskripsi..."></textarea>
                                        <div class="flex items-center gap-2 flex-wrap">
                                           <input type="text" [(ngModel)]="item.category" class="form-input text-xs w-24 py-1" placeholder="Kategori">
                                           <label class="flex items-center gap-1 text-xs cursor-pointer select-none bg-yellow-50 px-2 py-1 rounded border border-yellow-200 text-yellow-700">
                                              <input type="checkbox" [(ngModel)]="item.favorite"> ⭐ Fav
                                           </label>
                                           <label class="flex items-center gap-1 text-xs cursor-pointer select-none bg-red-50 px-2 py-1 rounded border border-red-200 text-red-700">
                                              <input type="checkbox" [(ngModel)]="item.soldOut"> 🚫 Habis
                                           </label>
                                           <button (click)="removeMenuItem($index)" class="ml-auto text-red-400 hover:text-red-600">✕</button>
                                        </div>
                                     </div>
                                  </div>
                               }
                            </div>
                         </div>
                      </div>
                   }

                   <!-- ==========================
                        TAB: ABOUT
                        ========================== -->
                   @if (currentTab() === 'about') {
                      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                         <h3 class="font-bold text-lg border-b pb-4">Halaman Tentang Kami</h3>
                         <div class="grid md:grid-cols-2 gap-8">
                            <div class="space-y-4">
                               <div><label class="form-label">Judul Section</label><input type="text" [(ngModel)]="config().about.title" class="form-input"></div>
                               <div><label class="form-label">Deskripsi Lengkap</label><textarea [(ngModel)]="config().about.description" class="form-input h-40"></textarea></div>
                            </div>
                            <div class="space-y-4">
                               <label class="form-label">Gambar Utama</label>
                               <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group">
                                  <img [src]="config().about.image" class="w-full h-full object-cover">
                                  <label class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold cursor-pointer transition">
                                     Ganti Gambar
                                     <input type="file" (change)="onFileSelected($event, 'aboutImage')" class="hidden">
                                  </label>
                               </div>
                            </div>
                         </div>
                      </div>
                   }

                   <!-- ==========================
                        TAB: PACKAGES
                        ========================== -->
                   @if (currentTab() === 'packages') {
                      <div class="space-y-6">
                         <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div class="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-200">
                               <h3 class="font-bold text-gray-700">Paket Hemat</h3>
                               <button (click)="addPackage()" class="bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-700 transition">+ Tambah Paket</button>
                            </div>
                            <div class="p-6">
                              @if (!config().branches[selectedBranchIndex()].packages?.length) {
                                 <div class="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">Belum ada paket untuk cabang ini.</div>
                              }
                              <div class="grid md:grid-cols-2 gap-6">
                                 @for (pkg of config().branches[selectedBranchIndex()].packages; track $index) {
                                    <div class="border rounded-xl p-4 relative bg-white hover:shadow-md transition group">
                                       <button (click)="removePackage($index)" class="absolute top-2 right-2 text-red-400 hover:text-red-600 bg-white rounded-full p-1 shadow-sm">✕</button>
                                       <div class="flex gap-4">
                                          <div class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                             <img [src]="pkg.image || 'https://picsum.photos/200'" class="w-full h-full object-cover">
                                             <label class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition">
                                                Ubah
                                                <input type="file" (change)="onFileSelected($event, 'packageItem', $index)" class="hidden">
                                             </label>
                                          </div>
                                          <div class="flex-1 space-y-2">
                                             <div class="flex gap-2">
                                                <input type="text" [(ngModel)]="pkg.name" class="form-input font-bold" placeholder="Nama Paket">
                                                <input type="text" [(ngModel)]="pkg.price" class="form-input w-24 text-right" placeholder="Harga">
                                             </div>
                                             <input type="text" [(ngModel)]="pkg.description" class="form-input text-xs" placeholder="Deskripsi Singkat">
                                             <div>
                                                <label class="text-[10px] uppercase font-bold text-gray-400">Isi Paket (Pisahkan koma)</label>
                                                <textarea [ngModel]="pkg.items.join(', ')" (ngModelChange)="updatePackageItems(pkg, $event)" class="form-input text-xs h-16"></textarea>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 }
                              </div>
                            </div>
                         </div>
                      </div>
                   }

                   <!-- ==========================
                        TAB: LOCATION
                        ========================== -->
                   @if (currentTab() === 'location') {
                       <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                           <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                               <h3 class="font-bold text-lg">Kelola Cabang</h3>
                               <button (click)="addBranch()" class="bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-bold">+ Cabang Baru</button>
                           </div>
                           <div class="flex overflow-x-auto border-b border-gray-200">
                               @for (branch of config().branches; track $index) {
                                  <button (click)="selectedBranchIndex.set($index)" class="px-6 py-3 text-sm font-bold border-b-2" [class.border-orange-500]="selectedBranchIndex()===$index" [class.border-transparent]="selectedBranchIndex()!==$index">{{branch.name}}</button>
                               }
                           </div>
                           <div class="p-6 grid md:grid-cols-2 gap-8">
                               <div class="space-y-4">
                                  <div><label class="form-label">Nama Cabang</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].name" class="form-input"></div>
                                  <div><label class="form-label">Alamat</label><textarea [(ngModel)]="config().branches[selectedBranchIndex()].address" class="form-input h-20"></textarea></div>
                                  <div class="grid grid-cols-2 gap-4">
                                     <div><label class="form-label">No. WA (62..)</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].whatsappNumber" class="form-input"></div>
                                     <div><label class="form-label">Jam Buka</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].hours" class="form-input"></div>
                                  </div>
                                  <button (click)="removeBranch()" class="text-red-600 text-xs underline font-bold">Hapus Cabang Ini</button>
                               </div>
                               <div class="space-y-4">
                                  <label class="form-label">Foto Lokasi / Peta</label>
                                  <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group border">
                                     <img [src]="config().branches[selectedBranchIndex()].mapImage" class="w-full h-full object-cover">
                                     <label class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition">
                                        Upload
                                        <input type="file" (change)="onFileSelected($event, 'branchMap')" class="hidden">
                                     </label>
                                  </div>
                                  <div><label class="form-label">Google Maps Link</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].googleMapsUrl" class="form-input text-xs"></div>
                               </div>
                           </div>
                       </div>
                   }

                   @if (currentTab() === 'ai' || currentTab() === 'database' || currentTab() === 'footer' || currentTab() === 'media') {
                      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                         <p class="mb-4">Pengaturan {{ getActiveTabLabel() }} tersedia.</p> 
                         <p class="text-xs">Silakan gunakan struktur grid yang sama seperti tab Global untuk merapikan bagian ini.</p>
                      </div>
                   }

                </div>
             </div>
          </main>
        }
      </div>
    }
  `,
  styles: [`
    .form-label { @apply block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5; }
    .form-input { @apply w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white shadow-sm; }
    .form-select { @apply w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white shadow-sm appearance-none cursor-pointer; }
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminComponent {
  configService = inject(ConfigService);
  toastService = inject(ToastService);
  config = this.configService.config;
  
  isOpen = signal(false);
  currentTab = signal('global');
  isUploading = signal(false);
  
  // Login
  emailInput = signal('');
  passwordInput = signal('');
  isLoggingIn = signal(false);
  loginError = signal<string | null>(null);
  
  // UI State
  selectedBranchIndex = signal(0);
  videoSizeWarning = signal(false);
  
  isAuthenticated = computed(() => this.configService.currentUser() !== null || this.configService.isDemoMode());
  firestoreError = this.configService.firestoreError;

  tabs = [
    { id: 'global', label: 'Global & Intro', icon: '🌍' },
    { id: 'hero', label: 'Hero Banner', icon: '🏠' },
    { id: 'about', label: 'Tentang Kami', icon: '📖' },
    { id: 'menu', label: 'Daftar Menu', icon: '🍽️' },
    { id: 'packages', label: 'Paket Hemat', icon: '📦' },
    { id: 'location', label: 'Lokasi', icon: '📍' },
    { id: 'media', label: 'Galeri & Testimoni', icon: '📷' },
    { id: 'footer', label: 'Footer', icon: '🔗' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
    { id: 'database', label: 'Database', icon: '🔥' }
  ];

  // Temp for DB
  tempConfig: FirebaseConfig = { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };

  constructor() {
    const current = this.configService.getStoredFirebaseConfig();
    if (current) this.tempConfig = {...current};

    effect(() => {
       if (this.isOpen()) {
         document.body.classList.add('admin-mode');
       } else {
         document.body.classList.remove('admin-mode');
       }
    });
  }

  getActiveTabLabel() {
    return this.tabs.find(t => t.id === this.currentTab())?.label || 'Dashboard';
  }

  togglePanel() {
    this.isOpen.update(v => !v);
  }

  async login() {
    this.isLoggingIn.set(true);
    this.loginError.set(null);
    try {
      await this.configService.loginAdmin(this.emailInput(), this.passwordInput());
      this.toastService.show('Login Berhasil', 'success');
    } catch (e: any) {
      this.loginError.set(e.message || 'Login gagal');
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  async logout() {
    await this.configService.logoutAdmin();
    this.togglePanel();
  }

  async saveChanges() {
    try {
      await this.configService.updateConfig(this.config());
      this.toastService.show('Disimpan!', 'success');
    } catch (e: any) {
       console.error(e);
       this.toastService.show('Gagal menyimpan.', 'error');
    }
  }

  async onFileSelected(event: any, type: string, index?: number) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading.set(true);
    try {
      const base64 = await this.configService.uploadFile(file);
      
      this.config.update(c => {
        const newC = { ...c };
        if (type === 'introVideo') newC.intro.videoUrl = base64;
        if (type === 'heroBg') newC.hero.bgImage = base64;
        if (type === 'aboutImage') newC.about.image = base64;
        if (type === 'logoImage') newC.global.logoImage = base64;
        if (type === 'favicon') newC.global.favicon = base64;
        
        if (type === 'menuItem' && typeof index === 'number') {
           newC.branches[this.selectedBranchIndex()].menu[index].image = base64;
        }
        if (type === 'packageItem' && typeof index === 'number') {
           if (newC.branches[this.selectedBranchIndex()].packages?.[index]) {
             newC.branches[this.selectedBranchIndex()].packages![index].image = base64;
           }
        }
        if (type === 'branchMap') {
           newC.branches[this.selectedBranchIndex()].mapImage = base64;
        }
        return newC;
      });
      
      this.toastService.show('Upload Berhasil', 'success');
    } catch (e) {
      this.toastService.show('Gagal Upload', 'error');
    } finally {
      this.isUploading.set(false);
    }
  }

  addMenuItem() {
    this.config.update(c => {
      const newC = { ...c };
      newC.branches[this.selectedBranchIndex()].menu.unshift({
        name: 'Menu Baru',
        desc: '',
        price: 'Rp 0',
        category: 'Umum',
        image: 'https://picsum.photos/200',
        favorite: false,
        soldOut: false,
        spicyLevel: 0
      });
      return newC;
    });
  }

  removeMenuItem(index: number) {
    if(!confirm('Hapus menu ini?')) return;
    this.config.update(c => {
      const newC = { ...c };
      newC.branches[this.selectedBranchIndex()].menu.splice(index, 1);
      return newC;
    });
  }

  addPackage() {
    this.config.update(c => {
      const newC = { ...c };
      const currentBranch = newC.branches[this.selectedBranchIndex()];
      if (!currentBranch.packages) currentBranch.packages = [];
      
      currentBranch.packages.unshift({
        name: 'Paket Baru',
        price: 'Rp 0',
        description: 'Deskripsi...',
        image: 'https://picsum.photos/400/300',
        items: ['Item 1', 'Item 2']
      });
      return newC;
    });
  }

  removePackage(index: number) {
    if(!confirm('Hapus paket ini?')) return;
    this.config.update(c => {
      const newC = { ...c };
      newC.branches[this.selectedBranchIndex()].packages?.splice(index, 1);
      return newC;
    });
  }

  updatePackageItems(pkg: PackageItem, text: string) {
    pkg.items = text.split(/[\n,]/).map(s => s.trim()).filter(s => s.length > 0);
  }

  addBranch() {
    const id = prompt("ID Cabang (contoh: 'jakarta'):");
    if (!id) return;
    
    this.config.update(c => {
      const newC = { ...c };
      newC.branches.push({
        id: id.toLowerCase().replace(/\s/g, '-'),
        name: 'Cabang Baru',
        address: '-',
        googleMapsUrl: '',
        phone: '',
        whatsappNumber: '',
        hours: '10.00 - 22.00',
        mapImage: 'https://picsum.photos/600/400',
        menu: [],
        packages: []
      });
      this.selectedBranchIndex.set(newC.branches.length - 1);
      return newC;
    });
  }

  removeBranch() {
    if (this.config().branches.length <= 1) return;
    if(!confirm('Hapus cabang ini?')) return;
    this.config.update(c => {
      const newC = { ...c };
      newC.branches.splice(this.selectedBranchIndex(), 1);
      this.selectedBranchIndex.set(0);
      return newC;
    });
  }

  saveFirebaseSetup() { 
    this.configService.saveStoredFirebaseConfig(this.tempConfig);
  }

  isVideo(url: string) { return this.configService.isVideo(url); }
}
