const {Markup} = require('telegraf');

const menu_keyboard = (isAdmin) => {
  if (!isAdmin) {
    return Markup.inlineKeyboard([
      Markup.button.callback('Список категорий', 'category'),
      Markup.button.callback('Поиск курса', 'search'),
      Markup.button.callback('О нас', 'about'),
      Markup.button.callback('Контакты', 'contacts'),
    ], {wrap: (btn, index, currentRow) => currentRow.length >= index / 2})
  } else {
    return Markup.inlineKeyboard([
      Markup.button.callback('Список категорий', 'category'),
      Markup.button.callback('Поиск курса', 'search'),
      Markup.button.callback('Админка', 'admin'),
      Markup.button.callback('О нас', 'about'),
      Markup.button.callback('Контакты', 'contacts'),
    ], {wrap: (btn, index, currentRow) => currentRow.length >= index / 2})
  }
};

module.exports = {menu_keyboard};
