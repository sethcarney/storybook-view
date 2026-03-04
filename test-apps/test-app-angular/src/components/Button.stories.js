"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disabled = exports.Large = exports.Small = exports.Danger = exports.Secondary = exports.Primary = void 0;
const Button_1 = require("./Button");
const meta = {
    title: 'Components/Button',
    component: Button_1.ButtonComponent,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'danger'],
            description: 'The button style variant',
        },
        size: {
            control: 'select',
            options: ['small', 'medium', 'large'],
            description: 'The button size',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the button is disabled',
        },
        clicked: { action: 'clicked' },
    },
};
exports.default = meta;
exports.Primary = {
    args: { label: 'Primary Button', variant: 'primary', size: 'medium' },
};
exports.Secondary = {
    args: { label: 'Secondary Button', variant: 'secondary', size: 'medium' },
};
exports.Danger = {
    args: { label: 'Delete', variant: 'danger', size: 'medium' },
};
exports.Small = {
    args: { label: 'Small Button', size: 'small' },
};
exports.Large = {
    args: { label: 'Large Button', size: 'large' },
};
exports.Disabled = {
    args: { label: 'Disabled Button', disabled: true },
};
//# sourceMappingURL=Button.stories.js.map