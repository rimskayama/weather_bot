import { Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { IBotContext } from '../context/context.interface';
import { ConfigService } from '../config/config.service';
import { Command } from '../command/command.class';
import { IConfigService } from '../config/config.interface';
import { FeedbackCommand } from '../command/feedback.command';
import { StartCommand } from '../command/start.command';
import { MongoClient } from 'mongodb';
import { session } from 'telegraf-session-mongodb';


class Bot {
    bot: Telegraf<IBotContext>;
    commands: Command[] = [];
    mongoClient: MongoClient;

    constructor(private readonly configService: IConfigService) {
        this.bot = new Telegraf<IBotContext>(this.configService.get('TOKEN'));

        // Подключение к MongoDB
        const mongoUri = this.configService.get('MONGODB_URI');
        this.mongoClient = new MongoClient(mongoUri);
        this.mongoClient.connect().then(() => {
            console.log("Connected to MongoDB");
        }).catch(err => {
            console.error("Failed to connect to MongoDB", err);
        });

        const db = this.mongoClient.db('Users'); 
        
        this.bot.use(session(db)); 

        this.commands = [new FeedbackCommand(this.bot), new StartCommand(this.bot)];
        this.setWebhook();
        for (const command of this.commands) {
            command.handle();
        }        
    }

    private async setWebhook() {
        const webhookUrl = `https://${process.env.VERCEL_URL}/api/webhook`;
        await this.bot.telegram.setWebhook(webhookUrl);
    }

    public webhook(req: VercelRequest, res: VercelResponse) {
        if (req.method === 'POST') {
            console.log("Received a webhook request:", req.body); // Логируйте здесь входящие данные
            this.bot.handleUpdate(req.body, res);
        } else {
            console.log("Received non-POST request");
            res.status(405).send('Method Not Allowed');
        }
    }
}

const bot = new Bot(new ConfigService());

export default (req: VercelRequest, res: VercelResponse) => {
    bot.webhook(req, res);
};