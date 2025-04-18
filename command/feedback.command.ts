import { Markup, Telegraf } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { Command } from "./command.class";

export class FeedbackCommand extends Command {
    constructor(bot: Telegraf<IBotContext>) {
        super(bot);
    }

        handle(): void {
            this.bot.command('feedback',(ctx) => {
                ctx.reply('Насколько точным вы считаете наш прогноз погоды на сегодня?', 
                        Markup.inlineKeyboard([Markup.button.callback("👍", 'like'), 
                        Markup.button.callback("👎", 'dislike')])
                );
            })
            this.bot.action("like", (ctx) => {
                ctx.session.userLike = true;
                ctx.editMessageText('Круто!');
            })
            this.bot.action("dislike", (ctx) => {
                ctx.session.userLike = false;
                ctx.editMessageText(':(');
            })
        }
    }

