const { gptScene, continue_dialog } = require("../scenes/gptScene")
const { NewChat } = require("../functions/gpt_api")
const axios = require('axios');
const fs = require('fs')
const { get_weather_data, get_weather_data_station } = require("../functions/weather_api");
const { removeKeyboard } = require("telegraf/markup");
require('dotenv').config()
const { logToFile } = require("../functions/to_log_file");
const { message } = require("telegraf/filters");

const user_id = process.env.USER_ID

const go_to_home = ctx => {
    try {
        console.log(ctx.update.callback_query.from.first_name);
        ctx.deleteMessage(continue_dialog);
        ctx.scene.leave('gpt')
        ctx.scene.leave('art')
    } catch (error) {
        ctx.reply("Произошла ошибка, нажмите /start")
    }

}


const inline = (ctx) => {
    ctx.reply("Запуталась по жизни?", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Не, все нормал", callback_data: "btn-1" }, { text: "Да, помоги", url: "https://t.me/zheky232" }],
                [{ text: "Поговори с Нейросетью", callback_data: "btn-2" }],
                [{ text: "Или сделай свою картинку:)", callback_data: "btn-3" }]
            ]
        }
    });
};


const be_good = ctx => {
    ctx.reply("Будет ещё лучше")
}
const scene_enter = ctx => {
    ctx.scene.enter('gpt')
}

const generate_image = (ctx) => {
    ctx.scene.enter('art')
}


const check_generate_image = async (ctx) => {

}

const check_log_file = (ctx) => {
    if (ctx.message.from.id == user_id) {
        fs.readFile("./log.txt", "utf8", (err, data) => {
            try {
                ctx.reply(`${data}`);
            } catch (err) {
                console.log(err);
                ctx.reply(`Ошибка ${err.message}`);
            }
        });
    } else {
        ctx.reply(`Недостаточно привелегий`)
    }

};


const bank_action = (ctx) => {
    try {
        console.log(`${ctx.update.callback_query.from.first_name} смотрит курс валют`);
    }
    catch {
        console.log('Unauthorized check BANK API');
    }
    try {
        axios.get('https://iss.moex.com/iss/statistics/engines/currency/markets/selt/rates.json')
            .then(res => {
                currency_values = []
                currency_keys = []
                for (let index = 0; index < 3; index++) {
                    currency_values.push(res.data.wap_rates.data[index][4])
                    currency_keys.push(res.data.wap_rates.data[index][3])
                    ctx.reply(`${currency_keys[index]}: <b>${currency_values[index]} ₽</b>\n`,
                        { parse_mode: "HTML" })
                }
                console.log(currency_keys, currency_values);
                setTimeout(() => {
                    ctx.reply(`Есть другие инструменты)`, {
                        reply_markup: {
                            inline_keyboard: [
                                // [{ text: "Не, все нормал", callback_data: "btn-1" }, { text: "Да, помоги", url: "https://t.me/zheky232" }],
                                [{ text: "Поговори с Нейросетью", callback_data: "btn-2" }],
                                [{ text: "Или сделай свою картинку:)", callback_data: "btn-3" }]
                            ]
                        }, parse_mode: "HTML"
                    });
                }, 2000)
            })
            .catch(err => {
                ctx.reply("Сервис недоступен, обратитесь позже")
                console.log(err);
            })
    }
    catch {
        ctx.reply(`Сервис просмотра валюты недоступен, но есть и другие интересные инструменты)`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Поговори с Нейросетью", callback_data: "btn-2" }],
                    [{ text: "Или сделай свою картинку:)", callback_data: "btn-3" }]
                ]
            }, parse_mode: "HTML"
        });
    }

}

const help = (ctx) => {
    ctx.reply(`
        БОТ <b>«Правая Рука»</b>
<b>Описание</b>: Бот взаимодействует с нейросетью для создания картинок и текстов. Он может помочь вам в решении различных задач, таких как:
            создание оригинальных изображений по текстовому описанию;
            генерация описаний или заголовков к картинкам;
            перевод текстов на разные языки;
            перефразирование текстов.

<b>Как использовать:</b>
            1. Отправьте боту текстовое описание вашей задачи.
            2. Бот обработает запрос с помощью нейросети и отправит вам результат.

<b>Примеры запросов:</b>
        «Сделай для меня красивый пейзаж»;
        «Опиши эту картинку»;
        «Переведи этот текст на английский»;
        «Скажи мне что-нибудь смешное».
        Попробуйте сами)
        Бот работает в реальном времени и доступен для пользователей бесплатно.`, {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [{ text: "Попробовать", callback_data: "start" }]
            ]
        }
    })
    ctx.scene.leave();
}

const new_gpt_chat = (ctx) => {
    ctx.scene.reenter()
    NewChat()
}



const bot_hears = (ctx) => {
    ctx.reply('Просьба <U><b>НЕ ВЫХОДИТЬ ЗА РАМКИ КОМАНД</U></b>', { parse_mode: "HTML" })
    if (!fs.existsSync('output.txt')) {
        fs.writeFileSync('output.txt', '');
    }
    fs.appendFileSync('output.txt', `Просьба <U><b>НЕ ВЫХОДИТЬ ЗА РАМКИ КОМАНД</U></b>`);

}


const weather_api = (ctx) => {
    get_weather_data()
    get_weather_data_station()
}
user_name_global = ""

const start = async (ctx) => {
    try {
        user_name = ctx.message.from.first_name
        user_name_global = user_name
        console.log(`${user_name} Начал использование бота!`);
    }
    catch {
        console.log(`Error Начал использование бота!`);
    }
     try {
        if (ctx.message.text == "/start") {
            ctx.replyWithSticker('CAACAgIAAxkBAAEFzS1mWHFIEKZgmRR0-2483Y_06tZsPQACHQADO3EfIqmCmmAwV9EZNQQ')
        }
       
        setTimeout(() => {
            ctx.reply(`Привет <b>ДРУГ</b>, Есть несколько интересных для тебя действий)`, {
                reply_markup: {
                    remove_keyboard: true,
                    inline_keyboard: [
                        [{ text: "Поговори с Нейросетью", callback_data: "btn-2" }],
                        [{ text: "Посмотреть курс валют", callback_data: "bank_action" }],
                        [{ text: "Или сделай свою картинку:)", callback_data: "btn-3" }]
                    ],
                }, parse_mode: "HTML"
            });
        }, 500)

    }
    catch {
        setTimeout(() => {
            ctx.reply(`Привет <b>ДРУГ</b>, Есть несколько интересных для тебя действий)`, {
                reply_markup: {
                    remove_keyboard: true,
                    inline_keyboard: [
                        [{ text: "Поговори с Нейросетью", callback_data: "btn-2" }],
                        [{ text: "Посмотреть курс валют", callback_data: "bank_action" }],
                        [{ text: "Или сделай свою картинку:)", callback_data: "btn-3" }]
                    ],
                }, parse_mode: "HTML"
            },);
        }, 500)

    }
    removeKeyboard()
    ctx.scene.leave('gpt', 'art', removeKeyboard());
}




module.exports = {
    bank_action,
    scene_enter,
    go_to_home,
    be_good,
    inline,
    new_gpt_chat,
    generate_image,
    check_generate_image,
    bot_hears,
    help,
    start,
    weather_api,
    check_log_file
}
