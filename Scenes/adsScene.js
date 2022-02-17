const {Telegraf, Scenes: {WizardScene}, Markup} = require('telegraf');

const postHandler = Telegraf.on('message', async ctx => {
  ctx.session.ads = {};
  if (ctx.update.message.photo) {
    ctx.session.ads.photo = ctx.update.message.photo[2].file_id;
    ctx.session.ads.caption = ctx.update.message.caption;
  } else {
    ctx.session.ads.caption  = ctx.update.message.text;
  }
  ctx.session.clear = 'ads';
  ctx.reply('Вы хотете запустить эту рекламу?', Markup.inlineKeyboard(
    [
      Markup.button.callback('Запусть', 'startAds'),
      Markup.button.callback('Сбросить', 'clear'),
    ]
    ));
});

const adsScene = new WizardScene('adsScene', postHandler);

adsScene.enter(ctx => ctx.reply('Введите рекламный пост'));

module.exports = adsScene;
