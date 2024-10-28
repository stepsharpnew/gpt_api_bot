const { Scenes } = require('telegraf')
const { bold, italic } = require('telegraf/format')
const { keyboard, removeKeyboard, inlineKeyboard } = require('telegraf/markup')
const {getGptResponse} = require ("../functions/gpt_api")
const {logToFile} = require ("../functions/to_log_file")



const gptScene = new Scenes.BaseScene('gpt')

gptScene.enter(async (ctx) => {
    try {
        user_name = ctx.update.callback_query.from.first_name;
        console.log(`${user_name} использует ChatGPT!`);
        logToFile(`${user_name} использует ChatGPT!`)
    } catch (error) {
        console.log(`ERROR использует ChatGPT!`);
    }
    ctx.reply('Введите запрос к GPT:', {
        reply_markup: {
            keyboard: [
                [{ text: "Кто такой Эйнштейн" }],
                [{ text: "Любовь в двух словах" }],
                [{ text: "Напиши сочинение на тему Демография" }],
            ]
        },
    });
});


gptScene.leave( async(ctx) => {
    try {
        user_name = ctx.message.from.first_name
        console.log(`${user_name} вышел из режима ChatGPT`);
    } catch (error) {
        console.log(`${error}ERROR вышел из ChatGPT!`);
    }
    ctx.reply(`<b>До скорых встреч</b> ещё увидимся)`, {
        reply_markup: {
            inline_keyboard: [
                // [{ text: "Не, все нормал", callback_data: "btn-1" }, { text: "Да, помоги", url: "https://t.me/zheky232" }],
                [{ text: "Поговори с Нейросетью", callback_data: "btn-2" }],
                [{ text: "Посмотреть курс валют", callback_data: "bank_action" }],
                [{ text: "Или сделай свою картинку:)", callback_data: "btn-3" }]
            ]
        },parse_mode : "HTML"
        
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


let continue_dialog 
gptScene.on('text', async (ctx) => {
    const prompt = ctx.message.text;
    if (prompt != "/help" && prompt != "/start" && prompt != "/gpt" && prompt != "Вернуться домой"){
        let param = "";
        ctx.reply(bold(italic("Подождите...")), removeKeyboard())
            .then((message) => {
            param = message.message_id;
        });
        try {
            const gptResponse = await getGptResponse(prompt);

            if (gptResponse !== "Произошла ошибка при получении ответа.") {
                await ctx.reply(gptResponse,{
                    parse_mode : "Markdown"
                })
                .then(()=>{
                    ctx.deleteMessage(param);
                })
                await ctx.reply(`Продолжить общение?`, {
                    reply_markup: {
                        inline_keyboard: [
                        [
                            { text: "Домой", callback_data: "go_to_home" },
                            { text: "Новый чат", callback_data: "new_gpt_chat" }
                        ],
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                })
                .then((message)=> {
                    continue_dialog = message.message_id
                    // ctx.deleteMessages(continue_dialog)
                })
            } else {
                await ctx.reply(`${gptResponse} Повторите запрос`, {
                    reply_markup: {
                        keyboard: [
                            [{ text: prompt, callback_data: "repeat" }]
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching GPT response:', error);
            await ctx.reply("Произошла ошибка при получении ответа. Повторите запрос.");
        }
    } else {
        ctx.scene.leave('gpt',removeKeyboard())
    }
});

module.exports = {gptScene ,continue_dialog}