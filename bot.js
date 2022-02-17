const {Telegraf} = require('telegraf');
const mongo = require('mongoose');
const config = require('config');

const bot = new Telegraf(config.get('TOKEN'));


bot.use((ctx, next) => {
  console.log(ctx.from.id);
  next();
})

bot.start(async ctx => {
  ctx.reply(`Hello, ${ctx.from.first_name}! This bot give some courses for free!`);
});

(async () => {
  try {
    mongo.connect(config.get('mongo'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    bot.launch();
    console.log('App has been started...')
  } catch (e) {
    console.log(`При подключении к БД и запуске бота произошла ошибка ${e.message}`);
  }
})();
