import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';


@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();
  @Output() esc = new EventEmitter<void>();

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(ev: PointerEvent): void {
    const host = this.el.nativeElement;
    const target = ev.target as Node | null;

    if (!target || host.contains(target)) return;

    this.clickOutside.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.esc.emit();
  }
}
