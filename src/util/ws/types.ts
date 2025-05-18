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

export type UserJoinEvent = GenericUser;

export type UserLeftEvent = GenericUser;

export interface UserMessageEvent extends GenericUser {
    /**
     * The message that the user sent.
     */
    message: string;
};

export type GenericMedia = {
    /**
     * The title of the currently playing media.
     */
    title: string;
    /**
     * The series of the currently playing media.
     */
    series: string;
    /**
     * The URL associated with the media.
     */
    url: string;
    /**
     * The poster image of the anime series.
     */
    poster_image_url: string;
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

export type MediaUpdateEvent = GenericMedia;

export type RoomDataEvent = {
    /**
     * The current playing media.
     */
    now_playing: NowPlaying;
    /**
     * An array of media that is queued to be played.
     */
    queue: Array<MediaUpdateEvent>;
};

export type TimeUpdateEvent = GenericPlayingMedia;