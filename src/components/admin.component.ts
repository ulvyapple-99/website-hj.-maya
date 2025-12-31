
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
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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
                         <div class="p-6 grid grid-cols-2 gap-6">
                            <!-- Images -->
                            <div class="col-span-2 grid grid-cols-2 gap-6">
                                <div>
                                   <label class="form-label">Main Background Image</label>
                                   <div class="flex gap-2 items-center">
                                       <input type="file" (change)="onFileSelected($event, 'heroBg')" class="form-input text-xs">
                                   </div>
                                   <div class="mt-2 h-24 bg-gray-100 rounded overflow-hidden border">
                                       @if (config().hero.bgImage) {
                                           <img [src]="config().hero.bgImage" class="w-full h-full object-cover">
                                       }
                                   </div>
                                </div>
                                <div>
                                   <label class="form-label">Fallback Image (Video Poster)</label>
                                   <div class="flex gap-2 items-center">
                                       <input type="file" (change)="onFileSelected($event, 'heroFallback')" class="form-input text-xs">
                                   </div>
                                   <div class="mt-2 h-24 bg-gray-100 rounded overflow-hidden border">
                                        @if (config().hero.fallbackImage) {
                                           <img [src]="config().hero.fallbackImage" class="w-full h-full object-cover">
                                        }
                                   </div>
                                </div>
                            </div>

                            <!-- Layout Controls -->
                            <div class="border-t pt-4 col-span-2 grid grid-cols-3 gap-4">
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

                            <!-- Overlay & Effects -->
                            <div class="col-span-2 grid grid-cols-3 gap-4">
                                <div>
                                    <label class="form-label">Overlay Opacity (0-1)</label>
                                    <input type="number" step="0.1" min="0" max="1" [(ngModel)]="config().hero.overlayOpacity" class="form-input">
                                </div>
                                <div>
                                    <label class="form-label">Blur Level</label>
                                    <input [(ngModel)]="config().hero.blurLevel" class="form-input" placeholder="0px">
                                </div>
                                <div>
                                    <label class="form-label">Gradient Direction</label>
                                    <select [(ngModel)]="config().hero.gradientDirection" class="form-select">
                                        <option value="radial">Radial</option>
                                        <option value="to bottom">Top to Bottom</option>
                                        <option value="to top">Bottom to Top</option>
                                    </select>
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
                            <div class="grid grid-cols-2 gap-4">
                                <div><label class="form-label">Quote Text</label><textarea [(ngModel)]="config().about.quote" class="form-input" rows="2"></textarea></div>
                                <div><label class="form-label">Founder Name</label><input [(ngModel)]="config().about.founderName" class="form-input"></div>
                                <div><label class="form-label">CTA Text</label><input [(ngModel)]="config().about.ctaText" class="form-input"></div>
                                <div><label class="form-label">CTA Link</label><input [(ngModel)]="config().about.ctaLink" class="form-input"></div>
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

                            <!-- Main Image -->
                            <div>
                               <label class="form-label">Section Image</label>
                               <div class="flex gap-2 items-center mb-2">
                                   <input type="file" (change)="onFileSelected($event, 'aboutImage')" class="form-input text-xs">
                               </div>
                               @if (config().about.image) {
                                  <div class="h-32 bg-gray-100 rounded border overflow-hidden">
                                     <img [src]="config().about.image" class="w-full h-full object-cover">
                                  </div>
                               }
                               <div class="mt-2 grid grid-cols-2 gap-2">
                                  <div><label class="form-label">Image Position</label>
                                     <select [(ngModel)]="config().about.imagePosition" class="form-select">
                                        <option value="left">Left</option>
                                        <option value="right">Right</option>
                                     </select>
                                  </div>
                                  <div><label class="form-label">Image Radius</label><input [(ngModel)]="config().about.style.borderRadius" class="form-input"></div>
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

                      <!-- Operational Settings -->
                      <div class="admin-card">
                         <div class="admin-card-header">Operational Settings</div>
                         <div class="p-6 space-y-6">
                            <div class="grid grid-cols-3 gap-4">
                               <div><label class="form-label">Min Pax (Regular)</label><input type="number" [(ngModel)]="config().reservation.minPaxRegular" class="form-input"></div>
                               <div><label class="form-label">Min Pax (Ramadan)</label><input type="number" [(ngModel)]="config().reservation.minPaxRamadan" class="form-input"></div>
                               <div><label class="form-label">Max Capacity</label><input type="number" [(ngModel)]="config().reservation.maxPax" class="form-input"></div>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-4 border-t pt-4">
                               <div><label class="form-label">Booking Lead Time (Hours)</label><input type="number" [(ngModel)]="config().reservation.bookingLeadTimeHours" class="form-input"></div>
                               <div><label class="form-label">DP Percentage (%)</label><input type="number" [(ngModel)]="config().reservation.downPaymentPercentage" class="form-input"></div>
                            </div>

                            <div class="flex gap-6 border-t pt-4">
                               <label class="flex items-center gap-2 cursor-pointer font-bold text-sm"><input type="checkbox" [(ngModel)]="config().reservation.enableSpecialRequest"> Enable Special Request</label>
                               <label class="flex items-center gap-2 cursor-pointer font-bold text-sm"><input type="checkbox" [(ngModel)]="config().reservation.requireEmail"> Require Email</label>
                               <label class="flex items-center gap-2 cursor-pointer font-bold text-sm"><input type="checkbox" [(ngModel)]="config().reservation.enableDownPaymentCalc"> Show DP Calculator</label>
                            </div>

                            <!-- Table Types -->
                            <div class="bg-gray-50 p-4 rounded border">
                               <label class="form-label mb-2">Table / Area Types</label>
                               <div class="space-y-2">
                                  @for (type of config().reservation.tableTypes; track $index) {
                                     <div class="flex gap-2">
                                        <input [(ngModel)]="config().reservation.tableTypes[$index]" class="form-input">
                                        <button (click)="removeTableType($index)" class="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200">✕</button>
                                     </div>
                                  }
                                  <button (click)="addTableType()" class="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded hover:bg-blue-100">+ Add Area Type</button>
                               </div>
                            </div>
                         </div>
                      </div>

                      <!-- Terms & Messaging -->
                      <div class="admin-card">
                         <div class="admin-card-header">Terms & Messaging</div>
                         <div class="p-6 space-y-4">
                            <div>
                               <label class="form-label">Terms & Conditions (Newline for bullet points)</label>
                               <textarea [(ngModel)]="config().reservation.termsAndConditions" class="form-input" rows="4"></textarea>
                            </div>
                            <div>
                               <label class="form-label">WhatsApp Template</label>
                               <p class="text-[10px] text-gray-500 mb-1">Variables: {{ '{name}, {contact}, {date}, {time}, {pax}, {branch}, {tableType}, {notes}' }}</p>
                               <textarea [(ngModel)]="config().reservation.whatsappTemplate" class="form-input font-mono text-xs" rows="6"></textarea>
                            </div>
                         </div>
                      </div>

                   }

                   <!-- ... Placeholder for other tabs ... -->
                   @if (currentTab() !== 'hero' && currentTab() !== 'global' && currentTab() !== 'about' && currentTab() !== 'menu' && currentTab() !== 'packages' && currentTab() !== 'reservation') {
                      <div class="text-center py-20 text-gray-400">
                         <p>Select a tab to edit.</p>
                         <p class="text-xs mt-2">(Other sections are hidden in this specific view but functional)</p>
                      </div>
                   }

                </div>
             </div>
          </main>
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
  isLoggingIn = signal(false);
  loginError = signal<string | null>(null);
  
  selectedBranchIndex = signal(0);
  
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
    { id: 'footer', label: 'Footer', icon: '🔗' },
  ];

  tempConfig: FirebaseConfig = { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };

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
        if (type === 'logoImage') newC.global.logoImage = base64;
        if (type === 'introVideo') newC.intro.videoUrl = base64;
        if (type === 'favicon') newC.global.favicon = base64;
        if (type === 'heroBg') newC.hero.bgImage = base64;
        if (type === 'heroFallback') newC.hero.fallbackImage = base64; 
        if (type === 'aboutImage') newC.about.image = base64;
        return newC;
      });
      
      this.toastService.show('Upload Berhasil', 'success');
    } catch (e) {
      this.toastService.show('Gagal Upload', 'error');
    } finally {
      this.isUploading.set(false);
    }
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
      const types = [...c.reservation.tableTypes, 'Area Baru'];
      return { ...c, reservation: { ...c.reservation, tableTypes: types } };
    });
  }

  removeTableType(index: number) {
    this.config.update(c => {
      const types = [...c.reservation.tableTypes];
      types.splice(index, 1);
      return { ...c, reservation: { ...c.reservation, tableTypes: types } };
    });
  }
}
