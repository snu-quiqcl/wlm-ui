export interface EventType {
    category: string;
    content: string;
    occurredAt: string;
};

export interface EventInfo {
    event: EventType;
};

export interface EventListInfo {
    events: EventInfo[];
};
