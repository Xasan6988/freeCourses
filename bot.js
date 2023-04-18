const {
  Telegraf,
  Markup,
  session,
  Scenes: {
    Stage
  }
} = require('telegraf');

const utf8 = require('utf8')
const mongo = require('mongoose');
const config = require('config');
const axios = require('axios');

const User = require('./models/User');

const {
  createStore,
  applyMiddleware
} = require('redux');
const rootReducer = require("./redux/rootReducer");
const {
  fetchCourse,
  fetchUsers,
  addUser,
  addVisits,
  clearVisits,
  deleteUser
} = require('./redux/actions');
const {
  default: thunk
} = require('redux-thunk');

const {
  menu_keyboard
} = require('./keyboards/menu_keyboard');
const {
  backupKeyboard
} = require('./keyboards/backup_keyboard');
const {
  category_list,
  courses_list
} = require('./keyboards/courses_keyboards');
const adsScene = require('./Scenes/adsScene');
const searchScene = require('./Scenes/searchScene');

const {
  checkUserInArr,
  findItemInArr,
  arrToLower,
  HowMuchTimeBeforeMidnight
} = require('./helpers');
const {
  csonParser
} = require('config/parser');
const Course = require('./models/Course');
const fs = require('fs')


const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

const bot = new Telegraf(config.get('TOKEN'));

const stage = new Stage([searchScene, adsScene]);

bot.use(session(), stage.middleware());

bot.start(async ctx => {
  // Проверяем наличие пользователя в базе
  if (!checkUserInArr(ctx.from.id, store.getState().users)) {
    // добавляем пользователя
    store.dispatch(addUser(ctx.from.id));
  }
  if (!checkUserInArr(ctx.from.id, store.getState().dayVisits)) {
    store.dispatch(addVisits(ctx.from.id));
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
  if (!checkUserInArr(ctx.from.id, store.getState().dayVisits)) {
    store.dispatch(addVisits(ctx.from.id));
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
})

bot.action('menu', async ctx => {
  if (!checkUserInArr(ctx.from.id, store.getState().dayVisits)) {
    store.dispatch(addVisits(ctx.from.id));
  }

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
      Markup.button.callback('Бекап', 'backup'),
      Markup.button.callback('Вернуться в меню', 'menu'),
    ], {
      wrap: (btn, index, currentRow) => currentRow.length >= index / 2
    }));
  } else {
    ctx.replyWithHTML('Ухади, ты не админ');
    ctx.replyWithHTML('Выберите один из пунктов меню', menu_keyboard());
  }
});

bot.action('backup', async ctx => {
  try {
    ctx.session.backup = {};
    ctx.reply('Choose load...', backupKeyboard);
  } catch (e) {
    console.log(e)
  }
})

bot.action('upload', async context => {
  try {
    context.reply('Send backup...');
    bot.on('document', async ctx => {
      await context.telegram.getFileLink(ctx.message.document.file_id).then(url => {

        axios({
          url: url.href,
          responseType: 'stream'
        }).then(response => {
          return new Promise((resolve, reject) => {
            response.data.pipe(fs.createWriteStream(`backups/upload.json`))
              .on('finish', () => console.log('File is saved.'))
              .on('error', e => console.log(`An error has occured ${e}`));
          });
        })
      });

      fs.readFile('backups/upload.json', (err, data) => {
        // User.deleteMany({}, (err) => {
        //   if (err) console.log(err)
        // });
        User.insertMany(JSON.parse(data), (err, models) => {
          if (err) console.log(err);
        });
        // Course.deleteMany({}, (err) => {
        //   if (err) console.log(err)
        // });
        // Course.insertMany(JSON.parse(data).products, (err, models) => {
        //   if (err) console.log(err);
        // });

        ctx.reply('DB was updated', Markup.inlineKeyboard([
          Markup.button.callback('Реклама', 'ads'),
          Markup.button.callback('Обновить данные', 'refresh'),
          Markup.button.callback('Получить сводку', 'symmaryOfVisits'),
          Markup.button.callback('Бекап', 'backup'),
          Markup.button.callback('Вернуться в меню', 'menu'),
        ], {
          wrap: (btn, index, currentRow) => currentRow.length >= index / 2
        }));
      })

    });
  } catch (e) {
    console.log(e)
  }
});

bot.action('download', async ctx => {
  try {
    ctx.session.backup.status = 'download';
    const collections = {
      users: await User.find(),
      courses: await Course.find(),
    }

    fs.writeFile('./backups/backup.json', JSON.stringify(collections), (err) => {
      if (err) throw new Error();

      // const mailer = new Mailer();


      // mailer.sendMail('238136@mail.ru', 'test', '', {
      //   filename: "backup.json",
      //   path: './backups/backup.json'
      // });

      ctx.replyWithDocument({
        filename: 'backup.json',
        source: './backups/backup.json'
      })
    })
    ctx.session.backup = {};
  } catch (e) {
    console.log(e);
  }
});

bot.action('symmaryOfVisits', async ctx => {
  const users = await User.find();

  ctx.editMessageText(
    `
Количество юзеров в базе данных: ${users.length}
Количество активных юзеров за последние сутки: ${store.getState().dayVisits.length}
  `, {
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
  ctx.session.searchTitle = undefined;
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
  // const users = [config.get('gal'), 5781915083]

  const ads = ctx.session.ads;
  // console.log(users)
  // console.log(ads)
  users.map(async user => {
    try {
      const res = await axios.get(`https://api.telegram.org/bot${config.get('TOKEN')}/sendMessage?chat_id=${user}&text=${ads}`);

      console.log(res.data)
      // console.log(config.get('gal'))
      // return
      await ctx.telegram.deleteMessage(res.data.result.chat.id, res.data.result.message_id);
      await ctx.telegram.copyMessage(user, config.get('gal'), ads.message_id);

    } catch (e) {
      console.log(`Ooops, some block: ${e.message}`);
      // console.log(e)
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
  ctx.editMessageText(`Не буду скрывать, что создал этого бота, что бы попробовать привлечь людей в свой канал. Иначе бы я, по прежнему, раздавал курсы под хайд на лолзе. Но, быть может, вам будет полезен данный софт, который будет хранить в себе ссылки на курсы (а заодно мотивирует меня поддерживать ссылки актуальными).

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

const activeSpam = async () => {
  const users = await User.find()
  // console.log(users)

  const text = 'Online'

  users.map(async user => {
    try {
      const res = await axios.get(`https://api.telegram.org/bot${config.get('TOKEN')}/sendMessage?chat_id=${user.userId}&text=${utf8.decode(text)}`);

      // await ctx.telegram.deleteMessage(res.data.result.chat.id, res.data.result.message_id);
      // await ctx.telegram.copyMessage(user, config.get('gal'), ads.message_id);

    } catch (e) {
      console.log(`Ooops, some block: ${e.message}`);
      // console.log(e)
    }
  })

}

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
    activeSpam();
    setTimeout(() => {
      store.dispatch(clearVisits());
      setInterval(() => {
        store.dispatch(clearVisits());
      }, 1000 * 60 * 60 * 24);
    }, HowMuchTimeBeforeMidnight(Date.now()))
  } catch (e) {
    console.log(`При подключении к БД и запуске бота произошла ошибка ${e.message}`);
  }
})();
