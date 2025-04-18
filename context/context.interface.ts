import { Context } from "telegraf";

export interface SessionData {
    userLike: boolean;
}

export interface IBotContext extends Context {
    session: SessionData
}