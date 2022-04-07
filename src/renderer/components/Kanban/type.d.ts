import type { DistractingRow } from '../Timer/action';

export interface Card {
    _id: string;
    content: string;
    title: string;
    sessionIds: string[];
    spentTimeInHour: {
        estimated: number;
        actual: number;
    };
    createdTime?: number;
    labels?: Label[];
    integration?: CardIntegration;
}

export interface CardIntegration {
    profileName?: string;
    gid?: string;
}
export interface IntegrationInfo {
    profileName: string;
    sourceOfTruth?: string;
    gitlab?: GitlabIntegrationInfo;
}
export interface GitlabIntegrationInfo {
    tokenRW?: string;
    tokenRO?: string;
}
export interface AggInfo {
    lastUpdatedTime: number;
    spentTime: number;
    appSpentTime: { [app: string]: number };
    keywordWeights: { [key: string]: number };
}

export interface Tag {
    name: string;
    count: number;
}

export interface Label {
    id: string;
    title: string;
    description: string;
    color: string;
    textColor: string;
}

export interface KanbanBoard {
    _id: string;
    name: string;
    spentHours: number;
    description: string;
    lists: string[]; // lists id in order
    focusedList: string;
    doneList: string;
    relatedSessions: string[];
    dueTime?: number; // TODO: Add due time setting
    lastVisitTime?: number;
    aggInfo?: AggInfo;
    pin?: boolean;
    collapsed?: boolean;
    distractionList?: DistractingRow[];
}

export interface List {
    _id: string;
    title: string;
    cards: string[]; // lists id in order
    visibleCards?: string[];
}

export type ListsState = { [_id: string]: List };

export interface MoveInfo {
    fromListId: string;
    toListId: string;
    cardId: string;
    time: number;
}
