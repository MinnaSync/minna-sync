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

type GenericUser = {
    /**
     * The username for the user.
     */
    username: string;
}

export type ConnectionEvent = {};

export type ConnectedEvent = {};

export type JoinRoomEvent = {
    /**
     * The channel that was joined.
     */
    channel_id: string;
    /**
     * The username that the guest user is joining as.
     * This field will not work if any authorization is provided.
     */
    guest_username?: string;
};

export type PlayerStateEvent = 
    { paused: boolean; } |
    { current_time: number; } |
    { current_time: number; paused: boolean; };

export type UserJoinEvent = GenericUser;

export type UserLeftEvent = GenericUser;

export interface GenericMessageEvent {
    /**
     * The message that the user sent.
     */
    message: string;
};

export type UserMessageEvent = GenericUser & GenericMessageEvent;

export type GenericMedia = {
    /**
     * The title of the currently playing media.
     */
    title?: string | null;
    /**
     * The series of the currently playing media.
     */
    series?: string | null;
    /**
     * The URL associated with the media.
     */
    url: string;
    /**
     * The poster image of the anime series.
     */
    poster_image_url?: string | null;
}

export type GenericPlayingMedia = {
    /**
     * Whether or not the current media is played or paused.
     */
    paused: boolean;
    /**
     * The current playback time of the media.
     */
    current_time: number;
}

export interface NowPlaying extends GenericMedia, GenericPlayingMedia {};

export type QueueMediaId = { id: string };

export type QueuedMedia = QueueMediaId & GenericMedia;

export enum MessageType {
    /** A system notification */
    Notification = 0,
    /** A user joining the channel. */
    UserJoin = 1,
    /** A user leaving the channel. */
    UserLeave = 2,
    /** A user sending a message to the channel. */
    UserMessage = 3,
    /** When media is changed. */
    MediaChanged = 4,
    /** When media is queued to be played. */
    MediaQueued = 5,
    /** When Media is removed from the queue */
    MediaRemoved = 6,
}

export type ChannelMessage = {
    /**
     * The type of the message that was sent.
     */
    type: MessageType;
    /**
     * When the message was sent.
     */
    utc_epoch: number;
    /**
     * The user that sent this message.
     * Anything that is not UserMessage will be "System".
     */
    username: string;
    /**
     * The contents of the message.
     */
    content: string;
}

export type RoomDataEvent = {
    /**
     * The current playing media.
     */
    now_playing: NowPlaying;
    /**
     * An array of media that is queued to be played.
     */
    queue: Array<QueuedMedia>;
    /**
     * A list of the current messages in the channel.
     */
    messages: Array<ChannelMessage>;
};

export enum CommandType {
    /**
     * A user has taken control over the player.
     */
    TakeRemote = 0,
    /**
     * The channel's messages have been purged.
     */
    PurgeMessages = 1,
    /**
     * Tells the server to skip to the next queued media.
     */
    QueueSkip = 2
}

export type ChannelCommand = {
    /**
     * The type of command that was executed.
     */
    type: CommandType;
};

export type TimeUpdateEvent = GenericPlayingMedia;