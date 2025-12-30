
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
    <!-- Floating Admin Button (Trigger) -->
    <button 
      (click)="togglePanel()"
      class="fixed bottom-6 left-6 z-50 bg-gray-900 text-white p-3.5 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white/20 group overflow-hidden"
      title="Admin Dashboard"
    >
      @if (firestoreError()) {
        <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-gray-900 animate-ping"></span>
        <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-gray-900"></span>
      }
      <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Upload Overlay -->
    @if (isUploading()) {
      <div class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center flex-col text-white transition-opacity">
         <div class="w-20 h-20 border-4 border-t-orange-500 border-gray-700 rounded-full animate-spin mb-6"></div>
         <p class="font-bold text-xl tracking-widest uppercase animate-pulse">Mengunggah...</p>
         <p class="text-sm opacity-60 mt-2">Mohon jangan tutup halaman ini.</p>
      </div>
    }

    <!-- MAIN ADMIN PANEL (FULLSCREEN) -->
    @if (isOpen()) {
      <div class="fixed inset-0 z-[60] bg-gray-100 font-sans text-gray-800 flex overflow-hidden animate-fade-in">
        
        <!-- LOGIN SCREEN -->
        @if (!isAuthenticated()) {
           <div class="absolute inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-95 backdrop-blur-sm p-4">
              <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <div class="bg-orange-600 p-8 text-center relative overflow-hidden">
                      <div class="absolute inset-0 bg-black/10"></div>
                      <div class="relative z-10">
                        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <h2 class="text-2xl font-bold text-white tracking-tight">Admin Portal</h2>
                        <p class="text-orange-100 text-sm mt-1">Sate Maranggi Hj. Maya</p>
                      </div>
                  </div>
                  
                  <div class="p-8 space-y-6">
                    <div class="space-y-4">
                        <div>
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                          <input type="email" [(ngModel)]="emailInput" class="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition" placeholder="admin@example.com">
                        </div>
                        <div class="relative">
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                          <input [type]="showPassword() ? 'text' : 'password'" [(ngModel)]="passwordInput" class="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition" placeholder="••••••••">
                          <button (click)="togglePassword()" class="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path *ngIf="!showPassword()" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path *ngIf="!showPassword()" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                <path *ngIf="showPassword()" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                             </svg>
                          </button>
                        </div>
                    </div>

                    <button (click)="login()" [disabled]="isLoggingIn()" class="w-full bg-gray-900 text-white font-bold py-3.5 rounded-lg shadow-lg hover:bg-black hover:shadow-xl transition transform hover:-translate-y-0.5 disabled:opacity-50">
                       {{ isLoggingIn() ? 'Verifying...' : 'Access Dashboard' }}
                    </button>
                    
                    @if (loginError()) {
                      <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                        {{ loginError() }}
                      </div>
                    }

                    <div class="pt-4 border-t border-gray-100 text-center">
                       <button (click)="togglePanel()" class="text-sm text-gray-500 hover:text-gray-800 transition underline">Kembali ke Website</button>
                    </div>
                  </div>
              </div>
           </div>
        } 
        
        <!-- DASHBOARD UI -->
        @else {
          <!-- SIDEBAR NAVIGATION -->
          <aside class="w-72 bg-gray-900 text-gray-300 flex flex-col h-full shadow-2xl z-20 flex-shrink-0">
             <!-- Brand -->
             <div class="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-950">
                <span class="font-bold text-white text-lg tracking-wide flex items-center gap-2">
                  <span class="w-3 h-3 bg-orange-500 rounded-full"></span> CMS Panel
                </span>
             </div>

             <!-- Nav Items -->
             <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                @for (tab of tabs; track tab.id) {
                   <button (click)="currentTab.set(tab.id)"
                     class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group"
                     [class.bg-orange-600]="currentTab() === tab.id"
                     [class.text-white]="currentTab() === tab.id"
                     [class.hover:bg-gray-800]="currentTab() !== tab.id">
                      <span class="text-xl opacity-80 group-hover:opacity-100 transition-opacity">{{ tab.icon }}</span>
                      <span class="tracking-wide">{{ tab.label }}</span>
                      
                      @if (currentTab() === tab.id) {
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                      }
                   </button>
                }
             </nav>

             <!-- Footer Nav -->
             <div class="p-4 border-t border-gray-800 bg-gray-950">
                <div class="flex items-center gap-3 mb-4 px-2">
                   <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">AD</div>
                   <div class="flex-1 overflow-hidden">
                      <p class="text-sm font-bold text-white truncate">Administrator</p>
                      <p class="text-xs text-gray-500 truncate">
                        {{ configService.isDemoMode() ? 'Local Mode' : 'Online' }}
                      </p>
                   </div>
                </div>
                <button (click)="logout()" class="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-xs font-bold transition border border-gray-700">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                   Log Out
                </button>
             </div>
          </aside>

          <!-- MAIN CONTENT AREA -->
          <main class="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 relative">
             <!-- Topbar -->
             <header class="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-8 z-10">
                <h1 class="text-xl font-bold text-gray-800 capitalize">{{ getActiveTabLabel() }}</h1>
                
                <div class="flex items-center gap-4">
                   @if (configService.isDemoMode()) {
                      <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200 flex items-center gap-1">
                        <span class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span> Local Mode
                      </span>
                   }
                   <button (click)="saveChanges()" class="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg text-sm font-bold shadow hover:shadow-lg transition flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                      Simpan Perubahan
                   </button>
                   <button (click)="togglePanel()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500">✕</button>
                </div>
             </header>

             <!-- Scrollable Content -->
             <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div class="max-w-5xl mx-auto space-y-8 pb-20">
                   
                   <!-- === GLOBAL & INTRO === -->
                   @if (currentTab() === 'global') {
                      <div class="card">
                         <h3 class="card-header">Video Intro (Loading Screen)</h3>
                         <div class="p-6">
                            <div class="flex items-center gap-3 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                               <input type="checkbox" [(ngModel)]="config().intro.enabled" class="toggle-checkbox">
                               <div>
                                  <label class="font-bold text-gray-800 block">Aktifkan Video Intro</label>
                                  <span class="text-xs text-gray-500">Video akan diputar saat pengunjung pertama kali membuka website.</span>
                               </div>
                            </div>
                            
                            @if (config().intro.enabled) {
                               <div class="grid md:grid-cols-2 gap-8">
                                  <div>
                                     <label class="label">File Video (.mp4)</label>
                                     <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition relative group">
                                         <input type="file" (change)="onFileSelected($event, 'introVideo')" accept="video/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full">
                                         <div class="space-y-2 pointer-events-none">
                                            <div class="mx-auto w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-orange-100 group-hover:text-orange-600 transition">
                                               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                            </div>
                                            <p class="text-sm text-gray-500 font-medium">Klik untuk upload video baru</p>
                                            <p class="text-[10px] text-gray-400">Max size 2MB (Firestore Limit)</p>
                                         </div>
                                     </div>
                                     
                                     <!-- Video Size Warning -->
                                     @if (videoSizeWarning()) {
                                        <div class="mt-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded flex gap-2 items-start">
                                           <span>⚠️</span> Video besar (>700KB). Jika gagal simpan, gunakan kompresi video.
                                        </div>
                                     }

                                     <!-- Preview -->
                                     @if (config().intro.videoUrl) {
                                        <div class="mt-4 bg-black rounded-lg overflow-hidden shadow-lg relative group">
                                           <video [src]="config().intro.videoUrl" class="w-full h-32 object-cover opacity-80" controls></video>
                                           <button (click)="config().intro.videoUrl=''" class="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">✕</button>
                                        </div>
                                     }
                                  </div>
                                  <div class="space-y-4">
                                     <div>
                                        <label class="label">Durasi (Detik)</label>
                                        <input type="number" [(ngModel)]="config().intro.duration" class="input">
                                     </div>
                                     <div>
                                        <label class="label">Efek Hilang</label>
                                        <select [(ngModel)]="config().intro.fadeOut" class="input">
                                            <option value="fade">Fade Out</option>
                                            <option value="slide-up">Slide Up</option>
                                            <option value="slide-down">Slide Down</option>
                                            <option value="zoom-out">Zoom Out</option>
                                            <option value="none">Langsung Hilang</option>
                                        </select>
                                     </div>
                                  </div>
                               </div>
                            }
                         </div>
                      </div>

                      <div class="card mt-8">
                         <h3 class="card-header">Identitas & SEO</h3>
                         <div class="p-6 grid grid-cols-2 gap-6">
                            <div><label class="label">Nama Website</label><input type="text" [(ngModel)]="config().global.logoText" class="input"></div>
                            <div><label class="label">Google Analytics ID</label><input type="text" [(ngModel)]="config().global.analyticsId" class="input" placeholder="G-XXXXXX"></div>
                            <div class="col-span-2"><label class="label">Meta Description</label><textarea [(ngModel)]="config().global.metaDescription" class="input h-20"></textarea></div>
                         </div>
                      </div>
                   }

                   <!-- === HERO === -->
                   @if (currentTab() === 'hero') {
                      <div class="card">
                         <h3 class="card-header">Hero Section (Banner Utama)</h3>
                         <div class="p-6 space-y-6">
                            <div class="grid md:grid-cols-2 gap-6">
                               <div>
                                  <label class="label">Background Image/Video</label>
                                  <input type="file" (change)="onFileSelected($event, 'heroBg')" class="input-file mb-2">
                                  @if (config().hero.bgImage) {
                                    <div class="h-32 bg-gray-200 rounded-lg overflow-hidden relative">
                                       <img [src]="config().hero.bgImage" class="w-full h-full object-cover">
                                    </div>
                                  }
                               </div>
                               <div class="space-y-4">
                                  <div><label class="label">Overlay Opacity</label><input type="range" min="0" max="1" step="0.1" [(ngModel)]="config().hero.overlayOpacity" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"></div>
                                  <div><label class="label">Accent Color</label><input type="color" [(ngModel)]="config().hero.style.accentColor" class="w-full h-10 rounded cursor-pointer"></div>
                               </div>
                            </div>
                            
                            <hr class="border-gray-100">
                            
                            <div class="grid md:grid-cols-2 gap-6">
                               <div><label class="label">Headline Utama</label><input type="text" [(ngModel)]="config().hero.title" class="input font-bold text-lg"></div>
                               <div><label class="label">Highlight Text</label><input type="text" [(ngModel)]="config().hero.highlight" class="input text-orange-600 font-bold"></div>
                               <div class="col-span-2"><label class="label">Sub Judul</label><textarea [(ngModel)]="config().hero.subtitle" class="input h-20"></textarea></div>
                            </div>
                         </div>
                      </div>
                   }

                   <!-- === MENU === -->
                   @if (currentTab() === 'menu') {
                      <div class="card">
                         <div class="card-header flex justify-between items-center">
                            <h3>Daftar Menu Makanan</h3>
                            <button (click)="addMenuItem()" class="btn-primary text-xs">+ Tambah Item</button>
                         </div>
                         
                         <!-- Branch Tabs -->
                         <div class="bg-gray-50 border-b px-6 flex gap-2 overflow-x-auto">
                            @for (branch of config().branches; track $index) {
                               <button (click)="selectedBranchIndex.set($index)" 
                                  class="py-3 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap"
                                  [class.border-orange-500]="selectedBranchIndex() === $index"
                                  [class.text-orange-600]="selectedBranchIndex() === $index"
                                  [class.border-transparent]="selectedBranchIndex() !== $index">
                                  {{ branch.name }}
                               </button>
                            }
                         </div>

                         <div class="p-6 space-y-4">
                            @for (item of config().branches[selectedBranchIndex()].menu; track $index) {
                               <div class="flex gap-4 p-4 border rounded-xl bg-white hover:shadow-md transition group">
                                  <!-- Image -->
                                  <div class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative cursor-pointer group-hover:opacity-90">
                                     <img [src]="item.image" class="w-full h-full object-cover">
                                     <input type="file" (change)="onFileSelected($event, 'menuItem', $index)" class="absolute inset-0 opacity-0 cursor-pointer" title="Ganti Foto">
                                     <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 text-white text-xs font-bold transition">Ubah Foto</div>
                                  </div>
                                  
                                  <!-- Details -->
                                  <div class="flex-1 grid gap-2">
                                     <div class="flex gap-3">
                                        <input type="text" [(ngModel)]="item.name" class="input font-bold" placeholder="Nama Menu">
                                        <input type="text" [(ngModel)]="item.price" class="input w-32 text-right" placeholder="Harga">
                                     </div>
                                     <textarea [(ngModel)]="item.desc" class="input text-xs min-h-[40px] resize-none" placeholder="Deskripsi"></textarea>
                                     <div class="flex flex-wrap gap-2 items-center mt-1">
                                         <input type="text" [(ngModel)]="item.category" class="input text-xs w-24 py-1" placeholder="Kategori">
                                         <label class="badge-check bg-yellow-50 text-yellow-700 border-yellow-200">
                                            <input type="checkbox" [(ngModel)]="item.favorite"> Favorite
                                         </label>
                                         <label class="badge-check bg-red-50 text-red-700 border-red-200">
                                            <input type="checkbox" [(ngModel)]="item.soldOut"> Habis
                                         </label>
                                         <div class="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded border text-xs">
                                            <span>🌶️</span> <input type="number" [(ngModel)]="item.spicyLevel" class="w-8 bg-transparent text-center font-bold outline-none" min="0" max="5">
                                         </div>
                                     </div>
                                  </div>
                                  <button (click)="removeMenuItem($index)" class="text-gray-300 hover:text-red-500 self-start p-1 transition">✕</button>
                               </div>
                            }
                         </div>
                      </div>
                   }

                   <!-- === PACKAGES === -->
                   @if (currentTab() === 'packages') {
                      <div class="card">
                         <div class="card-header flex justify-between items-center">
                            <h3>Paket Hemat</h3>
                            <button (click)="addPackage()" class="btn-primary text-xs">+ Tambah Paket</button>
                         </div>
                         <div class="p-6 grid gap-6">
                            @if (!config().branches[selectedBranchIndex()].packages?.length) {
                               <div class="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed">Belum ada paket di cabang ini.</div>
                            }
                            @for (pkg of config().branches[selectedBranchIndex()].packages; track $index) {
                               <div class="border rounded-xl p-4 relative bg-white hover:shadow-md transition">
                                  <button (click)="removePackage($index)" class="absolute top-2 right-2 text-red-500 hover:text-red-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50">✕</button>
                                  <div class="flex gap-6">
                                     <div class="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden relative flex-shrink-0">
                                        <img [src]="pkg.image || 'https://picsum.photos/200'" class="w-full h-full object-cover">
                                        <input type="file" (change)="onFileSelected($event, 'packageItem', $index)" class="absolute inset-0 opacity-0 cursor-pointer">
                                     </div>
                                     <div class="flex-1 space-y-3">
                                        <div class="flex gap-3 pr-8">
                                            <input type="text" [(ngModel)]="pkg.name" class="input font-bold" placeholder="Nama Paket">
                                            <input type="text" [(ngModel)]="pkg.price" class="input w-32 text-right" placeholder="Harga">
                                        </div>
                                        <input type="text" [(ngModel)]="pkg.description" class="input text-sm" placeholder="Deskripsi Singkat">
                                        <div>
                                            <label class="label mb-1">Isi Paket (Pisahkan dengan koma)</label>
                                            <textarea [ngModel]="pkg.items.join(', ')" (ngModelChange)="updatePackageItems(pkg, $event)" class="input h-16 text-xs"></textarea>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            }
                         </div>
                      </div>
                   }

                   <!-- === ABOUT === -->
                   @if (currentTab() === 'about') {
                       <div class="card">
                          <h3 class="card-header">Tentang Kami</h3>
                          <div class="p-6 grid gap-6">
                             <div><label class="label">Judul</label><input type="text" [(ngModel)]="config().about.title" class="input"></div>
                             <div><label class="label">Deskripsi</label><textarea [(ngModel)]="config().about.description" class="input h-32"></textarea></div>
                             
                             <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                   <label class="label">Gambar About</label>
                                   <input type="file" (change)="onFileSelected($event, 'aboutImage')" class="input-file">
                                   <img [src]="config().about.image" class="mt-2 h-32 rounded object-cover bg-gray-100">
                                </div>
                                <div>
                                   <label class="label">Statistik (Angka | Label)</label>
                                   <div class="grid grid-cols-2 gap-2 mb-2">
                                      <input type="text" [(ngModel)]="config().about.stats.val1" class="input" placeholder="Val 1"><input type="text" [(ngModel)]="config().about.stats.label1" class="input" placeholder="Label 1">
                                   </div>
                                   <div class="grid grid-cols-2 gap-2 mb-2">
                                      <input type="text" [(ngModel)]="config().about.stats.val2" class="input" placeholder="Val 2"><input type="text" [(ngModel)]="config().about.stats.label2" class="input" placeholder="Label 2">
                                   </div>
                                   <div class="grid grid-cols-2 gap-2">
                                      <input type="text" [(ngModel)]="config().about.stats.val3" class="input" placeholder="Val 3"><input type="text" [(ngModel)]="config().about.stats.label3" class="input" placeholder="Label 3">
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                   }

                   <!-- === LOCATION === -->
                   @if (currentTab() === 'location') {
                      <div class="card">
                         <div class="card-header flex justify-between items-center">
                            <h3>Lokasi & Cabang</h3>
                            <button (click)="addBranch()" class="btn-primary text-xs">+ Tambah Cabang</button>
                         </div>
                         <div class="p-6">
                             <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
                                @for (branch of config().branches; track $index) {
                                    <button (click)="selectedBranchIndex.set($index)" 
                                        class="px-4 py-2 rounded-lg border text-sm font-bold whitespace-nowrap transition" 
                                        [class.bg-gray-800]="selectedBranchIndex() === $index" 
                                        [class.text-white]="selectedBranchIndex() === $index"
                                        [class.bg-white]="selectedBranchIndex() !== $index">
                                        {{ branch.name }}
                                    </button>
                                }
                             </div>
                             
                             <div class="grid md:grid-cols-2 gap-8">
                                <div class="space-y-4">
                                   <div><label class="label">Nama Cabang</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].name" class="input font-bold"></div>
                                   <div><label class="label">Alamat Lengkap</label><textarea [(ngModel)]="config().branches[selectedBranchIndex()].address" class="input h-24"></textarea></div>
                                   <div class="grid grid-cols-2 gap-4">
                                      <div><label class="label">Telepon</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].phone" class="input"></div>
                                      <div><label class="label">WhatsApp</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].whatsappNumber" class="input"></div>
                                   </div>
                                   <div><label class="label">Jam Buka</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].hours" class="input"></div>
                                   <button (click)="removeBranch()" class="text-red-600 text-xs font-bold underline mt-2">Hapus Cabang Ini</button>
                                </div>
                                
                                <div>
                                   <label class="label">Link & Peta</label>
                                   <div class="space-y-4">
                                      <div><label class="label text-xs">Google Maps URL</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].googleMapsUrl" class="input"></div>
                                      <div><label class="label text-xs">Instagram Link</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].instagramLink" class="input"></div>
                                      
                                      <div>
                                         <label class="label">Foto Peta / Lokasi</label>
                                         <div class="h-40 bg-gray-100 rounded-lg overflow-hidden relative border group">
                                            <img [src]="config().branches[selectedBranchIndex()].mapImage" class="w-full h-full object-cover">
                                            <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                <span class="text-white font-bold text-sm">Klik ganti foto</span>
                                            </div>
                                            <input type="file" (change)="onFileSelected($event, 'branchMap')" class="absolute inset-0 opacity-0 cursor-pointer">
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </div>
                         </div>
                      </div>
                   }

                   <!-- === MEDIA (Gallery & Testimonial) === -->
                   @if (currentTab() === 'media') {
                       <div class="space-y-8">
                          <!-- Gallery -->
                          <div class="card">
                             <div class="card-header flex justify-between items-center">
                                <h3>Galeri Foto</h3>
                                <label class="btn-primary text-xs cursor-pointer">
                                   + Upload Foto
                                   <input type="file" (change)="onFileSelected($event, 'gallery')" class="hidden">
                                </label>
                             </div>
                             <div class="p-6 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                @for (img of config().gallery; track $index) {
                                   <div class="relative aspect-square group rounded-lg overflow-hidden bg-gray-100 shadow-sm border">
                                      <img [src]="img" class="w-full h-full object-cover">
                                      <button (click)="removeGalleryImage($index)" class="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">✕</button>
                                   </div>
                                }
                             </div>
                          </div>

                          <!-- Testimonials -->
                          <div class="card">
                             <div class="card-header flex justify-between items-center">
                                <h3>Testimoni Pelanggan</h3>
                                <button (click)="addTestimonial()" class="btn-primary text-xs">+ Tambah</button>
                             </div>
                             <div class="p-6 grid md:grid-cols-2 gap-6">
                                @for (t of config().testimonials; track $index) {
                                   <div class="bg-gray-50 border p-4 rounded-xl relative group">
                                      <button (click)="removeTestimonial($index)" class="absolute top-2 right-2 text-red-400 hover:text-red-600">✕</button>
                                      <div class="space-y-2">
                                         <div class="flex gap-2">
                                            <input type="text" [(ngModel)]="t.name" class="input font-bold" placeholder="Nama">
                                            <input type="text" [(ngModel)]="t.role" class="input text-xs w-1/3" placeholder="Status/Role">
                                         </div>
                                         <textarea [(ngModel)]="t.text" class="input h-20 text-sm"></textarea>
                                         <div class="flex items-center gap-2">
                                            <span class="text-xs font-bold text-gray-500">Rating:</span>
                                            <div class="flex text-orange-400">
                                               @for(s of [1,2,3,4,5]; track s) { <span class="cursor-pointer" (click)="t.rating = s">{{ s <= t.rating ? '★' : '☆' }}</span> }
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                }
                             </div>
                          </div>
                       </div>
                   }

                   <!-- === FOOTER === -->
                   @if (currentTab() === 'footer') {
                       <div class="card">
                          <h3 class="card-header">Footer & Copyright</h3>
                          <div class="p-6 grid gap-6">
                             <div><label class="label">Deskripsi Singkat</label><textarea [(ngModel)]="config().footer.description" class="input h-24"></textarea></div>
                             <div><label class="label">Teks Copyright</label><input type="text" [(ngModel)]="config().footer.copyrightText" class="input"></div>
                             
                             <div class="grid md:grid-cols-3 gap-6 pt-4 border-t">
                                <div><label class="label">Link Instagram (Utama)</label><input type="text" [(ngModel)]="config().footer.instagramLink" class="input"></div>
                                <div><label class="label">Link Facebook</label><input type="text" [(ngModel)]="config().footer.facebookLink" class="input"></div>
                                <div><label class="label">Link TikTok</label><input type="text" [(ngModel)]="config().footer.tiktokLink" class="input"></div>
                             </div>
                          </div>
                       </div>
                   }

                   <!-- === AI === -->
                   @if (currentTab() === 'ai') {
                       <div class="card border-l-4 border-l-purple-500">
                          <div class="card-header text-purple-900 bg-purple-50">
                             <h3>Konfigurasi AI Assistant (Gemini)</h3>
                          </div>
                          <div class="p-6 space-y-6">
                             <div>
                                <label class="label">Instruksi Sistem (System Prompt)</label>
                                <p class="text-xs text-gray-500 mb-2">Jelaskan bagaimana AI harus berperilaku, menu apa yang direkomendasikan, dan tone bicaranya.</p>
                                <textarea [(ngModel)]="config().ai.systemInstruction" class="input h-40 font-mono text-sm bg-gray-50"></textarea>
                             </div>
                             <div>
                                <label class="label">Pesan Sapaan Awal</label>
                                <input type="text" [(ngModel)]="config().ai.initialMessage" class="input">
                             </div>
                          </div>
                       </div>
                   }

                   <!-- === DATABASE === -->
                   @if (currentTab() === 'database') {
                       <div class="card border-l-4 border-l-red-500">
                          <div class="card-header text-red-900 bg-red-50 flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                             <h3>Konfigurasi Database (Danger Zone)</h3>
                          </div>
                          <div class="p-6">
                             <p class="text-sm text-red-600 mb-6 bg-red-50 p-3 rounded border border-red-100">
                                <b>PERINGATAN:</b> Mengubah data ini akan memutus koneksi aplikasi ke server. Hanya lakukan jika Anda tahu apa yang Anda lakukan.
                             </p>
                             <div class="grid gap-4 max-w-xl">
                                <div><label class="label">API Key</label><input type="password" [(ngModel)]="tempConfig.apiKey" class="input font-mono"></div>
                                <div><label class="label">Project ID</label><input type="text" [(ngModel)]="tempConfig.projectId" class="input font-mono"></div>
                                <div><label class="label">Auth Domain</label><input type="text" [(ngModel)]="tempConfig.authDomain" class="input font-mono"></div>
                                <div><label class="label">Storage Bucket</label><input type="text" [(ngModel)]="tempConfig.storageBucket" class="input font-mono"></div>
                                <div><label class="label">App ID</label><input type="text" [(ngModel)]="tempConfig.appId" class="input font-mono"></div>
                                
                                <button (click)="saveFirebaseSetup()" class="btn-primary bg-red-600 hover:bg-red-700 mt-4">Simpan Konfigurasi</button>
                             </div>
                          </div>
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
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
    
    .label { @apply block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide; }
    .input { @apply w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm; }
    .input-file { @apply text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100; }
    
    .card { @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden; }
    .card-header { @apply px-6 py-4 border-b border-gray-100 font-bold text-lg text-gray-800 bg-white; }
    
    .btn-primary { @apply bg-gray-900 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-black transition flex items-center gap-2; }
    .badge-check { @apply flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold cursor-pointer transition select-none hover:brightness-95; }
    .toggle-checkbox { @apply w-5 h-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300 cursor-pointer; }

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
  showPassword = signal(false);
  isLoggingIn = signal(false);
  loginError = signal<string | null>(null);
  
  // UI State
  selectedBranchIndex = signal(0);
  videoSizeWarning = signal(false);
  
  isAuthenticated = computed(() => this.configService.currentUser() !== null || this.configService.isDemoMode());
  firestoreError = this.configService.firestoreError;

  tabs = [
    { id: 'global', label: 'Global & Intro', icon: '⚙️' },
    { id: 'hero', label: 'Hero Banner', icon: '🏠' },
    { id: 'about', label: 'Tentang Kami', icon: '📖' },
    { id: 'menu', label: 'Daftar Menu', icon: '🍽️' },
    { id: 'packages', label: 'Paket Hemat', icon: '📦' },
    { id: 'location', label: 'Lokasi Cabang', icon: '📍' },
    { id: 'media', label: 'Galeri & Testimoni', icon: '📷' },
    { id: 'footer', label: 'Footer & Sosmed', icon: '🔗' },
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

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async login() {
    this.isLoggingIn.set(true);
    this.loginError.set(null);
    try {
      await this.configService.loginAdmin(this.emailInput(), this.passwordInput());
      this.toastService.show('Selamat datang, Admin!', 'success');
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
      this.toastService.show('Perubahan berhasil disimpan!', 'success');
    } catch (e: any) {
       console.error(e);
       this.toastService.show('Gagal menyimpan. Cek koneksi.', 'error');
    }
  }

  async onFileSelected(event: any, type: string, index?: number) {
    const file = event.target.files[0];
    if (!file) return;

    if (type === 'introVideo') {
       this.videoSizeWarning.set(false);
       if (file.size > 2 * 1024 * 1024) {
          alert("Video terlalu besar! Maksimal 2MB.");
          return;
       }
       if (file.size > 700 * 1024) {
          this.videoSizeWarning.set(true);
       }
    }

    this.isUploading.set(true);
    try {
      const base64 = await this.configService.uploadFile(file);
      
      this.config.update(c => {
        const newC = { ...c };
        if (type === 'introVideo') newC.intro.videoUrl = base64;
        if (type === 'heroBg') newC.hero.bgImage = base64;
        if (type === 'aboutImage') newC.about.image = base64;
        
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
        if (type === 'gallery') {
           newC.gallery.push(base64);
        }
        return newC;
      });
      
      this.toastService.show('File berhasil diunggah', 'success');
    } catch (e) {
      this.toastService.show('Gagal mengunggah file', 'error');
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
    const id = prompt("Masukkan ID unik cabang (contoh: 'jakarta'):");
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
    if (this.config().branches.length <= 1) {
      alert("Minimal harus ada 1 cabang.");
      return;
    }
    if(!confirm('Hapus cabang ini beserta seluruh datanya?')) return;
    
    this.config.update(c => {
      const newC = { ...c };
      newC.branches.splice(this.selectedBranchIndex(), 1);
      this.selectedBranchIndex.set(0);
      return newC;
    });
  }

  addTestimonial() {
    this.config.update(c => {
      const newC = { ...c };
      newC.testimonials.unshift({
        name: 'Pelanggan',
        role: 'Foodie',
        text: 'Makanannya enak!',
        rating: 5
      });
      return newC;
    });
  }

  removeTestimonial(index: number) {
    this.config.update(c => {
      const newC = { ...c };
      newC.testimonials.splice(index, 1);
      return newC;
    });
  }

  removeGalleryImage(index: number) {
    if(!confirm('Hapus foto ini?')) return;
    this.config.update(c => {
      const newC = { ...c };
      newC.gallery.splice(index, 1);
      return newC;
    });
  }

  saveFirebaseSetup() { 
    this.configService.saveStoredFirebaseConfig(this.tempConfig);
    this.toastService.show('Konfigurasi Database tersimpan.', 'success');
  }
}
