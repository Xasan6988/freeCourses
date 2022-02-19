const {Telegraf, Markup, session, Scenes: {Stage}} = require('telegraf');
const mongo = require('mongoose');
const config = require('config');

const User = require('./models/User');

const {createStore, applyMiddleware} = require('redux');
const rootReducer = require("./redux/rootReducer");
const {fetchCourse, fetchUsers, addUser} = require('./redux/actions');
const { default: thunk } = require('redux-thunk');

const {menu_keyboard} = require('./keyboards/menu_keyboard');
const { category_list, courses_list } = require('./keyboards/courses_keyboards');
const adsScene = require('./Scenes/adsScene');
const searchScene = require('./Scenes/searchScene');

const {checkUserInArr, findItemInArr, arrToLower} = require('./helpers');


const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

const bot = new Telegraf(config.get('TOKEN'));

const stage = new Stage([searchScene, adsScene]);

bot.use(session(), stage.middleware());

bot.use((ctx, next) => {
  console.log(ctx.from.id);
  next();
});

bot.start(async ctx => {
  // Проверяем наличие пользователя в базе
  if (!checkUserInArr(ctx.from.id, store.getState().users)) {
    // добавляем пользователя
    store.dispatch(addUser(ctx.from.id));
  }
  ctx.replyWithHTML(`Алоха, ${ctx.from.first_name}!

В этом боте ты можешь найти слитые курсы, которые есть у <a href="t.me/OneSadDev">меня</a>!

Курсы разбиты по категориям (насколько это вообще возможно), а так же есть поиск по названию курса.

Если есть желание поблагодарить меня - жми контакты, там есть реквизиты.

А так же, если тебе интересна разработка, то можешь залетать <a href="t.me/EchoGame">ко мне на канал</a>.
  `, {
      disable_web_page_preview: true,
      parse_mode: 'HTML',
      ...menu_keyboard(
          checkUserInArr(
            ctx.from.id,
            config.get('admins')
          )
      )
    });
});

bot.hears(/^[a-z | 0-9 | A-Z | а-я | А-Я]+$/, async ctx => {
  ctx.replyWithHTML(`Алоха, ${ctx.from.first_name}!

В этом боте ты можешь найти слитые курсы, которые есть у <a href="t.me/OneSadDev">меня</a>!

Курсы разбиты по категориям (насколько это вообще возможно), а так же есть поиск по названию курса.

Если есть желание поблагодарить меня - жми контакты, там есть реквизиты.

А так же, если тебе интересна разработка, то можешь залетать <a href="t.me/EchoGame">ко мне на канал</a>.
    `, {
        disable_web_page_preview: true,
        parse_mode: 'HTML',
        ...menu_keyboard(
            checkUserInArr(
              ctx.from.id,
              config.get('admins')
            )
        )
      });
})

bot.action('menu', async ctx => {
  ctx.editMessageText(`Алоха, ${ctx.from.first_name}!

В этом боте ты можешь найти слитые курсы, которые есть у <a href="t.me/OneSadDev">меня</a>!

Курсы разбиты по категориям (насколько это вообще возможно), а так же есть поиск по названию курса.

Если есть желание поблагодарить меня - жми контакты, там есть реквизиты.
    `, {
      disable_web_page_preview: true,
      parse_mode: 'HTML',
      ...menu_keyboard(
          checkUserInArr(
            ctx.from.id,
            config.get('admins')
          )
      )
    });
});

bot.action('admin', async ctx => {
  if (checkUserInArr(ctx.from.id, config.get('admins'))) {
    return ctx.editMessageText('Повелевай, админ', Markup.inlineKeyboard([
      Markup.button.callback('Реклама', 'ads'),
      Markup.button.callback('Обновить данные', 'refresh'),
      Markup.button.callback('Получить сводку', 'symmaryOfVisits'),
      Markup.button.callback('Вернуться в меню', 'menu'),
    ], {wrap: (btn, index, currentRow) => currentRow.length >= index / 2}));
  } else {
    ctx.replyWithHTML('Ухади, ты не админ');
    ctx.replyWithHTML('Выберите один из пунктов меню', menu_keyboard());
  }
});

bot.action('symmaryOfVisits', async ctx => {
  const users = await User.find();

  ctx.editMessageText(
    `
Количество юзеров в базе данных: ${users.length}
  `,
    {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([Markup.button.callback('В меню', 'menu'), Markup.button.callback('В админку', 'admin')])
    }
  );
})

bot.action('refresh', async ctx => {
  store.dispatch(fetchCourse());
  store.dispatch(fetchUsers());
  await ctx.editMessageText('Обновленно', Markup.inlineKeyboard([Markup.button.callback('В меню', 'menu')]));
});

bot.action('category', async ctx => {
  ctx.editMessageText(`
Выберите категорию:
  `, category_list(store.getState().courses));
});

bot.action('search', async ctx => {
  ctx.scene.enter('searchScene');
});

bot.action('find', async ctx => {
  ctx.scene.leave();
  // тут написать функцию поиска
  const searchWord = ctx.session.searchTitle.toLowerCase();
  const finded = [];
  const courses = store.getState().courses;


  courses.map(course => {
    if (course.title.toLowerCase() === searchWord || arrToLower(course.title.split(' ')).indexOf(searchWord) !== -1) {
      finded.push(course);
    } else if (course.description) {
      if (arrToLower(course.description.split(' ')).indexOf(searchWord) !== -1) {
        finded.push(course);
      }
    }
  });

  if (!Object.values(finded).length) {
    ctx.editMessageText('Курсы по заданным ключам не найдены', Markup.inlineKeyboard([
      Markup.button.callback('Искать заново', 'search'),
      Markup.button.callback('Назад в меню', 'menu'),
    ]));
  } else {
    ctx.editMessageText('Найден(ы) следующий(е) курс(ы):', courses_list(finded));
  }

});
// сброс поиска
bot.action('cancel_search', async ctx => {
  ctx.session.searchTitle= undefined;
  ctx.scene.leave();

  return ctx.editMessageText(`В этом боте ты можешь найти слитые курсы, которые есть у <a href="t.me/OneSadDev">меня</a>!

Курсы разбиты по категориям (насколько это вообще возможно), а так же есть поиск по названию курса.

Если есть желание поблагодарить меня - жми контакты, там есть реквизиты.
`, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...menu_keyboard(
        checkUserInArr(
          ctx.from.id,
          config.get('admins')
        )
      )
    });
});

bot.action('ads', async ctx => {
  if (checkUserInArr(ctx.from.id, config.get('admins'))) {
    ctx.scene.enter('adsScene');
  }
})

bot.action('startAds', async ctx => {
  ctx.scene.leave();
  const users = store.getState().users;
  const ads = ctx.session.ads;
  users.map(async (user) => {
    if (ads.photo) {
      await ctx.telegram.sendPhoto(user, ads.photo, {caption: ads.caption});
    } else {
      await ctx.telegram.sendMessage(user, ads.caption);
    }
  });
  ctx.session.ads = undefined;
  ctx.replyWithHTML(`Алоха, ${ctx.from.first_name}!

В этом боте ты можешь найти слитые курсы, которые есть у <a href="t.me/OneSadDev">меня</a>!

Курсы разбиты по категориям (насколько это вообще возможно), а так же есть поиск по названию курса.

Если есть желание поблагодарить меня - жми контакты, там есть реквизиты.

А так же, если тебе интересна разработка, то можешь залетать <a href="t.me/EchoGame">ко мне на канал</a>.
  `, {
      disable_web_page_preview: true,
      parse_mode: 'HTML',
      ...menu_keyboard(
          checkUserInArr(
            ctx.from.id,
            config.get('admins')
          )
      )
    });
});

bot.action('clear', async ctx => {
  ctx.scene.leave();
  ctx.session[ctx.session.clear] = undefined;
  ctx.session.clear = undefined;
  ctx.editMessageText(`Алоха, ${ctx.from.first_name}!

В этом боте ты можешь найти слитые курсы, которые есть у <a href="t.me/OneSadDev">меня</a>!

Курсы разбиты по категориям (насколько это вообще возможно), а так же есть поиск по названию курса.

Если есть желание поблагодарить меня - жми контакты, там есть реквизиты.
      `, {
        disable_web_page_preview: true,
        parse_mode: 'HTML',
        ...menu_keyboard(
            checkUserInArr(
              ctx.from.id,
              config.get('admins')
            )
        )
      });
});

bot.action('about', async ctx => {
  ctx.editMessageText(`Не буду скрывать, что создал этого бота, что бы попробовать привлечь людей в свой канал и пичкать вас рекламой. Иначе бы я, по прежнему, раздавал курсы под хайд на лолзе. Но, быть может, вам будет полезен данный софт, который будет хранить в себе ссылки на курсы (а заодно мотивирует меня поддерживать ссылки актуальными).

Вы всегда можете написать <a href="t.me/OneSadDev">мне в личку</a> и задать вопрос по программированию. Чем смогу - помогу.
  `, {
      disable_web_page_preview: true,
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([Markup.button.callback('Назад в меню', 'menu')])
    });
});

bot.action('contacts', async ctx => {
  ctx.editMessageText(`
Автор этого замечательного(нет) бота - <a href="t.me/OneSadDev">OneSadDev</a>

Так же я веду <a href="t.me/EchoGame">канал про разработку</a>

Если есть желание задонатить, то принимаю куда угодно и что угодно.

Белый кэш - +79624334653 сбер/киви/сбп
Крипта - в личку

Немытые деньги попрошу оставить при себе, мы же, все таки, не занимаемся криминалом.
  `, {
    disable_web_page_preview: true,
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([Markup.button.callback('Назад в меню', 'menu')])
  })
});

bot.action('backToCategory', async ctx => {
  const category = ctx.session.selectCategory;
  ctx.session.selectCategory = undefined;

  ctx.editMessageText(`Выребрите курс: `, courses_list(store.getState().courses, category));
});

bot.on('callback_query', async ctx => {
  if (ctx.update.callback_query.data.split(':')[0] === 'category') {
    const category = ctx.update.callback_query.data.split(':')[1].trim();
    ctx.editMessageText('Выберите курс:', courses_list(store.getState().courses, category))
  }

  if (ctx.update.callback_query.data.split(':')[0] === 'course') {
    const id = ctx.update.callback_query.data.split(':')[1].trim();
    const course = findItemInArr(id, store.getState().courses);

    ctx.session.selectCategory = course.category;

    ctx.editMessageText(`${course.title}

${course.description  ? 'Описание: ' + course.description : 'Здесь могло быть описание'}

${course.comment ? 'Мой коммент: ' + course.comment : 'Здесь мог быть мой коммент'}

Если нужно просто скопипастить: ${course.url}
`, {
    disable_web_page_preview: true,
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      Markup.button.url('Перейти к курсу', `${course.url}`),
      Markup.button.callback('Назад', 'backToCategory'),
      Markup.button.callback('В главное меню', 'menu'),
    ])
  })
  }
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
