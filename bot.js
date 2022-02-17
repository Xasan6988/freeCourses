const {Telegraf} = require('telegraf');
const mongo = require('mongoose');
const config = require('config');

const {createStore, applyMiddleware} = require('redux');
const rootReducer = require("./redux/rootReducer.js");
const {fetchCourse, fetchUsers, addUser} = require('./redux/actions');
const { default: thunk } = require('redux-thunk');

const {checkUser} = require('./helpers');

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

const bot = new Telegraf(config.get('TOKEN'));

bot.use((ctx, next) => {
  console.log(ctx.from.id);
  next();
});

bot.start(async ctx => {
  // Проверяем наличие пользователя в базе
  if (checkUser(ctx.from.id, store.getState().users)) {
    // добавляем пользователя
    store.dispatch(addUser(ctx.from.id));
  }
  ctx.reply(`Hello, ${ctx.from.first_name}! This bot give some courses for free!`);
});

(async () => {
  try {
    mongo.connect(config.get('mongo'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    store.dispatch(fetchCourse());
    store.dispatch(fetchUsers());
    bot.launch();
    console.log('App has been started...');
  } catch (e) {
    console.log(`При подключении к БД и запуске бота произошла ошибка ${e.message}`);
  }
})();
