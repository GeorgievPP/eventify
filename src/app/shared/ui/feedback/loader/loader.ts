import { Component, inject } from '@angular/core';

import { LoadingService } from '../../../../core/services/ui';


@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
})
export class Loader {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private loadingService = inject(LoadingService);

  // ==========================================
  // LOADING STATE (from service)
  // ==========================================
  isLoading = this.loadingService.isLoading;
}