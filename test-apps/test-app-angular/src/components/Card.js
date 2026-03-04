"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardComponent = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
let CardComponent = class CardComponent {
    constructor() {
        this.title = '';
        this.description = '';
        this.imageUrl = '';
        this.badge = '';
        this.elevated = false;
    }
    get cardClasses() {
        return this.elevated ? 'card elevated' : 'card';
    }
};
__decorate([
    (0, core_1.Input)()
], CardComponent.prototype, "title", void 0);
__decorate([
    (0, core_1.Input)()
], CardComponent.prototype, "description", void 0);
__decorate([
    (0, core_1.Input)()
], CardComponent.prototype, "imageUrl", void 0);
__decorate([
    (0, core_1.Input)()
], CardComponent.prototype, "badge", void 0);
__decorate([
    (0, core_1.Input)()
], CardComponent.prototype, "elevated", void 0);
CardComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-card',
        standalone: true,
        imports: [common_1.CommonModule],
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
], CardComponent);
exports.CardComponent = CardComponent;
//# sourceMappingURL=Card.js.map