import { Telegraf } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { Command } from "./command.class";
import axios from "axios";
import { Exception } from "../exception/exception.interface";

export class StartCommand extends Command {
    constructor(bot: Telegraf<IBotContext>) {
        super(bot);
    }

    handle() {
        this.bot.command('start', (ctx) => {
            ctx.reply('Добро пожаловать! Напишите название города, чтобы получить прогноз погоды.');
        });

        this.bot.hears(/.+/, async (ctx) => {
            const city: string = ctx.message.text.toString();
            console.log(`Данные: ${city}`);
            const weatherData = await this.getWeather(city);
            let UVIndex;
            if (weatherData) {
                UVIndex = await this.getUVIndex(weatherData.coord.lat, weatherData.coord.lon);
                console.log(`Широта: ${weatherData.coord.lat}, долгота: ${weatherData.coord.lon}`);
            }
            
            
            if (UVIndex != undefined) {
                ctx.reply(`Погода 📍 ${city}: \nТемпература: ${weatherData.main.temp}°C \nОписание: ${weatherData.weather[0].description} \nUV Index: ${UVIndex}`);
                console.log(`Погода 📍 ${city}: \nТемпература: ${weatherData.main.temp}°C \nОписание: ${weatherData.weather[0].description} \nUV Index: ${UVIndex}`);
            } else {
                ctx.reply('Не удалось получить данные о погоде. Попробуйте другой город.');
            }
        });
    }

    async getWeather(city: string) {
        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: { 
                    q: city,
                    appid: process.env.WEATHER_API_KEY,
                    lang: 'ru',
                    units: 'metric' // для получения температуры в Цельсиях
                }
            });
            return response.data;
        } catch (error) {
            const exception = error as Exception;

            if (exception.response && exception.response.data && exception.response.status) {
                console.error(
                    `data: ${exception.response.data.message}, status: ${exception.response.status}`);
            } else {
                console.error('Произошла ошибка:', error instanceof Error ? error.message : 'Неизвестная ошибка');
            }
            return null;
        }
    }

        async getUVIndex (latitude: number, longitude: number) {
            const api_key = process.env.UVI_API_KEY;
            try {
                const response = await axios.get(
                    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?key=${api_key}`, {
                });
        
                const UVIndex = response.data.currentConditions?.uvindex;
                console.log(`UV Index: ${UVIndex}`);
                return UVIndex;
            } catch (error) {
                console.error('Error', error);
            }
        };
}
