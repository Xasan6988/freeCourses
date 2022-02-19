const {Markup} = require('telegraf');


const courses_list = (courses, category = '') => {
  if (category) {
    const sortedCourses = courses.filter(course => course.category === category);

    return Markup.inlineKeyboard([
      ...sortedCourses.map(course => Markup.button.callback(course.title, `course:${course._id}`)),
      Markup.button.callback('Назад в категории', 'category')
    ], {wrap: (btn, index, currentRow) => currentRow.length >= index / (currentRow.length - 2)});
  } else {
    return Markup.inlineKeyboard([
      ...courses.map(course => Markup.button.callback(course.title, `course:${course._id}`)),
      Markup.button.callback('Назад в категории', 'category')
    ], {wrap: (btn, index, currentRow) => currentRow.length >= index / (currentRow.length - 2)});
  }
}

const category_list = (courses) => {
  const uniqCategory = [];

  courses.map(course => {
    if (uniqCategory.indexOf(course.category) === -1) {
      uniqCategory.push(course.category);
    }
  })

  return Markup.inlineKeyboard([
    ...uniqCategory.map(category => Markup.button.callback(`${category}`, `category:${category}`)),
    Markup.button.callback('Назад в меню', 'menu')
  ], {wrap: (btn, index, currentRow) => currentRow.length >= index / currentRow.length - 2});
}

module.exports = {courses_list, category_list}
