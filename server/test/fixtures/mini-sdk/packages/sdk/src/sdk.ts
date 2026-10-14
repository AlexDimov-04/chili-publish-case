import { WidgetController } from './controllers/WidgetController';

type Instrumented<T> = T;

export class SDK {
    widget: Instrumented<WidgetController>;
    config: { editorId: string };

    constructor() {
        this.widget = new WidgetController();
        this.config = { editorId: 'x' };
    }
}
