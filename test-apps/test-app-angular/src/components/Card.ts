import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <img *ngIf="imageUrl" [src]="imageUrl" [alt]="title" class="card-image" />
      <div class="card-body">
        <h3 class="card-title">{{ title }}</h3>
        <p class="card-description">{{ description }}</p>
        <div *ngIf="badge" class="card-badge">{{ badge }}</div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
      width: 280px;
      font-family: sans-serif;
      transition: box-shadow 0.2s;
    }
    .card.elevated { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .card-image { width: 100%; height: 160px; object-fit: cover; }
    .card-body { padding: 16px; }
    .card-title {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 700;
      color: #111827;
    }
    .card-description {
      margin: 0 0 12px;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }
    .card-badge {
      display: inline-block;
      padding: 4px 10px;
      background: #ede9fe;
      color: #7c3aed;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
    }
  `],
})
export class CardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() imageUrl = '';
  @Input() badge = '';
  @Input() elevated = false;

  get cardClasses(): string {
    return this.elevated ? 'card elevated' : 'card';
  }
}
