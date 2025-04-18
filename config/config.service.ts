import dotenv from "dotenv";
import { IConfigService } from "./config.interface";
dotenv.config();

export class ConfigService implements IConfigService {
    constructor() {
        if (!process.env.TOKEN) {
            throw new Error('Не найдена переменная окружения TOKEN');
        }
    }

    get(key: string): string {
        const res = process.env[key];
        if (!res) {
            throw new Error(`Нет такого ключа: ${key}`);
        }
        return res;
    }
}