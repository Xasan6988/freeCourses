const {Markup} = require('telegraf');

const backupKeyboard = Markup.inlineKeyboard([

    Markup.button.callback('upload', 'upload'),
    Markup.button.callback('download', 'download'),
    Markup.button.callback('Назад в меню', 'menu'),
  ], {
    wrap: (btn, index, currentRow) => currentRow.length >= index / 7
});

module.exports = {backupKeyboard}
