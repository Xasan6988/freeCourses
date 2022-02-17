const {Telegraf, session, Scenes: {WizardScene}, Markup} = require('telegraf');

const search_keyboard = () => Markup.inlineKeyboard([
  Markup.button.callback('Найти', 'find'),
  Markup.button.callback('Выйти из поиска', 'cancel_search')
]);

const nameHandler = Telegraf.on('text', async ctx => {
  ctx.session.searchTitle = ctx.message.text;

  ctx.replyWithHTML(`
  Вы ищете курс по следующим ключевым словам: <b>${ctx.session.searchTitle}</b>
  `, search_keyboard());
});


const searchScene = new WizardScene('searchScene', nameHandler);

searchScene.enter(ctx => ctx.editMessageText('Введите название курса, который вы ищете или ключевое слово, присутсвующее в названии.'));

module.exports = searchScene;
