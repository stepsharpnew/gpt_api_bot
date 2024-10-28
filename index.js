const { Telegraf, Markup, session, Scenes } = require('telegraf')
require('dotenv').config()
const bot_token = process.env.BOT_TOKEN
const bot = new Telegraf(bot_token)
const {gptScene, continue_dialog} = require ("./scenes/gptScene")
const {scene_enter,go_to_home,be_good,inline,
        new_gpt_chat,
        generate_image,
        bank_action,
        help,
        start,
        weather_api,
        check_log_file
        } = require ("./actions/actions")
const { artScene } = require('./scenes/artScene')




const stage = new Scenes.Stage([gptScene,artScene]);
bot.use(session());
bot.use(stage.middleware());



bot.action('go_to_home', go_to_home);
bot.action('btn-1', be_good);
bot.action('btn-2', scene_enter);
bot.action('btn-3', generate_image);
bot.action('start', start);
bot.action('bank_action',bank_action)
bot.action('new_gpt_chat',new_gpt_chat)

bot.command('gpt', scene_enter);
bot.command('art',generate_image )
bot.command('help',help)
bot.command('weather',weather_api)
bot.command('get_info',check_log_file)

bot.start(start) 
bot.on("message", (ctx) => {
    ctx.reply('Просьба <u><b>НЕ ВЫХОДИТЬ ЗА РАМКИ КОМАНД</b></u>', { parse_mode: "HTML" });
});



bot.launch()
    .then(() => console.log('Bot started'))
    .catch(err => console.error(err));


module.exports = {bot}





