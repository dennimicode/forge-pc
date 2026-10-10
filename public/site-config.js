// USER_ACTION: все настройки, требующие ваших действий, находятся в этом файле.
// После изменения настроек повторите публикацию. Значения здесь публичные — секреты запрещены.
window.FORGE_CONFIG = {
  // USER_ACTION [PAGES]: укажите полный URL сайта, например https://username.github.io/forge-pc/.
  siteUrl: 'https://dennimicode.github.io/forge-pc/',
  // USER_ACTION [COMPANY]: замените учебные данные компании на реальные перед коммерческим запуском.
  company: { email: 'support@forge-pc.ru', phone: '88005553535', address: '100100, Российская Федерация, ул. Максима Койкого, д. 123, пом. 12', hours: 'Пн–Пт, 10:00–18:00' },
  analytics: {
    // USER_ACTION [LIVEINTERNET]: зарегистрируйте URL на https://www.liveinternet.ru/add.
    // Для обычного счётчика ID не нужен: сервис определяет сайт по адресу страницы.
    // USER_ACTION [LIVEINTERNET LINK]: скопируйте адрес вашей статистики из кабинета в statUrl.
    // Это особенно важно при регистрации папки username.github.io/repository/.
    liveInternet: { enabled: true, badgeStyle: '52.7', statUrl: 'https://www.liveinternet.ru/stat/dennimicode.github.io/forge-pc/index.html' },
    // USER_ACTION [RAMBLER]: создайте счётчик на https://top100.rambler.ru/ и впишите project ID.
    // USER_ACTION [RAMBLER WIDGET]: widgetColor — цвет без #; fe9200 оранжевый, 000000 чёрный.
    // При пустом badgeUrl официальный SDK автоматически выводит картинку в подвале.
    // Цели создаются в статистике сайта: «Отчёты по целям», не в настройках счётчика.
    rambler: { id: '7752726', widgetColor: 'fe9200', badgeUrl: '' },
    // USER_ACTION [MAIL]: создайте счётчик на https://top.mail.ru/ и две JS-цели:
    // config_selected и order_created (имена точные). badgeUrl — URL картинки из выданного кода.
    // order_created означает создание учебной заявки в браузере, без отправки владельцу.
    mail: { id: '3800833', badgeUrl: '' },
    // USER_ACTION [WIDGETS]: только для Mail скопируйте HTTPS-адрес картинки в badgeUrl.
    // Для Rambler картинку рисует SDK; badgeUrl нужен лишь для замены собственным официальным URL.
    debug: false, // true: обезличенные события в консоли для проверки; не отправляет данные само по себе.
  },
}
