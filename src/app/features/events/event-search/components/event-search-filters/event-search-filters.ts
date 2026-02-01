import { Component, computed, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import { ClickOutsideDirective } from '../../../../../shared/directives/click-outside.directive';
import { SearchFilters } from '../../event-search.types';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-event-search-filters',
  imports: [ReactiveFormsModule, ClickOutsideDirective, DecimalPipe],
  templateUrl: './event-search-filters.html',
  styleUrl: './event-search-filters.css',
})
export class EventSearchFilters implements OnInit {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private fb = inject(FormBuilder);

  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  genres = input.required<string[]>();
  countries = input.required<string[]>();
  sliderMax = input<number>(0);
  globalMaxPrice = input<number>(0);
  initialGenres = input<string[]>([]);

  // ==========================================
  // OUTPUTS
  // ==========================================
  @Output() filtersChange = new EventEmitter<SearchFilters>();
  @Output() reset = new EventEmitter<void>();

  // ==========================================
  // FORM
  // ==========================================

  form: FormGroup = this.fb.group({
    title: [''],
    country: [''],
  });

  private formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  // ==========================================
  // LOCAL STATE
  // ==========================================

  selectedGenres = signal<string[]>([]);
  maxPrice = signal<number | null>(null);
  countryOpen = false;

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    if (this.initialGenres().length > 0) {
      this.selectedGenres.set(this.initialGenres());
      this.emitFilters();
    }
  }

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  countryValue = computed(() => {
    const formVal = this.formValue();
    return (formVal?.country ?? '').toString();
  });

  countryLabel = computed(() => {
    return this.countryValue() || 'All countries';
  });

  hasActivePriceFilter = computed(() => {
    const max = this.maxPrice();
    if (max == null) return false;
    return this.globalMaxPrice() > 0 ? max < this.globalMaxPrice() : true;
  });

  hasAnyActiveFilters = computed(() => {
    const formVal = this.formValue();
    const title = (formVal?.title ?? '').toString().trim();
    const country = (formVal?.country ?? '').toString().trim();

    return !!title || !!country || this.selectedGenres().length > 0 || this.hasActivePriceFilter();
  });

  // ==========================================
  // FILTER EMISSION
  // ==========================================

  private emitFilters(): void {
    const formVal = this.formValue();
    this.filtersChange.emit({
      title: (formVal?.title ?? '').toString(),
      country: (formVal?.country ?? '').toString(),
      genres: this.selectedGenres(),
      maxPrice: this.maxPrice(),
    });
  }

  // ==========================================
  // TITLE FILTER
  // ==========================================

  onTitleInput(): void {
    this.emitFilters();
  }

  // ==========================================
  // COUNTRY FILTER
  // ==========================================

  toggleCountry(): void {
    this.countryOpen = !this.countryOpen;
  }

  selectCountry(value: string): void {
    this.form.get('country')?.setValue(value);
    this.countryOpen = false;
    this.emitFilters();
  }

  clearCountry(): void {
    this.form.get('country')?.setValue('');
    this.emitFilters();
  }

  // ==========================================
  // GENRE FILTER
  // ==========================================

  toggleGenre(genre: string): void {
    const current = this.selectedGenres();
    this.selectedGenres.set(
      current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre],
    );

    this.emitFilters();
  }

  clearGenres(): void {
    this.selectedGenres.set([]);
    this.emitFilters();
  }

  // ==========================================
  // PRICE FILTER
  // ==========================================

  onMaxPriceChange(value: number): void {
    this.maxPrice.set(Number.isNaN(value) ? null : Math.round(value * 100) / 100);
    this.emitFilters();
  }

  clearPrice(): void {
    this.maxPrice.set(null);
    this.emitFilters();
  }

  // ==========================================
  // RESET
  // ==========================================

  clearAll(): void {
    this.form.reset({ title: '', country: '' });
    this.selectedGenres.set([]);
    this.maxPrice.set(null);

    this.reset.emit();
    this.emitFilters();
  }
}
