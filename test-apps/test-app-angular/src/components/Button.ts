import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClasses"
      [disabled]="disabled"
      (click)="clicked.emit($event)"
    >
      {{ label }}
    </button>
  `,
  styles: [`
    button {
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-family: sans-serif;
      transition: opacity 0.2s, transform 0.1s;
    }
    button:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    button:active:not(:disabled) { transform: translateY(0); }
    button:disabled { opacity: 0.5; cursor: not-allowed; }

    .primary   { background: #6366f1; color: white; }
    .secondary { background: #e5e7eb; color: #374151; }
    .danger    { background: #ef4444; color: white; }

    .small  { padding: 6px 12px;  font-size: 12px; }
    .medium { padding: 10px 20px; font-size: 14px; }
    .large  { padding: 14px 28px; font-size: 16px; }
  `],
})
export class ButtonComponent {
  @Input() label = 'Button';
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    return `${this.variant} ${this.size}`;
  }
}
