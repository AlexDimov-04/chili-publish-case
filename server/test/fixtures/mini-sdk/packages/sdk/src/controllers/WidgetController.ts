import type { Widget, WidgetKind } from '../types/WidgetTypes';

export class WidgetController {
    #api = 'engine';
    lock = new WidgetLockController();

    /**
     * Returns all widgets
     */
    getAll = async () => {
        return [] as Widget[];
    };

    /**
     * Renames a widget
     * @param id the widget id
     */
    rename = async (id: string, name: string): Promise<void> => {
        void [id, name, this.#api];
    };

    /**
     * Changes the kind of a widget
     */
    setKind = async (id: string, kind?: WidgetKind | null) => {
        void [id, kind];
    };

    /**
     * @ignore
     */
    internalHelper = () => 1;

    private secret = () => 2;

    #hidden = () => 3;
}

export class WidgetLockController {
    /** Locks a widget */
    lock(id: string): boolean {
        return id.length > 0;
    }
}

export class OrphanController {
    orphan = () => 0;
}
