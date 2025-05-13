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
    message: string;
};

export type UserJoinEvent = {
    username: string;
};

export type UserLeftEvent = {
    username: string;
};