export type MessageEvent = { 
    /**
     * The event that got fired.
     */
    event: string;
    /**
     * The data that was returned.
     */
    data: string | number | object;
};

export type UserMessageEvent = {
    username: string;
    content: string;
};

export type UserJoinEvent = {
    roomId: string;
};

export type UserLeftEvent = {
    roomId: string;
};