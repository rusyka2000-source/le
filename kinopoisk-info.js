(function () {
    'use strict'

    if (window.filminfo_ready) return
    window.filminfo_ready = true

    var DEFAULT_TOKEN = '94ded508-eb21-47c9-b329-529d58b86b16'
    var CACHE_TTL = 24 * 60 * 60 * 1000
    var MAX_ALL_PAGES = 3
    var PREVIEW_COUNT = 3
    var MAX_FILMOGRAPHY = 10
    var KP_BASE = 'https://kinopoiskapiunofficial.tech'
    var BO_ORDER = { BUDGET: 0, WORLD: 1, USA: 2, RUS: 3 }

    var network = null

    var manifest = {
        type: 'video',
        version: '1.6.0',
        name: 'Кинопоиск: сборы, награды, актёры и трейлеры',
        description: 'Сборы, награды, информация об актёрах и трейлеры с Кинопоиска. Рекомендации торрентов и «Продолжить просмотр»',
        component: 'kinopoisk_info'
    }

    function T(key) {
        return Lampa.Lang.translate(key)
    }

    function translations() {
        Lampa.Lang.add({
            filminfo_title: { ru: 'Кинопоиск: сборы, награды и актёры', en: 'Kinopoisk: box office, awards & actors' },
            filminfo_box_office: { ru: 'Сборы', en: 'Box office' },
            filminfo_comments: { ru: 'Комментарии', en: 'Comments' },
            filminfo_budget: { ru: 'Бюджет', en: 'Budget' },
            filminfo_world: { ru: 'Сборы в мире', en: 'Worldwide' },
            filminfo_usa: { ru: 'Сборы в США', en: 'USA' },
            filminfo_rus: { ru: 'Сборы в России и СНГ', en: 'Russia & CIS' },
            filminfo_loading: { ru: 'Загрузка…', en: 'Loading…' },
            filminfo_no_data: { ru: 'Нет данных', en: 'No data' },
            filminfo_no_reviews: { ru: 'Комментариев пока нет', en: 'No comments yet' },
            filminfo_no_matching: { ru: 'Нет подходящих отзывов', en: 'No matching reviews' },
            filminfo_set_review_filter: { ru: 'Показывать отзывы', en: 'Show reviews' },
            filminfo_filter_all: { ru: 'Все', en: 'All' },
            filminfo_filter_positive: { ru: 'Только положительные', en: 'Positive only' },
            filminfo_filter_negative: { ru: 'Только отрицательные', en: 'Negative only' },
            filminfo_not_found_kp: { ru: 'Фильм не найден на Кинопоиске', en: 'Movie not found on Kinopoisk' },
            filminfo_error: { ru: 'Не удалось загрузить данные Кинопоиска', en: 'Failed to load Kinopoisk data' },
            filminfo_error_auth: { ru: 'Неверный токен API Кинопоиска', en: 'Invalid Kinopoisk API token' },
            filminfo_no_token: { ru: 'Токен API Кинопоиска не указан. Вставьте его в настройках плагина.', en: 'Kinopoisk API token is not set. Add it in the plugin settings.' },
            filminfo_total: { ru: 'Всего', en: 'Total' },
            filminfo_all_comments: { ru: 'Все комментарии', en: 'All comments' },
            filminfo_shown_of: { ru: 'Показано {n} из {total}', en: 'Showing {n} of {total}' },
            filminfo_review_positive: { ru: 'Положительный', en: 'Positive' },
            filminfo_review_neutral: { ru: 'Нейтральный', en: 'Neutral' },
            filminfo_review_negative: { ru: 'Негативный', en: 'Negative' },
            filminfo_review_unknown: { ru: 'Неизвестно', en: 'Unknown' },
            filminfo_pos: { ru: 'положительных', en: 'positive' },
            filminfo_neu: { ru: 'нейтральных', en: 'neutral' },
            filminfo_neg: { ru: 'отрицательных', en: 'negative' },
            filminfo_close: { ru: 'Закрыть', en: 'Close' },
            filminfo_settings_name: { ru: 'Кинопоиск: сборы, награды и актёры', en: 'Kinopoisk: box office, awards & actors' },
            filminfo_set_token: { ru: 'Токен API Кинопоиска (X-API-KEY)', en: 'Kinopoisk API token (X-API-KEY)' },
            filminfo_set_token_desc: { ru: 'Получить можно на kinopoiskapiunofficial.tech. Хранится только в настройках Lampa.', en: 'Get it at kinopoiskapiunofficial.tech. Stored only in Lampa settings.' },
            filminfo_set_boxoffice: { ru: 'Показывать сборы', en: 'Show box office' },
            filminfo_set_comments: { ru: 'Показывать комментарии', en: 'Show comments' },
            filminfo_set_proxy: { ru: 'CORS-прокси (необязательно)', en: 'CORS proxy (optional)' },
            filminfo_set_proxy_desc: { ru: 'Префикс прокси, если API недоступен напрямую. Должен передавать заголовок X-API-KEY.', en: 'Proxy prefix if the API is not reachable directly. It must forward the X-API-KEY header.' },
            filminfo_set_awards: { ru: 'Показывать награды', en: 'Show awards' },
            filminfo_set_actor_info: { ru: 'Показывать информацию об актёрах', en: 'Show actor info' },
            filminfo_awards: { ru: 'Награды', en: 'Awards' },
            filminfo_actor_section: { ru: 'Кинопоиск: актёр', en: 'Kinopoisk: actor' },
            filminfo_no_awards: { ru: 'Нет данных о наградах', en: 'No awards data' },
            filminfo_not_found_person: { ru: 'Актёр не найден на Кинопоиске', en: 'Actor not found on Kinopoisk' },
            filminfo_awards_win: { ru: 'Победа', en: 'Win' },
            filminfo_awards_nom: { ru: 'Номинация', en: 'Nomination' },
            filminfo_actor_growth: { ru: 'Рост', en: 'Height' },
            filminfo_actor_birthday: { ru: 'Дата рождения', en: 'Birthday' },
            filminfo_actor_birthplace: { ru: 'Место рождения', en: 'Birthplace' },
            filminfo_actor_death: { ru: 'Дата смерти', en: 'Death date' },
            filminfo_actor_deathplace: { ru: 'Место смерти', en: 'Deathplace' },
            filminfo_actor_spouse: { ru: 'Супруг(а)', en: 'Spouse' },
            filminfo_actor_children: { ru: 'Дети', en: 'Children' },
            filminfo_actor_facts: { ru: 'Факты', en: 'Facts' },
            filminfo_actor_filmography: { ru: 'Фильмография', en: 'Filmography' },
            filminfo_trailers: { ru: 'Трейлеры', en: 'Trailers' },
            filminfo_trailer: { ru: 'Трейлер', en: 'Trailer' },
            filminfo_no_trailers: { ru: 'Трейлеры не найдены', en: 'No trailers found' },
            filminfo_set_trailers: { ru: 'Кнопка «Трейлеры»', en: 'Show "Trailers" button' }
        })
    }

    function settingsInit() {
        Lampa.SettingsApi.addComponent({
            component: 'kinopoisk_info',
            name: Lampa.Lang.translate('filminfo_settings_name'),
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>'
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'filminfo_token', type: 'input', default: DEFAULT_TOKEN, values: '' },
            field: {
                name: Lampa.Lang.translate('filminfo_set_token'),
                description: Lampa.Lang.translate('filminfo_set_token_desc')
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'filminfo_box_office', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('filminfo_set_boxoffice') }
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'filminfo_reviews', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('filminfo_set_comments') }
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: {
                name: 'filminfo_review_filter',
                type: 'select',
                values: {
                    all: Lampa.Lang.translate('filminfo_filter_all'),
                    positive: Lampa.Lang.translate('filminfo_filter_positive'),
                    negative: Lampa.Lang.translate('filminfo_filter_negative')
                },
                default: 'all'
            },
            field: { name: Lampa.Lang.translate('filminfo_set_review_filter') }
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'filminfo_awards', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('filminfo_set_awards') }
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'filminfo_actor_info', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('filminfo_set_actor_info') }
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'filminfo_trailers', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('filminfo_set_trailers') }
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'filminfo_proxy', type: 'input', default: '', values: '' },
            field: {
                name: Lampa.Lang.translate('filminfo_set_proxy'),
                description: Lampa.Lang.translate('filminfo_set_proxy_desc')
            }
        })
    }

    function styleInit() {
        if ($('#filminfo-style').length) return

        var css = '' +
            '.filminfo-body{padding:0 1.5em}' +
            '.filminfo-row{margin-bottom:2em}' +
            '.filminfo-subtitle{font-size:1.3em;margin-bottom:1em}' +
            '.filminfo-stats{display:flex;flex-wrap:wrap;margin:-0.5em}' +
            '.filminfo-stat{flex:1 1 14em;margin:0.5em;padding:1em 1.2em;background:rgba(0,0,0,0.25);border-radius:0.8em}' +
            '.filminfo-stat__name{font-size:1em;opacity:0.7;margin-bottom:0.4em}' +
            '.filminfo-stat__value{font-size:1.6em;font-weight:600}' +
            '.filminfo-reviews-list{display:flex;flex-wrap:wrap;gap:1em}' +
            '.filminfo-review{flex:1 1 16em;min-width:15em;max-width:32em;width:auto}' +
            '.filminfo-review__badge{font-size:1.1em;font-weight:600;margin-bottom:0.6em}' +
            '.filminfo-review__title{font-size:1.25em;font-weight:500;margin-bottom:0.5em}' +
            '.filminfo-review__text{-webkit-line-clamp:4;line-clamp:4}' +
            '.filminfo-review__author{font-weight:500}' +
            '.filminfo-review__date{margin-left:auto;opacity:0.6;font-size:0.9em;padding-left:1em}' +
            '.filminfo-review__likes{margin-left:2em;display:flex;gap:0.6em}' +
            '.filminfo-likes--pos{color:#4caf50}' +
            '.filminfo-likes--neg{color:#f44336}' +
            '.filminfo-summary{display:flex;flex-wrap:wrap;align-items:center;gap:0.5em 1.5em;font-size:1.15em;margin-bottom:0.5em;flex-basis:100%}' +
            '.filminfo-summary__total{font-weight:600}' +
            '.filminfo-summary__item{display:inline-flex;align-items:center;gap:0.5em;opacity:0.85}' +
            '.filminfo-dot{width:0.7em;height:0.7em;border-radius:100%;display:inline-block}' +
            '.filminfo-btn{display:inline-block;align-self:flex-start;flex-basis:100%;margin-top:0.5em;padding:0.6em 1.4em;font-size:1.2em;background:rgba(0,0,0,0.25);border-radius:2em;cursor:pointer}' +
            '.filminfo-btn.focus{background:#fff;color:#000}' +
            '.filminfo-stat.focus{background:rgba(255,255,255,0.14);outline:0.2em solid #fff;outline-offset:-0.2em}' +
            '.filminfo-message{opacity:0.7;font-size:1.2em}' +
            '.filminfo-loading{opacity:0.5}' +
            '.filminfo-modal{font-size:1.05em}' +
            '.filminfo-modal-review__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1em}' +
            '.filminfo-modal-review__type{font-size:1.15em;font-weight:600}' +
            '.filminfo-modal-review__date{opacity:0.6}' +
            '.filminfo-modal-review__title{font-size:1.45em;font-weight:600;margin-bottom:0.5em}' +
            '.filminfo-modal-review__author{opacity:0.75;margin-bottom:0.8em}' +
            '.filminfo-modal-review__likes{margin-bottom:0.8em;display:flex;gap:0.8em}' +
            '.filminfo-modal-review__text{font-size:1.25em;line-height:1.5}' +
            '.filminfo-all__list{margin-top:1em}' +
            '.filminfo-all-review{padding:1.2em 0;border-bottom:1px solid rgba(255,255,255,0.08)}' +
            '.filminfo-all-review:last-child{border-bottom:none}' +
            '.filminfo-all-review__head{display:flex;flex-wrap:wrap;align-items:center;gap:0.5em 1.2em;cursor:pointer}' +
            '.filminfo-all-review__head.focus{background:rgba(255,255,255,0.12);border-radius:0.6em;padding:0.4em 0.6em;margin:-0.4em -0.6em}' +
            '.filminfo-all-review__type{font-weight:600}' +
            '.filminfo-all-review__author{opacity:0.85}' +
            '.filminfo-all-review__date{opacity:0.55;margin-left:auto}' +
            '.filminfo-all-review__likes{display:flex;gap:0.6em}' +
            '.filminfo-all-review__body{display:none;padding-top:1em;font-size:1.2em;line-height:1.5}' +
            '.filminfo-all-review.open .filminfo-all-review__body{display:block}' +
            '.filminfo-all__note{opacity:0.6;margin-top:1.5em;font-size:1.05em}' +
            'body.light--version .filminfo-stat{background:rgba(0,0,0,0.05)}' +
            'body.light--version .filminfo-stat.focus{background:rgba(0,0,0,0.14)}' +
            'body.light--version .filminfo-btn{background:rgba(0,0,0,0.08)}' +
            'body.light--version .filminfo-btn.focus{background:#000;color:#fff}' +
            'body.light--version .filminfo-all-review{border-bottom-color:rgba(0,0,0,0.1)}' +
            'body.light--version .filminfo-all-review__head.focus{background:rgba(0,0,0,0.08)}' +
            '.filminfo-awards{display:flex;flex-wrap:wrap;gap:1em}' +
            '.filminfo-award{display:flex;flex-wrap:wrap;align-items:center;gap:0.5em 1.2em;flex:1 1 16em;min-width:15em;max-width:32em;width:auto;padding:0.8em 1.1em;background:rgba(0,0,0,0.25);border-radius:0.7em}' +
            '.filminfo-award__year{font-weight:600;opacity:0.8;min-width:3.5em}' +
            '.filminfo-award__name{font-weight:500;flex:1 1 14em}' +
            '.filminfo-award__result{font-size:0.95em;padding:0.15em 0.7em;border-radius:1em}' +
            '.filminfo-award__result--win{color:#4caf50;border:1px solid rgba(76,175,80,0.5)}' +
            '.filminfo-award__result--nom{color:#ffc107;border:1px solid rgba(255,193,7,0.5)}' +
            '.filminfo-award__cat{opacity:0.75;font-size:0.95em;flex-basis:100%}' +
            '.filminfo-award.focus{background:rgba(255,255,255,0.14);outline:0.2em solid #fff;outline-offset:-0.2em}' +
            '.filminfo-actor{display:flex;gap:1.5em;flex-wrap:wrap}' +
            '.filminfo-actor.focus{background:rgba(255,255,255,0.05);border-radius:0.8em;outline:0.2em solid #fff;outline-offset:-0.2em}' +
            '.filminfo-actor__photo{flex:0 0 13em;width:13em;height:18em;border-radius:0.8em;overflow:hidden;background:rgba(0,0,0,0.25)}' +
            '.filminfo-actor__photo img{width:100%;height:100%;object-fit:cover;display:block}' +
            '.filminfo-actor__info{flex:1 1 26em;min-width:0}' +
            '.filminfo-actor__name{font-size:1.7em;font-weight:600;margin-bottom:0.6em}' +
            '.filminfo-actor__facts{display:flex;flex-wrap:wrap;margin:-0.5em}' +
            '.filminfo-actor__fact{flex:1 1 12em;margin:0.5em;padding:0.8em 1em;background:rgba(0,0,0,0.25);border-radius:0.7em}' +
            '.filminfo-actor__fact-name{font-size:0.9em;opacity:0.7;margin-bottom:0.3em}' +
            '.filminfo-actor__fact-value{font-size:1.1em;font-weight:500}' +
            '.filminfo-actor__facts-title{font-size:1.25em;font-weight:500;margin:1.2em 0 0.5em}' +
            '.filminfo-actor__facts-text{font-size:1.15em;line-height:1.5}' +
            '.filminfo-filmography{display:flex;flex-direction:column;gap:0.5em}' +
            '.filminfo-filmography__item{display:flex;gap:1em;opacity:0.9}' +
            '.filminfo-filmography__year{opacity:0.6;min-width:3em}' +
            'body.light--version .filminfo-award{background:rgba(0,0,0,0.05)}' +
            'body.light--version .filminfo-award.focus{background:rgba(0,0,0,0.14)}' +
            'body.light--version .filminfo-actor__photo{background:rgba(0,0,0,0.08)}' +
            'body.light--version .filminfo-actor__fact{background:rgba(0,0,0,0.05)}'

        $('<style id="filminfo-style">').html(css).appendTo('head')
    }

    function setting(name, def) {
        var v
        try { v = Lampa.Storage.field(name) } catch (e) {}
        if (typeof v == 'undefined' || v === null) return def
        if (typeof def == 'boolean') {
            if (v === true || v === 'true' || v === 1) return true
            if (v === false || v === 'false' || v === 0) return false
            return def
        }
        return v
    }

    function getToken() {
        var t = setting('filminfo_token', DEFAULT_TOKEN)
        return String(t == null ? '' : t).trim()
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
    }

    function fmt(tpl, params) {
        return tpl.replace(/\{(\w+)\}/g, function (m, k) {
            return params[k] != null ? params[k] : m
        })
    }

    function nws(x) {
        var n = parseFloat(x)
        if (isNaN(n)) return '0'
        var s = String(Math.round(n))
        return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    function formatDate(s) {
        if (!s) return ''
        var d = new Date(s)
        if (isNaN(d.getTime())) return String(s)
        var dd = ('0' + d.getDate()).slice(-2)
        var mm = ('0' + (d.getMonth() + 1)).slice(-2)
        return dd + '.' + mm + '.' + d.getFullYear()
    }

    function moneyHtml(item) {
        if (!item || item.amount == null || item.amount === '') return '—'
        var sym = item.symbol || ''
        return esc(sym) + ' ' + nws(item.amount)
    }

    function reviewType(type) {
        if (type == 'POSITIVE') return { label: T('filminfo_review_positive'), color: '#4caf50' }
        if (type == 'NEGATIVE') return { label: T('filminfo_review_negative'), color: '#f44336' }
        if (type == 'NEUTRAL') return { label: T('filminfo_review_neutral'), color: '#9e9e9e' }
        return { label: T('filminfo_review_unknown'), color: '#9e9e9e' }
    }

    function boxOfficeName(type) {
        if (type == 'BUDGET') return T('filminfo_budget')
        if (type == 'WORLD') return T('filminfo_world')
        if (type == 'USA') return T('filminfo_usa')
        if (type == 'RUS') return T('filminfo_rus')
        return type || ''
    }

    function sanitizeReviewHtml(html) {
        var str = String(html == null ? '' : html)
        str = str.replace(/<script[\s\S]*?<\/script\s*>/gi, '')
        str = str.replace(/<iframe[\s\S]*?<\/iframe\s*>/gi, '')
        str = str.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        str = str.replace(/javascript\s*:/gi, '')
        return str.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, function (m) {
            var tag = m.match(/^<\/?\s*([a-z0-9]+)/i)
            if (!tag) return ''
            var name = tag[1].toLowerCase()
            return ['b', 'i', 'u', 'em', 'strong', 'br', 'p', 'a'].indexOf(name) >= 0 ? m : ''
        })
    }

    function openExternal(url) {
        try {
            if (typeof AndroidJS != 'undefined' && AndroidJS.openBrowser) return AndroidJS.openBrowser(url)
            if (typeof nw != 'undefined' && nw.Shell && nw.Shell.openExternal) return nw.Shell.openExternal(url)
        } catch (e) {}
        if (window.open) {
            var w = window.open(url, '_blank')
            if (w && w.focus) w.focus()
        }
    }

    function kpUrl(path) {
        var base = KP_BASE + path
        var proxy = String(setting('filminfo_proxy', '') || '').trim()
        if (proxy) {
            if (proxy.slice(-1) != '/') proxy += '/'
            return proxy + base
        }
        return base
    }

    function kpParams() {
        return {
            headers: { 'X-API-KEY': getToken() },
            timeout: 1000 * 20
        }
    }

    function readCache(key) {
        try {
            var c = Lampa.Storage.get(key, null)
            if (c && c.time && (Date.now() - c.time) < CACHE_TTL) return c.data
        } catch (e) {}
        return null
    }

    function writeCache(key, data) {
        try {
            Lampa.Storage.set(key, { time: Date.now(), data: data })
        } catch (e) {}
    }

    function kpGet(url, onSuccess, onError) {
        var cacheKey = 'filminfo_kp_' + url
        var cached = readCache(cacheKey)
        if (cached !== null) {
            onSuccess(cached)
            return
        }

        network.silent(url, function (json) {
            writeCache(cacheKey, json)
            onSuccess(json)
        }, function (jqXHR) {
            var code = 0
            try { code = network.errorCode(jqXHR) } catch (e) {}
            onError(code == 401 ? 'auth' : 'network')
        }, false, kpParams())
    }

    function search(keyword, callback) {
        var url = kpUrl('/api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(keyword) + '&page=1')
        kpGet(url, function (json) {
            callback(json && json.films ? json.films : [])
        }, function (kind) {
            callback(null, kind)
        })
    }

    function resolveKpId(movie, callback) {
        if (movie.kinopoisk_id) {
            callback({ id: movie.kinopoisk_id })
            return
        }

        var cacheKey = 'filminfo_kp_id_' + movie.id
        var cached = readCache(cacheKey)
        if (cached !== null) {
            callback(cached)
            return
        }

        var isTv = !!(movie.name || movie.original_name)
        var year = String((movie.release_date || movie.first_air_date) || '').split('-')[0]

        var keywords = []
        if (movie.title || movie.name) keywords.push(movie.title || movie.name)
        if (movie.original_title || movie.original_name) keywords.push(movie.original_title || movie.original_name)

        keywords = keywords.filter(function (k, i) {
            return k && keywords.indexOf(k) === i
        })

        if (!keywords.length) {
            writeCache(cacheKey, { error: 'notfound' })
            callback({ error: 'notfound' })
            return
        }

        function done(result) {
            if (!result || !result.error || result.error == 'notfound') writeCache(cacheKey, result)
            callback(result)
        }

        function score(f, okTypes, year) {
            var s = 0
            if (okTypes.indexOf(f.type) >= 0) s += 2
            if (year && String(f.year) == String(year)) s += 1
            return s
        }

        function tryNext(idx, best) {
            if (idx >= keywords.length) {
                if (best) done({ id: best.filmId })
                else done({ error: 'notfound' })
                return
            }

            search(keywords[idx], function (films, kind) {
                if (films === null) {
                    done({ error: kind == 'auth' ? 'auth' : 'network' })
                    return
                }

                var okTypes = isTv ? ['TV_SERIES', 'TV_SHOW', 'MINI_SERIES'] : ['FILM']
                var found = null

                for (var i = 0; i < films.length; i++) {
                    var f = films[i]
                    if (!f || !f.filmId) continue

                    var typeOk = okTypes.indexOf(f.type) >= 0
                    var yearOk = year && String(f.year) == String(year)

                    if (typeOk && yearOk) {
                        done({ id: f.filmId })
                        return
                    }

                    if (!found || score(f, okTypes, year) > score(found, okTypes, year)) found = f
                }

                tryNext(idx + 1, found || best)
            })
        }

        tryNext(0, null)
    }

    function fetchBoxOffice(kpId, callback) {
        var url = kpUrl('/api/v2.2/films/' + kpId + '/box_office')
        kpGet(url, function (json) {
            callback(json && json.items ? json.items : [])
        }, function (kind) {
            callback(null, kind)
        })
    }

    function fetchReviews(kpId, page, callback) {
        var url = kpUrl('/api/v2.2/films/' + kpId + '/reviews?page=' + page + '&order=DATE_DESC')
        kpGet(url, function (json) {
            callback(json || null)
        }, function (kind) {
            callback(null, kind)
        })
    }

    function fetchAwards(kpId, callback) {
        var url = kpUrl('/api/v2.2/films/' + kpId + '/awards')
        kpGet(url, function (json) {
            callback(json && json.items ? json.items : [])
        }, function (kind) {
            callback(null, kind)
        })
    }

    function fetchStaff(kpId, callback) {
        var url = kpUrl('/api/v1/staff?filmId=' + kpId)
        kpGet(url, function (json) {
            callback(Array.isArray(json) ? json : [])
        }, function (kind) {
            callback(null, kind)
        })
    }

    function fetchPerson(personId, callback) {
        var url = kpUrl('/api/v1/staff/' + personId)
        kpGet(url, function (json) {
            callback(json || null)
        }, function (kind) {
            callback(null, kind)
        })
    }

    function fetchVideos(kpId, callback) {
        var url = kpUrl('/api/v2.2/films/' + kpId + '/videos')
        kpGet(url, function (json) {
            callback(json && json.items ? json.items : [])
        }, function (kind) {
            callback(null, kind)
        })
    }

    function normalizeName(s) {
        return String(s == null ? '' : s).toLowerCase().replace(/[^a-zа-яё0-9]/gi, '')
    }

    function isPersonMovie(movie) {
        if (!movie) return false
        if (movie.type == 'person' || movie.type == 'people') return true
        if (movie.type && ['film', 'tv', 'serial', 'documentary', 'anime', 'concert', 'video', 'clip', 'cartoon'].indexOf(movie.type) >= 0) return false
        if (movie.title || movie.original_title || movie.release_date || movie.first_air_date ||
            movie.backdrop_path || movie.poster_path || movie.vote_average || movie.kinopoisk_id ||
            movie.year || movie.rating) return false
        return !!(movie.name || movie.original_name)
    }

    function readPersons() {
        try {
            var map = Lampa.Storage.get('filminfo_kp_persons', null)
            return map && typeof map == 'object' ? map : {}
        } catch (e) {
            return {}
        }
    }

    function cachePersons(staff) {
        try {
            var map = readPersons()
            var added = false
            staff.forEach(function (s) {
                if (!s || !s.staffId) return
                if (s.nameRu) map[normalizeName(s.nameRu)] = { id: s.staffId, name: s.nameRu }
                if (s.nameEn) map[normalizeName(s.nameEn)] = { id: s.staffId, name: s.nameRu || s.nameEn }
                added = true
            })
            if (!added) return
            var keys = Object.keys(map)
            if (keys.length > 2000) {
                var trimmed = {}
                keys.slice(-1000).forEach(function (k) { trimmed[k] = map[k] })
                map = trimmed
            }
            Lampa.Storage.set('filminfo_kp_persons', map)
        } catch (e) {}
    }

    function lookupPerson(map, person) {
        var candidates = [person.name, person.original_name, person.title, person.original_title]
        for (var i = 0; i < candidates.length; i++) {
            var n = normalizeName(candidates[i])
            if (n && map[n]) return map[n]
        }
        return null
    }

    function resolveKpPersonId(person, callback, retried) {
        var found = lookupPerson(readPersons(), person)
        if (found) {
            callback({ id: found.id, name: found.name })
            return
        }

        if (retried) {
            callback({ error: 'notfound' })
            return
        }

        var last = null
        try { last = Lampa.Storage.get('filminfo_last_kp_film', null) } catch (e) {}
        if (!last || !last.id) {
            callback({ error: 'notfound' })
            return
        }

        fetchStaff(last.id, function (staff) {
            if (Array.isArray(staff) && staff.length) {
                cachePersons(staff)
                var found2 = lookupPerson(readPersons(), person)
                if (found2) {
                    callback({ id: found2.id, name: found2.name })
                    return
                }
            }
            callback({ error: 'notfound' })
        })
    }

    function sectionHtml(body, title) {
        return '<div class="items-line filminfo-section">' +
            '<div class="items-line__head">' +
            '<div class="items-line__title">' + esc(title || T('filminfo_title')) + '</div>' +
            '</div>' +
            '<div class="items-line__body filminfo-body">' + body + '</div>' +
            '</div>'
    }

    function blockSubtitle(text) {
        return '<div class="filminfo-subtitle">' + esc(text) + '</div>'
    }

    function boxOfficeBlockHtml() {
        return '<div class="filminfo-row">' +
            blockSubtitle(T('filminfo_box_office')) +
            '<div class="filminfo-stats"></div>' +
            '</div>'
    }

    function reviewsBlockHtml() {
        return '<div class="filminfo-row">' +
            blockSubtitle(T('filminfo_comments')) +
            '<div class="filminfo-reviews-list"></div>' +
            '</div>'
    }

    function awardsBlockHtml() {
        return '<div class="filminfo-row">' +
            blockSubtitle(T('filminfo_awards')) +
            '<div class="filminfo-awards"></div>' +
            '</div>'
    }

    function actorBlockHtml() {
        return '<div class="filminfo-row filminfo-actor selector">' +
            '<div class="filminfo-actor__photo"></div>' +
            '<div class="filminfo-actor__info"></div>' +
            '</div>'
    }

    function loadingHtml() {
        return '<div class="filminfo-message filminfo-loading">' + esc(T('filminfo_loading')) + '</div>'
    }

    function msgHtml(text) {
        return '<div class="filminfo-message">' + esc(text) + '</div>'
    }

    function statHtml(name, value) {
        return '<div class="filminfo-stat selector">' +
            '<div class="filminfo-stat__name">' + esc(name) + '</div>' +
            '<div class="filminfo-stat__value">' + value + '</div>' +
            '</div>'
    }

    function likesHtml(r) {
        var p = r.positiveRating || 0
        var n = r.negativeRating || 0
        if (!p && !n) return ''
        return '<span class="filminfo-likes--pos">+' + p + '</span><span class="filminfo-likes--neg">−' + n + '</span>'
    }

    function reviewCardHtml(r) {
        var t = reviewType(r.type)
        var html = '<div class="full-review type--vertical filminfo-review selector">'
        html += '<div class="filminfo-review__badge" style="color:' + t.color + '">' + t.label + '</div>'
        if (r.title) html += '<div class="filminfo-review__title">' + esc(r.title) + '</div>'
        html += '<div class="full-review__text filminfo-review__text">' + sanitizeReviewHtml(r.description || r.review || '') + '</div>'
        html += '<div class="full-review__footer">'
        html += '<div class="filminfo-review__author">' + esc(r.author || '—') + '</div>'
        var d = formatDate(r.date)
        if (d) html += '<div class="filminfo-review__date">' + esc(d) + '</div>'
        var likes = likesHtml(r)
        if (likes) html += '<div class="filminfo-review__likes">' + likes + '</div>'
        html += '</div>'
        html += '</div>'
        return html
    }

    function summaryHtml(json) {
        var total = json.total || 0
        var p = json.totalPositiveReviews || 0
        var n = json.totalNeutralReviews || 0
        var g = json.totalNegativeReviews || 0
        var html = '<div class="filminfo-summary">'
        html += '<span class="filminfo-summary__total">' + esc(T('filminfo_total')) + ': ' + total + '</span>'
        if (p) html += '<span class="filminfo-summary__item"><i class="filminfo-dot" style="background:#4caf50"></i>' + p + ' ' + esc(T('filminfo_pos')) + '</span>'
        if (n) html += '<span class="filminfo-summary__item"><i class="filminfo-dot" style="background:#9e9e9e"></i>' + n + ' ' + esc(T('filminfo_neu')) + '</span>'
        if (g) html += '<span class="filminfo-summary__item"><i class="filminfo-dot" style="background:#f44336"></i>' + g + ' ' + esc(T('filminfo_neg')) + '</span>'
        html += '</div>'
        return html
    }

    function loadBoxOffice(kpId, $stats) {
        $stats.html(loadingHtml())

        fetchBoxOffice(kpId, function (items, kind) {
            if (!items) {
                $stats.html(msgHtml(kind == 'auth' ? T('filminfo_error_auth') : T('filminfo_error')))
                syncFull()
                return
            }
            if (!items.length) {
                $stats.html(msgHtml(T('filminfo_no_data')))
                syncFull()
                return
            }

            items.sort(function (a, b) {
                var oa = BO_ORDER[a.type] != null ? BO_ORDER[a.type] : 99
                var ob = BO_ORDER[b.type] != null ? BO_ORDER[b.type] : 99
                return oa - ob
            })

            var html = ''
            items.forEach(function (it) {
                html += statHtml(boxOfficeName(it.type), moneyHtml(it))
            })
            $stats.html(html)
            registerSelectors($stats)
            refreshFilminfoRow($stats.closest('.filminfo-section'))
            syncFull()
        })
    }

    function reviewMatches(r, filter) {
        if (!r) return false
        if (filter == 'positive') return r.type == 'POSITIVE'
        if (filter == 'negative') return r.type == 'NEGATIVE'
        return true
    }

    function loadReviewsPreview(movie, kpId, $list) {
        $list.html(loadingHtml())

        var filter = setting('filminfo_review_filter', 'all')
        var collected = []
        var firstJson = null

        function render(items, json) {
            if (!items.length) {
                $list.html(msgHtml(filter == 'all' ? T('filminfo_no_reviews') : T('filminfo_no_matching')))
                syncFull()
                return
            }

            $list.html(summaryHtml(json))

            items.forEach(function (r) {
                var $card = $(reviewCardHtml(r))
                $card.on('hover:enter', function () {
                    openReviewModal(movie, r)
                })
                $list.append($card)
            })

            var total
            if (filter == 'all') total = json.total || collected.length
            else total = collected.filter(function (r) { return reviewMatches(r, filter) }).length

            var $btn = $('<div class="filminfo-btn selector">' + esc(T('filminfo_all_comments') + ' (' + total + ')') + '</div>')
            $btn.on('hover:enter', function () {
                openAllReviewsModal(movie, kpId, json)
            })
            $list.append($btn)
            registerSelectors($list)
            refreshFilminfoRow($list.closest('.filminfo-section'))

            syncFull()
        }

        function collect(page) {
            fetchReviews(kpId, page, function (json, kind) {
                if (!json) {
                    var got = collected.filter(function (r) { return reviewMatches(r, filter) })
                    if (got.length) {
                        render(got.slice(0, PREVIEW_COUNT), firstJson)
                    } else {
                        $list.html(msgHtml(kind == 'auth' ? T('filminfo_error_auth') : T('filminfo_error')))
                        syncFull()
                    }
                    return
                }

                if (!firstJson) firstJson = json
                if (json.items) collected = collected.concat(json.items)

                var got = collected.filter(function (r) { return reviewMatches(r, filter) })
                var totalPages = json.totalPages || page
                if (got.length < PREVIEW_COUNT && page < Math.min(totalPages, MAX_ALL_PAGES)) {
                    collect(page + 1)
                    return
                }

                render(got.slice(0, PREVIEW_COUNT), firstJson)
            })
        }

        collect(1)
    }

    function awardItemHtml(a) {
        var win = !!(a.win)
        var label = win ? T('filminfo_awards_win') : T('filminfo_awards_nom')
        var cls = win ? 'filminfo-award__result--win' : 'filminfo-award__result--nom'
        var cat = (a.nominationItem && a.nominationItem.name) || a.nominationName || ''
        var html = '<div class="filminfo-award selector">'
        html += '<div class="filminfo-award__year">' + (a.year ? esc(a.year) : '') + '</div>'
        html += '<div class="filminfo-award__name">' + esc(a.name || '—') + '</div>'
        html += '<span class="filminfo-award__result ' + cls + '">' + esc(label) + '</span>'
        if (cat) html += '<div class="filminfo-award__cat">' + esc(cat) + '</div>'
        html += '</div>'
        return html
    }

    function loadAwards(kpId, $box) {
        $box.html(loadingHtml())

        fetchAwards(kpId, function (items, kind) {
            if (!items) {
                $box.html(msgHtml(kind == 'auth' ? T('filminfo_error_auth') : T('filminfo_error')))
                syncFull()
                return
            }
            if (!items.length) {
                $box.html(msgHtml(T('filminfo_no_awards')))
                syncFull()
                return
            }

            items.sort(function (a, b) {
                var wa = a.win ? 0 : 1
                var wb = b.win ? 0 : 1
                if (wa != wb) return wa - wb
                return (a.year || 0) - (b.year || 0)
            })

            var html = ''
            items.forEach(function (a) {
                html += awardItemHtml(a)
            })
            $box.html(html)
            $box.find('.filminfo-award').on('hover:enter', function () {
                openExternal('https://www.kinopoisk.ru/film/' + kpId + '/awards/')
            })
            registerSelectors($box)
            refreshFilminfoRow($box.closest('.filminfo-section'))

            syncFull()
        })
    }

    function renderActor(p, $photo, $info) {
        if (p.posterUrl) {
            var $img = $('<img>')
            $img.attr('src', esc(p.posterUrl))
            var alt = p.posterUrl.match(/kinopoiskapiunofficial\.tech\/images\/actor_posters\/kp\/(\d+)\.jpg/i)
            if (alt) {
                $img.on('error', function () {
                    $img.off('error')
                    $img.attr('src', 'https://st.kp.yandex.net/images/actor_iphone/iphone360_' + alt[1] + '.jpg')
                })
            }
            $photo.html($img)
        }

        var html = ''
        try {
            var name = p.nameRu || p.nameEn || p.nameOriginal || ''
            if (name) html += '<div class="filminfo-actor__name">' + esc(name) + '</div>'

            var facts = []
            if (p.growth) facts.push([T('filminfo_actor_growth'), esc(p.growth)])
            if (p.birthday) facts.push([T('filminfo_actor_birthday'), esc(formatDate(p.birthday))])
            if (p.birthplace) facts.push([T('filminfo_actor_birthplace'), esc(p.birthplace)])
            if (p.death) facts.push([T('filminfo_actor_death'), esc(formatDate(p.death))])
            if (p.deathplace) facts.push([T('filminfo_actor_deathplace'), esc(p.deathplace)])
            if (p.spouse) facts.push([T('filminfo_actor_spouse'), esc(p.spouse)])
            if (p.children) facts.push([T('filminfo_actor_children'), esc(p.children)])

            if (facts.length) {
                html += '<div class="filminfo-actor__facts">'
                facts.forEach(function (f) {
                    html += '<div class="filminfo-actor__fact">' +
                        '<div class="filminfo-actor__fact-name">' + f[0] + '</div>' +
                        '<div class="filminfo-actor__fact-value">' + f[1] + '</div>' +
                        '</div>'
                })
                html += '</div>'
            }

            var factsList = Array.isArray(p.facts) ? p.facts : (typeof p.facts == 'string' && p.facts ? [p.facts] : [])
            if (factsList.length) {
                html += '<div class="filminfo-actor__facts-title">' + esc(T('filminfo_actor_facts')) + '</div>'
                html += '<div class="filminfo-actor__facts-text">' + esc(factsList.join(' ')) + '</div>'
            }

            var films = (p.films || []).slice()
            var actorFilms = films.filter(function (f) {
                return f && f.professionKey == 'ACTOR'
            })
            if (actorFilms.length) films = actorFilms
            films = films.slice(0, MAX_FILMOGRAPHY)

            if (films.length) {
                html += '<div class="filminfo-actor__facts-title">' + esc(T('filminfo_actor_filmography')) + '</div>'
                html += '<div class="filminfo-filmography">'
                films.forEach(function (f) {
                    var fname = (f.nameRu || f.nameEn || '').trim()
                    if (!fname) return
                    html += '<div class="filminfo-filmography__item">' +
                        '<span class="filminfo-filmography__year">' + (f.year ? esc(f.year) : '') + '</span>' +
                        '<span>' + esc(fname) + '</span>' +
                        '</div>'
                })
                html += '</div>'
            }
        } catch (e) {}

        $info.html(html || msgHtml(T('filminfo_error')))
    }

    function loadActor(movie, $section) {
        var $photo = $section.find('.filminfo-actor__photo')
        var $info = $section.find('.filminfo-actor__info')
        $info.html(loadingHtml())

        resolveKpPersonId(movie, function (res) {
            if (!res || !res.id) {
                var msg
                if (res && res.error == 'auth') msg = T('filminfo_error_auth')
                else if (res && res.error == 'network') msg = T('filminfo_error')
                else msg = T('filminfo_not_found_person')
                $info.html(msgHtml(msg))
                syncFull()
                return
            }

            fetchPerson(res.id, function (person) {
                if (!person) {
                    $info.html(msgHtml(T('filminfo_error')))
                    syncFull()
                    return
                }
                renderActor(person, $photo, $info)
                syncFull()
            })
        })
    }

    function showActorCard(person, $root, comp) {
        if ($root.find('.filminfo-section').length) return

        var $section = $(sectionHtml(actorBlockHtml(), T('filminfo_actor_section')))

        var $head = $root.find('.person-start').first().closest('.items-line')
        if ($head.length) {
            $head.after($section)
        } else {
            var $descr = $root.find('.full-descr, .full-person__description').first().closest('.items-line')
            if ($descr.length) {
                $descr.after($section)
            } else {
                var $first = $root.find('.items-line').first()
                if ($first.length) $first.before($section)
                else $root.append($section)
            }
        }

        var registered = registerActorRow(comp, $section)
        if (!registered) registerSelectors($section)
        syncFull()

        var token = getToken()
        if (!token) {
            $section.find('.filminfo-actor__info').html(msgHtml(T('filminfo_no_token')))
            return
        }

        loadActor(person, $section)
    }

    function handlePersonPage(movie, e, $body) {
        if (!setting('filminfo_actor_info', true)) return
        showActorCard(movie, $body, e.link)
    }

    var actorCardTimer = null
    var actorCardDone = false

    function resetActorCard() {
        actorCardDone = false
        if (actorCardTimer) {
            clearTimeout(actorCardTimer)
            actorCardTimer = null
        }
    }

    function tryActorCard(object) {
        if (actorCardDone) return
        actorCardDone = true

        var comp = null
        try {
            var act = object || Lampa.Activity.active()
            var a = act && act.activity
            if (a) {
                if (a.component) comp = a.component
                else if (a.items) comp = a
            }
        } catch (e) {}

        var attempts = 0
        var MAX_ATTEMPTS = 50

        function poll() {
            if (attempts++ > MAX_ATTEMPTS) return

            var $act = $('.activity--active')
            if (!$act.length) return

            var $name = $act.find('.person-start__name').first()
            if (!$name.length) {
                actorCardTimer = setTimeout(poll, 400)
                return
            }

            var name = $name.text().trim()
            if (!name) {
                actorCardTimer = setTimeout(poll, 400)
                return
            }

            showActorCard({ name: name }, $act, comp)
        }

        actorCardTimer = setTimeout(poll, 400)
    }

    function currentController() {
        try {
            return Lampa.Controller.enabled().name
        } catch (e) {
            return 'content'
        }
    }

    function pageStillActive(movie) {
        try {
            var active = Lampa.Activity.active()
            return !!(active && active.card && active.card.id == movie.id)
        } catch (e) {
            return true
        }
    }

    function syncFull() {
        try {
            Lampa.Activity.active().activity.toggle()
        } catch (e) {}
    }

    function registerSelectors($root) {
        try {
            if (!Lampa.Controller || typeof Lampa.Controller.collectionAppend != 'function') return
            if (!$root || !$root.length) return
            var $els = $root.find('.selector').filter(function () {
                return this.offsetParent !== null
            })
            if (!$els.length) return
            Lampa.Controller.collectionAppend($els)
        } catch (e) {}
    }

    function findDescriptionIndex(comp) {
        var items = comp && comp.items
        if (!Array.isArray(items)) return -1
        for (var i = 0; i < items.length; i++) {
            var it = items[i]
            if (!it || typeof it.render != 'function') continue
            try {
                var el = it.render(true)
                if (el && el.querySelector && (el.querySelector('.full-descr') || el.querySelector('.full-person__description'))) return i
            } catch (e) {}
        }
        return -1
    }

    function findItemIndex(comp, selector) {
        var items = comp && comp.items
        if (!Array.isArray(items)) return -1
        for (var i = 0; i < items.length; i++) {
            var it = items[i]
            if (!it || typeof it.render != 'function') continue
            try {
                var el = it.render(true)
                if (el && el.querySelector && el.querySelector(selector)) return i
            } catch (e) {}
        }
        return -1
    }

    function registerActorRow(comp, $section) {
        if (!comp) return false
        var idx = findItemIndex(comp, '.person-start, .full-person__description, .full-descr')
        if (idx < 0) return false
        return registerFilminfoRow(comp, $section, idx)
    }

    function makeFilminfoRowItem($html, comp) {
        return {
            html: $html,
            last: null,
            use: function (handlers) {
                for (var key in handlers) {
                    if (Object.prototype.hasOwnProperty.call(handlers, key)) this[key] = handlers[key]
                }
            },
            create: function () {},
            render: function (js) {
                return js ? this.html[0] : this.html
            },
            toggle: function () {
                var self = this
                try {
                    comp.active = comp.items.indexOf(self)
                    comp.scroll.update(self.render(true))
                } catch (e) {}
                self._fromAbove = true
                try {
                    var prev = Navigator.getFocusedElement()
                    if (prev && prev.nodeType) {
                        var sr = self.html[0].getBoundingClientRect()
                        var pr = prev.getBoundingClientRect()
                        if (pr.bottom > sr.top + 2) self._fromAbove = false
                    }
                } catch (e) {}
                Lampa.Controller.add('filminfo_row', {
                    link: self,
                    toggle: function () {
                        var target = null
                        try {
                            var focused = Navigator.getFocusedElement()
                            if (focused && focused.nodeType && self.html[0].contains(focused) && focused.offsetParent !== null) target = focused
                        } catch (e) {}
                        if (!target) target = self.last
                        if (!target) {
                            var sels = []
                            try {
                                self.html.find('.selector').each(function () {
                                    if (this.offsetParent !== null) sels.push(this)
                                })
                            } catch (e) {}
                            if (sels.length) target = self._fromAbove ? sels[0] : sels[sels.length - 1]
                        }
                        Lampa.Controller.collectionSet(self.html)
                        Lampa.Controller.collectionFocus(target, self.html)
                    },
                    right: function () {
                        Navigator.move('right')
                    },
                    left: function () {
                        if (Navigator.canmove('left')) Navigator.move('left')
                        else if (self.onLeft) self.onLeft()
                    },
                    down: function () {
                        if (Navigator.canmove('down')) Navigator.move('down')
                        else if (self.onDown) self.onDown()
                    },
                    up: function () {
                        if (Navigator.canmove('up')) Navigator.move('up')
                        else if (self.onUp) self.onUp()
                    },
                    back: function () {
                        if (self.onBack) self.onBack()
                        else {
                            try {
                                Lampa.Activity.backward()
                            } catch (e) {}
                        }
                    }
                })
                Lampa.Controller.toggle('filminfo_row')
            },
            destroy: function () {
                this.html.remove()
            }
        }
    }

    function registerFilminfoRow(comp, $section, index) {
        try {
            if (!comp || !Array.isArray(comp.items) || typeof comp.emit != 'function') return false
            if (typeof index != 'number' || index < 0) {
                var descIndex = findDescriptionIndex(comp)
                if (descIndex < 0) return false
                index = descIndex
            }
            var insertAt = index + 1
            var item = makeFilminfoRowItem($section, comp)
            item.html.on('hover:focus', function (e) {
                var el = e && e.target
                if (el && el.nodeType && el.classList && el.classList.contains('selector') && $section[0].contains(el)) {
                    item.last = el
                }
            })
            item.use({
                onDown: comp.emit.bind(comp, 'down'),
                onUp: comp.emit.bind(comp, 'up'),
                onBack: comp.emit.bind(comp, 'back'),
                onLeft: comp.emit.bind(comp, 'left'),
                onActive: function () {
                    comp.active = comp.items.indexOf(item)
                },
                onToggle: function () {
                    try {
                        comp.scroll.update(item.render(true))
                    } catch (e) {}
                }
            })
            comp.items.splice(insertAt, 0, item)
            if (Array.isArray(comp.rows)) comp.rows.splice(insertAt, 0, 'filminfo')
            bindFilminfoScrollFollow($section, comp)
            return true
        } catch (e) {
            return false
        }
    }

    function bindFilminfoScrollFollow($row, comp) {
        try {
            if (typeof Navigator == 'undefined' || !Navigator || typeof Navigator.follow != 'function') return
            Navigator.follow('focus', function (event) {
                var el = event && event.elem
                if (!el || !el.nodeType || !$row[0].contains(el)) return
                try {
                    var sc = comp && comp.scroll
                    if (!sc || typeof sc.update != 'function') return
                    var scEl = typeof sc.render == 'function' ? sc.render(true) : null
                    if (!scEl) return
                    var sr = scEl.getBoundingClientRect()
                    var rect = el.getBoundingClientRect()
                    if (!rect.width && !rect.height) return
                    if (rect.bottom > sr.bottom || rect.top < sr.top) {
                        var delta = rect.top < sr.top ? sr.top - rect.top : rect.bottom - sr.bottom
                        if (delta > 0) {
                            if (typeof sc.shift == 'function') {
                                sc.shift(rect.top < sr.top ? -delta : delta)
                            } else {
                                sc.update(el, rect.top < sr.top ? false : true)
                            }
                        }
                    }
                } catch (e) {}
            })
        } catch (e) {}
    }

    function refreshFilminfoRow($row) {
        try {
            if (!$row || !$row.length) return
            if (Lampa.Controller.enabled().name != 'filminfo_row') return
            var target = null
            try {
                var focused = Navigator.getFocusedElement()
                if (focused && focused.offsetParent && $row[0].contains(focused)) target = focused
            } catch (e) {}
            Lampa.Controller.collectionSet($row)
            Lampa.Controller.collectionFocus(target, $row)
        } catch (e) {}
    }

    function restoreController(name) {
        Lampa.Modal.close()
        Lampa.Controller.toggle(name)
    }

    function modalBase(movie) {
        var controller = currentController()
        return {
            title: (movie.title || movie.name || ''),
            size: 'large',
            mask: true,
            buttons: [
                { name: T('filminfo_close'), onSelect: function () { restoreController(controller) } }
            ],
            onBack: function () { restoreController(controller) }
        }
    }

    function openReviewModal(movie, r) {
        var t = reviewType(r.type)
        var html = '<div class="filminfo-modal-review">'
        html += '<div class="filminfo-modal-review__head">'
        html += '<span class="filminfo-modal-review__type" style="color:' + t.color + '">' + t.label + '</span>'
        var d = formatDate(r.date)
        if (d) html += '<span class="filminfo-modal-review__date">' + esc(d) + '</span>'
        html += '</div>'
        if (r.title) html += '<div class="filminfo-modal-review__title">' + esc(r.title) + '</div>'
        html += '<div class="filminfo-modal-review__author">' + esc(r.author || '—') + '</div>'
        var likes = likesHtml(r)
        if (likes) html += '<div class="filminfo-modal-review__likes">' + likes + '</div>'
        html += '<div class="filminfo-modal-review__text">' + sanitizeReviewHtml(r.description || r.review || '') + '</div>'
        html += '</div>'

        var params = modalBase(movie)
        params.html = $('<div class="filminfo-modal">' + html + '</div>')
        Lampa.Modal.open(params)
    }

    function allReviewItemHtml(r) {
        var t = reviewType(r.type)
        var d = formatDate(r.date)
        var html = '<div class="filminfo-all-review">'
        html += '<div class="filminfo-all-review__head selector">'
        html += '<span class="filminfo-all-review__type" style="color:' + t.color + '">' + t.label + '</span>'
        html += '<span class="filminfo-all-review__author">' + esc(r.author || '—') + '</span>'
        if (d) html += '<span class="filminfo-all-review__date">' + esc(d) + '</span>'
        var likes = likesHtml(r)
        if (likes) html += '<span class="filminfo-all-review__likes">' + likes + '</span>'
        html += '</div>'
        html += '<div class="filminfo-all-review__body">' + sanitizeReviewHtml(r.description || r.review || '') + '</div>'
        html += '</div>'
        return html
    }

    function openAllModal(movie, kpId, items, total, firstPage) {
        var $html = $('<div class="filminfo-all">' + summaryHtml(firstPage) + '</div>')

        if (!items.length) {
            $html.append('<div class="filminfo-message">' + esc(T('filminfo_no_reviews')) + '</div>')
        } else {
            var $list = $('<div class="filminfo-all__list"></div>')

            items.forEach(function (r) {
                var $item = $(allReviewItemHtml(r))
                $item.find('.filminfo-all-review__head').on('hover:enter', function () {
                    $item.toggleClass('open')
                })
                $list.append($item)
            })

            $html.append($list)
            $html.append('<div class="filminfo-all__note">' + esc(fmt(T('filminfo_shown_of'), { n: items.length, total: total })) + '</div>')
        }

        var params = modalBase(movie)
        params.html = $html
        params.buttons.push({
            name: 'Кинопоиск',
            onSelect: function () {
                openExternal('https://www.kinopoisk.ru/film/' + kpId + '/reviews/')
            }
        })
        Lampa.Modal.open(params)
    }

    function openAllReviewsModal(movie, kpId, firstPage) {
        var filter = setting('filminfo_review_filter', 'all')
        var totalPages = firstPage.totalPages || 1
        var pagesToLoad = Math.min(totalPages, MAX_ALL_PAGES)
        var collected = (firstPage.items || []).filter(function (r) { return reviewMatches(r, filter) })
        var total = filter == 'all' ? (firstPage.total || collected.length) : collected.length

        function next(page) {
            if (page > pagesToLoad) {
                if (pageStillActive(movie)) openAllModal(movie, kpId, collected, total, firstPage)
                return
            }
            fetchReviews(kpId, page, function (json) {
                if (json && json.items) collected = collected.concat(json.items.filter(function (r) { return reviewMatches(r, filter) }))
                next(page + 1)
            })
        }

        next(2)
    }

    function trailerBtnIcon() {
        return '<svg class="filminfo-trailer-btn__icon" width="239" height="239" viewBox="0 0 239 239" fill="currentColor" xmlns="http://www.w3.org/2000/svg" xml:space="preserve">' +
            '<path fill="currentColor" d="M215 121.415l-99.297-6.644 90.943 36.334a106.416 106.416 0 0 0 8.354-29.69z" />' +
            '<path fill="currentColor" d="M194.608 171.609C174.933 197.942 143.441 215 107.948 215 48.33 215 0 166.871 0 107.5 0 48.13 48.33 0 107.948 0c35.559 0 67.102 17.122 86.77 43.539l-90.181 48.07L162.57 32.25h-32.169L90.892 86.862V32.25H64.77v150.5h26.123v-54.524l39.509 54.524h32.169l-56.526-57.493 88.564 46.352z" />' +
            '<path d="M206.646 63.895l-90.308 36.076L215 93.583a106.396 106.396 0 0 0-8.354-29.688z" fill="currentColor" />' +
            '</svg>'
    }

    function trailerVideoId(t) {
        var id = String(t.videoId || '').trim()
        if (id) return id
        var m = String(t.url || '').match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^\/?#&]+)/i)
        return m ? m[1] : ''
    }

    function trailerWidgetId(t) {
        var m = String(t.url || '').match(/kinopoisk\.ru\/discovery\/trailer\/(\d+)/i)
        return m ? m[1] : ''
    }

    function parseTrailerWidget(html) {
        try {
            var m = String(html).match(/<script[^>]*data-state[^>]*>([\s\S]*?)<\/script>/i)
            if (!m) return null
            var json = JSON.parse(decodeURIComponent(m[1]))
            var trailers = json && json.models && json.models.trailers
            if (!trailers) return null
            var keys = Object.keys(trailers)
            if (!keys.length) return null
            var t = trailers[keys[0]]
            if (!t || !t.streamUrl) return null
            var preview = ''
            if (t.img && t.img.mediumPreviewUrl && t.img.mediumPreviewUrl.x1) preview = 'https:' + t.img.mediumPreviewUrl.x1
            else if (t.img && t.img.previewUrl && t.img.previewUrl.x1) preview = 'https:' + t.img.previewUrl.x1
            return { streamUrl: t.streamUrl, preview: preview }
        } catch (e) {
            return null
        }
    }

    function fetchTrailerWidget(trailerId, callback) {
        var url = 'https://widgets.kinopoisk.ru/discovery/trailer/' + trailerId + '?onlyPlayer=1&autoplay=0'
        var done = function (html) {
            callback(parseTrailerWidget(html))
        }
        var fail = function () {
            callback(null)
        }
        try {
            if (network && typeof network.native == 'function') network.native(url, done, fail, false, { dataType: 'html', timeout: 1000 * 20 })
            else if (network) network.silent(url, done, fail, false, { dataType: 'html', timeout: 1000 * 20 })
            else callback(null)
        } catch (e) {
            callback(null)
        }
    }

    function playTrailerItem(a) {
        if (!a || !a.url) return
        var u = String(a.url)
        try {
            if (u.indexOf('youtube.com') >= 0 || u.indexOf('strm.yandex') >= 0 || /\.m3u8(\?|$)/i.test(u)) {
                if (typeof Lampa.Player != 'undefined' && typeof Lampa.Player.play == 'function') {
                    Lampa.Player.play({ title: a.title || T('filminfo_trailer'), url: u })
                    return
                }
            }
        } catch (e) {}
        openExternal(u)
    }

    function displayTrailers(movie, kpId, $body) {
        try {
            if (!kpId) return
            fetchVideos(kpId, function (items) {
                if (!items || !items.length) return
                if (!$body || !$body.length) return
                var $cont = $body.find('.full-start-new__buttons, .full-start__buttons').first()
                if (!$cont || !$cont.length) return
                if ($cont.find('.button--kinopoisk_trailers, .filminfo-trailer-btn').length) return

                var list = []
                items.forEach(function (t) {
                    var name = (t.name || '').trim() || T('filminfo_trailer')
                    var videoId = trailerVideoId(t)
                    if (videoId) {
                        list.push({
                            title: name,
                            url: 'https://www.youtube.com/watch?v=' + videoId,
                            icon: '<img class="size-youtube" src="https://img.youtube.com/vi/' + videoId + '/default.jpg">',
                            ready: true
                        })
                    } else {
                        var wid = trailerWidgetId(t)
                        if (wid) {
                            list.push({
                                title: name,
                                url: String(t.url || ''),
                                wid: wid,
                                icon: '<img class="size-youtube" src="https://st.kp.yandex.net/images/film_iphone/iphone360_' + kpId + '.jpg">',
                                ready: false
                            })
                        }
                    }
                })

                if (!list.length) return

                list.forEach(function (a) {
                    if (a.ready || !a.wid) return
                    fetchTrailerWidget(a.wid, function (res) {
                        if (res) {
                            a.ready = true
                            a.url = res.streamUrl
                            if (res.preview) a.icon = '<img class="size-youtube" src="' + res.preview + '">'
                        }
                    })
                })

                $cont.append('<div class="full-start__button selector filminfo-trailer-btn">' +
                    trailerBtnIcon() +
                    '<span>' + esc(T('filminfo_trailers')) + '</span>' +
                    '</div>')

                var $btn = $cont.find('.filminfo-trailer-btn').last()

                $btn.on('hover:enter', function () {
                    var trailers = list.map(function (a) {
                        return {
                            title: a.title,
                            url: a.url,
                            icon: a.icon || '',
                            template: 'selectbox_icon'
                        }
                    })

                    try {
                        if (typeof Lampa.Select != 'undefined' && typeof Lampa.Select.show == 'function') {
                            Lampa.Select.show({
                                title: 'Трейлеры Кинопоиск',
                                items: trailers,
                                onSelect: function (a) {
                                    playTrailerItem(a)
                                },
                                onBack: function () {
                                    try { Lampa.Controller.toggle('full_start') } catch (e2) {}
                                }
                            })
                        } else if (trailers.length) {
                            playTrailerItem(trailers[0])
                        }
                    } catch (e) {}
                })

                try {
                    if (Lampa.Controller && typeof Lampa.Controller.collectionAppend == 'function') Lampa.Controller.collectionAppend($btn)
                } catch (e) {}
            })
        } catch (e) {}
    }

    function onFull(e) {
        if (e.type == 'archive') {
            if (network) network.clear()
            return
        }

        if (e.type != 'complite') return

        var data = e.data
        var movie = data && data.movie
        if (!movie || !movie.id) return

        var $body = $(e.body)
        if (!$body.length) return

        if (isPersonMovie(movie)) {
            handlePersonPage(movie, e, $body)
            return
        }

        if ($body.find('.filminfo-section').length) return

        var showBoxOffice = setting('filminfo_box_office', true)
        var showReviews = setting('filminfo_reviews', true)
        var showAwards = setting('filminfo_awards', true)
        var showTrailers = setting('filminfo_trailers', true)
        if (!showBoxOffice && !showReviews && !showAwards && !showTrailers) return

        var $descr = $body.find('.full-descr').closest('.items-line')
        if (!$descr.length) $descr = $body.find('.items-line').eq(1)
        if (!$descr.length) return

        var bodyHtml = ''
        if (showBoxOffice) bodyHtml += boxOfficeBlockHtml()
        if (showAwards) bodyHtml += awardsBlockHtml()
        if (showReviews) bodyHtml += reviewsBlockHtml()

        var $section = null
        if (bodyHtml) {
            $section = $(sectionHtml(bodyHtml))
            $descr.after($section)

            var registered = registerFilminfoRow(e.link, $section)
            if (!registered) registerSelectors($section)

            syncFull()
        }

        var token = getToken()
        if (!token) {
            if ($section) $section.find('.filminfo-stats, .filminfo-awards, .filminfo-reviews-list').html(msgHtml(T('filminfo_no_token')))
            return
        }

        resolveKpId(movie, function (res) {
            if (!res || !res.id) {
                var msg
                if (res && res.error == 'auth') msg = T('filminfo_error_auth')
                else if (res && res.error == 'network') msg = T('filminfo_error')
                else msg = T('filminfo_not_found_kp')
                if ($section) $section.find('.filminfo-stats, .filminfo-awards, .filminfo-reviews-list').html(msgHtml(msg))
                return
            }

            try { Lampa.Storage.set('filminfo_last_kp_film', { id: res.id }) } catch (e2) {}

            if (showTrailers) displayTrailers(movie, res.id, $body)

            if ($section) {
                if (showBoxOffice) loadBoxOffice(res.id, $section.find('.filminfo-stats'))
                if (showAwards) loadAwards(res.id, $section.find('.filminfo-awards'))
                if (showReviews) loadReviewsPreview(movie, res.id, $section.find('.filminfo-reviews-list'))
            }

            if (setting('filminfo_actor_info', true)) {
                fetchStaff(res.id, function (staff) {
                    if (Array.isArray(staff) && staff.length) cachePersons(staff)
                })
            }
        })
    }

    function onActivity(e) {
        if (e.type == 'archive' || e.type == 'destroy') {
            if (network) network.clear()
        }
        if (e.type == 'start' && e.component == 'actor' && setting('filminfo_actor_info', true)) {
            resetActorCard()
            tryActorCard(e.object)
        }
    }

    /* ================================================================
       EasyTorrent: система рекомендаций торрентов (внедрена полностью)
       Русский язык, по умолчанию SDR оценивается выше HDR
       ================================================================ */

    var ET_VERSION = '1.0.0 Beta'
    var ET_QR_PAGE = 'https://darkestclouds.github.io/plugins/easytorrent/'
    var ET_QR_API = 'https://wozuelafumpzgvllcjne.supabase.co'
    var ET_QR_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvenVlbGFmdW1wemd2bGxjam5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5Mjg1MDgsImV4cCI6MjA4MjUwNDUwOH0.ODnHlq_P-1wr_D6Jwaba1mLXIVuGBnnUZsrHI8Twdug'

    var ET_STR = {
        name: 'Торрент-рекомендации',
        version: ET_VERSION,
        title: 'Торрент-рекомендации',
        desc: 'Рекомендации торрентов на основе качества, HDR и озвучки',
        show_scores: 'Показывать оценки',
        show_scores_desc: 'Отображать оценку качества торрента',
        ideal: 'Идеальный',
        recommended: 'Рекомендуется',
        config_json: 'Конфигурация (JSON)',
        config_json_desc: 'Нажмите для просмотра или изменения настроек',
        config_view: 'Просмотреть параметры',
        config_edit: 'Вставить JSON',
        config_reset: 'Сбросить к заводским',
        config_error: 'Ошибка: неверный формат JSON',
        resume_title: 'Продолжить просмотр',
        resume_desc: 'Открывать последний просмотренный торрент с места остановки'
    }

    var ET_DEFAULT_CONFIG = {
        version: '2.0',
        generated: '2025-12-27T13:43:12.099Z',
        device: {
            type: 'tv_4k',
            supported_hdr: ['hdr10', 'hdr10plus'],
            supported_audio: ['stereo', 'surround_51']
        },
        network: { speed: 'very_fast', stability: 'stable' },
        parameter_priority: ['audio_track', 'resolution', 'availability', 'bitrate', 'hdr', 'audio_quality'],
        audio_track_priority: ['Дубляж RU', 'MVO HDRezka', 'MVO LostFilm', 'MVO Кубик в Кубе', 'MVO NewStudio', 'Original'],
        preferences: { min_seeds: 3, recommendation_count: 3 },
        scoring_rules: {
            weights: { audio_track: 100, resolution: 85, availability: 70, bitrate: 55, hdr: 40, audio_quality: 25 },
            resolution: { 480: -60, 720: -30, 1080: 17, 1440: 42.5, 2160: 85 },
            hdr: { dolby_vision: -14, hdr10plus: -14, hdr10: -14, sdr: 40 },
            bitrate_bonus: {
                thresholds: [
                    { min: 0, max: 15, bonus: 0 },
                    { min: 15, max: 30, bonus: 15 },
                    { min: 30, max: 60, bonus: 30 },
                    { min: 60, max: 999, bonus: 35 }
                ],
                weight: 0.55
            },
            availability: { weight: 0.7, min_seeds: 2 },
            audio_quality: { weight: 0.25 },
            audio_track: { weight: 1 }
        }
    }

    var etConfig = null
    var ET_HDR_LABEL = { dolby_vision: 'DV', hdr10plus: 'HDR10+', hdr10: 'HDR10', sdr: 'SDR' }

    function etLoadConfig() {
        var saved = null
        try { saved = Lampa.Storage.get('et_config_json', null) } catch (e) {}
        if (saved) {
            try {
                var cfg = typeof saved == 'string' ? JSON.parse(saved) : saved
                if (cfg && (cfg.version === '2.0' || cfg.version === 2)) {
                    etConfig = cfg
                    return
                }
            } catch (e) {}
        }
        etConfig = ET_DEFAULT_CONFIG
    }

    function etSaveConfig(obj) {
        var str = typeof obj == 'string' ? obj : JSON.stringify(obj)
        try { Lampa.Storage.set('et_config_json', str) } catch (e) {}
        try { etConfig = JSON.parse(str) } catch (e) { etConfig = ET_DEFAULT_CONFIG }
    }

    function etToInt(s) {
        var n = parseInt(s, 10)
        return Number.isFinite(n) ? n : null
    }

    function etRange(a, b) {
        if (a == null) return null
        if (b == null || b === a) return { start: a, end: a }
        return { start: Math.min(a, b), end: Math.max(a, b) }
    }

    function etValidSeason(n) {
        return Number.isInteger(n) && n >= 1 && n <= 60
    }

    function etValidEpisode(n) {
        return Number.isInteger(n) && n >= 0 && n <= 5000
    }

    function etValidRange(a, b) {
        return Number.isInteger(a) && Number.isInteger(b) &&
            a >= 1900 && a <= 2100 && b >= 1900 && b <= 2100 && b >= a && b - a <= 60
    }

    function etNormalizeTitle(raw) {
        var t = String(raw == null ? '' : raw)
        t = t.replace(/[\u2012\u2013\u2014\u2212]/g, '-')
        t = t.replace(/х/gi, 'x')
        t = t.replace(/\u00A0/g, ' ')
        t = t.replace(/\s+/g, ' ').trim()
        return t
    }

    function etEscRe(s) {
        return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    function etTrashTitle(raw) {
        var t = String(raw || '').toLowerCase()
        var patterns = [
            /(?:^|[^\p{L}\p{N}])(фильм|film|movie|movies)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(спецвыпуск|special|specials|sp|ova|ona|bonus|extra|экстра|спэшл|спешл|спэшал|ова|она|спэшел)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(трейлер|trailer|teaser|тизер)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(саундтрек|ost|soundtrack)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(клип|clip|pv)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(интервью|interview)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(репортаж|report)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(промо|promo)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(отрывок|preview)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(анонс|announcement)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(съемки|making of|behind the scenes)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(сборник|collection)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(документальный|docu|documentary)(?=$|[^\p{L}\p{N}])/iu,
            /(?:^|[^\p{L}\p{N}])(концерт|concert|live)(?=$|[^\p{L}\p{N}])/iu,
            /movie\s*\d+/i,
            /film\s*\d+/i,
            /(?:^|[^\p{L}\p{N}])(мультфильм|аниме-фильм|спецэпизод|спецсерія)(?=$|[^\p{L}\p{N}])/iu,
            /\bepisode of\b/i
        ]
        for (var i = 0; i < patterns.length; i++) {
            if (patterns[i].test(t)) return true
        }
        return false
    }

    function etDub2x2(text, index, match) {
        if (String(match).toLowerCase().replace(/\s+/g, '') === '2x2') return true
        var before = text.slice(Math.max(0, index - 12), index).toLowerCase()
        var after = text.slice(index + match.length, index + match.length + 12).toLowerCase()
        return /(дб|dub)\s*\(/i.test(before) && /^\s*\)/.test(after)
    }

    function etConfidence(par) {
        if (par.title && etTrashTitle(par.title)) return 0
        var i = par.season != null ? par.season : (par.seasonRange ? par.seasonRange.start : null)
        var l = par.episode != null ? par.episode : (par.episodeRange ? par.episodeRange.start : null)
        var sc = par.base
        if (i != null) sc += 10
        if (l != null) sc += 10
        if (i != null && l != null) sc += 15
        if (par.seasonRange && par.seasonRange.end !== par.seasonRange.start) sc += 5
        if (par.episodeRange && par.episodeRange.end !== par.episodeRange.start) sc += 5
        if (i != null && !etValidSeason(i)) sc -= 60
        if (l != null && !etValidEpisode(l)) sc -= 60
        return Number.isFinite(sc) ? Math.max(0, Math.min(100, Math.round(sc))) : 0
    }

    function etParseTorrentTitle(raw) {
        var text = etNormalizeTitle(raw)
        var total = null
        var mTotal = /(?:^|[^\p{L}\p{N}])(?:из|of)\s*(\d{1,4})(?=$|[^\p{L}\p{N}])/iu.exec(text)
        if (mTotal) {
            var n = etToInt(mTotal[1])
            if (etValidEpisode(n)) total = n
        }
        if (etTrashTitle(text)) return { season: null, episode: null, source: 'trash', confidence: 0 }

        var seasonCandidates = []
        var episodeCandidates = []

        var m1 = /s(\d{1,2})\s*[ex](\d{1,3})(?:\s*[-]\s*[ex]?(\d{1,3}))?\b/i.exec(text)
        if (m1) {
            var s1 = etToInt(m1[1])
            var e1 = etRange(etToInt(m1[2]), etToInt(m1[3]))
            var ep1 = e1 ? e1.start : null
            if (etValidSeason(s1)) seasonCandidates.push({ season: s1, base: 90, name: 'SxxEyy' })
            if (etValidEpisode(ep1)) episodeCandidates.push({ episode: ep1, episodeRange: e1, base: 90, name: 'SxxEyy' })
        }

        var m2 = /\b(\d{1,2})\s*[-]\s*(\d{1,2})\s*x\s*(\d{1,3})(?:\s*[-]\s*(\d{1,4}))?\b/i.exec(text)
        if (m2 && !etDub2x2(text, m2.index, m2[0])) {
            var sA = etToInt(m2[1])
            var sB = etToInt(m2[2])
            var eA = etToInt(m2[3])
            var eB = etToInt(m2[4])
            var sRange = etRange(sA, sB)
            var eRange = etRange(eA, eB)
            if (sRange && etValidSeason(sRange.start) && etValidSeason(sRange.end)) {
                seasonCandidates.push({
                    season: sRange.start,
                    seasonRange: sRange.start !== sRange.end ? sRange : undefined,
                    base: 92,
                    name: 'Srange x Erange'
                })
            }
            if (eRange && etValidEpisode(eRange.start) && etValidEpisode(eRange.end)) {
                episodeCandidates.push({
                    episode: eRange.start,
                    episodeRange: eRange.start !== eRange.end ? eRange : undefined,
                    base: 92,
                    name: 'Srange x Erange'
                })
            }
        }

        var m3 = /\b(\d{1,2})\s*x\s*(\d{1,3})(?:\s*[-]\s*(\d{1,3}))?\b/i.exec(text)
        if (m3 && !etDub2x2(text, m3.index, m3[0])) {
            var s3 = etToInt(m3[1])
            var e3 = etRange(etToInt(m3[2]), etToInt(m3[3]))
            var ep3 = e3 ? e3.start : null
            if (etValidSeason(s3)) seasonCandidates.push({ season: s3, base: 85, name: 'xxXyy' })
            if (etValidEpisode(ep3)) episodeCandidates.push({ episode: ep3, episodeRange: e3, base: 85, name: 'xxXyy' })
        }

        var bracketRe = /[\[\(]([^\]\)]+)[\]\)]?/g
        var bm
        while ((bm = bracketRe.exec(text)) !== null) {
            var inner = bm[1]
            var rangeRe = /(\d{1,4})\s*[-]\s*(\d{1,4})/g
            var rm
            while ((rm = rangeRe.exec(inner)) !== null) {
                var a = etToInt(rm[1])
                var b = etToInt(rm[2])
                if (a == null || b == null || etValidRange(a, b)) continue
                var after = inner.slice(rm.index + rm[0].length, rm.index + rm[0].length + 12).toLowerCase()
                var before = inner.slice(Math.max(0, rm.index - 12), rm.index).toLowerCase()
                var hint = /(эп|ep|из|of|tv|series|сер)/i.test(before + ' ' + after)
                if (!(hint || Math.max(a, b) >= 50)) continue
                var range = etRange(a, b)
                var start = range ? range.start : null
                episodeCandidates.push({
                    episode: etValidEpisode(start) ? start : null,
                    episodeRange: range && etValidEpisode(range.start) ? range : undefined,
                    base: hint ? 75 : 70,
                    name: 'bracket range'
                })
            }
            var singleRe = /(?:эп|ep|сер|серия)\s*(\d{1,4})(?=$|[^\d])/i
            var singleMatch = /(?:^|[^\d])(\d{1,4})(?:\s*(?:из|эп|ep|сер|of|from))(?=$|[^\d])/i.exec(inner) || singleRe.exec(inner)
            if (singleMatch) {
                var sv = etToInt(singleMatch[1])
                if (etValidEpisode(sv)) episodeCandidates.push({ episode: sv, base: 65, name: 'bracket single' })
            }
        }

        var seasonPatterns = [
            { re: /(?:^|[^\p{L}\p{N}])(\d{1,2})(?:\s*[-]\s*(\d{1,2}))?\s*сезон(?:а|ы|ів)?(?=$|[^\p{L}\p{N}])/iu, base: 75, name: 'N сезон' },
            { re: /(?:^|[^\p{L}\p{N}])сезон(?:а|ы|и|ів)?\s*(\d{1,2})(?:\s*[-]\s*(\d{1,2}))?(?=$|[^\p{L}\p{N}])/iu, base: 70, name: 'Сезон N' },
            { re: /(?:^|[^\p{L}\p{N}])сезон(?:а|ы|и|ів)?\s*:\s*(\d{1,2})(?:\s*[-]\s*(\d{1,2}))?/iu, base: 66, name: 'Сезон: N' },
            { re: /\bseason\s*[: ]\s*(\d{1,2})(?:\s*[-]\s*(\d{1,2}))?\b/i, base: 55, name: 'Season:' },
            { re: /\bseason\s*(\d{1,2})\b/i, base: 52, name: 'Season N' },
            { re: /\[\s*s(\d{1,2})\s*\]/i, base: 80, name: '[Sxx]' },
            { re: /\bs(\d{1,2})\b/i, base: 50, name: 'Sxx (season-only)' }
        ]
        for (var spi = 0; spi < seasonPatterns.length; spi++) {
            var sp = seasonPatterns[spi]
            var sm = sp.re.exec(text)
            if (!sm) continue
            if (sp.name === 'Сезон: N') {
                var tail = text.slice(sm.index + sm[0].length, sm.index + sm[0].length + 20).toLowerCase()
                if (/^[\s]* (сер|series|episode|эпиз)/i.test(tail)) continue
            }
            var va = etToInt(sm[1])
            var vb = etToInt(sm[2])
            if (va == null) continue
            var range = etRange(va, vb)
            seasonCandidates.push({
                season: range ? range.start : null,
                seasonRange: range && range.end !== range.start ? range : undefined,
                base: sp.base,
                name: sp.name
            })
        }

        var episodePatterns = [
            { re: /(?:^|[^\p{L}\p{N}])(?:серии|серія|серії|эпизод(?:ы)?|episodes|эп\.?)\s*[: ]?\s*(\d{1,4})(?:\s*[-]\s*(\d{1,4}))?(?=$|[^\p{L}\p{N}])/iu, base: 60, name: 'серии' },
            { re: /(?:^|[^\p{L}\p{N}])(\d{1,4})(?:\s*[-]\s*(\d{1,4}))?\s*(?:серии|серія|серії|эпизод(?:ы)?|эп\.?)(?=$|[^\p{L}\p{N}])/iu, base: 62, name: '1-4 серии' },
            { re: /(?:^|[^\p{L}\p{N}])(\d{1,4})\s*[-]\s*(\d{1,4})\s*серия(?=$|[^\p{L}\p{N}])/iu, base: 62, name: '1-4 серия' },
            { re: /(?:^|[^\p{L}\p{N}])(\d{1,4})\s*(?:серия|серія)(?=$|[^\p{L}\p{N}])/iu, base: 54, name: 'N серия' },
            { re: /(?:серии|серії)\s*(\d{1,4})\s*из\s*(\d{1,4})/iu, base: 65, name: 'серии X из Y' }
        ]
        for (var epi = 0; epi < episodePatterns.length; epi++) {
            var ep = episodePatterns[epi]
            var em = ep.re.exec(text)
            if (!em) continue
            var va2 = etToInt(em[1])
            var vb2 = etToInt(em[2])
            if (va2 == null) continue
            var range2 = etRange(va2, vb2)
            episodeCandidates.push({
                episode: range2 ? range2.start : null,
                episodeRange: range2 && range2.end !== range2.start ? range2 : undefined,
                base: ep.base,
                name: ep.name
            })
        }

        seasonCandidates.sort(function (a, b) { return b.base - a.base })
        episodeCandidates.sort(function (a, b) { return b.base - a.base })
        var bestSeason = seasonCandidates[0] || null
        var bestEpisode = episodeCandidates[0] || null

        if (bestSeason || bestEpisode) {
            var seasonVal = bestSeason && bestSeason.season != null && etValidSeason(bestSeason.season) ? bestSeason.season : null
            var episodeVal = bestEpisode && bestEpisode.episode != null && etValidEpisode(bestEpisode.episode) ? bestEpisode.episode : null
            var sRange = bestSeason ? bestSeason.seasonRange : undefined
            var eRange = bestEpisode ? bestEpisode.episodeRange : undefined
            var epCount = eRange ? eRange.end - eRange.start + 1 : (episodeVal != null ? 1 : null)
            return {
                season: seasonVal,
                seasonRange: sRange,
                episode: episodeVal,
                episodeRange: eRange,
                episodesTotal: total,
                episodesCount: epCount,
                source: [bestSeason && bestSeason.name, bestEpisode && bestEpisode.name].filter(Boolean).join(' + ') || 'heuristic',
                confidence: etConfidence({
                    season: seasonVal,
                    seasonRange: sRange,
                    episode: episodeVal,
                    episodeRange: eRange,
                    base: Math.max(bestSeason ? bestSeason.base : 0, bestEpisode ? bestEpisode.base : 0),
                    title: text
                })
            }
        }
        return { season: null, episode: null, source: 'none', confidence: 0 }
    }

    function etResolution(element) {
        var t = (element.Title || element.title || '').toLowerCase()
        if (element.ffprobe && Array.isArray(element.ffprobe)) {
            var v = element.ffprobe.find(function (s) { return s.codec_type === 'video' })
            if (v && v.height) {
                return v.height >= 2160 || (v.width && v.width >= 3800) ? 2160
                    : v.height >= 1440 || (v.width && v.width >= 2500) ? 1440
                        : v.height >= 1080 || (v.width && v.width >= 1900) ? 1080
                            : v.height >= 720 || (v.width && v.width >= 1260) ? 720
                                : 480
            }
        }
        if (/\b2160p\b/.test(t) || /\b4k\b/.test(t)) return 2160
        if (/\b1440p\b/.test(t) || /\b2k\b/.test(t)) return 1440
        if (/\b1080p\b/.test(t)) return 1080
        if (/\b720p\b/.test(t)) return 720
        return null
    }

    function etHdrType(element) {
        var t = (element.Title || element.title || '').toLowerCase()
        var n = []
        if (element.ffprobe && Array.isArray(element.ffprobe)) {
            var v = element.ffprobe.find(function (s) { return s.codec_type === 'video' })
            if (v && v.side_data_list) {
                v.side_data_list.some(function (s) {
                    return s.side_data_type === 'DOVI configuration record' || s.side_data_type === 'Dolby Vision RPU'
                }) && n.push('dolby_vision')
            }
        }
        var hasHdr10p = t.indexOf('hdr10+') >= 0 || t.indexOf('hdr10plus') >= 0 || t.indexOf('hdr10 plus') >= 0
        if (hasHdr10p && n.indexOf('hdr10plus') < 0) n.push('hdr10plus')
        var hasHdr10 = t.indexOf('hdr10') >= 0 || /hdr-?10/.test(t)
        if (hasHdr10 && n.indexOf('hdr10') < 0) n.push('hdr10')
        var hasDv = t.indexOf('dolby vision') >= 0 || t.indexOf('dovi') >= 0 ||
            /\sp8\s/.test(t) || /\(dv\)/.test(t) || /\[dv\]/.test(t) || /\sdv\s/.test(t) || /,\s*dv\s/.test(t)
        if (hasDv && n.indexOf('dolby_vision') < 0) n.push('dolby_vision')
        var hasGeneric = /\bhdr\b/.test(t) || t.indexOf('[hdr]') >= 0 || t.indexOf('(hdr)') >= 0 || t.indexOf(', hdr') >= 0
        if (!hasGeneric && n.indexOf('hdr10plus') < 0 && n.indexOf('hdr10') < 0) n.push('hdr10')
        var hasSdr = t.indexOf('sdr') >= 0 || t.indexOf('[sdr]') >= 0 || t.indexOf('(sdr)') >= 0
        if (hasSdr && n.indexOf('sdr') < 0) n.push('sdr')
        if (n.length === 0) return 'sdr'
        var rules = (etConfig.scoring_rules && etConfig.scoring_rules.hdr) || { dolby_vision: 24, hdr10plus: 40, hdr10: 32, sdr: -14 }
        var best = n[0]
        var bestScore = rules[best] || 0
        n.forEach(function (type) {
            var s = rules[type] || 0
            if (s > bestScore) { bestScore = s; best = type }
        })
        return best
    }

    function etBitrate(element, item, isSeries, seasonCount) {
        var title = element.Title || element.title || ''
        var size = element.Size || element.size_bytes || 0
        if (element.ffprobe && Array.isArray(element.ffprobe)) {
            var v = element.ffprobe.find(function (s) { return s.codec_type === 'video' })
            if (v) {
                if (v.tags && v.tags.BPS) {
                    var b = parseInt(v.tags.BPS, 10)
                    if (!isNaN(b) && b > 0) return Math.round(b / 1e6)
                }
                if (v.bit_rate) {
                    var br = parseInt(v.bit_rate, 10)
                    if (!isNaN(br) && br > 0) return Math.round(br / 1e6)
                }
            }
        }
        var runtime = item && (item.runtime || item.duration || item.episode_run_time)
        if (Array.isArray(runtime)) runtime = runtime.length > 0 ? runtime[0] : 0
        if (!runtime && isSeries) runtime = 45
        if (size > 0 && runtime > 0) {
            var mult = 1
            if (isSeries) {
                var pr = etParseTorrentTitle(title)
                if (pr && pr.episodesCount && pr.episodesCount > 1) mult = pr.episodesCount
                else if (pr && pr.episodesTotal && pr.episodesTotal > 1) mult = pr.episodesTotal
                else if (seasonCount > 1) {
                    if (size > (/\b2160p\b|4k\b/i.test(title) ? 32212254720 : 10737418240)) mult = seasonCount
                }
            }
            var seconds = 60 * runtime * mult
            var rate = Math.round(8 * size / 1e6 / seconds)
            if (rate > 0) return Math.min(rate, 150)
        }
        if (element.bitrate) {
            var m = String(element.bitrate).match(/(\d+\.?\d*)/)
            if (m) return Math.round(parseFloat(m[1]))
        }
        var m2 = String(title).match(/(\d+\.?\d*)\s*(?:Mbps|Мбит)/i)
        return m2 ? Math.round(parseFloat(m2[1])) : 0
    }

    var ET_AUDIO_MAP = {
        'Дубляж RU': ['дубляж', 'дб', 'd', 'dub'],
        'Дубляж UKR': ['ukr'],
        'Дубляж Пифагор': ['пифагор'],
        'Дубляж Red Head Sound': ['red head sound', 'rhs'],
        'Дубляж Videofilm': ['videofilm'],
        'Дубляж MovieDalen': ['moviedalen'],
        'Дубляж LeDoyen': ['ledoyen'],
        'Дубляж Whiskey Sound': ['whiskey sound'],
        'Дубляж IRON VOICE': ['iron voice'],
        'Дубляж AlexFilm': ['alexfilm'],
        'Дубляж Amedia': ['amedia'],
        'MVO HDRezka': ['hdrezka', 'hdrezka studio'],
        'MVO LostFilm': ['lostfilm'],
        'MVO TVShows': ['tvshows', 'tv shows'],
        'MVO Jaskier': ['jaskier'],
        'MVO RuDub': ['rudub'],
        'MVO LE-Production': ['le-production'],
        'MVO Кубик в Кубе': ['кубик в кубе'],
        'MVO NewStudio': ['newstudio'],
        'MVO Good People': ['good people'],
        'MVO IdeaFilm': ['ideafilm'],
        'MVO AMS': ['ams'],
        'MVO Baibako': ['baibako'],
        'MVO Profix Media': ['profix media'],
        'MVO NewComers': ['newcomers'],
        'MVO GoLTFilm': ['goltfilm'],
        'MVO JimmyJ': ['jimmyj'],
        'MVO Kerob': ['kerob'],
        'MVO LakeFilms': ['lakefilms'],
        'MVO Novamedia': ['novamedia'],
        'MVO Twister': ['twister'],
        'MVO Voice Project': ['voice project'],
        'MVO Dragon Money Studio': ['dragon money', 'dms'],
        'MVO Syncmer': ['syncmer'],
        'MVO ColdFilm': ['coldfilm'],
        'MVO SunshineStudio': ['sunshinestudio'],
        'MVO Ultradox': ['ultradox'],
        'MVO Octopus': ['octopus'],
        'MVO OMSKBIRD': ['omskbird records', 'omskbird'],
        'AVO Володарский': ['володарский'],
        'AVO Яроцкий': ['яроцкий', 'м. яроцкий'],
        'AVO Сербин': ['сербин', 'ю. сербин'],
        'PRO Gears Media': ['gears media'],
        'PRO Hamsterstudio': ['hamsterstudio', 'hamster'],
        'PRO P.S.Energy': ['p.s.energy'],
        'UKR НеЗупиняйПродакшн': ['незупиняйпродакшн'],
        'Original': ['original']
    }

    function etAudioMatch(text, key) {
        var t = String(text || '').toLowerCase()
        return (ET_AUDIO_MAP[key] || []).some(function (alt) {
            var a = alt.toLowerCase()
            if (a.length <= 3) return new RegExp('\\b' + etEscRe(a) + '\\b', 'i').test(t)
            return t.indexOf(a) >= 0
        })
    }

    function etAudioTracks(element, item, isSeries, seasonCount) {
        var title = (element.Title || element.title || '').toLowerCase()
        var found = []
        if (element.ffprobe && Array.isArray(element.ffprobe)) {
            element.ffprobe.filter(function (s) { return s.codec_type === 'audio' }).forEach(function (st) {
                var tags = st.tags || {}
                var tName = (tags.title || tags.handler_name || '').toLowerCase()
                var lang = (tags.language || '').toLowerCase()
                var keys = []
                for (var k in ET_AUDIO_MAP) {
                    var alts = ET_AUDIO_MAP[k]
                    if (k === 'Дубляж RU' && (lang === 'rus' || lang === 'russian') &&
                        (tName.indexOf('dub') >= 0 || tName.indexOf('дубляж') >= 0)) {
                        keys.push(k)
                        continue
                    }
                    var matched = alts.some(function (alt) {
                        var a = alt.toLowerCase()
                        if (a === lang) return true
                        if (a.length <= 3) return new RegExp('\\b' + etEscRe(a) + '\\b', 'i').test(tName)
                        return tName.indexOf(a) >= 0
                    })
                    if (matched) keys.push(k)
                }
                keys.forEach(function (k) { if (found.indexOf(k) < 0) found.push(k) })
            })
        }
        for (var k in ET_AUDIO_MAP) {
            if (found.indexOf(k) >= 0) continue
            var matched = ET_AUDIO_MAP[k].some(function (alt) {
                var a = alt.toLowerCase()
                if (a.length <= 3) return new RegExp('\\b' + etEscRe(a) + '\\b', 'i').test(title)
                return title.indexOf(a) >= 0
            })
            if (matched) found.push(k)
        }
        return found
    }

    function etFeatures(element, item, isSeries, seasonCount) {
        return {
            resolution: etResolution(element),
            hdr_type: etHdrType(element),
            audio_tracks: etAudioTracks(element, item, isSeries, seasonCount),
            bitrate: etBitrate(element, item, isSeries, seasonCount)
        }
    }

    function etMakeScorer() {
        var cfg = etConfig
        var rules = cfg.scoring_rules
        return function (el) {
            var total = 100
            var feats = el.features
            var seeds = el.Seeds || el.seeds || el.Seeders || el.seeders || 0
            var a = { base: 100, resolution: 0, hdr: 0, bitrate: 0, availability: 0, audio: 0, audio_track: 0 }
            var priority = cfg.parameter_priority || ['resolution', 'hdr', 'bitrate', 'audio_track', 'availability', 'audio_quality']

            var resW = ((rules.weights && rules.weights.resolution) || 100) / 100
            var resScore = ((rules.resolution && rules.resolution[feats.resolution]) || 0) * resW
            a.resolution = resScore
            total += resScore

            var hdrW = ((rules.weights && rules.weights.hdr) || 100) / 100
            var hdrScore = ((rules.hdr && rules.hdr[feats.hdr_type]) || 0) * hdrW
            a.hdr = hdrScore
            total += hdrScore

            var bitW = (((rules.weights && rules.weights.bitrate) || 100 * (rules.bitrate_bonus && rules.bitrate_bonus.weight)) || 55) / 100
            var bitScore = 0
            if (feats.bitrate > 0) {
                var th = rules.bitrate_bonus && rules.bitrate_bonus.thresholds
                if (th) {
                    for (var i = 0; i < th.length; i++) {
                        if (feats.bitrate >= th[i].min && feats.bitrate < th[i].max) {
                            bitScore = th[i].bonus * bitW
                            break
                        }
                    }
                }
            } else {
                var bi = priority.indexOf('bitrate')
                bitScore = (bi === 0 ? -50 : bi === 1 ? -30 : -15) * bitW
            }
            a.bitrate = bitScore
            total += bitScore

            var audW = ((rules.weights && rules.weights.audio_track) || 100) / 100
            var pref = cfg.audio_track_priority || []
            var tracks = feats.audio_tracks || []
            var audScore = 0
            for (var j = 0; j < pref.length; j++) {
                var key = pref[j]
                var matched = tracks.some(function (tr) { return etAudioMatch(tr, key) })
                if (matched) {
                    audScore = 15 * (pref.length - j) * audW
                    break
                }
            }
            a.audio_track = audScore
            total += audScore

            var minSeeds = (cfg.preferences && cfg.preferences.min_seeds) || (rules.availability && rules.availability.min_seeds) || 1
            var avW = (((rules.weights && rules.weights.availability) || 100 * (rules.availability && rules.availability.weight)) || 70) / 100
            var avScore = 0
            if (seeds < minSeeds) {
                var ai = priority.indexOf('availability')
                avScore = (ai === 0 ? -80 : ai === 1 ? -40 : -20) * avW
            } else {
                avScore = 12 * Math.log10(seeds + 1) * avW
            }
            a.availability = avScore
            total += avScore

            if (priority[0] === 'resolution' && String(cfg.device && cfg.device.type || 'tv_4k').indexOf('4k') >= 0) {
                if (feats.resolution === 2160 && feats.bitrate > 0) { a.special = 80; total += 80 }
                else if (feats.resolution === 2160) { a.special = 30; total += 30 }
                else if (feats.resolution === 1080 && seeds > 50 && feats.bitrate > 0) { a.special = 10; total += 10 }
            }

            total = Math.max(0, Math.round(total))

            if (setting('et_show_scores', true)) {
                var ttl = (el.Title || el.title || '').substring(0, 80)
                console.log('[Score]', ttl, {
                    total: total,
                    breakdown: a,
                    features: { resolution: feats.resolution, hdr_type: feats.hdr_type, bitrate: feats.bitrate, audio_tracks: feats.audio_tracks },
                    seeds: seeds,
                    paramPriority: priority.slice(0, 3)
                })
            }
            return { score: total, breakdown: a }
        }
    }

    function etProcessResults(data, type) {
        if (!setting('et_enabled', true)) return
        if (!data.Results || !Array.isArray(data.Results)) return
        console.log('[EasyTorrent] Получено от парсера:', data.Results.length, 'торрентов')

        var movie = data.movie || (type && type.movie)
        var isSeries = !!(movie && (movie.original_name || (movie.number_of_seasons || 0) > 0 || movie.seasons))
        var seasonCount = 1
        if (isSeries) {
            var realMax = 1
            var planMax = 1
            data.Results.forEach(function (el) {
                var pr = etParseTorrentTitle(el.Title || el.title || '')
                if (pr.episodesCount > realMax) realMax = pr.episodesCount
                if (pr.episodesTotal > planMax) planMax = pr.episodesTotal
            })
            seasonCount = realMax > 1 ? realMax : planMax
            if (seasonCount > 1) {
                console.log('[EasyTorrent] Режим сериала. Анализ: Реальный макс=' + realMax + ', План=' + planMax + '. Используем=' + seasonCount)
            }
        }

        var scorer = etMakeScorer()
        var items = data.Results.map(function (el, idx) {
            var feats = etFeatures(el, movie, isSeries, seasonCount)
            var res = scorer(Object.assign({}, el, { features: feats }))
            return { element: el, originalIndex: idx, features: feats, score: res.score, breakdown: res.breakdown }
        })
        console.log('[EasyTorrent] Все торренты оценены')

        items.sort(function (a, b) {
            if (b.score !== a.score) return b.score - a.score
            if (b.features.bitrate !== a.features.bitrate) return b.features.bitrate - a.features.bitrate
            var sa = a.element.Seeds || a.element.seeds || a.element.Seeders || a.element.seeders || 0
            var sb = b.element.Seeds || b.element.seeds || b.element.Seeders || b.element.seeders || 0
            return sb - sa
        })

        if (items.length > 0) {
            console.log('=== ВСЕ ТОРРЕНТЫ (отсортированы по score) ===')
            items.forEach(function (it, idx) {
                var n = it.element.Seeds || it.element.seeds || it.element.Seeders || it.element.seeders || 0
                var r = it.breakdown
                var title = (it.element.Title || it.element.title || '').substring(0, 100)
                var parts = []
                if (typeof r.audio_track !== 'undefined' && r.audio_track !== 0) parts.push('A:' + (r.audio_track > 0 ? '+' : '') + Math.round(r.audio_track))
                if (typeof r.resolution !== 'undefined' && r.resolution !== 0) parts.push('R:' + (r.resolution > 0 ? '+' : '') + Math.round(r.resolution))
                if (typeof r.bitrate !== 'undefined' && r.bitrate !== 0) parts.push('B:' + (r.bitrate > 0 ? '+' : '') + Math.round(r.bitrate))
                if (typeof r.availability !== 'undefined' && r.availability !== 0) parts.push('S:' + (r.availability > 0 ? '+' : '') + Math.round(r.availability))
                if (typeof r.hdr !== 'undefined' && r.hdr !== 0) parts.push('H:' + (r.hdr > 0 ? '+' : '') + Math.round(r.hdr))
                if (typeof r.special !== 'undefined' && r.special !== 0) parts.push('SP:' + (r.special > 0 ? '+' : '') + Math.round(r.special))
                var tag = parts.length > 0 ? '[' + parts.join(' ') + ']' : '[no breakdown]'
                console.log((idx + 1) + '. [' + it.score + '] ' + (it.features.resolution || '?') + 'p ' +
                    it.features.hdr_type + ' ' + it.features.bitrate + 'mb Seeds:' + n + ' ' + tag + ' | ' + title)
            })
            console.log('=== ВСЕГО: ' + items.length + ' торрентов ===')
        }

        var count = (etConfig.preferences && etConfig.preferences.recommendation_count) || 3
        var minSeeds = (etConfig.preferences && etConfig.preferences.min_seeds) || 2
        var candidates = items.filter(function (it) {
            return (it.element.Seeds || it.element.seeds || it.element.Seeders || it.element.seeders || 0) >= minSeeds
        })
        candidates.slice(0, count).forEach(function (it, idx) {
            it.rank = idx
            it.isIdeal = idx === 0 && it.score >= 150
        })
        items.forEach(function (it) {
            it.element._recommendScore = it.score
            it.element._recommendBreakdown = it.breakdown
            it.element._recommendFeatures = it.features
        })
        console.log('[EasyTorrent] Все торренты промаркированы баллами')
        console.log('[EasyTorrent] Топ-рекомендации сохранены')
    }

    function etBreakdownChips(breakdown) {
        if (!breakdown) return null
        var $chips = $('<div class="torrent-recommend-panel__chips"></div>')
        var defs = [
            { key: 'audio_track', name: 'Озвучка' },
            { key: 'resolution', name: 'Разреш.' },
            { key: 'bitrate', name: 'Битрейт' },
            { key: 'availability', name: 'Сиды' },
            { key: 'hdr', name: 'HDR' },
            { key: 'special', name: 'Бонус' }
        ]
        defs.forEach(function (d) {
            if (typeof breakdown[d.key] === 'undefined' || breakdown[d.key] === 0) return
            var v = Math.round(breakdown[d.key])
            var sign = v > 0 ? '+' : ''
            var cls = v >= 0 ? 'tr-chip--pos' : 'tr-chip--neg'
            $chips.append('<div class="tr-chip ' + cls + '">' +
                '<span class="tr-chip__name">' + d.name + '</span>' +
                '<span class="tr-chip__val">' + sign + v + '</span>' +
                '</div>')
        })
        return $chips
    }

    function etRenderPanel(e) {
        if (!setting('et_enabled', true)) return
        var element = e.element
        var item = e.item
        var showScores = setting('et_show_scores', true)
        if (typeof element._recommendRank === 'undefined') return
        item.find('.torrent-recommend-badge').remove()
        item.find('.torrent-recommend-panel').remove()

        var rank = element._recommendRank
        var score = element._recommendScore
        var breakdown = element._recommendBreakdown || {}
        var count = (etConfig.preferences && etConfig.preferences.recommendation_count) || 3
        if (!(element._recommendIsIdeal || rank < count || showScores)) return

        var features = element._recommendFeatures || {}
        var meta = []
        if (features.resolution) meta.push(features.resolution + 'p')
        if (features.hdr_type) meta.push(ET_HDR_LABEL[features.hdr_type] || String(features.hdr_type).toUpperCase())
        if (features.bitrate) meta.push(features.bitrate + ' Mbps')

        var variant = 'neutral'
        var label = 'Оценка'
        if (element._recommendIsIdeal) {
            variant = 'ideal'
            label = ET_STR.ideal
        } else if (rank < count) {
            variant = 'recommended'
            label = ET_STR.recommended + ' • #' + (rank + 1)
        }

        var $panel = $('<div class="torrent-recommend-panel torrent-recommend-panel--' + variant + '"></div>')
        var $left = $('<div class="torrent-recommend-panel__left"></div>')
        $left.append('<div class="torrent-recommend-panel__label">' + label + '</div>')
        if (meta.length) $left.append('<div class="torrent-recommend-panel__meta">' + meta.join(' • ') + '</div>')

        var $right = $('<div class="torrent-recommend-panel__right"></div>')
        if (showScores && typeof score !== 'undefined') {
            $right.append('<div class="torrent-recommend-panel__score">' + score + '</div>')
        }

        $panel.append($left)
        if (showScores) {
            var chips = etBreakdownChips(breakdown)
            if (chips) $panel.append(chips)
        }
        $panel.append($right)
        item.append($panel)
    }

    function etPatchParserGet(Parser) {
        console.log('[EasyTorrent] Патчим Parser.get для перехвата и фиксации топов')
        var orig = Parser.get

        Parser.get = function (type, callback, params) {
            return orig.call(this, type, function (data) {
                if (data && data.Results && Array.isArray(data.Results)) {
                    etProcessResults(data, type)
                    etInjectResumeButton(type || data)
                    var arr = data.Results

                    var reorder = function (list) {
                        if (!Array.isArray(list) || list.length === 0) return list
                        var count = (etConfig.preferences && etConfig.preferences.recommendation_count) || 3
                        var minSeeds = (etConfig.preferences && etConfig.preferences.min_seeds) || 0
                        var rec = [].concat(list).filter(function (el) {
                            var s = el.Seeds || el.seeds || el.Seeders || el.seeders || 0
                            return (el._recommendScore || 0) > 0 && s >= minSeeds
                        }).sort(function (a, b) {
                            return (b._recommendScore || 0) - (a._recommendScore || 0)
                        }).slice(0, count)
                        if (rec.length === 0) {
                            list.forEach(function (el) { el._recommendRank = 999 })
                            return list
                        }
                        var others = Array.prototype.filter.call(list, function (el) { return rec.indexOf(el) < 0 })
                        var sorted = [].concat(rec, others)
                        sorted.forEach(function (el, i) {
                            el._recommendRank = i
                            el._recommendIsIdeal = i === 0 && (el._recommendScore || 0) >= 150
                        })
                        others.forEach(function (el) { el._recommendRank = 999 })
                        return sorted
                    }

                    var wrap = function (list) {
                        if (!list || list._etPatched) return list
                        var origSort = list.sort
                        list.sort = function () {
                            origSort.apply(this, arguments)
                            var res = reorder(this)
                            for (var i = 0; i < res.length; i++) this[i] = res[i]
                            return this
                        }
                        var origFilter = list.filter
                        list.filter = function () {
                            var res = origFilter.apply(this, arguments)
                            return wrap(reorder(res))
                        }
                        list._etPatched = true
                        return list
                    }

                    arr = wrap(reorder(arr))
                    try {
                        Object.defineProperty(data, 'Results', {
                            get: function () { return arr },
                            set: function (v) { arr = wrap(reorder(v)) },
                            configurable: true,
                            enumerable: true
                        })
                        console.log('[EasyTorrent] Умная контекстная фильтрация активирована')
                    } catch (e) {
                        console.log('[EasyTorrent] Ошибка при фиксации топов:', e)
                    }
                }
                return callback.apply(this, arguments)
            }, params)
        }
        console.log('[EasyTorrent] Parser.get пропатчен!')
    }

    function etPatchParser() {
        var Parser = window.Lampa.Parser || (window.Lampa.Component ? window.Lampa.Component.Parser : null)
        if (Parser && Parser.get) {
            etPatchParserGet(Parser)
        } else {
            setTimeout(function () { etPatchParser() }, 1000)
        }
    }

    /* ------- Продолжить просмотр (resume) ------- */

    var etPlayCtx = null
    var etHeartbeat = null

    function etResumeKey(movieId) { return 'et_resume_' + movieId }

    function etLoadResume(movieId) {
        if (!movieId) return null
        try { return Lampa.Storage.get(etResumeKey(movieId), null) } catch (e) { return null }
    }

    function etSaveResume(movieId, rec) {
        if (!movieId || !rec) return
        try { Lampa.Storage.set(etResumeKey(movieId), rec) } catch (e) {}
    }

    function etClearResume(movieId) {
        if (!movieId) return
        try { Lampa.Storage.remove(etResumeKey(movieId)) } catch (e) {
            try { Lampa.Storage.set(etResumeKey(movieId), null) } catch (e2) {}
        }
    }

    function etPlayerInstance() {
        try {
            if (Lampa.Player && Lampa.Player.player) return Lampa.Player.player
        } catch (e) {}
        return null
    }

    function etPlayerPosition() {
        var p = etPlayerInstance()
        if (!p) return null
        try {
            if (typeof p.time == 'function') {
                var t = p.time()
                if (typeof t == 'number') return t
            }
            if (typeof p.getPosition == 'function') return p.getPosition()
            if (typeof p.currentTime == 'function') return p.currentTime()
            var v = p.video || p.element
            if (v) {
                if (typeof v.currentTime == 'number') return v.currentTime
                if (typeof v.getCurrentTime == 'function') return v.getCurrentTime()
            }
        } catch (e) {}
        return null
    }

    function etPlayerDuration() {
        var p = etPlayerInstance()
        if (!p) return null
        try {
            if (typeof p.duration == 'function') {
                var d = p.duration()
                if (typeof d == 'number') return d
            }
            if (typeof p.getDuration == 'function') return p.getDuration()
            var v = p.video || p.element
            if (v && typeof v.duration == 'number') return v.duration
        } catch (e) {}
        return null
    }

    function etSeekTo(seconds) {
        var p = etPlayerInstance()
        if (!p) return false
        try {
            if (typeof p.setPosition == 'function') { p.setPosition(seconds); return true }
            if (typeof p.seek == 'function') { p.seek(seconds); return true }
        } catch (e) {}
        try {
            var v = p.video || p.element
            if (v && typeof v.currentTime == 'number') { v.currentTime = seconds; return true }
        } catch (e) {}
        return false
    }

    function etResumeSeek(position) {
        var tries = 0
        var maxTries = 90
        function tick() {
            if (tries++ > maxTries) return
            var pos = etPlayerPosition()
            var dur = etPlayerDuration()
            if (dur != null && dur > 0 && pos != null && pos >= position - 3) return
            if (dur != null && dur > 0) etSeekTo(position)
            setTimeout(tick, 1500)
        }
        setTimeout(tick, 2000)
    }

    function etFormatTime(sec) {
        var s = Math.max(0, Math.floor(sec || 0))
        var h = Math.floor(s / 3600)
        var m = Math.floor((s % 3600) / 60)
        var ss = s % 60
        var mm = m < 10 ? '0' + m : String(m)
        var sm = ss < 10 ? '0' + ss : String(ss)
        if (h > 0) return h + ':' + mm + ':' + sm
        return mm + ':' + sm
    }

    function etStartParams(e) {
        var p = null
        try { p = e && e.data } catch (err) {}
        if (!p || typeof p != 'object') {
            try { p = Lampa.Player && Lampa.Player.current } catch (err) {}
        }
        if (!p || typeof p != 'object') p = {}
        return {
            url: String(p.url || p.torrent || p.stream || ''),
            title: String(p.title || p.Title || p.name || '')
        }
    }

    function etSaveCurrentPosition() {
        if (!etPlayCtx || !etPlayCtx.movieId || !etPlayCtx.url) return
        var pos = etPlayerPosition()
        if (pos == null || pos < 15) return
        var dur = etPlayerDuration()
        etSaveResume(etPlayCtx.movieId, {
            title: etPlayCtx.title || '',
            url: etPlayCtx.url,
            position: pos,
            duration: dur,
            updated: Date.now()
        })
    }

    function etStartHeartbeat() {
        if (!etHeartbeat) etHeartbeat = setInterval(function () { etSaveCurrentPosition() }, 10000)
    }

    function etStopHeartbeat() {
        if (etHeartbeat) {
            clearInterval(etHeartbeat)
            etHeartbeat = null
        }
    }

    function etResumeOnStart(e) {
        var wasResume = etPlayCtx && etPlayCtx.resume
        var sp = etStartParams(e)
        var movieId = null
        try {
            var act = Lampa.Activity.active()
            if (act && act.card && act.card.id) movieId = act.card.id
        } catch (err) {}
        if (!movieId && etPlayCtx) movieId = etPlayCtx.movieId
        etPlayCtx = {
            movieId: movieId,
            url: sp.url || (etPlayCtx && etPlayCtx.url),
            title: sp.title || (etPlayCtx && etPlayCtx.title),
            resume: wasResume
        }
        etStartHeartbeat()
        if (!wasResume && movieId && etPlayCtx.url) {
            var rec = etLoadResume(movieId)
            if (rec && rec.url === etPlayCtx.url && rec.position > 20) {
                etResumeSeek(rec.position)
            }
        }
    }

    function etHandleEnded() {
        etStopHeartbeat()
        if (!etPlayCtx || !etPlayCtx.movieId) {
            etPlayCtx = null
            return
        }
        var pos = etPlayerPosition()
        var dur = etPlayerDuration()
        var finished = dur != null && dur > 0 && pos != null && pos >= dur - 120
        if (finished) etClearResume(etPlayCtx.movieId)
        else etSaveCurrentPosition()
        etPlayCtx = null
    }

    function etOnPlayer(e) {
        try {
            if (e.type == 'start') { etResumeOnStart(e); return }
            if (e.type == 'ended') { etHandleEnded(); return }
            if (e.type == 'stop' || e.type == 'destroy') {
                etSaveCurrentPosition()
                etStopHeartbeat()
                etPlayCtx = null
                return
            }
            if (e.type == 'pause') etSaveCurrentPosition()
        } catch (err) {}
    }

    function etResumePlay(movie) {
        var rec = etLoadResume(movie && movie.id)
        if (!rec || !rec.url) {
            try { Lampa.Noty.show('Нет данных о просмотре') } catch (e) {}
            return
        }
        var title = rec.title || (movie && (movie.title || movie.name)) || ''
        etPlayCtx = { movieId: movie && movie.id, url: rec.url, title: title, resume: true }
        etStartHeartbeat()
        try {
            if (Lampa.Torrent && typeof Lampa.Torrent.start == 'function') {
                Lampa.Torrent.start({ url: rec.url, MagnetUri: rec.url, Link: rec.url, Title: title }, movie || {})
            } else {
                Lampa.Player.play({ title: title, url: rec.url })
            }
        } catch (e) {}
        etResumeSeek(rec.position)
    }

    function etCapturePlayed(element, movie) {
        try {
            var url = element && (element.MagnetUri || element.Link || element.url || '')
            var title = element && (element.Title || element.title || '')
            var movieId = movie && (movie.id || movie.kinopoisk_id)
            if (!movieId) {
                try {
                    var act = Lampa.Activity.active()
                    if (act && act.card && act.card.id) movieId = act.card.id
                } catch (e) {}
            }
            if (!url && etPlayCtx) url = etPlayCtx.url
            if (!title && etPlayCtx) title = etPlayCtx.title
            if (!url || !movieId) return
            etPlayCtx = { movieId: movieId, url: url, title: title, resume: etPlayCtx && etPlayCtx.resume }
            etStartHeartbeat()
        } catch (e) {}
    }

    function etWrapTorrent() {
        try {
            if (typeof Lampa.Torrent == 'undefined' || !Lampa.Torrent) {
                setTimeout(function () { etWrapTorrent() }, 1000)
                return
            }
            if (typeof Lampa.Torrent.start == 'function' && !Lampa.Torrent.start._etWrapped) {
                var origStart = Lampa.Torrent.start
                Lampa.Torrent.start = function (element, movie) {
                    etCapturePlayed(element, movie)
                    return origStart.apply(this, arguments)
                }
                Lampa.Torrent.start._etWrapped = true
            }
            if (typeof Lampa.Torrent.play == 'function' && !Lampa.Torrent.play._etWrapped) {
                var origPlay = Lampa.Torrent.play
                Lampa.Torrent.play = function (element, movie) {
                    etCapturePlayed(element, movie)
                    return origPlay.apply(this, arguments)
                }
                Lampa.Torrent.play._etWrapped = true
            }
        } catch (e) {}
    }

    function etInjectResumeButton(activity) {
        try {
            if (!setting('et_resume_enabled', true)) return
            var movie = activity && (activity.movie || activity.card)
            if (!movie || !movie.id) return
            var rec = etLoadResume(movie.id)
            if (!rec || !rec.url) return
            var $head = $('.activity--active .explorer__files-head')
            if (!$head || !$head.length) $head = $('.explorer__files-head').filter(':visible').last()
            if (!$head || !$head.length) return
            if ($head.find('.et-resume-torrents').length) return
            var label = '▶ ' + ET_STR.resume_title
            if (rec.position) label += ' (' + etFormatTime(rec.position) + ')'
            var $btn = $('<div class="simple-button selector et-resume-torrents">' + label + '</div>')
            $btn.on('hover:enter', function () { etResumePlay(movie) })
            $head.append($btn)
            try {
                if (Lampa.Controller && typeof Lampa.Controller.collectionAppend == 'function') Lampa.Controller.collectionAppend($btn)
            } catch (e2) {}
        } catch (e) {}
    }

    var etResumeDefer = null

    function etMaybeResumeMenu(activity, defer) {
        try {
            if (!activity || activity._etResumePassed) return false
            if (activity.component != 'torrents') return false
            var movie = activity.movie || activity.card
            if (!movie || !movie.id) return false
            if (!setting('et_resume_enabled', true)) return false
            var rec = etLoadResume(movie.id)
            if (!rec || !rec.url) return false

            etResumeDefer = defer

            Lampa.Select.show({
                title: movie.title || movie.name || ET_STR.resume_title,
                items: [
                    { title: ET_STR.resume_title + ' (' + etFormatTime(rec.position) + ')', action: 'resume' },
                    { title: 'Смотреть с начала', action: 'start' }
                ],
                onSelect: function (sel) {
                    if (sel.action == 'resume') {
                        etResumePlay(movie)
                    } else {
                        activity._etResumePassed = true
                        if (etResumeDefer) etResumeDefer()
                    }
                },
                onBack: function () {}
            })
            return true
        } catch (e) {
            return false
        }
    }

    function etInterceptTorrents() {
        try {
            if (typeof Lampa.Activity == 'undefined' || !Lampa.Activity) return

            if (typeof Lampa.Activity.push == 'function' && !Lampa.Activity.push._etWrapped) {
                var origPush = Lampa.Activity.push
                Lampa.Activity.push = function (activity) {
                    var self = this
                    var args = arguments
                    var defer = function () { origPush.apply(self, args) }
                    if (etMaybeResumeMenu(activity, defer)) return
                    return origPush.apply(self, args)
                }
                Lampa.Activity.push._etWrapped = true
            }

            if (typeof Lampa.Activity.load == 'function' && !Lampa.Activity.load._etWrapped) {
                var origLoad = Lampa.Activity.load
                Lampa.Activity.load = function (activity) {
                    var self = this
                    var args = arguments
                    var defer = function () { origLoad.apply(self, args) }
                    if (etMaybeResumeMenu(activity, defer)) return
                    return origLoad.apply(self, args)
                }
                Lampa.Activity.load._etWrapped = true
            }
        } catch (e) {}
    }

    /* ------- Настройки ------- */

    function etConfigView() {
        var cfg = etConfig
        var items = [
            { title: 'Версия конфига', subtitle: cfg.version, noselect: true },
            { title: 'Тип устройства', subtitle: String(cfg.device && cfg.device.type || '').toUpperCase(), noselect: true },
            { title: 'Поддержка HDR', subtitle: ((cfg.device && cfg.device.supported_hdr) || []).join(', ') || 'нет', noselect: true },
            { title: 'Поддержка звука', subtitle: ((cfg.device && cfg.device.supported_audio) || []).join(', ') || 'стерео', noselect: true },
            { title: 'Приоритет параметров', subtitle: (cfg.parameter_priority || []).join(' > '), noselect: true },
            { title: 'Приоритет озвучек', subtitle: (cfg.audio_track_priority || []).length + ' шт. • Нажмите для просмотра', action: 'show_voices' },
            { title: 'Минимально сидов', subtitle: cfg.preferences && cfg.preferences.min_seeds, noselect: true },
            { title: 'Число рекомендаций', subtitle: cfg.preferences && cfg.preferences.recommendation_count, noselect: true }
        ]
        Lampa.Select.show({
            title: 'Текущая конфигурация',
            items: items,
            onSelect: function (e) {
                if (e.action === 'show_voices') {
                    var voices = (etConfig.audio_track_priority || []).map(function (v, i) {
                        return { title: (i + 1) + '. ' + v, noselect: true }
                    })
                    Lampa.Select.show({
                        title: 'Приоритет озвучек',
                        items: voices,
                        onBack: function () { etConfigView() }
                    })
                }
            },
            onBack: function () {
                try { Lampa.Controller.toggle('settings') } catch (e) {}
            }
        })
    }

    function etQrCode() {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        var code = ''
        for (var i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
        return code
    }

    function etQrPoll(code, callback) {
        try {
            var url = ET_QR_API + '/rest/v1/tv_configs?id=eq.' + encodeURIComponent(code) + '&select=data,updated_at'
            fetch(url, { headers: { apikey: ET_QR_KEY, Authorization: 'Bearer ' + ET_QR_KEY } })
                .then(function (r) {
                    if (!r.ok) throw new Error('Fetch failed: ' + r.status)
                    return r.json()
                })
                .then(function (arr) {
                    callback(arr && arr.length ? arr[0].data : null)
                })
                .catch(function (err) {
                    console.error('[EasyTorrent] Fetch error:', err)
                    callback(null)
                })
        } catch (err) {
            console.error('[EasyTorrent] Fetch error:', err)
            callback(null)
        }
    }

    function etQrOpen() {
        var code = etQrCode()
        var page = ET_QR_PAGE + '?pairCode=' + code
        var $html = $('<div class="about">' +
            '<div style="text-align: center; margin-bottom: 20px;">' +
            '<div id="qrCodeContainer" style="background: white; padding: 20px; border-radius: 15px; display: inline-block; margin-bottom: 20px; height: 20em; width: 20em;"></div>' +
            '</div>' +
            '<div class="about__text" style="text-align: center; margin-bottom: 15px;">' +
            '<strong>Или перейдите вручную:</strong><br>' +
            '<span style="word-break: break-all;">' + page + '</span>' +
            '</div>' +
            '<div class="about__text" style="text-align: center;">' +
            '<strong>Код сопряжения:</strong>' +
            '<div style="font-size: 2em; font-weight: bold; letter-spacing: 0.3em; margin: 10px 0; color: #667eea;">' + code + '</div>' +
            '</div>' +
            '<div class="about__text" id="qrStatus" style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-top: 20px;">' +
            '⏳ Ожидание конфигурации...' +
            '</div>' +
            '</div>')
        var lastGenerated = null
        var timer = null
        Lampa.Modal.open({
            title: 'Настройка приоритетов',
            html: $html,
            size: 'medium',
            onBack: function () {
                if (timer) { clearInterval(timer); timer = null }
                Lampa.Modal.close()
                try { Lampa.Controller.toggle('settings_component') } catch (e) {}
            }
        })
        setTimeout(function () {
            var el = document.getElementById('qrCodeContainer')
            if (el && Lampa.Utils && Lampa.Utils.qrcode) {
                try { Lampa.Utils.qrcode(page, el) } catch (e) {
                    el.innerHTML = '<p style="color: #f44336;">Ошибка генерации QR-кода</p>'
                }
            }
        }, 100)
        timer = setInterval(function () {
            etQrPoll(code, function (cfg) {
                if (!cfg) return
                var g = cfg.generated
                if (g && g === lastGenerated) return
                lastGenerated = g
                etSaveConfig(cfg)
                $('#qrStatus').html('✅ Конфигурация получена и применена!').css('color', '#4CAF50')
                setTimeout(function () {
                    if (timer) { clearInterval(timer); timer = null }
                    Lampa.Modal.close()
                    Lampa.Noty.show('Конфигурация обновлена!')
                    try { Lampa.Controller.toggle('settings_component') } catch (e) {}
                }, 2000)
            })
        }, 5000)
    }

    function etSettingsInit() {
        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'et_about', type: 'static' },
            field: { name: '<div>' + ET_STR.name + ' ' + ET_STR.version + '</div>' },
            onRender: function (e) {
                e.css('opacity', '0.7')
                e.find('.settings-param__name').css({ 'font-size': '1.2em', 'margin-bottom': '0.3em' })
                e.append('<div style="font-size: 0.9em; padding: 0 1.2em; line-height: 1.4;">Автор: DarkestClouds<br>Система рекомендаций торрентов на основе качества, HDR и озвучки</div>')
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'et_enabled', type: 'trigger', default: true },
            field: { name: ET_STR.title, description: ET_STR.desc }
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'et_show_scores', type: 'trigger', default: true },
            field: { name: ET_STR.show_scores, description: ET_STR.show_scores_desc }
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'et_resume_enabled', type: 'trigger', default: true },
            field: { name: ET_STR.resume_title, description: ET_STR.resume_desc }
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'et_config_json', type: 'static', default: JSON.stringify(ET_DEFAULT_CONFIG) },
            field: { name: ET_STR.config_json, description: ET_STR.config_json_desc },
            onRender: function (e) {
                var update = function () {
                    var cfg = etConfig
                    var txt = String(cfg.device && cfg.device.type || '').toUpperCase()
                    if (cfg.parameter_priority && cfg.parameter_priority.length) txt += ' | ' + cfg.parameter_priority[0]
                    e.find('.settings-param__value').text(txt)
                }
                update()
                e.on('hover:enter', function () {
                    Lampa.Select.show({
                        title: ET_STR.config_json,
                        items: [
                            { title: ET_STR.config_view, action: 'view' },
                            { title: ET_STR.config_edit, action: 'edit' },
                            { title: ET_STR.config_reset, action: 'reset' }
                        ],
                        onSelect: function (sel) {
                            if (sel.action == 'view') {
                                etConfigView()
                            } else if (sel.action == 'edit') {
                                Lampa.Input.edit({
                                    value: Lampa.Storage.get('et_config_json') || JSON.stringify(ET_DEFAULT_CONFIG),
                                    free: true
                                }, function (val) {
                                    if (val) {
                                        try {
                                            JSON.parse(val)
                                            etSaveConfig(val)
                                            update()
                                            Lampa.Noty.show('OK')
                                        } catch (err) {
                                            Lampa.Noty.show(ET_STR.config_error)
                                        }
                                    }
                                    Lampa.Controller.toggle('settings')
                                })
                            } else if (sel.action == 'reset') {
                                etSaveConfig(ET_DEFAULT_CONFIG)
                                update()
                                Lampa.Noty.show('OK')
                                Lampa.Controller.toggle('settings')
                            }
                        },
                        onBack: function () { Lampa.Controller.toggle('settings') }
                    })
                })
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'kinopoisk_info',
            param: { name: 'et_qr_setup', type: 'static' },
            field: { name: 'Расставить приоритеты', description: 'Откройте визард на телефоне через QR-код' },
            onRender: function (e) {
                e.on('hover:enter', function () { etQrOpen() })
            }
        })
    }

    function etStyleInit() {
        if ($('#et-style').length) return

        var css = `
.torrent-recommend-panel{
    display: flex;
    align-items: center;
    gap: 0.9em;
    margin: 0.8em -1em -1em;
    padding: 0.75em 1em 0.85em;
    border-radius: 0 0 0.3em 0.3em;
    border-top: 1px solid rgba(255,255,255,0.10);
    background: rgba(0,0,0,0.18);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
}
.torrent-recommend-panel__left{
    min-width: 0;
    flex: 1 1 auto;
}
.torrent-recommend-panel__label{
    font-size: 0.95em;
    font-weight: 800;
    letter-spacing: 0.2px;
    color: rgba(255,255,255,0.92);
    line-height: 1.15;
}
.torrent-recommend-panel__meta{
    margin-top: 0.25em;
    font-size: 0.82em;
    font-weight: 600;
    color: rgba(255,255,255,0.58);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.torrent-recommend-panel__right{
    flex: 0 0 auto;
    display: flex;
    align-items: center;
}
.torrent-recommend-panel__score{
    font-size: 1.05em;
    font-weight: 900;
    padding: 0.25em 0.55em;
    border-radius: 0.6em;
    background: rgba(255,255,255,0.10);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.95);
}
.torrent-recommend-panel__chips{
    display: flex;
    flex: 2 1 auto;
    gap: 0.45em;
    flex-wrap: wrap;
    justify-content: flex-start;
}
.torrent-recommend-panel__chips:empty{
    display: none;
}
.tr-chip{
    display: inline-flex;
    align-items: baseline;
    gap: 0.35em;
    padding: 0.28em 0.55em;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.10);
}
.tr-chip__name{
    font-size: 0.78em;
    font-weight: 700;
    color: rgba(255,255,255,0.60);
}
.tr-chip__val{
    font-size: 0.86em;
    font-weight: 900;
    color: rgba(255,255,255,0.92);
}
.tr-chip--pos{
    background: rgba(76,175,80,0.10);
    border-color: rgba(76,175,80,0.22);
}
.tr-chip--pos .tr-chip__val{ color: rgba(120,255,170,0.95); }
.tr-chip--neg{
    background: rgba(244,67,54,0.10);
    border-color: rgba(244,67,54,0.22);
}
.tr-chip--neg .tr-chip__val{ color: rgba(255,120,120,0.95); }
.torrent-recommend-panel--ideal{
    background: linear-gradient(135deg, rgba(255,215,0,0.16) 0%, rgba(255,165,0,0.08) 100%);
    border-top-color: rgba(255,215,0,0.20);
}
.torrent-recommend-panel--ideal .torrent-recommend-panel__label{
    color: rgba(255,235,140,0.98);
}
.torrent-recommend-panel--recommended{
    background: rgba(76,175,80,0.08);
    border-top-color: rgba(76,175,80,0.18);
}
.torrent-recommend-panel--recommended .torrent-recommend-panel__label{
    color: rgba(160,255,200,0.92);
}
.torrent-recommend-panel{
    animation: tr-panel-in 0.22s ease-out;
}
@keyframes tr-panel-in{
    from{ opacity: 0; transform: translateY(-3px); }
    to{ opacity: 1; transform: translateY(0); }
}
.torrent-item.focus .torrent-recommend-panel{
    background: rgba(255,255,255,0.08);
    border-top-color: rgba(255,255,255,0.16);
}
@media (max-width: 520px){
    .torrent-recommend-panel{
        gap: 0.7em;
        padding: 0.65em 0.9em 0.75em;
    }
    .torrent-recommend-panel__meta{
        display: none;
    }
}
.et-resume-torrents{
    color: rgba(255,235,140,0.95);
    background: rgba(255,215,0,0.10);
    border: 1px solid rgba(255,215,0,0.25);
    border-radius: 0.5em;
    font-weight: 700;
}
.et-resume-torrents.focus{
    background: rgba(255,215,0,0.25);
    color: #fff;
}
`
        $('<style id="et-style">').html(css).appendTo('head')
    }

    function etInit() {
        etLoadConfig()
        etSettingsInit()
        etStyleInit()
        etPatchParser()
        etInterceptTorrents()
        etWrapTorrent()

        Lampa.Listener.follow('torrent', function (e) {
            if (e.type == 'render') etRenderPanel(e)
        })

        Lampa.Listener.follow('player', etOnPlayer)

        Lampa.Listener.follow('activity', function (e) {
            if (e.type == 'start' && e.component == 'torrents') console.log('[EasyTorrent] Новая страница торрентов')
        })

        console.log('[EasyTorrent] Готов к работе!')
    }

    function init() {
        network = new Lampa.Reguest()
        network.timeout(1000 * 20)

        Lampa.Manifest.plugins = manifest
        translations()
        settingsInit()
        styleInit()
        etInit()

        Lampa.Listener.follow('full', onFull)
        Lampa.Listener.follow('activity', onActivity)
    }

    if (window.appready) init()
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') init()
    })
})()
