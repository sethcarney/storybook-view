"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonComponent = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
let ButtonComponent = class ButtonComponent {
    constructor() {
        this.label = 'Button';
        this.variant = 'primary';
        this.size = 'medium';
        this.disabled = false;
        this.clicked = new core_1.EventEmitter();
    }
    get buttonClasses() {
        return `${this.variant} ${this.size}`;
    }
};
__decorate([
    (0, core_1.Input)()
], ButtonComponent.prototype, "label", void 0);
__decorate([
    (0, core_1.Input)()
], ButtonComponent.prototype, "variant", void 0);
__decorate([
    (0, core_1.Input)()
], ButtonComponent.prototype, "size", void 0);
__decorate([
    (0, core_1.Input)()
], ButtonComponent.prototype, "disabled", void 0);
__decorate([
    (0, core_1.Output)()
], ButtonComponent.prototype, "clicked", void 0);
ButtonComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-button',
        standalone: true,
        imports: [common_1.CommonModule],
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
], ButtonComponent);
exports.ButtonComponent = ButtonComponent;
//# sourceMappingURL=Button.js.map