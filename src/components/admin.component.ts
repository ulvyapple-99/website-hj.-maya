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
      class="fixed bottom-6 left-6 z-50 bg-gray-900 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition-all border-2 border-white/20 group opacity-5 hover:opacity-100"
      title="Admin Dashboard"
    >
      @if (firestoreError()) {
        <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
      }
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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
                          <div class="relative">
                            <input 
                              [type]="showPassword() ? 'text' : 'password'" 
                              [(ngModel)]="passwordInput" 
                              class="w-full p-3 pr-10 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition">
                            <button 
                              (click)="showPassword.set(!showPassword())" 
                              type="button"
                              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                              @if (showPassword()) {
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m0 0l-2.11 2.11" />
                                </svg>
                              } @else {
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                                </svg>
                              }
                            </button>
                          </div>
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
          <aside class="w-64 bg-[#111827] text-gray-400 flex flex-col h-full flex-shrink-0 border-r border-gray-800">
             <div class="h-16 flex items-center px-6 border-b border-gray-800 bg-[#0B0F19]">
                <span class="font-bold text-white text-lg tracking-wide">CMS Panel</span>
             </div>
             
             <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                @for (tab of tabs; track tab.id) {
                   <button (click)="currentTab.set(tab.id)"
                     class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                     [class.bg-orange-600]="currentTab() === tab.id"
                     [class.text-white]="currentTab() === tab.id"
                     [class.hover:bg-gray-800]="currentTab() !== tab.id">
                      <span class="text-lg w-6 text-center">{{ tab.icon }}</span>
                      <span>{{ tab.label }}</span>
                   </button>
                }
             </nav>
             <div class="p-4 border-t border-gray-800">
                <button (click)="logout()" class="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold transition">Log Out</button>
             </div>
          </aside>

          <!-- MAIN AREA -->
          <main class="flex-1 flex flex-col h-full overflow-hidden bg-[#F9FAFB] relative">
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
             <div class="flex-1 overflow-y-auto p-8 custom-scrollbar pb-32">
                <div class="max-w-5xl mx-auto space-y-8">
                   
                   <!-- === 1. GLOBAL SETTINGS === -->
                   @if (currentTab() === 'global') {
                      
                      <!-- Brand Identity -->
                      <div class="admin-card">
                         <div class="admin-card-header bg-blue-900 text-white">Brand Identity & Logo</div>
                         <div class="p-6 grid grid-cols-2 gap-6">
                            <!-- Logo Text & Style -->
                            <div class="col-span-2 grid grid-cols-4 gap-4">
                                <div class="col-span-2"><label class="form-label">Logo Text</label><input [(ngModel)]="config().global.logoText" class="form-input"></div>
                                <div><label class="form-label">Font Family</label><input [(ngModel)]="config().global.logoStyle.fontFamily" class="form-input"></div>
                                <div>
                                   <label class="form-label">Font Size</label>
                                   <input [(ngModel)]="config().global.logoStyle.fontSize" class="form-input">
                                </div>
                                <div class="col-span-4 mt-2">
                                   <label class="form-label">Logo Text Color</label>
                                   <div class="flex items-center gap-2">
                                      <input type="color" [(ngModel)]="config().global.logoStyle.color" class="h-9 w-9 border cursor-pointer p-0 rounded">
                                      <input [(ngModel)]="config().global.logoStyle.color" class="form-input">
                                   </div>
                                </div>
                            </div>
                            
                            <!-- Logo Images -->
                            <div class="border-t pt-4 mt-2 col-span-2 grid grid-cols-2 gap-6">
                                <div>
                                   <label class="form-label">Logo Image (Overrides Text)</label>
                                   <div class="flex gap-2 items-center">
                                      <input type="file" (change)="onFileSelected($event, 'logoImage')" class="form-input text-xs">
                                   </div>
                                   @if(config().global.logoImage) {
                                      <div class="mt-2 h-16 bg-gray-100 rounded border flex items-center justify-center p-2">
                                         <img [src]="config().global.logoImage" class="h-full object-contain">
                                      </div>
                                   }
                                </div>
                                <div>
                                   <label class="form-label">Favicon (Browser Tab)</label>
                                   <div class="flex gap-2 items-center">
                                      <input type="file" (change)="onFileSelected($event, 'favicon')" class="form-input text-xs">
                                   </div>
                                   @if(config().global.favicon) {
                                      <div class="mt-2 h-16 bg-gray-100 rounded border flex items-center justify-center p-2">
                                         <img [src]="config().global.favicon" class="h-8 w-8">
                                      </div>
                                   }
                                </div>
                            </div>
                         </div>
                      </div>

                      <!-- Background Music -->
                      <div class="admin-card">
                        <div class="admin-card-header bg-green-800 text-white">Background Music</div>
                        <div class="p-6 space-y-6">
                            <label class="flex items-center gap-2 cursor-pointer font-bold text-sm select-none">
                                <input type="checkbox" [(ngModel)]="config().global.enableBackgroundMusic" class="w-5 h-5 text-green-600 rounded focus:ring-green-500"> 
                                Aktifkan Musik Latar
                            </label>

                            <div class="border-t pt-4">
                                <div>
                                    <label class="form-label">Upload File Audio (.mp3, .wav, .ogg)</label>
                                    <div class="flex items-center gap-2">
                                        <input type="file" (change)="onFileSelected($event, 'backgroundMusic')" class="form-input text-xs" accept="audio/*">
                                        @if(config().global.backgroundMusicUrl) {
                                            <button (click)="removeBackgroundMusic()" class="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200" title="Hapus Musik">✕</button>
                                        }
                                    </div>
                                    @if(config().global.backgroundMusicUrl) {
                                        <div class="mt-2 p-2 bg-gray-100 rounded border overflow-hidden">
                                            <audio [src]="config().global.backgroundMusicUrl" controls class="w-full"></audio>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                      </div>

                      <!-- Intro Video -->
                      <div class="admin-card">
                        <div class="admin-card-header bg-indigo-800 text-white">Intro Video Settings</div>
                        <div class="p-6 space-y-6">
                            <label class="flex items-center gap-2 cursor-pointer font-bold text-sm select-none">
                                <input type="checkbox" [(ngModel)]="config().intro.enabled" class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"> 
                                Aktifkan Video Intro
                            </label>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                                <!-- Upload & Preview -->
                                <div>
                                    <label class="form-label">Upload Video (.mp4)</label>
                                    <div class="flex items-center gap-2">
                                        <input type="file" (change)="onFileSelected($event, 'introVideo')" class="form-input text-xs" accept="video/mp4,video/webm">
                                        @if(config().intro.videoUrl) {
                                            <button (click)="removeIntroVideo()" class="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200" title="Hapus Video">✕</button>
                                        }
                                    </div>
                                    @if(config().intro.videoUrl) {
                                        <div class="mt-2 h-32 bg-gray-900 rounded border overflow-hidden">
                                            <video [src]="config().intro.videoUrl" class="w-full h-full object-contain" controls muted></video>
                                        </div>
                                    }
                                </div>
                                
                                <!-- Settings -->
                                <div class="space-y-4">
                                    <div>
                                        <label class="form-label">Auto-skip setelah (detik)</label>
                                        <input type="number" [(ngModel)]="config().intro.duration" class="form-input" min="1">
                                    </div>
                                    <div>
                                        <label class="form-label">Efek Transisi Keluar</label>
                                        <select [(ngModel)]="config().intro.fadeOut" class="form-select">
                                            <option value="none">Tidak ada</option>
                                            <option value="fade">Fade Out</option>
                                            <option value="slide-up">Slide Up</option>
                                            <option value="slide-down">Slide Down</option>
                                            <option value="zoom-out">Zoom Out</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                      </div>

                      <!-- Navigation Bar Settings -->
                      <div class="admin-card">
                         <div class="admin-card-header">Navigation Bar Styling</div>
                         <div class="p-6 grid grid-cols-3 gap-6">
                             <div>
                                <label class="form-label">Background Color</label>
                                <div class="flex items-center gap-2">
                                   <input type="color" [(ngModel)]="config().global.navbarColor" class="h-9 w-9 border cursor-pointer p-0 rounded">
                                   <input [(ngModel)]="config().global.navbarColor" class="form-input">
                                </div>
                             </div>
                             <div>
                                <label class="form-label">Text/Link Color</label>
                                <div class="flex items-center gap-2">
                                   <input type="color" [(ngModel)]="config().global.navbarTextColor" class="h-9 w-9 border cursor-pointer p-0 rounded">
                                   <input [(ngModel)]="config().global.navbarTextColor" class="form-input">
                                </div>
                             </div>
                             <div>
                                <label class="form-label">Navbar Height</label>
                                <input [(ngModel)]="config().global.navHeight" class="form-input" placeholder="80px">
                             </div>
                             <div>
                                <label class="form-label">Logo Height in Nav</label>
                                <input [(ngModel)]="config().global.navLogoHeight" class="form-input" placeholder="50px">
                             </div>
                             <div>
                                <label class="form-label">Link Font Size</label>
                                <input [(ngModel)]="config().global.navLinkFontSize" class="form-input" placeholder="16px">
                             </div>
                             <div>
                                <label class="form-label">Link Gap (Spacing)</label>
                                <input [(ngModel)]="config().global.navLinkGap" class="form-input" placeholder="32px">
                             </div>
                         </div>
                      </div>

                      <!-- SEO & General Typography -->
                      <div class="admin-card">
                         <div class="admin-card-header">SEO & General Settings</div>
                         <div class="p-6 space-y-4">
                            <div>
                                <label class="form-label">Meta Description (SEO)</label>
                                <textarea [(ngModel)]="config().global.metaDescription" class="form-input" rows="2"></textarea>
                            </div>
                            <div>
                                <label class="form-label">Meta Keywords</label>
                                <input [(ngModel)]="config().global.metaKeywords" class="form-input" placeholder="sate, food, cimahi">
                            </div>
                            
                            <div class="grid grid-cols-3 gap-4 pt-2">
                               <div>
                                  <label class="form-label">General Font Family (Body)</label>
                                  <input [(ngModel)]="config().global.metaStyle.fontFamily" class="form-input">
                               </div>
                               <div>
                                  <label class="form-label">Scrollbar Color</label>
                                  <div class="flex items-center gap-2">
                                     <input type="color" [(ngModel)]="config().global.scrollbarColor" class="h-9 w-9 border cursor-pointer p-0 rounded">
                                     <input [(ngModel)]="config().global.scrollbarColor" class="form-input">
                                  </div>
                               </div>
                               <div>
                                  <label class="form-label">WhatsApp Floating Number</label>
                                  <input [(ngModel)]="config().global.floatingWhatsapp" class="form-input" placeholder="628123456789">
                                </div>
                            </div>

                            <div class="flex gap-8 pt-4 border-t mt-4">
                               <label class="flex items-center gap-2 cursor-pointer font-bold text-sm select-none">
                                  <input type="checkbox" [(ngModel)]="config().global.enableSmoothScroll" class="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"> 
                                  Enable Smooth Scroll
                               </label>
                               <label class="flex items-center gap-2 cursor-pointer font-bold text-sm text-red-600 select-none">
                                  <input type="checkbox" [(ngModel)]="config().global.maintenanceMode" class="w-5 h-5 text-red-600 rounded focus:ring-red-500"> 
                                  Maintenance Mode
                               </label>
                            </div>
                         </div>
                      </div>
                      
                      <!-- Advanced (CSS/JS) -->
                      <div class="admin-card">
                         <div class="admin-card-header bg-gray-700 text-white">Advanced Customization</div>
                         <div class="p-6 grid grid-cols-2 gap-4">
                            <div>
                                <label class="form-label">Custom CSS</label>
                                <textarea [(ngModel)]="config().global.customCss" class="form-input font-mono text-xs" rows="6" placeholder=".my-class { color: red; }"></textarea>
                            </div>
                            <div>
                                <label class="form-label">Custom JS</label>
                                <textarea [(ngModel)]="config().global.customJs" class="form-input font-mono text-xs" rows="6" placeholder="console.log('Hello');"></textarea>
                            </div>
                         </div>
                      </div>
                   }
                   
                   <!-- === 2. HERO SETTINGS === -->
                   @if (currentTab() === 'hero') {
                      
                      <!-- 1. Visual & Background -->
                      <div class="admin-card">
                         <div class="admin-card-header bg-gray-800 text-white">Visual & Background Layer</div>
                         <div class="p-6 space-y-6">
                            <!-- Slideshow Management -->
                            <div>
                                <label class="form-label">Background Slideshow</label>
                                <div class="p-4 border rounded-lg bg-gray-50 space-y-3">
                                    @for (slide of configService.slideshowContent(); track slide.id) {
                                        <div class="flex items-center gap-3 bg-white p-2 rounded-md shadow-sm">
                                            @if (configService.isVideo(slide.content)) {
                                                <video [src]="slide.content" class="w-16 h-10 object-cover rounded bg-black"></video>
                                            } @else {
                                                <img [src]="slide.content" class="w-16 h-10 object-cover rounded">
                                            }
                                            <span class="text-xs text-gray-500 truncate flex-1">Slide {{ $index + 1 }}</span>
                                            <button (click)="removeHeroSlide(slide.id)" class="bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs font-bold hover:bg-red-200">Hapus</button>
                                        </div>
                                    }
                                    <div class="flex items-center gap-2 pt-2">
                                        <input type="file" (change)="onHeroSlideSelected($event)" class="form-input text-xs flex-1" accept="image/*,video/*">
                                    </div>
                                    @if (config().hero.backgroundSlides.length === 0 || (config().hero.backgroundSlides.length === 1 && config().hero.backgroundSlides[0] === 'placeholder-id-1')) {
                                        <p class="text-center text-xs text-gray-500 py-4">Tidak ada slide. Silakan tambahkan satu.</p>
                                    }
                                </div>
                            </div>
                            
                            <!-- Settings -->
                            <div class="grid grid-cols-3 gap-4 border-t pt-4">
                                <div>
                                    <label class="form-label">Durasi Slide (detik)</label>
                                    <input type="number" [(ngModel)]="config().hero.slideDuration" class="form-input">
                                </div>
                                <div>
                                    <label class="form-label">Overlay Opacity (0-1)</label>
                                    <input type="number" step="0.1" min="0" max="1" [(ngModel)]="config().hero.overlayOpacity" class="form-input">
                                </div>
                                <div>
                                    <label class="form-label">Blur Level</label>
                                    <input [(ngModel)]="config().hero.blurLevel" class="form-input" placeholder="0px">
                                </div>
                            </div>

                            <!-- Layout Controls -->
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="form-label">Text Alignment</label>
                                    <select [(ngModel)]="config().hero.textAlign" class="form-select">
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Section Height</label>
                                    <input [(ngModel)]="config().hero.height" class="form-input" placeholder="95vh">
                                </div>
                                <div>
                                    <label class="form-label">BG Position</label>
                                    <input [(ngModel)]="config().hero.bgPosition" class="form-input" placeholder="center center">
                                </div>
                            </div>
                         </div>
                      </div>

                      <!-- 2. Typography & Content (Granular) -->
                      <div class="admin-card">
                         <div class="admin-card-header bg-orange-700 text-white">Typography & Texts</div>
                         <div class="p-6 space-y-6">
                            
                            <!-- Badge -->
                            <div class="bg-gray-50 p-4 rounded-lg border">
                                <span class="text-xs font-bold uppercase text-gray-400 mb-2 block">1. Badge / Top Label</span>
                                <div class="grid grid-cols-4 gap-3">
                                    <div class="col-span-2"><input [(ngModel)]="config().hero.badgeText" class="form-input" placeholder="Text"></div>
                                    <div><input [(ngModel)]="config().hero.badgeStyle.fontFamily" class="form-input" placeholder="Font Family"></div>
                                    <div><input [(ngModel)]="config().hero.badgeStyle.fontSize" class="form-input" placeholder="Size (px/rem)"></div>
                                    <div>
                                        <div class="flex items-center gap-1">
                                           <input type="color" [(ngModel)]="config().hero.badgeStyle.color" class="h-9 w-9 border p-0 cursor-pointer">
                                           <input [(ngModel)]="config().hero.badgeStyle.color" class="form-input text-xs" placeholder="Color">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Main Title -->
                            <div class="bg-gray-50 p-4 rounded-lg border">
                                <span class="text-xs font-bold uppercase text-gray-400 mb-2 block">2. Main Title</span>
                                <div class="grid grid-cols-4 gap-3">
                                    <div class="col-span-2"><textarea [(ngModel)]="config().hero.title" class="form-input" rows="2" placeholder="Main Title"></textarea></div>
                                    <div><input [(ngModel)]="config().hero.titleStyle.fontFamily" class="form-input" placeholder="Font Family"></div>
                                    <div><input [(ngModel)]="config().hero.titleStyle.fontSize" class="form-input" placeholder="Size"></div>
                                    <div>
                                        <div class="flex items-center gap-1">
                                           <input type="color" [(ngModel)]="config().hero.titleStyle.color" class="h-9 w-9 border p-0 cursor-pointer">
                                           <input [(ngModel)]="config().hero.titleStyle.color" class="form-input text-xs">
                                        </div>
                                    </div>
                                    <div class="col-span-4 mt-2">
                                        <label class="form-label">Text Shadow CSS</label>
                                        <input [(ngModel)]="config().hero.textShadow" class="form-input" placeholder="2px 2px 4px rgba(0,0,0,0.5)">
                                    </div>
                                </div>
                            </div>

                            <!-- Highlight -->
                            <div class="bg-gray-50 p-4 rounded-lg border">
                                <span class="text-xs font-bold uppercase text-gray-400 mb-2 block">3. Highlight Text</span>
                                <div class="grid grid-cols-4 gap-3">
                                    <div class="col-span-2"><input [(ngModel)]="config().hero.highlight" class="form-input" placeholder="Highlighted Word"></div>
                                    <div><input [(ngModel)]="config().hero.highlightStyle.fontFamily" class="form-input" placeholder="Font Family"></div>
                                    <div><input [(ngModel)]="config().hero.highlightStyle.fontSize" class="form-input" placeholder="Size"></div>
                                    <div>
                                        <div class="flex items-center gap-1">
                                           <input type="color" [(ngModel)]="config().hero.highlightStyle.color" class="h-9 w-9 border p-0 cursor-pointer">
                                           <input [(ngModel)]="config().hero.highlightStyle.color" class="form-input text-xs">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Subtitle -->
                            <div class="bg-gray-50 p-4 rounded-lg border">
                                <span class="text-xs font-bold uppercase text-gray-400 mb-2 block">4. Subtitle / Description</span>
                                <div class="grid grid-cols-4 gap-3">
                                    <div class="col-span-2"><textarea [(ngModel)]="config().hero.subtitle" class="form-input" rows="2"></textarea></div>
                                    <div><input [(ngModel)]="config().hero.subtitleStyle.fontFamily" class="form-input" placeholder="Font Family"></div>
                                    <div><input [(ngModel)]="config().hero.subtitleStyle.fontSize" class="form-input" placeholder="Size"></div>
                                    <div>
                                        <div class="flex items-center gap-1">
                                           <input type="color" [(ngModel)]="config().hero.subtitleStyle.color" class="h-9 w-9 border p-0 cursor-pointer">
                                           <input [(ngModel)]="config().hero.subtitleStyle.color" class="form-input text-xs">
                                        </div>
                                    </div>
                                </div>
                            </div>
                         </div>
                      </div>

                      <!-- 3. Buttons & Interaction -->
                      <div class="admin-card">
                         <div class="admin-card-header">Buttons & Interaction</div>
                         <div class="p-6 grid grid-cols-2 gap-8">
                             
                             <!-- Button 1 -->
                             <div class="space-y-3">
                                <span class="font-bold border-b block pb-1">Primary Button</span>
                                <div><label class="form-label">Text</label><input [(ngModel)]="config().hero.buttonText1" class="form-input"></div>
                                <div><label class="form-label">Link</label><input [(ngModel)]="config().hero.button1Link" class="form-input"></div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div><label class="form-label">Font</label><input [(ngModel)]="config().hero.button1Style.fontFamily" class="form-input"></div>
                                    <div><label class="form-label">Size</label><input [(ngModel)]="config().hero.button1Style.fontSize" class="form-input"></div>
                                    <div>
                                        <label class="form-label">Text Color</label>
                                        <div class="flex items-center gap-1">
                                            <input type="color" [(ngModel)]="config().hero.button1Style.color" class="h-8 w-8 p-0 border cursor-pointer">
                                            <input [(ngModel)]="config().hero.button1Style.color" class="form-input text-xs">
                                        </div>
                                    </div>
                                    <div>
                                        <label class="form-label">Background Color</label>
                                        <div class="flex items-center gap-1">
                                            <input type="color" [(ngModel)]="config().hero.style.accentColor" class="h-8 w-8 p-0 border cursor-pointer">
                                            <input [(ngModel)]="config().hero.style.accentColor" class="form-input text-xs">
                                        </div>
                                    </div>
                                </div>
                             </div>

                             <!-- Button 2 -->
                             <div class="space-y-3">
                                <span class="font-bold border-b block pb-1">Secondary Button</span>
                                <div><label class="form-label">Text</label><input [(ngModel)]="config().hero.buttonText2" class="form-input"></div>
                                <div><label class="form-label">Link</label><input [(ngModel)]="config().hero.button2Link" class="form-input"></div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div><label class="form-label">Font</label><input [(ngModel)]="config().hero.button2Style.fontFamily" class="form-input"></div>
                                    <div><label class="form-label">Size</label><input [(ngModel)]="config().hero.button2Style.fontSize" class="form-input"></div>
                                    <div>
                                        <label class="form-label">Text Color</label>
                                        <div class="flex items-center gap-1">
                                            <input type="color" [(ngModel)]="config().hero.button2Style.color" class="h-8 w-8 p-0 border cursor-pointer">
                                            <input [(ngModel)]="config().hero.button2Style.color" class="form-input text-xs">
                                        </div>
                                    </div>
                                </div>
                             </div>
                             
                             <!-- Button Layout -->
                             <div class="col-span-2 border-t pt-4 grid grid-cols-3 gap-4">
                                <div><label class="form-label">Padding X</label><input [(ngModel)]="config().hero.style.buttonPaddingX" class="form-input"></div>
                                <div><label class="form-label">Padding Y</label><input [(ngModel)]="config().hero.style.buttonPaddingY" class="form-input"></div>
                                <div><label class="form-label">Border Radius</label><input [(ngModel)]="config().hero.style.buttonRadius" class="form-input"></div>
                             </div>
                             
                             <!-- Social Proof -->
                             <div class="col-span-2 border-t pt-4">
                                <label class="form-label">Social Proof Text</label>
                                <input [(ngModel)]="config().hero.socialProofText" class="form-input" placeholder="⭐ 5/5 from Google">
                             </div>

                         </div>
                      </div>
                   }

                   <!-- === 3. ABOUT SETTINGS === -->
                   @if (currentTab() === 'about') {
                      
                      <!-- Content & Typography -->
                      <div class="admin-card">
                         <div class="admin-card-header bg-green-700 text-white">Main Content & Typography</div>
                         <div class="p-6 space-y-6">
                            
                            <!-- Title -->
                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                                <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Section Title</div>
                                <div class="col-span-2"><label class="form-label">Text</label><input [(ngModel)]="config().about.title" class="form-input"></div>
                                <div><label class="form-label">Font Family</label><input [(ngModel)]="config().about.titleStyle.fontFamily" class="form-input"></div>
                                <div><label class="form-label">Size</label><input [(ngModel)]="config().about.titleStyle.fontSize" class="form-input"></div>
                                <div class="col-span-4"><label class="form-label">Color</label>
                                   <div class="flex gap-2">
                                     <input type="color" [(ngModel)]="config().about.titleStyle.color" class="h-9 w-9 border cursor-pointer p-0">
                                     <input [(ngModel)]="config().about.titleStyle.color" class="form-input">
                                   </div>
                                </div>
                            </div>

                            <!-- Description -->
                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                                <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Description</div>
                                <div class="col-span-2"><label class="form-label">Text</label><textarea [(ngModel)]="config().about.description" class="form-input" rows="4"></textarea></div>
                                <div><label class="form-label">Font Family</label><input [(ngModel)]="config().about.descriptionStyle.fontFamily" class="form-input"></div>
                                <div><label class="form-label">Size</label><input [(ngModel)]="config().about.descriptionStyle.fontSize" class="form-input"></div>
                                <div class="col-span-4"><label class="form-label">Color</label>
                                   <div class="flex gap-2">
                                     <input type="color" [(ngModel)]="config().about.descriptionStyle.color" class="h-9 w-9 border cursor-pointer p-0">
                                     <input [(ngModel)]="config().about.descriptionStyle.color" class="form-input">
                                   </div>
                                </div>
                            </div>

                            <!-- Quote & CTA -->
                            <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
                                <div class="col-span-2 space-y-3">
                                    <div>
                                        <label class="form-label">Quote Text</label>
                                        <textarea [(ngModel)]="config().about.quote" class="form-input" rows="2"></textarea>
                                    </div>
                                    <div>
                                        <label class="form-label">Quote Text Color</label>
                                        <div class="flex gap-2">
                                        <input type="color" [(ngModel)]="config().about.quoteStyle.color" class="h-9 w-9 border cursor-pointer p-0">
                                        <input [(ngModel)]="config().about.quoteStyle.color" class="form-input">
                                        </div>
                                    </div>
                                </div>

                                <div class="space-y-3">
                                    <label class="form-label">Founder Name</label>
                                    <input [(ngModel)]="config().about.founderName" class="form-input">
                                </div>
                                <div class="space-y-3">
                                    <label class="form-label">Founder Name Color</label>
                                    <div class="flex gap-2">
                                    <input type="color" [(ngModel)]="config().about.founderNameStyle.color" class="h-9 w-9 border cursor-pointer p-0">
                                    <input [(ngModel)]="config().about.founderNameStyle.color" class="form-input">
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
                                <div class="col-span-2 font-bold text-xs uppercase text-gray-400">CTA Button</div>
                                <div>
                                    <label class="form-label">CTA Text</label>
                                    <input [(ngModel)]="config().about.ctaText" class="form-input">
                                </div>
                                <div>
                                    <label class="form-label">CTA Link</label>
                                    <input [(ngModel)]="config().about.ctaLink" class="form-input">
                                </div>
                                <div>
                                    <label class="form-label">Background Color</label>
                                    <div class="flex gap-2">
                                        <input type="color" [(ngModel)]="config().about.ctaStyle.backgroundColor" class="h-9 w-9 border cursor-pointer p-0">
                                        <input [(ngModel)]="config().about.ctaStyle.backgroundColor" class="form-input">
                                    </div>
                                </div>
                                <div>
                                    <label class="form-label">Text Color</label>
                                    <div class="flex gap-2">
                                        <input type="color" [(ngModel)]="config().about.ctaStyle.color" class="h-9 w-9 border cursor-pointer p-0">
                                        <input [(ngModel)]="config().about.ctaStyle.color" class="form-input">
                                    </div>
                                </div>
                            </div>
                         </div>
                      </div>

                      <!-- Visuals & Layout -->
                      <div class="admin-card">
                         <div class="admin-card-header">Visuals & Layout</div>
                         <div class="p-6 grid grid-cols-2 gap-6">
                            
                            <!-- Colors & Spacing -->
                            <div class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                       <label class="form-label">Background Color</label>
                                       <div class="flex gap-2"><input type="color" [(ngModel)]="config().about.style.backgroundColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().about.style.backgroundColor" class="form-input"></div>
                                    </div>
                                    <div>
                                       <label class="form-label">Text Color</label>
                                       <div class="flex gap-2"><input type="color" [(ngModel)]="config().about.style.textColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().about.style.textColor" class="form-input"></div>
                                    </div>
                                    <div>
                                       <label class="form-label">Accent Color</label>
                                       <div class="flex gap-2"><input type="color" [(ngModel)]="config().about.style.accentColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().about.style.accentColor" class="form-input"></div>
                                    </div>
                                    <div>
                                       <label class="form-label">Section Padding Y</label>
                                       <input [(ngModel)]="config().about.style.sectionPaddingY" class="form-input">
                                    </div>
                                </div>
                                
                                <div class="flex gap-4 pt-2">
                                   <label class="flex items-center gap-2 text-sm font-bold text-gray-600"><input type="checkbox" [(ngModel)]="config().about.showPattern"> Show Pattern</label>
                                   <label class="flex items-center gap-2 text-sm font-bold text-gray-600"><input type="checkbox" [(ngModel)]="config().about.enableGlassEffect"> Glass Effect</label>
                                </div>
                            </div>

                            <!-- Media Slideshow -->
                            <div>
                                <label class="form-label">Section Media (Slideshow)</label>
                                <div class="p-4 border rounded-lg bg-gray-50 space-y-3">
                                    @for (slide of config().about.mediaSlides; track $index) {
                                        <div class="flex items-center gap-3 bg-white p-2 rounded-md shadow-sm">
                                            @if (configService.isVideo(slide)) {
                                                <video [src]="slide" class="w-16 h-10 object-cover rounded bg-black" muted playsinline></video>
                                            } @else {
                                                <img [src]="slide" class="w-16 h-10 object-cover rounded">
                                            }
                                            <span class="text-xs text-gray-500 truncate flex-1">Slide {{ $index + 1 }}</span>
                                            <button (click)="removeAboutSlide($index)" class="bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs font-bold hover:bg-red-200">Hapus</button>
                                        </div>
                                    }
                                    <div class="flex items-center gap-2 pt-2">
                                        <input type="file" (change)="onAboutSlideSelected($event)" class="form-input text-xs flex-1" accept="image/*,video/*">
                                    </div>
                                </div>
                                <div class="mt-2 grid grid-cols-2 gap-2">
                                  <div><label class="form-label">Media Position</label>
                                     <select [(ngModel)]="config().about.imagePosition" class="form-select">
                                        <option value="left">Left</option>
                                        <option value="right">Right</option>
                                     </select>
                                  </div>
                                  <div><label class="form-label">Container Radius</label><input [(ngModel)]="config().about.style.borderRadius" class="form-input"></div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <!-- Stats & Logos -->
                      <div class="admin-card">
                         <div class="admin-card-header">Statistics & Trusted Logos</div>
                         <div class="p-6 space-y-6">
                            
                            <!-- Stats Styling -->
                            <div class="grid grid-cols-4 gap-4">
                               <div><label class="form-label">Number Font</label><input [(ngModel)]="config().about.statsStyle.fontFamily" class="form-input"></div>
                               <div><label class="form-label">Number Size</label><input [(ngModel)]="config().about.statsStyle.fontSize" class="form-input"></div>
                               <div><label class="form-label">Number Color</label>
                                   <div class="flex gap-2"><input type="color" [(ngModel)]="config().about.statsStyle.color" class="h-8 w-8 p-0 border"><input [(ngModel)]="config().about.statsStyle.color" class="form-input"></div>
                               </div>
                               <div><label class="form-label">Label Color</label>
                                   <div class="flex gap-2"><input type="color" [(ngModel)]="config().about.statsLabelStyle.color" class="h-8 w-8 p-0 border"><input [(ngModel)]="config().about.statsLabelStyle.color" class="form-input"></div>
                               </div>
                            </div>

                            <!-- Stats Values -->
                            <div class="grid grid-cols-3 gap-4 border-t pt-4">
                               <div><label class="form-label">Stat 1 Value</label><input [(ngModel)]="config().about.stats.val1" class="form-input"></div>
                               <div><label class="form-label">Stat 2 Value</label><input [(ngModel)]="config().about.stats.val2" class="form-input"></div>
                               <div><label class="form-label">Stat 3 Value</label><input [(ngModel)]="config().about.stats.val3" class="form-input"></div>
                               
                               <div><label class="form-label">Stat 1 Label</label><input [(ngModel)]="config().about.stats.label1" class="form-input"></div>
                               <div><label class="form-label">Stat 2 Label</label><input [(ngModel)]="config().about.stats.label2" class="form-input"></div>
                               <div><label class="form-label">Stat 3 Label</label><input [(ngModel)]="config().about.stats.label3" class="form-input"></div>
                            </div>

                            <!-- Logos -->
                            <div class="border-t pt-4">
                               <label class="form-label mb-2">Trusted/Featured Logos (URL)</label>
                               <div class="space-y-2">
                                  @for (logo of config().about.trustedLogos; track $index) {
                                     <div class="flex gap-2">
                                        <input [(ngModel)]="config().about.trustedLogos[$index]" class="form-input">
                                        <button (click)="removeLogo($index)" class="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200">✕</button>
                                     </div>
                                  }
                                  <button (click)="addLogo()" class="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded hover:bg-blue-100">+ Add Logo URL</button>
                               </div>
                            </div>
                         </div>
                      </div>
                   }

                   <!-- === 4. MENU SETTINGS === -->
                   @if (currentTab() === 'menu') {
                      
                      <!-- Header & General -->
                      <div class="admin-card">
                         <div class="admin-card-header bg-gray-900 text-white">Menu Header & General</div>
                         <div class="p-6 space-y-6">
                            <!-- Page Titles -->
                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                               <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Page Title</div>
                               <div class="col-span-2"><label class="form-label">Title Text</label><input [(ngModel)]="config().menuPage.title" class="form-input"></div>
                               <div><label class="form-label">Font Family</label><input [(ngModel)]="config().menuPage.titleStyle.fontFamily" class="form-input"></div>
                               <div><label class="form-label">Font Size</label><input [(ngModel)]="config().menuPage.titleStyle.fontSize" class="form-input"></div>
                               <div class="col-span-4 mt-2">
                                   <label class="form-label">Title Color</label>
                                   <div class="flex gap-2"><input type="color" [(ngModel)]="config().menuPage.titleStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().menuPage.titleStyle.color" class="form-input"></div>
                               </div>
                            </div>

                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                               <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Page Subtitle</div>
                               <div class="col-span-2"><label class="form-label">Subtitle Text</label><textarea [(ngModel)]="config().menuPage.subtitle" class="form-input" rows="2"></textarea></div>
                               <div><label class="form-label">Font Family</label><input [(ngModel)]="config().menuPage.subtitleStyle.fontFamily" class="form-input"></div>
                               <div><label class="form-label">Font Size</label><input [(ngModel)]="config().menuPage.subtitleStyle.fontSize" class="form-input"></div>
                               <div class="col-span-4 mt-2">
                                   <label class="form-label">Subtitle Color</label>
                                   <div class="flex gap-2"><input type="color" [(ngModel)]="config().menuPage.subtitleStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().menuPage.subtitleStyle.color" class="form-input"></div>
                               </div>
                            </div>

                            <!-- Page Styling -->
                            <div class="border-t pt-4">
                               <div class="grid grid-cols-3 gap-4">
                                  <div>
                                     <label class="form-label">Background Color</label>
                                     <div class="flex gap-2"><input type="color" [(ngModel)]="config().menuPage.style.backgroundColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().menuPage.style.backgroundColor" class="form-input"></div>
                                  </div>
                                  <div>
                                     <label class="form-label">Text Color</label>
                                     <div class="flex gap-2"><input type="color" [(ngModel)]="config().menuPage.style.textColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().menuPage.style.textColor" class="form-input"></div>
                                  </div>
                                  <div>
                                     <label class="form-label">Accent Color (Buttons/Active)</label>
                                     <div class="flex gap-2"><input type="color" [(ngModel)]="config().menuPage.style.accentColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().menuPage.style.accentColor" class="form-input"></div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <!-- Menu Management -->
                      <div class="admin-card">
                        <div class="admin-card-header bg-orange-800 text-white">Kelola Item Menu</div>
                        <div class="p-6 space-y-6">
                            <!-- Branch Selector -->
                            <div>
                               <label class="form-label">Pilih Cabang untuk Dikelola:</label>
                               <select [(ngModel)]="selectedMenuBranchIndex" class="form-select">
                                  @for (branch of config().branches; track $index) {
                                     <option [value]="$index">{{ branch.name }}</option>
                                  }
                               </select>
                            </div>
                            
                            <!-- Add Button & List -->
                            <div class="border-t pt-4">
                               <button (click)="openMenuModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">+ Tambah Menu Baru</button>
                               
                               <!-- Menu Table -->
                               <div class="overflow-x-auto bg-white rounded-lg border">
                                   <table class="w-full text-sm text-left text-gray-500">
                                       <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                                           <tr>
                                               <th scope="col" class="px-6 py-3">Nama</th>
                                               <th scope="col" class="px-6 py-3">Harga</th>
                                               <th scope="col" class="px-6 py-3">Kategori</th>
                                               <th scope="col" class="px-6 py-3 text-center">Status</th>
                                               <th scope="col" class="px-6 py-3 text-right">Aksi</th>
                                           </tr>
                                       </thead>
                                       <tbody>
                                          @if(selectedBranchMenuItems().length > 0) {
                                            @for (item of selectedBranchMenuItems(); track item.id) {
                                                <tr class="bg-white border-b hover:bg-gray-50">
                                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center gap-3">
                                                        <div class="w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                                                            <img [src]="item.image" class="w-full h-full object-cover">
                                                        </div>
                                                        {{ item.name }}
                                                    </th>
                                                    <td class="px-6 py-4">{{ item.price }}</td>
                                                    <td class="px-6 py-4">{{ item.category }}</td>
                                                    <td class="px-6 py-4 text-center">
                                                        @if(item.soldOut) { <span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Habis</span> }
                                                        @if(item.favorite) { <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Favorit</span> }
                                                    </td>
                                                    <td class="px-6 py-4 text-right">
                                                        <button (click)="openMenuModal(item)" class="font-medium text-blue-600 hover:underline mr-4">Edit</button>
                                                        <button (click)="deleteMenuItem(item)" class="font-medium text-red-600 hover:underline">Hapus</button>
                                                    </td>
                                                </tr>
                                            }
                                          } @else {
                                             <tr><td colspan="5" class="text-center p-8 text-gray-400">Belum ada menu di cabang ini.</td></tr>
                                          }
                                       </tbody>
                                   </table>
                               </div>
                            </div>
                        </div>
                      </div>

                      <!-- Grid & Card Styling -->
                      <div class="admin-card">
                         <div class="admin-card-header">Layout, Grid & Cards</div>
                         <div class="p-6 grid grid-cols-3 gap-6">
                            <div>
                               <label class="form-label">Grid Gap (e.g. 24px, 1rem)</label>
                               <input [(ngModel)]="config().menuPage.gridGap" class="form-input">
                            </div>
                            <div>
                               <label class="form-label">Card Border Radius</label>
                               <input [(ngModel)]="config().menuPage.cardBorderRadius" class="form-input">
                            </div>
                            <div>
                               <label class="form-label">Image Height (e.g. 200px, 100%)</label>
                               <input [(ngModel)]="config().menuPage.cardImageHeight" class="form-input" placeholder="100% or 250px">
                            </div>
                         </div>
                      </div>

                      <!-- Item Typography -->
                      <div class="admin-card">
                         <div class="admin-card-header">Item Typography</div>
                         <div class="p-6 grid grid-cols-2 gap-6">
                            <div>
                               <label class="form-label">Item Title Font Size</label>
                               <input [(ngModel)]="config().menuPage.itemTitleSize" class="form-input" placeholder="1.125rem">
                            </div>
                            <div>
                               <label class="form-label">Item Price Font Size</label>
                               <input [(ngModel)]="config().menuPage.itemPriceSize" class="form-input" placeholder="0.875rem">
                            </div>
                         </div>
                      </div>
                   }
                   
                   <!-- === 5. PACKAGES SETTINGS === -->
                   @if (currentTab() === 'packages') {
                      
                      <!-- Header & General -->
                      <div class="admin-card">
                         <div class="admin-card-header bg-orange-800 text-white">Packages Header & Colors</div>
                         <div class="p-6 space-y-6">
                            
                            <!-- Page Titles -->
                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                               <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Page Title</div>
                               <div class="col-span-2"><label class="form-label">Title Text</label><input [(ngModel)]="config().packagesPage.title" class="form-input"></div>
                               <div><label class="form-label">Font Family</label><input [(ngModel)]="config().packagesPage.titleStyle.fontFamily" class="form-input"></div>
                               <div><label class="form-label">Font Size</label><input [(ngModel)]="config().packagesPage.titleStyle.fontSize" class="form-input"></div>
                               <div class="col-span-4 mt-2">
                                   <label class="form-label">Title Color</label>
                                   <div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.titleStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().packagesPage.titleStyle.color" class="form-input"></div>
                               </div>
                            </div>

                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                               <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Page Subtitle</div>
                               <div class="col-span-2"><label class="form-label">Subtitle Text</label><textarea [(ngModel)]="config().packagesPage.subtitle" class="form-input" rows="2"></textarea></div>
                               <div><label class="form-label">Font Family</label><input [(ngModel)]="config().packagesPage.subtitleStyle.fontFamily" class="form-input"></div>
                               <div><label class="form-label">Font Size</label><input [(ngModel)]="config().packagesPage.subtitleStyle.fontSize" class="form-input"></div>
                               <div class="col-span-4 mt-2">
                                   <label class="form-label">Subtitle Color</label>
                                   <div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.subtitleStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().packagesPage.subtitleStyle.color" class="form-input"></div>
                               </div>
                            </div>

                            <!-- Page Styling -->
                            <div class="border-t pt-4">
                               <div class="grid grid-cols-3 gap-4">
                                  <div>
                                     <label class="form-label">Background Color</label>
                                     <div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.style.backgroundColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().packagesPage.style.backgroundColor" class="form-input"></div>
                                  </div>
                                  <div>
                                     <label class="form-label">Text Color</label>
                                     <div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.style.textColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().packagesPage.style.textColor" class="form-input"></div>
                                  </div>
                                  <div>
                                     <label class="form-label">Accent Color (Buttons)</label>
                                     <div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.style.accentColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().packagesPage.style.accentColor" class="form-input"></div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <!-- Card & Content Styling -->
                      <div class="admin-card">
                         <div class="admin-card-header">Package Cards Design</div>
                         <div class="p-6 space-y-6">
                            <div class="grid grid-cols-3 gap-6">
                               <div>
                                  <label class="form-label">Card Background</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.cardBackgroundColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().packagesPage.cardBackgroundColor" class="form-input"></div>
                               </div>
                               <div>
                                  <label class="form-label">Card Text Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.cardTextColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().packagesPage.cardTextColor" class="form-input"></div>
                               </div>
                               <div>
                                  <label class="form-label">Card Radius</label>
                                  <input [(ngModel)]="config().packagesPage.cardBorderRadius" class="form-input" placeholder="16px">
                               </div>
                            </div>

                            <div class="grid grid-cols-3 gap-6 border-t pt-6">
                               <div>
                                  <label class="form-label">Price Tag Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.priceColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().packagesPage.priceColor" class="form-input"></div>
                               </div>
                               <div>
                                  <label class="form-label">Price Font Size</label>
                                  <input [(ngModel)]="config().packagesPage.priceFontSize" class="form-input" placeholder="1rem">
                               </div>
                               <div>
                                  <label class="form-label">Action Button Text</label>
                                  <input [(ngModel)]="config().packagesPage.buttonText" class="form-input" placeholder="Pesan Sekarang">
                               </div>
                            </div>
                            
                            <div class="border-t pt-6">
                                <label class="form-label">"Isi Paket" Header Text</label>
                                <input [(ngModel)]="config().packagesPage.itemsHeaderText" class="form-input" placeholder="Isi Paket:">
                            </div>
                         </div>
                      </div>

                       <!-- Package Management -->
                       <div class="admin-card">
                        <div class="admin-card-header bg-teal-800 text-white">Kelola Item Paket</div>
                        <div class="p-6 space-y-6">
                            <!-- Branch Selector -->
                            <div>
                               <label class="form-label">Pilih Cabang untuk Dikelola:</label>
                               <select [(ngModel)]="selectedPackageBranchIndex" class="form-select">
                                  @for (branch of config().branches; track $index) {
                                     <option [value]="$index">{{ branch.name }}</option>
                                  }
                               </select>
                            </div>
                            
                            <!-- Add Button & List -->
                            <div class="border-t pt-4">
                               <button (click)="openPackageModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">+ Tambah Paket Baru</button>
                               
                               <!-- Package Table -->
                               <div class="overflow-x-auto bg-white rounded-lg border">
                                   <table class="w-full text-sm text-left text-gray-500">
                                       <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                                           <tr>
                                               <th scope="col" class="px-6 py-3">Nama Paket</th>
                                               <th scope="col" class="px-6 py-3">Harga</th>
                                               <th scope="col" class="px-6 py-3">Deskripsi</th>
                                               <th scope="col" class="px-6 py-3 text-right">Aksi</th>
                                           </tr>
                                       </thead>
                                       <tbody>
                                          @if(config().branches[selectedPackageBranchIndex()]?.packages?.length > 0) {
                                            @for (pkg of config().branches[selectedPackageBranchIndex()].packages; track $index) {
                                                <tr class="bg-white border-b hover:bg-gray-50">
                                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center gap-3">
                                                        <div class="w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                                                            <img [src]="pkg.image" class="w-full h-full object-cover">
                                                        </div>
                                                        {{ pkg.name }}
                                                    </th>
                                                    <td class="px-6 py-4">{{ pkg.price }}</td>
                                                    <td class="px-6 py-4 line-clamp-2">{{ pkg.description }}</td>
                                                    <td class="px-6 py-4 text-right">
                                                        <button (click)="openPackageModal(pkg, $index)" class="font-medium text-blue-600 hover:underline mr-4">Edit</button>
                                                        <button (click)="deletePackageItem($index)" class="font-medium text-red-600 hover:underline">Hapus</button>
                                                    </td>
                                                </tr>
                                            }
                                          } @else {
                                             <tr><td colspan="4" class="text-center p-8 text-gray-400">Belum ada paket di cabang ini.</td></tr>
                                          }
                                       </tbody>
                                   </table>
                               </div>
                            </div>
                        </div>
                      </div>
                   }
                   
                   <!-- === 6. RESERVATION SETTINGS === -->
                   @if (currentTab() === 'reservation') {
                      
                      <!-- Header Text & Fonts -->
                      <div class="admin-card">
                         <div class="admin-card-header bg-teal-800 text-white">Header & Typography</div>
                         <div class="p-6 space-y-6">
                            
                            <!-- Title -->
                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                               <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Section Title</div>
                               <div class="col-span-2"><label class="form-label">Title Text</label><input [(ngModel)]="config().reservation.title" class="form-input"></div>
                               <div><label class="form-label">Font Family</label><input [(ngModel)]="config().reservation.titleStyle.fontFamily" class="form-input"></div>
                               <div><label class="form-label">Size</label><input [(ngModel)]="config().reservation.titleStyle.fontSize" class="form-input"></div>
                               <div class="col-span-4 mt-2">
                                   <label class="form-label">Color</label>
                                   <div class="flex gap-2"><input type="color" [(ngModel)]="config().reservation.titleStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().reservation.titleStyle.color" class="form-input"></div>
                               </div>
                            </div>

                            <!-- Subtitle -->
                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                               <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Subtitle</div>
                               <div class="col-span-2"><label class="form-label">Text</label><textarea [(ngModel)]="config().reservation.subtitle" class="form-input" rows="2"></textarea></div>
                               <div><label class="form-label">Font Family</label><input [(ngModel)]="config().reservation.subtitleStyle.fontFamily" class="form-input"></div>
                               <div><label class="form-label">Size</label><input [(ngModel)]="config().reservation.subtitleStyle.fontSize" class="form-input"></div>
                               <div class="col-span-4 mt-2">
                                   <label class="form-label">Color</label>
                                   <div class="flex gap-2"><input type="color" [(ngModel)]="config().reservation.subtitleStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().reservation.subtitleStyle.color" class="form-input"></div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <!-- Page & Card Styling -->
                      <div class="admin-card">
                         <div class="admin-card-header">Page & Card Styling</div>
                         <div class="p-6 grid grid-cols-2 gap-8">
                            
                            <!-- Page Background -->
                            <div class="space-y-3">
                               <span class="font-bold border-b block pb-1">Page Background</span>
                               <div>
                                  <label class="form-label">Background Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().reservation.style.backgroundColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().reservation.style.backgroundColor" class="form-input"></div>
                               </div>
                               <div>
                                  <label class="form-label">Page Text Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().reservation.style.textColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().reservation.style.textColor" class="form-input"></div>
                               </div>
                               <div>
                                  <label class="form-label">Padding Y</label>
                                  <input [(ngModel)]="config().reservation.style.sectionPaddingY" class="form-input">
                               </div>
                            </div>

                            <!-- Card Styling -->
                            <div class="space-y-3">
                               <span class="font-bold border-b block pb-1">Card / Container</span>
                               <div>
                                  <label class="form-label">Card Background</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().reservation.cardBackgroundColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().reservation.cardBackgroundColor" class="form-input"></div>
                               </div>
                               <div>
                                  <label class="form-label">Card Text Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().reservation.cardTextColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().reservation.cardTextColor" class="form-input"></div>
                               </div>
                               <div>
                                  <label class="form-label">Card Border Radius</label>
                                  <input [(ngModel)]="config().reservation.cardBorderRadius" class="form-input">
                               </div>
                            </div>

                            <!-- Accent Color -->
                            <div class="col-span-2 border-t pt-4">
                               <label class="form-label">Accent Color (Highlights/Active)</label>
                               <div class="flex gap-2"><input type="color" [(ngModel)]="config().reservation.style.accentColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().reservation.style.accentColor" class="form-input"></div>
                            </div>
                         </div>
                      </div>

                      <!-- Form Elements Styling (Granular) -->
                      <div class="admin-card">
                         <div class="admin-card-header bg-gray-700 text-white">Form Elements (Granular Control)</div>
                         <div class="p-6 space-y-6">
                            
                            <!-- Input Fields -->
                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                               <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Input Fields</div>
                               <div><label class="form-label">Height</label><input [(ngModel)]="config().reservation.inputHeight" class="form-input"></div>
                               <div><label class="form-label">Border Radius</label><input [(ngModel)]="config().reservation.inputBorderRadius" class="form-input"></div>
                               <div><label class="form-label">Font Family</label><input [(ngModel)]="config().reservation.inputStyle.fontFamily" class="form-input"></div>
                               <div><label class="form-label">Font Size</label><input [(ngModel)]="config().reservation.inputStyle.fontSize" class="form-input"></div>
                               <div class="col-span-4"><label class="form-label">Text Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().reservation.inputStyle.color" class="h-8 w-8 p-0 border"><input [(ngModel)]="config().reservation.inputStyle.color" class="form-input"></div>
                               </div>
                            </div>

                            <!-- Labels -->
                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                               <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Input Labels</div>
                               <div class="col-span-2"><label class="form-label">Font Family</label><input [(ngModel)]="config().reservation.labelStyle.fontFamily" class="form-input"></div>
                               <div><label class="form-label">Font Size</label><input [(ngModel)]="config().reservation.labelStyle.fontSize" class="form-input"></div>
                               <div><label class="form-label">Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().reservation.labelStyle.color" class="h-8 w-8 p-0 border"><input [(ngModel)]="config().reservation.labelStyle.color" class="form-input"></div>
                               </div>
                            </div>

                            <!-- Submit Button -->
                            <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
                               <div class="col-span-2 font-bold text-xs uppercase text-gray-400">Action Button</div>
                               <div><label class="form-label">Button Height</label><input [(ngModel)]="config().reservation.buttonHeight" class="form-input"></div>
                            </div>

                            <!-- Summary Text -->
                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                               <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Total / Summary Text</div>
                               <div class="col-span-2"><label class="form-label">Font Family</label><input [(ngModel)]="config().reservation.summaryStyle.fontFamily" class="form-input"></div>
                               <div><label class="form-label">Size</label><input [(ngModel)]="config().reservation.summaryStyle.fontSize" class="form-input"></div>
                               <div><label class="form-label">Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().reservation.summaryStyle.color" class="h-8 w-8 p-0 border"><input [(ngModel)]="config().reservation.summaryStyle.color" class="form-input"></div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <!-- Operational Settings (Per Branch) -->
                      <div class="admin-card">
                         <div class="admin-card-header">Operational Settings</div>
                         @if (config().branches.length > 0) {
                            <div class="p-6 border-b">
                               <label class="form-label">Edit Pengaturan untuk Cabang:</label>
                               <select [(ngModel)]="selectedReservationBranchIndex" class="form-select">
                                  @for (branch of config().branches; track $index) {
                                     <option [value]="$index">{{ branch.name }}</option>
                                  }
                               </select>
                            </div>
                            
                            <div class="p-6 space-y-6">
                               <div class="grid grid-cols-3 gap-4">
                                  <div><label class="form-label">Min Pax (Regular)</label><input type="number" [(ngModel)]="config().branches[selectedReservationBranchIndex()].minPaxRegular" class="form-input"></div>
                                  <div><label class="form-label">Min Pax (Ramadan)</label><input type="number" [(ngModel)]="config().branches[selectedReservationBranchIndex()].minPaxRamadan" class="form-input"></div>
                                  <div><label class="form-label">Max Capacity</label><input type="number" [(ngModel)]="config().branches[selectedReservationBranchIndex()].maxPax" class="form-input"></div>
                               </div>
                               
                               <div class="grid grid-cols-3 gap-4 border-t pt-4">
                                  <div><label class="form-label">Booking Lead Time (Hours)</label><input type="number" [(ngModel)]="config().branches[selectedReservationBranchIndex()].bookingLeadTimeHours" class="form-input"></div>
                                  <div><label class="form-label">DP Percentage (%)</label><input type="number" [(ngModel)]="config().branches[selectedReservationBranchIndex()].downPaymentPercentage" class="form-input"></div>
                               </div>

                               <div class="flex gap-6 border-t pt-4">
                                  <label class="flex items-center gap-2 cursor-pointer font-bold text-sm"><input type="checkbox" [(ngModel)]="config().branches[selectedReservationBranchIndex()].enableSpecialRequest"> Enable Special Request</label>
                                  <label class="flex items-center gap-2 cursor-pointer font-bold text-sm"><input type="checkbox" [(ngModel)]="config().branches[selectedReservationBranchIndex()].requireEmail"> Require Email</label>
                                  <label class="flex items-center gap-2 cursor-pointer font-bold text-sm"><input type="checkbox" [(ngModel)]="config().branches[selectedReservationBranchIndex()].enableDownPaymentCalc"> Show DP Calculator</label>
                               </div>

                               <!-- Table Types -->
                               <div class="bg-gray-50 p-4 rounded border">
                                  <label class="form-label mb-2">Table / Area Types</label>
                                  <div class="space-y-2">
                                     @for (type of config().branches[selectedReservationBranchIndex()].tableTypes; track $index) {
                                        <div class="flex gap-2">
                                           <input [(ngModel)]="config().branches[selectedReservationBranchIndex()].tableTypes[$index]" class="form-input">
                                           <button (click)="removeTableType($index)" class="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200">✕</button>
                                        </div>
                                     }
                                     <button (click)="addTableType()" class="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded hover:bg-blue-100">+ Add Area Type</button>
                                  </div>
                               </div>
                            </div>
                         } @else {
                            <div class="p-6 text-center text-gray-500">Buat cabang terlebih dahulu.</div>
                         }
                      </div>

                      <!-- Terms & Messaging (Per Cabang) -->
                      <div class="admin-card">
                         <div class="admin-card-header">Terms & Messaging (Per Cabang)</div>
                         @if (config().branches.length > 0) {
                            <div class="p-6 border-b">
                               <label class="form-label">Edit Pengaturan untuk Cabang:</label>
                               <select [(ngModel)]="selectedReservationBranchIndex" class="form-select">
                                  @for (branch of config().branches; track $index) {
                                     <option [value]="$index">{{ branch.name }}</option>
                                  }
                               </select>
                            </div>
                            <div class="p-6 space-y-4">
                               <div>
                                   <label class="form-label">Nomor WhatsApp Reservasi Cabang</label>
                                   <input [(ngModel)]="config().branches[selectedReservationBranchIndex()].whatsappNumber" class="form-input" placeholder="e.g., 628123456789">
                               </div>
                               <div class="border-t pt-4">
                                   <label class="form-label">Terms & Conditions (Newline for bullet points)</label>
                                   <textarea [(ngModel)]="config().branches[selectedReservationBranchIndex()].termsAndConditions" class="form-input" rows="4"></textarea>
                               </div>
                               <div class="border-t pt-4">
                                   <label class="form-label">WhatsApp Template</label>
                                   <p class="text-[10px] text-gray-500 mb-1">Variables: {{ '{name}, {contact}, {date}, {time}, {pax}, {branch}, {tableType}, {notes}' }}</p>
                                   <textarea [(ngModel)]="config().branches[selectedReservationBranchIndex()].whatsappTemplate" class="form-input font-mono text-xs" rows="6"></textarea>
                               </div>
                            </div>
                         } @else {
                            <div class="p-6 text-center text-gray-500">Buat cabang terlebih dahulu.</div>
                         }
                      </div>
                   }

                   <!-- === 7. LOCATION SETTINGS === -->
                   @if (currentTab() === 'location') {
                      <!-- Header Text & Fonts -->
                      <div class="admin-card">
                          <div class="admin-card-header bg-purple-800 text-white">Header & Typography</div>
                          <div class="p-6 space-y-6">
                              <!-- Title -->
                              <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                                  <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Section Title</div>
                                  <div class="col-span-2"><label class="form-label">Title Text</label><input [(ngModel)]="config().locationPage.title" class="form-input"></div>
                                  <div><label class="form-label">Font Family</label><input [(ngModel)]="config().locationPage.titleStyle.fontFamily" class="form-input"></div>
                                  <div><label class="form-label">Size</label><input [(ngModel)]="config().locationPage.titleStyle.fontSize" class="form-input"></div>
                                  <div class="col-span-4 mt-2">
                                      <label class="form-label">Color</label>
                                      <div class="flex gap-2"><input type="color" [(ngModel)]="config().locationPage.titleStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().locationPage.titleStyle.color" class="form-input"></div>
                                  </div>
                              </div>

                              <!-- Subtitle -->
                              <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                                  <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Subtitle</div>
                                  <div class="col-span-2"><label class="form-label">Text</label><textarea [(ngModel)]="config().locationPage.subtitle" class="form-input" rows="2"></textarea></div>
                                  <div><label class="form-label">Font Family</label><input [(ngModel)]="config().locationPage.subtitleStyle.fontFamily" class="form-input"></div>
                                  <div><label class="form-label">Size</label><input [(ngModel)]="config().locationPage.subtitleStyle.fontSize" class="form-input"></div>
                                  <div class="col-span-4 mt-2">
                                      <label class="form-label">Color</label>
                                      <div class="flex gap-2"><input type="color" [(ngModel)]="config().locationPage.subtitleStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().locationPage.subtitleStyle.color" class="form-input"></div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Page & Card Styling -->
                      <div class="admin-card">
                          <div class="admin-card-header">Page & Card Styling</div>
                          <div class="p-6 grid grid-cols-3 gap-6">
                              <div>
                                  <label class="form-label">Background Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().locationPage.style.backgroundColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().locationPage.style.backgroundColor" class="form-input"></div>
                              </div>
                              <div>
                                  <label class="form-label">Page Text Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().locationPage.style.textColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().locationPage.style.textColor" class="form-input"></div>
                              </div>
                              <div>
                                  <label class="form-label">Accent Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().locationPage.style.accentColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().locationPage.style.accentColor" class="form-input"></div>
                              </div>
                              <div>
                                  <label class="form-label">Section Padding Y</label>
                                  <input [(ngModel)]="config().locationPage.style.sectionPaddingY" class="form-input">
                              </div>
                              <div>
                                  <label class="form-label">Card Border Radius</label>
                                  <input [(ngModel)]="config().locationPage.cardBorderRadius" class="form-input">
                              </div>
                              <div>
                                  <label class="form-label">Map Image Height</label>
                                  <input [(ngModel)]="config().locationPage.mapHeight" class="form-input">
                              </div>
                          </div>
                      </div>
                      
                      <!-- Granular Typography -->
                      <div class="admin-card">
                          <div class="admin-card-header bg-gray-700 text-white">Granular Typography</div>
                          <div class="p-6 space-y-6">
                              <!-- Label -->
                              <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                                  <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Top Label ("Temukan Kami")</div>
                                  <div class="col-span-2"><label class="form-label">Font Family</label><input [(ngModel)]="config().locationPage.labelStyle.fontFamily" class="form-input"></div>
                                  <div><label class="form-label">Font Size</label><input [(ngModel)]="config().locationPage.labelStyle.fontSize" class="form-input"></div>
                                  <div><label class="form-label">Color</label>
                                      <div class="flex gap-2"><input type="color" [(ngModel)]="config().locationPage.labelStyle.color" class="h-8 w-8 p-0 border"><input [(ngModel)]="config().locationPage.labelStyle.color" class="form-input"></div>
                                  </div>
                              </div>
                              <!-- Branch Name -->
                              <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                                  <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Branch Name</div>
                                  <div class="col-span-2"><label class="form-label">Font Family</label><input [(ngModel)]="config().locationPage.branchNameStyle.fontFamily" class="form-input"></div>
                                  <div><label class="form-label">Font Size</label><input [(ngModel)]="config().locationPage.branchNameStyle.fontSize" class="form-input"></div>
                                  <div><label class="form-label">Color</label>
                                      <div class="flex gap-2"><input type="color" [(ngModel)]="config().locationPage.branchNameStyle.color" class="h-8 w-8 p-0 border"><input [(ngModel)]="config().locationPage.branchNameStyle.color" class="form-input"></div>
                                  </div>
                              </div>
                              <!-- Branch Details -->
                              <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                                  <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Branch Details (Address, etc)</div>
                                  <div class="col-span-2"><label class="form-label">Font Family</label><input [(ngModel)]="config().locationPage.branchDetailStyle.fontFamily" class="form-input"></div>
                                  <div><label class="form-label">Font Size</label><input [(ngModel)]="config().locationPage.branchDetailStyle.fontSize" class="form-input"></div>
                                  <div><label class="form-label">Color</label>
                                      <div class="flex gap-2"><input type="color" [(ngModel)]="config().locationPage.branchDetailStyle.color" class="h-8 w-8 p-0 border"><input [(ngModel)]="config().locationPage.branchDetailStyle.color" class="form-input"></div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Kelola Gambar Lokasi -->
                      <div class="admin-card">
                          <div class="admin-card-header bg-purple-900 text-white">Kelola Gambar Lokasi</div>
                          <div class="p-6 space-y-6">
                              @if(config().branches.length > 0) {
                                  @for (branch of config().branches; track $index) {
                                      <div class="p-4 rounded-lg border bg-gray-50/50">
                                          <h4 class="font-bold text-gray-800 mb-3 border-b pb-2">{{ branch.name }}</h4>
                                          <div>
                                              <label class="form-label">Gambar Lokasi (Slideshow)</label>
                                              <div class="grid grid-cols-4 gap-2 mb-2">
                                                @for(imageId of branch.locationImages; track imageId) {
                                                  <div class="relative group">
                                                    <img [src]="branchImageContent(imageId)" class="w-full h-24 object-cover rounded border">
                                                    <button (click)="removeBranchLocationImage($index, imageId)" class="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold">✕</button>
                                                  </div>
                                                }
                                              </div>
                                              <input type="file" (change)="onBranchFileSelected($event, $index)" class="form-input text-xs" accept="image/*" multiple>
                                          </div>
                                      </div>
                                  }
                              } @else {
                                  <p class="text-center text-gray-500">Belum ada cabang yang dikonfigurasi.</p>
                              }
                          </div>
                      </div>
                   }

                   <!-- === 8. TESTIMONIALS SETTINGS === -->
                   @if (currentTab() === 'testimonials') {
                      <!-- Header & Styling -->
                      <div class="admin-card">
                         <div class="admin-card-header bg-yellow-800 text-white">Testimonials Header & Styling</div>
                         <div class="p-6 space-y-6">
                            <!-- Page Titles -->
                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                               <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Section Title</div>
                               <div class="col-span-2"><label class="form-label">Title Text</label><input [(ngModel)]="config().testimonialsPage.title" class="form-input"></div>
                               <div><label class="form-label">Font Family</label><input [(ngModel)]="config().testimonialsPage.titleStyle.fontFamily" class="form-input"></div>
                               <div><label class="form-label">Font Size</label><input [(ngModel)]="config().testimonialsPage.titleStyle.fontSize" class="form-input"></div>
                               <div class="col-span-4 mt-2">
                                   <label class="form-label">Title Color</label>
                                   <div class="flex gap-2"><input type="color" [(ngModel)]="config().testimonialsPage.titleStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().testimonialsPage.titleStyle.color" class="form-input"></div>
                               </div>
                            </div>
                            <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                               <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Section Subtitle</div>
                               <div class="col-span-2"><label class="form-label">Subtitle Text</label><textarea [(ngModel)]="config().testimonialsPage.subtitle" class="form-input" rows="2"></textarea></div>
                               <div><label class="form-label">Font Family</label><input [(ngModel)]="config().testimonialsPage.subtitleStyle.fontFamily" class="form-input"></div>
                               <div><label class="form-label">Font Size</label><input [(ngModel)]="config().testimonialsPage.subtitleStyle.fontSize" class="form-input"></div>
                               <div class="col-span-4 mt-2">
                                   <label class="form-label">Subtitle Color</label>
                                   <div class="flex gap-2"><input type="color" [(ngModel)]="config().testimonialsPage.subtitleStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().testimonialsPage.subtitleStyle.color" class="form-input"></div>
                               </div>
                            </div>
                            <!-- Page Styling -->
                            <div class="border-t pt-4">
                               <div class="grid grid-cols-3 gap-4">
                                  <div>
                                     <label class="form-label">Background Color</label>
                                     <div class="flex gap-2"><input type="color" [(ngModel)]="config().testimonialsPage.style.backgroundColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().testimonialsPage.style.backgroundColor" class="form-input"></div>
                                  </div>
                                  <div>
                                     <label class="form-label">Accent Color (Stars)</label>
                                     <div class="flex gap-2"><input type="color" [(ngModel)]="config().testimonialsPage.style.accentColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().testimonialsPage.style.accentColor" class="form-input"></div>
                                  </div>
                                  <div>
                                     <label class="form-label">Card Radius</label>
                                     <input [(ngModel)]="config().testimonialsPage.style.borderRadius" class="form-input">
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <!-- Manage Testimonials -->
                      <div class="admin-card">
                         <div class="admin-card-header">Kelola Testimoni</div>
                         <div class="p-6">
                            <button (click)="addTestimonial()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6">+ Tambah Testimoni</button>
                            <div class="space-y-4">
                               @for (t of config().testimonials; track $index) {
                                  <div class="bg-white p-4 rounded-lg border border-gray-200 relative">
                                     <button (click)="removeTestimonial($index)" class="absolute top-2 right-2 bg-red-100 text-red-600 w-6 h-6 rounded-full font-bold hover:bg-red-200">✕</button>
                                     <div class="grid grid-cols-12 gap-4">
                                        <div class="col-span-12 md:col-span-5">
                                           <label class="form-label">Ulasan</label>
                                           <textarea [(ngModel)]="config().testimonials[$index].text" class="form-input" rows="3"></textarea>
                                        </div>
                                        <div class="col-span-12 md:col-span-7 grid grid-cols-2 gap-4">
                                           <div><label class="form-label">Nama</label><input [(ngModel)]="config().testimonials[$index].name" class="form-input"></div>
                                           <div><label class="form-label">Peran</label><input [(ngModel)]="config().testimonials[$index].role" class="form-input"></div>
                                           <div class="col-span-2"><label class="form-label">Rating (1-5)</label><input type="number" min="1" max="5" [(ngModel)]="config().testimonials[$index].rating" class="form-input"></div>
                                        </div>
                                     </div>
                                  </div>
                               }
                            </div>
                         </div>
                      </div>
                   }


                   <!-- === 9. FOOTER SETTINGS === -->
                   @if (currentTab() === 'footer') {
                      <!-- Content & Links -->
                      <div class="admin-card">
                          <div class="admin-card-header bg-gray-800 text-white">Content & Global Social Links</div>
                          <div class="p-6 space-y-4">
                              <div>
                                  <label class="form-label">Footer Description (supports newlines)</label>
                                  <textarea [(ngModel)]="config().footer.description" class="form-input" rows="3"></textarea>
                              </div>
                              <div>
                                  <label class="form-label">Copyright Text</label>
                                  <input [(ngModel)]="config().footer.copyrightText" class="form-input">
                              </div>
                              <div class="grid grid-cols-3 gap-4 border-t pt-4">
                                  <div>
                                      <label class="form-label">Global Instagram Link</label>
                                      <input [(ngModel)]="config().footer.instagramLink" class="form-input">
                                  </div>
                                  <div>
                                      <label class="form-label">Global Facebook Link</label>
                                      <input [(ngModel)]="config().footer.facebookLink" class="form-input">
                                  </div>
                                  <div>
                                      <label class="form-label">Global TikTok Link</label>
                                      <input [(ngModel)]="config().footer.tiktokLink" class="form-input">
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Branch Social Media Links -->
                      <div class="admin-card">
                          <div class="admin-card-header bg-indigo-800 text-white">Tautan Media Sosial Cabang</div>
                          <div class="p-6 space-y-6">
                              @if (config().branches.length > 0) {
                                  @for (branch of config().branches; track $index) {
                                      <div class="p-4 rounded-lg border bg-gray-50/50">
                                          <div class="flex items-center gap-4 mb-3 border-b pb-2">
                                              <h4 class="font-bold text-gray-800 flex-1">{{ branch.name }}</h4>
                                              <label class="form-label mb-0">Warna Judul</label>
                                              <div class="flex items-center gap-2">
                                                  <input type="color" [(ngModel)]="config().branches[$index].socialLinkColor" class="h-8 w-8 border cursor-pointer p-0 rounded">
                                              </div>
                                          </div>
                                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                  <label class="form-label">Instagram Link</label>
                                                  <input [(ngModel)]="config().branches[$index].instagramLink" class="form-input" placeholder="https://instagram.com/...">
                                              </div>
                                              <div>
                                                  <label class="form-label">Instagram Text</label>
                                                  <input [(ngModel)]="config().branches[$index].instagramLinkText" class="form-input" placeholder="Instagram">
                                              </div>
                                              <div>
                                                  <label class="form-label">Facebook Link</label>
                                                  <input [(ngModel)]="config().branches[$index].facebookLink" class="form-input" placeholder="https://facebook.com/...">
                                              </div>
                                              <div>
                                                  <label class="form-label">TikTok Link</label>
                                                  <input [(ngModel)]="config().branches[$index].tiktokLink" class="form-input" placeholder="https://tiktok.com/...">
                                              </div>
                                          </div>
                                      </div>
                                  }
                              } @else {
                                  <p class="text-center text-gray-500">Belum ada cabang yang dikonfigurasi. Silakan tambah cabang di pengaturan 'Lokasi'.</p>
                              }
                          </div>
                      </div>

                      <!-- Typography (Granular) -->
                      <div class="admin-card">
                          <div class="admin-card-header">Typography</div>
                          <div class="p-6 space-y-6">
                          
                              <!-- Brand Style -->
                              <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                                  <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Brand Name Style</div>
                                  <div class="col-span-2"><label class="form-label">Font Family</label><input [(ngModel)]="config().footer.brandStyle.fontFamily" class="form-input"></div>
                                  <div><label class="form-label">Size</label><input [(ngModel)]="config().footer.brandStyle.fontSize" class="form-input"></div>
                                  <div><label class="form-label">Color</label>
                                      <div class="flex gap-2"><input type="color" [(ngModel)]="config().footer.brandStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().footer.brandStyle.color" class="form-input"></div>
                                  </div>
                              </div>

                              <!-- Description Style -->
                              <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                                  <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Description Style</div>
                                  <div class="col-span-2"><label class="form-label">Font Family</label><input [(ngModel)]="config().footer.descriptionStyle.fontFamily" class="form-input"></div>
                                  <div><label class="form-label">Size</label><input [(ngModel)]="config().footer.descriptionStyle.fontSize" class="form-input"></div>
                                  <div><label class="form-label">Color</label>
                                      <div class="flex gap-2"><input type="color" [(ngModel)]="config().footer.descriptionStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().footer.descriptionStyle.color" class="form-input"></div>
                                  </div>
                              </div>

                              <!-- Social Media Header Style -->
                              <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                                  <div class="col-span-4 font-bold text-xs uppercase text-gray-400">"Media Sosial" Header Style</div>
                                  <div class="col-span-2"><label class="form-label">Font Family</label><input [(ngModel)]="config().footer.socialMediaHeaderStyle.fontFamily" class="form-input"></div>
                                  <div><label class="form-label">Size</label><input [(ngModel)]="config().footer.socialMediaHeaderStyle.fontSize" class="form-input"></div>
                                  <div><label class="form-label">Color</label>
                                      <div class="flex gap-2"><input type="color" [(ngModel)]="config().footer.socialMediaHeaderStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().footer.socialMediaHeaderStyle.color" class="form-input"></div>
                                  </div>
                              </div>

                              <!-- Copyright Style -->
                              <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
                                  <div class="col-span-4 font-bold text-xs uppercase text-gray-400">Copyright Text Style</div>
                                  <div class="col-span-2"><label class="form-label">Font Family</label><input [(ngModel)]="config().footer.copyrightStyle.fontFamily" class="form-input"></div>
                                  <div><label class="form-label">Size</label><input [(ngModel)]="config().footer.copyrightStyle.fontSize" class="form-input"></div>
                                  <div><label class="form-label">Color</label>
                                      <div class="flex gap-2"><input type="color" [(ngModel)]="config().footer.copyrightStyle.color" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().footer.copyrightStyle.color" class="form-input"></div>
                                  </div>
                              </div>

                          </div>
                      </div>

                      <!-- Page Styling -->
                      <div class="admin-card">
                          <div class="admin-card-header">Page Styling</div>
                          <div class="p-6 grid grid-cols-3 gap-6">
                              <div>
                                  <label class="form-label">Background Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().footer.style.backgroundColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().footer.style.backgroundColor" class="form-input"></div>
                              </div>
                              <div>
                                  <label class="form-label">Main Text Color</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().footer.style.textColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().footer.style.textColor" class="form-input"></div>
                              </div>
                              <div>
                                  <label class="form-label">Accent Color (Links)</label>
                                  <div class="flex gap-2"><input type="color" [(ngModel)]="config().footer.style.accentColor" class="h-9 w-9 p-0 border"><input [(ngModel)]="config().footer.style.accentColor" class="form-input"></div>
                              </div>
                               <div>
                                  <label class="form-label">Section Padding Y</label>
                                  <input [(ngModel)]="config().footer.style.sectionPaddingY" class="form-input">
                              </div>
                               <div>
                                  <label class="form-label">Default Font Family</label>
                                  <input [(ngModel)]="config().footer.style.fontFamily" class="form-input">
                              </div>
                          </div>
                      </div>
                   }

                   <!-- === 10. AI SETTINGS === -->
                   @if (currentTab() === 'ai') {
                      <!-- AI Assistant Settings -->
                      <div class="admin-card">
                         <div class="admin-card-header bg-cyan-800 text-white">Pengaturan Asisten AI</div>
                         <div class="p-6 space-y-6">
                            <div>
                               <label class="form-label">System Instruction (Prompt Utama)</label>
                               <p class="text-xs text-gray-500 mb-1">Aturan dan konteks utama yang diberikan ke AI. Daftar menu akan ditambahkan secara otomatis.</p>
                               <textarea [(ngModel)]="config().ai.systemInstruction" class="form-input font-mono text-xs" rows="5"></textarea>
                            </div>
                            <div>
                               <label class="form-label">Pesan Pembuka</label>
                               <textarea [(ngModel)]="config().ai.initialMessage" class="form-input" rows="2"></textarea>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-6 border-t pt-6">
                               <div>
                                  <label class="form-label">Warna Tombol & Header</label>
                                  <div class="flex items-center gap-2">
                                     <input type="color" [(ngModel)]="config().ai.buttonColor" class="h-9 w-9 border cursor-pointer p-0 rounded">
                                     <input [(ngModel)]="config().ai.buttonColor" class="form-input">
                                  </div>
                               </div>
                               <div>
                                  <label class="form-label">Ukuran Tombol (e.g. 60px)</label>
                                  <input [(ngModel)]="config().ai.buttonSize" class="form-input">
                               </div>
                               <div>
                                  <label class="form-label">Lebar Jendela Chat (e.g. 360px)</label>
                                  <input [(ngModel)]="config().ai.windowWidth" class="form-input">
                               </div>
                            </div>
                         </div>
                      </div>
                   }

                   <!-- === 11. ATTENDANCE SETTINGS === -->
                   @if (currentTab() === 'attendance') {
                      <div class="admin-card">
                         <div class="admin-card-header bg-gray-800 text-white">Pengaturan Halaman Absensi</div>
                         <div class="p-6 space-y-4">
                            <div>
                               <label class="form-label">URL Halaman Absensi Eksternal</label>
                               <input [(ngModel)]="config().attendancePage.url" class="form-input" placeholder="https://your-attendance-app.com">
                            </div>
                            <div class="border-t pt-4 grid grid-cols-2 gap-4">
                                <div>
                                   <label class="form-label">Judul Halaman</label>
                                   <input [(ngModel)]="config().attendancePage.title" class="form-input">
                                </div>
                                <div>
                                   <label class="form-label">Teks Tombol</label>
                                   <input [(ngModel)]="config().attendancePage.buttonText" class="form-input">
                                </div>
                            </div>
                            <div>
                               <label class="form-label">Subjudul/Deskripsi</label>
                               <textarea [(ngModel)]="config().attendancePage.subtitle" class="form-input" rows="3"></textarea>
                            </div>
                            <div>
                               <label class="form-label">Catatan Kaki</label>
                               <input [(ngModel)]="config().attendancePage.note" class="form-input">
                            </div>
                         </div>
                      </div>

                      <!-- Job Application Settings -->
                      <div class="admin-card">
                         <div class="admin-card-header bg-blue-800 text-white">Pengaturan Lamaran Kerja</div>
                         <div class="p-6 space-y-6">
                            <label class="flex items-center gap-2 cursor-pointer font-bold text-sm select-none">
                                <input type="checkbox" [(ngModel)]="config().jobApplication.enabled" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"> 
                                Aktifkan Fitur Lamaran Kerja
                            </label>
                            
                            <div class="border-t pt-4 space-y-4">
                               <div class="grid grid-cols-2 gap-4">
                                  <div>
                                     <label class="form-label">Judul Halaman</label>
                                     <input [(ngModel)]="config().jobApplication.title" class="form-input">
                                  </div>
                                  <div>
                                     <label class="form-label">Teks Tombol</label>
                                     <input [(ngModel)]="config().jobApplication.buttonText" class="form-input">
                                  </div>
                               </div>
                               <div>
                                  <label class="form-label">Deskripsi</label>
                                  <textarea [(ngModel)]="config().jobApplication.subtitle" class="form-input" rows="2"></textarea>
                               </div>
                               <div class="grid grid-cols-2 gap-4">
                                  <div>
                                     <label class="form-label">Email Tujuan (HRD)</label>
                                     <input [(ngModel)]="config().jobApplication.email" class="form-input" placeholder="hrd@email.com">
                                  </div>
                                  <div>
                                     <label class="form-label">Subjek Email</label>
                                     <input [(ngModel)]="config().jobApplication.emailSubject" class="form-input">
                                  </div>
                               </div>
                               <div>
                                  <label class="form-label">Template Body Email</label>
                                  <textarea [(ngModel)]="config().jobApplication.emailBody" class="form-input font-mono text-xs" rows="4"></textarea>
                               </div>
                            </div>
                         </div>
                      </div>
                   }

                   <!-- ... Placeholder for other tabs ... -->
                   @if (currentTab() !== 'hero' && currentTab() !== 'global' && currentTab() !== 'about' && currentTab() !== 'menu' && currentTab() !== 'packages' && currentTab() !== 'reservation' && currentTab() !== 'location' && currentTab() !== 'testimonials' && currentTab() !== 'footer' && currentTab() !== 'ai' && currentTab() !== 'attendance') {
                      <div class="text-center py-20 text-gray-400">
                         <p>Select a tab to edit.</p>
                         <p class="text-xs mt-2">(Other sections are hidden in this specific view but functional)</p>
                      </div>
                   }

                </div>
             </div>
          </main>
          
          <!-- MENU MODAL -->
          @if(isMenuModalOpen()) {
            <div class="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                   <div class="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                       <h3 class="text-lg font-bold">{{ editingMenuItemId() === null ? 'Tambah' : 'Edit' }} Item Menu</h3>
                       <button (click)="closeMenuModal()" class="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                   </div>
                   
                   <!-- Modal Form -->
                   <div class="p-6 overflow-y-auto space-y-4">
                       <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label class="form-label">Nama Menu</label><input [(ngModel)]="tempMenuItem().name" class="form-input"></div>
                          <div><label class="form-label">Harga</label><input [(ngModel)]="tempMenuItem().price" class="form-input" placeholder="Rp 50.000"></div>
                       </div>
                       <div><label class="form-label">Deskripsi Singkat</label><textarea [(ngModel)]="tempMenuItem().desc" class="form-input" rows="2"></textarea></div>
                       
                       <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div><label class="form-label">Kategori</label><input [(ngModel)]="tempMenuItem().category" class="form-input" placeholder="Sate, Sop, Minuman"></div>
                           <div>
                               <label class="form-label">Level Pedas (0-5)</label>
                               <input type="number" min="0" max="5" [(ngModel)]="tempMenuItem().spicyLevel" class="form-input">
                           </div>
                           <div class="flex gap-6 items-center pt-6">
                               <label class="flex items-center gap-2 cursor-pointer font-bold text-sm"><input type="checkbox" [(ngModel)]="tempMenuItem().favorite"> Favorit?</label>
                               <label class="flex items-center gap-2 cursor-pointer font-bold text-sm"><input type="checkbox" [(ngModel)]="tempMenuItem().soldOut"> Habis?</label>
                           </div>
                       </div>
                       
                       <div>
                          <label class="form-label">Gambar Menu</label>
                          <input type="file" (change)="onMenuFileSelected($event)" class="form-input text-xs">
                          @if(tempMenuItem().image) {
                            <div class="mt-2 h-24 w-24 bg-gray-100 rounded border flex items-center justify-center p-2">
                                <img [src]="tempMenuItem().image" class="h-full w-full object-cover">
                            </div>
                          }
                       </div>
                   </div>

                   <div class="p-4 bg-gray-50 border-t rounded-b-2xl flex justify-end gap-3">
                       <button (click)="closeMenuModal()" class="bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded-lg">Batal</button>
                       <button (click)="saveMenuItem()" class="bg-green-600 text-white font-bold py-2 px-5 rounded-lg">Simpan</button>
                   </div>
                </div>
            </div>
          }

          <!-- PACKAGE MODAL -->
          @if(isPackageModalOpen()) {
            <div class="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                   <div class="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                       <h3 class="text-lg font-bold">{{ editingPackageItemIndex() === null ? 'Tambah' : 'Edit' }} Item Paket</h3>
                       <button (click)="closePackageModal()" class="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                   </div>
                   
                   <!-- Modal Form -->
                   <div class="p-6 overflow-y-auto space-y-4">
                       <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label class="form-label">Nama Paket</label><input [(ngModel)]="tempPackageItem().name" class="form-input"></div>
                          <div><label class="form-label">Harga</label><input [(ngModel)]="tempPackageItem().price" class="form-input" placeholder="Rp 250.000"></div>
                       </div>
                       <div><label class="form-label">Deskripsi Singkat</label><textarea [(ngModel)]="tempPackageItem().description" class="form-input" rows="2"></textarea></div>
                       
                       <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                               <label class="form-label">Minimal Pax (Opsional)</label>
                               <input type="number" min="0" [(ngModel)]="tempPackageItem().minPax" class="form-input">
                           </div>
                           <div>
                              <label class="form-label">Gambar Paket</label>
                              <input type="file" (change)="onPackageFileSelected($event)" class="form-input text-xs">
                              @if(tempPackageItem().image) {
                                <div class="mt-2 h-24 w-24 bg-gray-100 rounded border flex items-center justify-center p-2">
                                    <img [src]="tempPackageItem().image" class="h-full w-full object-cover">
                                </div>
                              }
                           </div>
                       </div>
                       
                       <div>
                          <label class="form-label">Isi Paket (Satu item per baris)</label>
                          <textarea [(ngModel)]="tempPackageItemsString" class="form-input font-mono text-xs" rows="5"></textarea>
                       </div>
                   </div>

                   <div class="p-4 bg-gray-50 border-t rounded-b-2xl flex justify-end gap-3">
                       <button (click)="closePackageModal()" class="bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded-lg">Batal</button>
                       <button (click)="savePackageItem()" class="bg-green-600 text-white font-bold py-2 px-5 rounded-lg">Simpan</button>
                   </div>
                </div>
            </div>
          }

        }
      </div>
    }
  `
})
export class AdminComponent {
  configService = inject(ConfigService);
  toastService = inject(ToastService);
  config = this.configService.config;
  
  isOpen = signal(false);
  currentTab = signal('reservation'); 
  isUploading = signal(false);
  
  emailInput = signal('');
  passwordInput = signal('');
  showPassword = signal(false);
  isLoggingIn = signal(false);
  loginError = signal<string | null>(null);
  
  selectedBranchIndex = signal(0);
  selectedReservationBranchIndex = signal(0);

  // === MENU CRUD SIGNALS ===
  selectedMenuBranchIndex = signal(0);
  isMenuModalOpen = signal(false);
  editingMenuItemId = signal<string | null>(null);
  tempMenuItem = signal<MenuItem>(this.getNewMenuItem());

  // === PACKAGE CRUD SIGNALS ===
  selectedPackageBranchIndex = signal(0);
  isPackageModalOpen = signal(false);
  editingPackageItemIndex = signal<number | null>(null);
  tempPackageItem = signal<PackageItem>(this.getNewPackageItem());
  tempPackageItemsString = signal('');
  
  isAuthenticated = computed(() => this.configService.currentUser() !== null || this.configService.isDemoMode());
  firestoreError = this.configService.firestoreError;

  tabs = [
    { id: 'global', label: 'Global', icon: '🌍' },
    { id: 'hero', label: 'Hero', icon: '🏠' },
    { id: 'about', label: 'About', icon: '📖' },
    { id: 'menu', label: 'Menu', icon: '🍽️' },
    { id: 'packages', label: 'Paket', icon: '📦' },
    { id: 'reservation', label: 'Reservasi', icon: '📅' },
    { id: 'location', label: 'Lokasi', icon: '📍' },
    { id: 'testimonials', label: 'Testimoni', icon: '💬' },
    { id: 'footer', label: 'Footer', icon: '🔗' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
    { id: 'attendance', label: 'Absensi', icon: '⏰' },
  ];

  tempConfig: FirebaseConfig = { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };

  selectedBranchMenuItems = computed(() => {
    const branchIndex = this.selectedMenuBranchIndex();
    const selectedBranch = this.config().branches[branchIndex];
    if (!selectedBranch) return [];
    return this.configService.menuItems().filter(item => item.branchId === selectedBranch.id);
  });

  constructor() {
    const current = this.configService.getStoredFirebaseConfig();
    if (current) this.tempConfig = {...current};

    effect(() => {
       if (this.isOpen()) document.body.classList.add('admin-mode');
       else document.body.classList.remove('admin-mode');
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
       this.toastService.show('Gagal menyimpan: ' + e.message, 'error');
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
        if (type === 'logoImage') newC.global.logoImage = base64;
        if (type === 'backgroundMusic') newC.global.backgroundMusicUrl = base64;
        if (type === 'introVideo') newC.intro.videoUrl = base64;
        if (type === 'favicon') newC.global.favicon = base64;
        // This is now handled by onAboutSlideSelected
        // if (type === 'aboutImage') newC.about.image = base64;
        return newC;
      });
      
      this.toastService.show('Upload Berhasil', 'success');
    } catch (e) {
      this.toastService.show('Gagal Upload', 'error');
    } finally {
      this.isUploading.set(false);
    }
  }

  removeIntroVideo() {
    if (!confirm('Apakah Anda yakin ingin menghapus video intro?')) return;
    this.config.update(c => ({
      ...c,
      intro: { ...c.intro, videoUrl: '' }
    }));
    this.toastService.show('Video intro dihapus', 'info');
  }
  
  removeBackgroundMusic() {
    if (!confirm('Apakah Anda yakin ingin menghapus musik latar?')) return;
    this.config.update(c => ({
      ...c,
      global: { ...c.global, backgroundMusicUrl: '' }
    }));
    this.toastService.show('Musik latar dihapus', 'info');
  }

  // === HERO SLIDESHOW METHODS ===
  async onHeroSlideSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading.set(true);
    try {
      const docId = await this.configService.addSlideshowItem(file);
      this.config.update(c => {
        const currentSlides = c.hero.backgroundSlides.filter(id => id !== 'placeholder-id-1');
        const newSlides = [...currentSlides, docId];
        return { ...c, hero: { ...c.hero, backgroundSlides: newSlides } };
      });
      this.toastService.show('Slide berhasil diunggah', 'success');
    } catch (e: any) {
      this.toastService.show(`Gagal: ${e.message}`, 'error');
    } finally {
      this.isUploading.set(false);
    }
  }

  async removeHeroSlide(slideIdToDelete: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus slide ini?')) return;
    
    this.isUploading.set(true);
    try {
        const currentConfig = this.config();
        
        const newSlides = currentConfig.hero.backgroundSlides.filter(id => id !== slideIdToDelete);
        
        const newConfig = { 
            ...currentConfig, 
            hero: { ...currentConfig.hero, backgroundSlides: newSlides } 
        };

        await this.configService.updateConfig(newConfig);

        await this.configService.deleteSlideshowItem(slideIdToDelete);
        
        this.toastService.show('Slide berhasil dihapus dan disimpan.', 'success');
    } catch(e: any) {
        this.toastService.show(`Gagal menghapus slide: ${e.message}`, 'error');
    } finally {
        this.isUploading.set(false);
    }
  }

  // === ABOUT SLIDESHOW METHODS ===
  async onAboutSlideSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading.set(true);
    try {
      const base64 = await this.configService.uploadFile(file);
      this.config.update(c => {
        const newSlides = [...(c.about.mediaSlides || [])];
        newSlides.push(base64);
        return { ...c, about: { ...c.about, mediaSlides: newSlides } };
      });
      this.toastService.show('Media berhasil diunggah', 'success');
    } catch (e: any) {
      this.toastService.show(`Gagal unggah: ${e.message}`, 'error');
    } finally {
      this.isUploading.set(false);
    }
  }

  removeAboutSlide(index: number) {
    if (!confirm('Apakah Anda yakin ingin menghapus media ini?')) return;
    this.config.update(c => {
      const newSlides = [...c.about.mediaSlides];
      newSlides.splice(index, 1);
      return { ...c, about: { ...c.about, mediaSlides: newSlides } };
    });
  }

  // === MENU CRUD METHODS ===

  getNewMenuItem(): MenuItem {
    return { branchId: '', name: '', desc: '', price: '', category: '', image: '', favorite: false, soldOut: false, spicyLevel: 0 };
  }

  openMenuModal(item: MenuItem | null = null) {
    if (item && item.id) {
      this.editingMenuItemId.set(item.id);
      this.tempMenuItem.set({ ...item });
    } else {
      this.editingMenuItemId.set(null);
      this.tempMenuItem.set(this.getNewMenuItem());
    }
    this.isMenuModalOpen.set(true);
  }

  closeMenuModal() {
    this.isMenuModalOpen.set(false);
  }

  async onMenuFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.isUploading.set(true);
    try {
      const base64 = await this.configService.uploadFile(file);
      this.tempMenuItem.update(item => ({ ...item, image: base64 }));
      this.toastService.show('Gambar menu diunggah', 'success');
    } catch (e) {
      this.toastService.show('Gagal upload gambar', 'error');
    } finally {
      this.isUploading.set(false);
    }
  }

  async saveMenuItem() {
    const branchIndex = this.selectedMenuBranchIndex();
    const branch = this.config().branches[branchIndex];
    if (!branch) {
      this.toastService.show('Cabang tidak valid.', 'error');
      return;
    }
    
    let itemToSave = this.tempMenuItem();
    itemToSave.branchId = branch.id;
    const editId = this.editingMenuItemId();

    try {
      if (editId) {
        const { id, ...dataToUpdate } = itemToSave;
        await this.configService.updateMenuItem(editId, dataToUpdate);
      } else {
        const { id, ...dataToAdd } = itemToSave;
        await this.configService.addMenuItem(dataToAdd);
      }
      this.toastService.show('Menu berhasil disimpan!', 'success');
      this.closeMenuModal();
    } catch (e: any) {
      this.toastService.show('Gagal menyimpan menu: ' + e.message, 'error');
    }
  }

  async deleteMenuItem(item: MenuItem) {
    if (!item.id || !confirm('Apakah Anda yakin ingin menghapus item menu ini?')) return;

    try {
      await this.configService.deleteMenuItem(item.id);
      this.toastService.show('Menu berhasil dihapus.', 'info');
    } catch (e: any) {
      this.toastService.show('Gagal menghapus menu: ' + e.message, 'error');
    }
  }

  // === PACKAGE CRUD METHODS ===

  getNewPackageItem(): PackageItem {
    return { name: '', price: '', description: '', image: '', items: [], minPax: 0 };
  }

  openPackageModal(item: PackageItem | null = null, index: number | null = null) {
    if (item && index !== null) {
      this.editingPackageItemIndex.set(index);
      this.tempPackageItem.set({ ...item });
      this.tempPackageItemsString.set(item.items.join('\n'));
    } else {
      this.editingPackageItemIndex.set(null);
      this.tempPackageItem.set(this.getNewPackageItem());
      this.tempPackageItemsString.set('');
    }
    this.isPackageModalOpen.set(true);
  }

  closePackageModal() {
    this.isPackageModalOpen.set(false);
  }

  async onPackageFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.isUploading.set(true);
    try {
      const base64 = await this.configService.uploadFile(file);
      this.tempPackageItem.update(item => ({ ...item, image: base64 }));
      this.toastService.show('Gambar paket diunggah', 'success');
    } catch (e) {
      this.toastService.show('Gagal upload gambar', 'error');
    } finally {
      this.isUploading.set(false);
    }
  }

  savePackageItem() {
    const branchIndex = this.selectedPackageBranchIndex();
    const itemToSave = { ...this.tempPackageItem() };
    itemToSave.items = this.tempPackageItemsString().split('\n').filter(line => line.trim() !== '');
    const editIndex = this.editingPackageItemIndex();

    this.config.update(c => {
      const newBranches = [...c.branches];
      const branchToUpdate = { ...newBranches[branchIndex] };
      const newPackages = [...(branchToUpdate.packages || [])];

      if (editIndex !== null) {
        newPackages[editIndex] = itemToSave;
      } else {
        newPackages.push(itemToSave);
      }
      
      branchToUpdate.packages = newPackages;
      newBranches[branchIndex] = branchToUpdate;

      return { ...c, branches: newBranches };
    });

    this.toastService.show('Paket berhasil disimpan!', 'success');
    this.closePackageModal();
  }

  deletePackageItem(index: number) {
    if (!confirm('Apakah Anda yakin ingin menghapus item paket ini?')) return;

    const branchIndex = this.selectedPackageBranchIndex();
    this.config.update(c => {
      const newBranches = [...c.branches];
      const branchToUpdate = { ...newBranches[branchIndex] };
      const newPackages = [...(branchToUpdate.packages || [])];
      newPackages.splice(index, 1);
      
      branchToUpdate.packages = newPackages;
      newBranches[branchIndex] = branchToUpdate;

      return { ...c, branches: newBranches };
    });

    this.toastService.show('Paket berhasil dihapus.', 'info');
  }


  saveFirebaseSetup() { 
    this.configService.saveStoredFirebaseConfig(this.tempConfig);
  }

  addLogo() {
    this.config.update(c => {
      const logos = [...(c.about.trustedLogos || [])];
      logos.push('');
      return { ...c, about: { ...c.about, trustedLogos: logos } };
    });
  }

  removeLogo(index: number) {
    this.config.update(c => {
      const logos = [...c.about.trustedLogos];
      logos.splice(index, 1);
      return { ...c, about: { ...c.about, trustedLogos: logos } };
    });
  }
  
  addTableType() {
    this.config.update(c => {
      const branches = [...c.branches];
      const branchIndex = this.selectedReservationBranchIndex();
      if (branches[branchIndex]) {
        const branch = { ...branches[branchIndex] };
        const types = [...(branch.tableTypes || []), 'Area Baru'];
        branch.tableTypes = types;
        branches[branchIndex] = branch;
      }
      return { ...c, branches: branches };
    });
  }

  removeTableType(index: number) {
    this.config.update(c => {
      const branches = [...c.branches];
      const branchIndex = this.selectedReservationBranchIndex();
      if (branches[branchIndex]) {
        const branch = { ...branches[branchIndex] };
        const types = [...(branch.tableTypes || [])];
        types.splice(index, 1);
        branch.tableTypes = types;
        branches[branchIndex] = branch;
      }
      return { ...c, branches: branches };
    });
  }

  // === BRANCH IMAGE METHODS ===
  branchImageContent(id: string): string {
    return this.configService.branchImagesContent().get(id) || '';
  }

  async onBranchFileSelected(event: any, index: number) {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      this.isUploading.set(true);
      try {
          const uploadPromises = Array.from(files).map(file => this.configService.addBranchImage(file as File));
          const imageIds = await Promise.all(uploadPromises);
          
          this.config.update(c => {
              const newBranches = [...c.branches];
              if (newBranches[index]) {
                  const updatedBranch = { ...newBranches[index] };
                  updatedBranch.locationImages = [...(updatedBranch.locationImages || []), ...imageIds];
                  newBranches[index] = updatedBranch;
              }
              return { ...c, branches: newBranches };
          });
          
          this.toastService.show(`${files.length} gambar berhasil diunggah`, 'success');
      } catch (e: any) {
          this.toastService.show(`Gagal mengunggah gambar: ${e.message}`, 'error');
      } finally {
          this.isUploading.set(false);
          event.target.value = '';
      }
  }

  async removeBranchLocationImage(branchIndex: number, imageId: string) {
      if (!confirm('Apakah Anda yakin ingin menghapus gambar ini?')) return;
      
      this.isUploading.set(true);
      try {
        await this.configService.deleteBranchImage(imageId);

        this.config.update(c => {
            const newBranches = [...c.branches];
            const branch = { ...newBranches[branchIndex] };
            branch.locationImages = (branch.locationImages || []).filter(id => id !== imageId);
            newBranches[branchIndex] = branch;
            return { ...c, branches: newBranches };
        });
        
        // Immediately persist the change to the main config document
        await this.saveChanges();
        
      } catch (e: any) {
         this.toastService.show(`Gagal menghapus: ${e.message}`, 'error');
      } finally {
        this.isUploading.set(false);
      }
  }

  // === TESTIMONIALS CRUD METHODS ===
  addTestimonial() {
    this.config.update(c => {
      const newTestimonials = [...(c.testimonials || [])];
      newTestimonials.push({ name: 'Nama Baru', text: 'Ulasan baru...', role: 'Pelanggan', rating: 5 });
      return { ...c, testimonials: newTestimonials };
    });
  }

  removeTestimonial(index: number) {
    if (!confirm('Hapus testimoni ini?')) return;
    this.config.update(c => {
      const newTestimonials = [...c.testimonials];
      newTestimonials.splice(index, 1);
      return { ...c, testimonials: newTestimonials };
    });
  }
}
