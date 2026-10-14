/** A widget on the page */
export interface Widget {
    id: string;
}

export enum WidgetKind {
    box = 'box',
}

export type WidgetId = string;

type InternalCounter = number;
export const unused: InternalCounter = 0;
