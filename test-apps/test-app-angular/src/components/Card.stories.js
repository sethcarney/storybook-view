"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithImage = exports.Elevated = exports.WithBadge = exports.Default = void 0;
const Card_1 = require("./Card");
const meta = {
    title: 'Components/Card',
    component: Card_1.CardComponent,
    tags: ['autodocs'],
    argTypes: {
        title: { control: 'text', description: 'Card heading' },
        description: { control: 'text', description: 'Card body text' },
        imageUrl: { control: 'text', description: 'URL for the cover image' },
        badge: { control: 'text', description: 'Optional badge label' },
        elevated: { control: 'boolean', description: 'Drop shadow' },
    },
};
exports.default = meta;
exports.Default = {
    args: {
        title: 'Angular Component',
        description: 'A simple card built with a standalone Angular component and Storybook.',
    },
};
exports.WithBadge = {
    args: {
        title: 'Featured',
        description: 'This card has a badge label displayed below the description.',
        badge: 'New',
    },
};
exports.Elevated = {
    args: {
        title: 'Elevated Card',
        description: 'Uses a drop shadow to lift the card off the page.',
        elevated: true,
    },
};
exports.WithImage = {
    args: {
        title: 'Photo Card',
        description: 'A card with a cover image at the top.',
        imageUrl: 'https://picsum.photos/seed/angular/560/320',
        elevated: true,
    },
};
//# sourceMappingURL=Card.stories.js.map