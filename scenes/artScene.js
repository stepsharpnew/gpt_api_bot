const { Scenes } = require('telegraf')
const { bold, italic } = require('telegraf/format')
const { keyboard, removeKeyboard, inlineKeyboard } = require('telegraf/markup')
const { getGptArt, CheckGenerateImage, new_prompt } = require("../functions/art_api")
const { logToFile } = require('../functions/to_log_file')
// const my_name = require('../actions/actions')
// const path = require('path');



const artScene = new Scenes.BaseScene('art')

artScene.enter(async (ctx) => {
    try {
        user_name = ctx.update.callback_query.from.first_name
        logToFile(`${user_name} использует ART`)
        console.log(`${user_name} использует ART`);
    } catch (error) {
        console.log(`ERROR использует ART!`);
    }

    ctx.reply(`Добро пожаловать в среду 
генерирования картинок с помощью <b>искуственного интеллекта</b>
Напишите интересующую <b>Вас</b> идею или <u>выберите из предложенных ниже</u>`, {
        reply_markup: {
            keyboard: [
                [{ text: "Каменные джунгли" }, { text: "Смешные камни" }],
                [{ text: "Яблоки на столе" }, { text: "Милые кошечки" }],
            ]
        }, parse_mode: "HTML"
    })
})



artScene.leave(async (ctx) => {
    try {
        user_name = ctx.update.callback_query.from.first_name
        console.log(`${user_name} вышел из режима ART`);
    } catch (error) {
        console.log(`ERROR вышел из режима ART`);
    }

    ctx.reply(`<b>До скорых встреч</b> ещё увидимся)`, {
        reply_markup: {
            inline_keyboard: [
                // [{ text: "Не, все нормал", callback_data: "btn-1" }, { text: "Да, помоги", url: "https://t.me/zheky232" }],
                [{ text: "Поговори с Нейросетью", callback_data: "btn-2" }],
                [{ text: "Посмотреть курс валют", callback_data: "bank_action" }],
                [{ text: "Или сделай свою картинку:)", callback_data: "btn-3" }]
            ]
        }, parse_mode: "HTML"
    });
    await ctx.reply("🫡", {
        reply_markup : {
            remove_keyboard : true
        },parse_mode : "HTML"
    })
    .then((message)=> {
        param = message.message_id
        setTimeout(()=>{
            ctx.deleteMessage(param)
        },2000)
    })
})

// let continue_dialog 

let id_photo
artScene.on('text', async (ctx) => {
    console.log(ctx.message.from.first_name);
    const prompt = ctx.message.text;
    if (prompt != "/start" && prompt != "/check" && prompt != "Вернуться домой") {
        let param = "";
        ctx.reply(bold(italic("Подождите...")), removeKeyboard())
            .then((message) => {
                param = message.message_id;
                setTimeout(() => {
                    ctx.deleteMessage(message.message_id);
                }, 4000);
                setTimeout(() => {
                    ctx.reply(`Проверьте результат <b>/check</b>`, { parse_mode: "HTML" })
                }, 4000)
            });
        try {
            const gptResponse = await getGptArt(prompt);
            console.log(`Поиск по картинке :${prompt}`);
            logToFile(`${ctx.message.from.first_name} ищет ${prompt}`)
            if (gptResponse !== "Произошла ошибка при получении ответа.") {
                console.log(gptResponse.data.id);
                id_photo = gptResponse.data.id
            }
        } catch (error) {
            console.log(); ('Error fetching GPT response:', error);
            await ctx.reply("Невозможно отрисовать картинку по такому запросу");
        }
    } else {
        if (prompt != "/start" && prompt != "/help") {
            imagePath = await CheckGenerateImage(id_photo)
            // setInterval(async()=>{
            if (typeof (imagePath) == "string") {
                ctx.reply(imagePath)
                console.log(imagePath);
            } else {
                console.log(imagePath);
                await ctx.replyWithPhoto({ source: imagePath }, new_prompt)
                setTimeout(() => {
                    ctx.reply(`Продолжить общение?`, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: "Домой", callback_data: "go_to_home" },
                                ],
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true
                        }
                    })
                }, 6000)
            }
            // },2000)

        }
        else {
            try {
                const gptResponse = await getGptArt(prompt);
                ctx.scene.leave('art',removeKeyboard())
                if (gptResponse !== "Произошла ошибка при получении ответа.") {
                    console.log(gptResponse.data.id);
                    id_photo = gptResponse.data.id
                }
            } catch (error) {
                console.error('Error fetching GPT response:', error);
                await ctx.reply("Произошла ошибка при получении ответа. Повторите запрос.");
                ctx.scene.leave('art',removeKeyboard())
            }
        }

    }
});

module.exports = { artScene }