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
        'Дубляж RU': ['дубляж', 'дб', 'dub', 'рус'],
        'Дубляж UKR': ['ukr', 'укр'],
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

    function etIsUkrainianKey(key) {
        return key.indexOf('UKR') >= 0 || key.indexOf('укр') >= 0
    }

function etAudioTracks(element, item, isSeries, seasonCount) {
        var title = (element.Title || element.title || '').toLowerCase()
        var found = []
        var ukrViaTag = false
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
                if (lang === 'ukr' || lang === 'uk' || lang === 'ukrainian' ||
                    (keys.indexOf('Дубляж UKR') >= 0)) ukrViaTag = true
                keys.forEach(function (k) {
                    if (k === 'Дубляж RU' && (lang === 'ukr' || lang === 'uk')) return
                    if (found.indexOf(k) < 0) found.push(k)
                })
            })
        }
        for (var k in ET_AUDIO_MAP) {
            if (found.indexOf(k) >= 0) continue
            if (etIsUkrainianKey(k)) continue
            var matched = ET_AUDIO_MAP[k].some(function (alt) {
                var a = alt.toLowerCase()
                if (a.length <= 3) return new RegExp('\\b' + etEscRe(a) + '\\b', 'i').test(title)
                return title.indexOf(a) >= 0
            })
            if (matched) found.push(k)
        }
        if (ukrViaTag && found.indexOf('Дубляж UKR') < 0) found.push('Дубляж UKR')
        if (!ukrViaTag) {
            var ukrIdx = found.indexOf('Дубляж UKR')
            if (ukrIdx >= 0) found.splice(ukrIdx, 1)
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
                var matched = tracks.indexOf(key) >= 0
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

    var ET_SYNC_KEY = 'et_resume_history_v1'
    var ET_CACHE_KEY = 'et_resume_history_cache_v1'
    var ET_SCHEMA_VERSION = 1
    var ET_WRITE_INTERVAL_MS = 15000
    var ET_TORRSERVER_WRITE_INTERVAL_MS = 30000
    var ET_SEEN_PERCENT = 90
    var ET_REQUEST_TIMEOUT_MS = 5000
    var ET_VIDEO_EXTENSIONS = ['asf', 'wmv', 'divx', 'avi', 'mp4', 'm4v', 'mov', '3gp', '3g2', 'mkv', 'trp', 'tp', 'mts', 'mpg', 'mpeg', 'dat', 'vob', 'rm', 'rmvb', 'm2ts', 'ts']
    var ET_SUBTITLE_EXTENSIONS = ['srt', 'vtt', 'ass', 'ssa']
    var etResumeRuntime = null

    function etText(value) {
        return typeof value === 'string' ? value.trim() : ''
    }

    function etNumber(value) {
        return Number.isFinite(Number(value)) ? Number(value) : 0
    }

    function etValidAlias(value) {
        return /^(?:movie:)?(?:source:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+|tmdb:\d+|imdb:tt\d+|kinopoisk:\d+)$/.test(value)
    }

    function etCanonicalAlias(aliases) {
        return aliases.find(function (value) {
            return /^(?:movie:)?tmdb:/.test(value)
        }) || aliases.find(function (value) {
            return /^(?:movie:)?source:/.test(value)
        }) || aliases.find(function (value) {
            return /^(?:movie:)?imdb:/.test(value)
        }) || aliases.find(function (value) {
            return /^(?:movie:)?kinopoisk:/.test(value)
        })
    }

    function etCardIdentity(card) {
        card = card || {}
        var source = etText(card.source) || 'tmdb'
        var id = card.id
        var tmdb = card.tmdb_id || (source === 'tmdb' ? id : 0)
        var imdb = etText(card.imdb_id)
        var kinopoisk = card.kinopoisk_id || 0
        var media = etText(card.media_type) || etText(card.type)
        var movie = media === 'movie' || (media !== 'tv' && !card.name && !card.first_air_date && etNumber(card.number_of_seasons) <= 0 && Boolean(etText(card.release_date)))
        var prefix = movie ? 'movie:' : ''
        var aliases = []
        if (id !== undefined && id !== null) aliases.push(prefix + 'source:' + source + ':' + id)
        if (tmdb) aliases.push(prefix + 'tmdb:' + tmdb)
        if (imdb) aliases.push(prefix + 'imdb:' + imdb)
        if (kinopoisk) aliases.push(prefix + 'kinopoisk:' + kinopoisk)
        return {
            key: aliases.find(function (value) {
                return /^(?:movie:)?tmdb:/.test(value)
            }) || aliases[0] || '',
            aliases: Array.from(new Set(aliases)),
            card: {
                source: source,
                id: id,
                tmdb: tmdb || 0,
                imdb: imdb,
                kinopoisk: kinopoisk || 0
            }
        }
    }

    function etSanitizeProgress(input) {
        input = input || {}
        var duration = Math.max(0, etNumber(input.duration))
        var time = Math.max(0, etNumber(input.time))
        var calculated = duration ? time / duration * 100 : 0
        var percent = Math.max(0, Math.min(100, etNumber(input.percent) || calculated))
        return { time: time, duration: duration, percent: percent }
    }

    function etEmptyHistory() {
        return { schema: ET_SCHEMA_VERSION, cards: {} }
    }

    function etSanitizeModeRecord(input) {
        input = input || {}
        var mode = input.mode === 'torrent' ? 'torrent' : ''
        if (!mode) return null
        var episode = input.episode || {}
        var base = {
            mode: mode,
            updated_at: Math.max(0, etNumber(input.updated_at)),
            episode: {
                season: Math.max(0, etNumber(episode.season)),
                episode: Math.max(0, etNumber(episode.episode)),
                timeline_hash: etText(episode.timeline_hash)
            },
            progress: etSanitizeProgress(input.progress),
            playlist: {
                kind: 'season',
                selected_season: Math.max(0, etNumber(episode.season)),
                selected_episode: Math.max(0, etNumber(episode.episode))
            }
        }
        var source = input.torrent || {}
        base.torrent = {
            infohash: etText(source.infohash).toUpperCase(),
            magnet: etText(source.magnet).indexOf('magnet:') === 0 ? etText(source.magnet) : '',
            file_index: Math.max(0, etNumber(source.file_index)),
            file_path: etText(source.file_path),
            torrent_title: etText(source.torrent_title)
        }
        if (!base.torrent.infohash || !base.torrent.file_path) return null
        return base
    }

    function etModesOf(entry) {
        return entry && entry.modes ? entry.modes : {}
    }

    function etNewestMode(modes) {
        return Object.values(modes).sort(function (left, right) {
            return right.updated_at - left.updated_at
        })[0]
    }

    function etSanitizeHistory(input) {
        var root = etEmptyHistory()
        if (!input || Number(input.schema) !== ET_SCHEMA_VERSION || !input.cards) return root
        Object.keys(input.cards).forEach(function (key) {
            var source = input.cards[key] || {}
            var modes = {}
            var clean = etSanitizeModeRecord(source.modes && source.modes.torrent)
            if (clean) modes.torrent = clean
            if (Object.keys(modes).length) {
                var newest = etNewestMode(modes)
                var aliases = Array.from(new Set((source.aliases || []).filter(function (value) {
                    return typeof value === 'string'
                }).map(function (value) {
                    return value.trim()
                }).filter(etValidAlias)))
                var safeKey = etCanonicalAlias(aliases)
                if (!safeKey) return
                root.cards[safeKey] = {
                    aliases: aliases,
                    last_mode: newest.mode,
                    modes: modes
                }
            }
        })
        return root
    }

    function etMergeHistory(leftInput, rightInput) {
        var left = etSanitizeHistory(leftInput)
        var right = etSanitizeHistory(rightInput)
        var result = etEmptyHistory()
        var incoming = Object.entries(left.cards).concat(Object.entries(right.cards))
        incoming.forEach(function (pair) {
            var sourceKey = pair[0]
            var source = pair[1]
            var aliases = Array.from(new Set([sourceKey].concat(source.aliases || [])))
            var matches = Object.entries(result.cards).filter(function (pair2) {
                var known = [pair2[0]].concat(pair2[1].aliases || [])
                return aliases.some(function (alias) {
                    return known.indexOf(alias) >= 0
                })
            })
            var existingKey = matches.length ? matches[0][0] : ''
            var knownAliases = []
            matches.forEach(function (pair2) {
                knownAliases = knownAliases.concat([pair2[0]], pair2[1].aliases || [])
            })
            var allAliases = Array.from(new Set(knownAliases.concat(aliases)))
            var preferredKey = allAliases.find(function (alias) {
                return /^(?:movie:)?tmdb:/.test(alias)
            }) || existingKey || sourceKey
            var modes = {}
            matches.forEach(function (pair2) {
                var candidate = etModesOf(pair2[1]).torrent
                if (candidate && (!modes.torrent || candidate.updated_at > modes.torrent.updated_at)) modes.torrent = candidate
            })
            var sourceMode = etModesOf(source).torrent
            if (sourceMode && (!modes.torrent || sourceMode.updated_at > modes.torrent.updated_at)) modes.torrent = sourceMode
            matches.forEach(function (pair2) {
                delete result.cards[pair2[0]]
            })
            var newest = etNewestMode(modes)
            result.cards[preferredKey] = {
                aliases: allAliases,
                last_mode: newest ? newest.mode : '',
                modes: modes
            }
        })
        return result
    }

    function etCreateRecipeStore(Lampa) {
        var value = etMergeHistory(Lampa.Storage.get(ET_SYNC_KEY, etEmptyHistory()), Lampa.Storage.get(ET_CACHE_KEY, etEmptyHistory()))
        var listeners = []

        function persist(next) {
            var clean = etSanitizeHistory(next)
            var syncBefore = JSON.stringify(Lampa.Storage.get(ET_SYNC_KEY, etEmptyHistory()))
            value = clean
            Lampa.Storage.set(ET_CACHE_KEY, clean, true)
            if (syncBefore !== JSON.stringify(clean)) Lampa.Storage.set(ET_SYNC_KEY, clean)
            listeners.slice().forEach(function (listener) {
                return listener(clean)
            })
        }

        function find(card) {
            var identity = etCardIdentity(card)
            var direct = value.cards[identity.key]
            if (direct) return direct
            return Object.values(value.cards).find(function (entry) {
                return entry.aliases.some(function (alias) {
                    return identity.aliases.indexOf(alias) >= 0
                })
            }) || null
        }

        function upsert(card, input) {
            var record = etSanitizeModeRecord(input)
            var identity = etCardIdentity(card)
            if (!record || !identity.key) return null
            var next = etMergeHistory(value, etEmptyHistory())
            var previousKey = Object.keys(next.cards).find(function (key) {
                return key === identity.key || next.cards[key].aliases.some(function (alias) {
                    return identity.aliases.indexOf(alias) >= 0
                })
            })
            var previous = previousKey ? next.cards[previousKey] : { aliases: [], modes: {} }
            var modes = Object.assign({}, previous.modes, { torrent: record })
            var newest = etNewestMode(modes)
            if (previousKey && previousKey !== identity.key) delete next.cards[previousKey]
            next.cards[identity.key] = {
                aliases: Array.from(new Set([].concat(previous.aliases, identity.aliases))),
                last_mode: newest.mode,
                modes: modes
            }
            persist(next)
            return next.cards[identity.key]
        }

        return {
            read: function () {
                return value
            },
            find: find,
            upsert: upsert,
            subscribe: function (listener) {
                listeners.push(listener)
                var active = true
                return function () {
                    if (!active) return
                    active = false
                    var index = listeners.indexOf(listener)
                    if (index >= 0) listeners.splice(index, 1)
                }
            }
        }
    }

    function etTorrentRecipe(input) {
        input = input || {}
        var magnet = etText(input.magnet || input.torrent_magnet)
        return {
            infohash: etText(input.infohash || input.torrent_hash),
            magnet: magnet.indexOf('magnet:') === 0 ? magnet : '',
            file_index: etNumber(input.file_index === undefined ? input.id : input.file_index),
            file_path: etText(input.file_path || input.path),
            torrent_title: etText(input.torrent_title || input.path_human || input.title)
        }
    }

    function etUsableTorrent(input) {
        if (!input) return null
        var recipe = etTorrentRecipe(input)
        return recipe.infohash && recipe.file_path ? recipe : null
    }

    function etResumeMeta(data) {
        data = data || {}
        var resume = data.lampac_resume || {}
        return resume.recipe || resume
    }

    function etTorrentForItem(item, fallback) {
        var metadata = etResumeMeta(item)
        var source = metadata.mode === 'torrent' && metadata.torrent ? Object.assign({}, item, metadata.torrent) : item
        var active = etUsableTorrent(source)
        if (!active) return fallback
        return Object.assign({}, fallback, active, {
            magnet: active.magnet || fallback.magnet,
            torrent_title: active.torrent_title || fallback.torrent_title
        })
    }

    function etTimelineHash(item) {
        return etText(item && (item.timeline_hash || item.timeline && item.timeline.hash || item.hash))
    }

    function etSameCard(left, right) {
        var leftAliases = etCardIdentity(left).aliases
        var rightAliases = etCardIdentity(right).aliases
        return leftAliases.some(function (alias) {
            return rightAliases.indexOf(alias) >= 0
        })
    }

    function etSameItem(left, right) {
        if (left && right && etText(left.torrent_hash) && etText(right.torrent_hash)) {
            return etText(left.torrent_hash) === etText(right.torrent_hash) && etNumber(left.id) === etNumber(right.id)
        }
        var leftHash = etTimelineHash(left)
        var rightHash = etTimelineHash(right)
        if (leftHash && rightHash) return leftHash === rightHash
        return Boolean(left && right && (etNumber(left.season) || etNumber(left.episode)) &&
            etNumber(left.season) === etNumber(right.season) && etNumber(left.episode) === etNumber(right.episode))
    }

    function etItemMatch(items, data) {
        var hash = etTimelineHash(data)
        var torrent = data && etText(data.torrent_hash)
        var selected = torrent && items.find(function (item) {
            return item && etText(item.torrent_hash) && etSameItem(item, data)
        })
        return selected || items.find(function (item) {
            return etTimelineHash(item) === hash
        }) || items.find(function (item) {
            return etNumber(item.season) === etNumber(data.season) && etNumber(item.episode) === etNumber(data.episode)
        }) || data
    }

    function etSameProgress(left, right) {
        return left.time === right.time && left.duration === right.duration && left.percent === right.percent
    }

    function etCreateCapture(Lampa, store, options) {
        var stateSource = options && options.globalObject || (typeof window != 'undefined' ? window : {})
        var session = null
        var lastWrite = 0

        function stagePlayback(data) {
            if (!data) return null
            var metadata = etResumeMeta(data)
            var card = data.card
            if (!card) {
                try {
                    var act = Lampa.Activity.active()
                    card = (act && (act.movie || act.card)) || null
                } catch (e) {}
            }
            var playlist = Array.isArray(data.playlist) ? data.playlist.slice() : []
            var selected = etItemMatch(playlist, data)
            var items = playlist.length ? playlist : [selected]
            var byHash = {}
            items.forEach(function (item) {
                var hash = etTimelineHash(item)
                if (hash) byHash[hash] = item
            })
            var source = metadata && metadata.mode === 'torrent' && metadata.torrent ? Object.assign({}, data, metadata.torrent) : data
            var torrent = etUsableTorrent(source)
            if (!torrent || !card) return null
            var context = typeof options.findTorrentContext === 'function' ? options.findTorrentContext(torrent.infohash) : null
            if (context) {
                torrent = Object.assign({}, torrent, {
                    magnet: torrent.magnet || context.magnet,
                    torrent_title: context.torrent_title || torrent.torrent_title
                })
            }
            if (!etTimelineHash(selected) && source && source.timeline_hash) selected.timeline_hash = source.timeline_hash
            if (etTimelineHash(selected)) byHash[etTimelineHash(selected)] = selected
            return {
                card: card,
                mode: 'torrent',
                torrent: torrent,
                item: selected,
                byHash: byHash,
                progress: etSanitizeProgress(selected.timeline || {})
            }
        }

        function recordFromSession(current) {
            var item = current.item || {}
            return {
                mode: 'torrent',
                updated_at: Date.now(),
                episode: {
                    season: etNumber(item.season),
                    episode: etNumber(item.episode),
                    timeline_hash: etTimelineHash(item)
                },
                progress: etSanitizeProgress(current.progress),
                torrent: current.torrent
            }
        }

        function commit(force) {
            var now = Date.now()
            if (!session || !session.confirmed || (!force && now - lastWrite < ET_WRITE_INTERVAL_MS)) return
            lastWrite = now
            store.upsert(session.card, recordFromSession(session))
        }

        function writeTorrentTimecode(force) {
            if (!session || !session.external || session.mode !== 'torrent' || typeof options.writeTorrentTimecode !== 'function') return
            options.writeTorrentTimecode(session.torrent.infohash, session.torrent.file_index, session.progress.time, force)
        }

        function onCreate(event) {
            var data = event && event.data
            session = stagePlayback(data)
            if (session) {
                session.launchedHash = etTimelineHash(session.item)
                session.launchedProgress = Object.assign({}, session.progress)
            }
        }

        function refreshConfirmedPlayback(data) {
            if (!session || !data) return
            var hash = etTimelineHash(data)
            var current = hash && session.byHash[hash] || (etSameItem(session.item, data) ? session.item : null)
            if (!current) return
            var item = Object.assign({}, current, data, {
                timeline: Object.assign({}, current.timeline || {}, data.timeline || {})
            })
            session.item = item
            if (hash) session.byHash[hash] = item
            session.progress = etSanitizeProgress(item.timeline || {})
        }

        function confirm(data, external) {
            if (!session) session = stagePlayback(data)
            if (!session) return
            refreshConfirmedPlayback(data)
            session.confirmed = true
            session.external = external
            commit(true)
        }

        function onStart(data) {
            confirm(data, false)
        }

        function onExternal(data) {
            confirm(data, true)
        }

        function onTimeline(event) {
            if (!session || !session.confirmed || !event || !event.data) return
            var hash = etText(event.data.hash)
            var item = session.byHash[hash]
            if (!item) return
            var progress = etSanitizeProgress(event.data.road)
            if (session.external && session.externalProgressSeen && hash === session.launchedHash && etSameProgress(progress, session.launchedProgress)) return
            if (session.external) session.externalProgressSeen = true
            session.item = item
            session.torrent = etTorrentForItem(item, session.torrent)
            session.progress = progress
            commit(session.external)
            writeTorrentTimecode(session.external)
        }

        function setPlaylist(playlist, position) {
            if (!session || !Array.isArray(playlist)) return
            session.byHash = {}
            playlist.forEach(function (item) {
                var hash = etTimelineHash(item)
                if (hash) session.byHash[hash] = item
            })
            if (playlist[position]) {
                session.item = playlist[position]
                if (session.mode === 'torrent') session.torrent = etTorrentForItem(session.item, session.torrent)
            }
            if (session.mode === 'torrent') {
                var currentHash = etTimelineHash(session.item)
                if (currentHash) session.byHash[currentHash] = session.item
            }
        }

        function onPlaylistSet(event) {
            if (!event) return
            setPlaylist(event.playlist, event.position)
        }

        function onPlaylistSelect(event) {
            if (!session || !session.confirmed || !event || !event.item) return
            commit(true)
            setPlaylist(event.playlist, event.position)
            session.item = event.item
            var hash = etTimelineHash(event.item)
            if (hash) session.byHash[hash] = event.item
            session.progress = etSanitizeProgress(event.item.timeline || {})
            commit(true)
        }

        function onTorrentFile(event) {
            if (!session || session.mode !== 'torrent' || !event || event.type !== 'onenter' || !event.element) return
            var source = Object.assign({}, event.element, {
                card: event.element.card || (event.params && event.params.movie)
            })
            var torrent = etUsableTorrent(source)
            if (!torrent || !source.card || !etSameCard(session.card, source.card) || !etSameItem(session.item, source)) return
            session.torrent = etTorrentForItem(source, session.torrent)
            session.item = source
            var hash = etTimelineHash(source)
            if (hash) session.byHash[hash] = source
            if (session.confirmed) commit(true)
        }

        function onDestroy() {
            if (!session) return
            commit(true)
            writeTorrentTimecode(true)
            session = null
        }

        function start() {
            if (Lampa.Player && Lampa.Player.listener) {
                Lampa.Player.listener.follow('create', onCreate)
                Lampa.Player.listener.follow('start', onStart)
                Lampa.Player.listener.follow('external', onExternal)
                Lampa.Player.listener.follow('destroy', onDestroy)
            }
            if (Lampa.PlayerPlaylist && Lampa.PlayerPlaylist.listener) {
                Lampa.PlayerPlaylist.listener.follow('set', onPlaylistSet)
                Lampa.PlayerPlaylist.listener.follow('select', onPlaylistSelect)
            }
            if (Lampa.Timeline && Lampa.Timeline.listener) {
                Lampa.Timeline.listener.follow('update', onTimeline)
            }
            Lampa.Listener.follow('torrent_file', onTorrentFile)
        }

        function stop() {
            onDestroy()
            if (Lampa.Player && Lampa.Player.listener) {
                Lampa.Player.listener.remove('create', onCreate)
                Lampa.Player.listener.remove('start', onStart)
                Lampa.Player.listener.remove('external', onExternal)
                Lampa.Player.listener.remove('destroy', onDestroy)
            }
            if (Lampa.PlayerPlaylist && Lampa.PlayerPlaylist.listener) {
                Lampa.PlayerPlaylist.listener.remove('set', onPlaylistSet)
                Lampa.PlayerPlaylist.listener.remove('select', onPlaylistSelect)
            }
            if (Lampa.Timeline && Lampa.Timeline.listener) {
                Lampa.Timeline.listener.remove('update', onTimeline)
            }
            Lampa.Listener.remove('torrent_file', onTorrentFile)
        }

        return {
            start: start,
            stop: stop,
            currentSession: function () {
                return session
            }
        }
    }

    function etEpisodeCompleted(progress) {
        return etSanitizeProgress(progress).percent >= ET_SEEN_PERCENT
    }

    function etSelectLastMode(history) {
        if (!history || !history.modes) return null
        return Object.values(history.modes).filter(function (record) {
            return record && record.mode === 'torrent'
        }).sort(function (left, right) {
            return Number(right.updated_at) - Number(left.updated_at)
        })[0] || null
    }

    function etChooseResumeTarget(record, playlist, selected) {
        var episode = record && record.episode ? record.episode : {}
        var items = Array.isArray(playlist) ? playlist : []
        var hash = episode.timeline_hash
        var index = record && record.mode === 'torrent' && selected ? items.indexOf(selected) : -1
        if (index < 0 && hash) index = items.findIndex(function (item) {
            return item && item.timeline && item.timeline.hash === hash
        })
        if (index < 0) index = items.findIndex(function (item) {
            return item && Number(item.season) === Number(episode.season) && Number(item.episode) === Number(episode.episode)
        })
        if (index < 0) throw new Error('resume-episode-missing')
        var progress = record && record.progress ? record.progress : {}
        if (Number(episode.season) > 0 && Number(episode.episode) > 0 && etEpisodeCompleted(progress)) {
            if (index + 1 >= items.length) throw new Error('resume-next-episode-missing')
            var nextIndex = index + 1
            var item = items[nextIndex]
            var duration = Number(item && item.timeline && item.timeline.duration)
            return {
                item: item,
                index: nextIndex,
                time: 0,
                progress: Object.assign({
                    time: 0
                }, duration > 0 ? {
                    duration: duration
                } : {}, {
                    percent: 0
                })
            }
        }
        return {
            item: items[index],
            index: index,
            time: Number(progress.time) || 0,
            progress: Object.assign({}, progress, {
                time: Number(progress.time) || 0
            })
        }
    }

    function etCreateResumeOrchestrator(params) {
        var store = params.store
        var torrent = params.torrent
        var launcher = params.launcher
        return {
            resume: function (card, beforeLaunch) {
                return Promise.resolve().then(function () {
                    var history = store.find(card)
                    var record = etSelectLastMode(history)
                    if (!record) throw new Error('resume-history-missing')
                    var prepared = false
                    function prepare() {
                        if (prepared) return
                        prepared = true
                        if (typeof beforeLaunch === 'function') beforeLaunch()
                    }
                    return torrent.resolve(card, record).then(function (resolved) {
                        if (resolved && resolved.launched === true) return
                        var target = etChooseResumeTarget(record, resolved.playlist, resolved.item)
                        prepare()
                        return launcher.launch({
                            item: target.item,
                            playlist: resolved.playlist,
                            progress: target.progress,
                            card: card,
                            mode: 'torrent'
                        })
                    })
                })
            }
        }
    }

    function etNormalizePlaylist(playlist, selected, progress) {
        if (!Array.isArray(playlist)) throw new Error('resume-playlist')
        var index = playlist.indexOf(selected)
        if (index < 0) throw new Error('resume-selected-item')
        var normalized = playlist.map(function (item, itemIndex) {
            if (!item || typeof item.url !== 'string' || !item.url) throw new Error('resume-playlist-url')
            var copy = Object.assign({}, item)
            var current = item.timeline || {}
            var hash = current.hash || item.timeline_hash
            if (!hash) throw new Error('resume-playlist-timeline')
            var fresh = typeof current.handler === 'function' ? {} : Lampa.Timeline.view(hash)
            copy.timeline = Object.assign({}, fresh || {}, current, {
                hash: hash,
                handler: current.handler || (fresh && fresh.handler)
            })
            if (typeof copy.timeline.handler !== 'function') throw new Error('resume-playlist-timeline')
            if (itemIndex === index) {
                copy.timeline = Object.assign({}, copy.timeline, {
                    time: Number(progress && progress.time) || 0,
                    duration: Number(progress && progress.duration) > 0 ? Number(progress.duration) : copy.timeline.duration,
                    percent: Number.isFinite(Number(progress && progress.percent)) ? Number(progress.percent) : copy.timeline.percent
                })
            }
            return copy
        })
        return {
            item: normalized[index],
            playlist: normalized,
            index: index
        }
    }

    function etCreatePlayerLauncher(Lampa) {
        return {
            launch: function (payload) {
                var result = etNormalizePlaylist(payload.playlist, payload.item, payload.progress)
                var data = Object.assign({}, result.item, {
                    playlist: result.playlist,
                    return_result: true
                })
                var android = Lampa.Platform && typeof Lampa.Platform.is === 'function' && Lampa.Platform.is('android') &&
                    ['android'].indexOf(String(Lampa.Storage.field(payload.mode === 'torrent' ? 'player_torrent' : 'player') || '')) >= 0
                var previous = Lampa.Storage.get('playlist_next', true)
                return new Promise(function (resolve, reject) {
                    var timer
                    var finished = false
                    function cleanup() {
                        if (finished) return false
                        finished = true
                        clearTimeout(timer)
                        if (Lampa.Player && Lampa.Player.listener) {
                            Lampa.Player.listener.remove('start', complete)
                            Lampa.Player.listener.remove('external', complete)
                            Lampa.Player.listener.remove('destroy', complete)
                        }
                        if (android) Lampa.Storage.set('playlist_next', previous, true)
                        return true
                    }
                    function complete() {
                        if (!cleanup()) return
                        resolve()
                    }
                    if (android) Lampa.Storage.set('playlist_next', true, true)
                    if (Lampa.Player && Lampa.Player.listener) {
                        Lampa.Player.listener.follow('start', complete)
                        Lampa.Player.listener.follow('external', complete)
                        Lampa.Player.listener.follow('destroy', complete)
                    }
                    timer = setTimeout(complete, 10000)
                    function primeTimeline(event) {
                        if (!event || event.data !== data) return
                        if (Lampa.Player && Lampa.Player.listener) Lampa.Player.listener.remove('create', primeTimeline)
                        var timeline = result.item.timeline
                        timeline.handler(timeline.percent, timeline.time, timeline.duration)
                    }
                    try {
                        if (Lampa.Player && Lampa.Player.listener) Lampa.Player.listener.follow('create', primeTimeline)
                        Lampa.Player.play(data)
                        if (typeof Lampa.Player.playlist === 'function') Lampa.Player.playlist(result.playlist)
                    } catch (error) {
                        cleanup()
                        reject(error)
                    } finally {
                        if (Lampa.Player && Lampa.Player.listener) Lampa.Player.listener.remove('create', primeTimeline)
                    }
                })
            }
        }
    }

    function etExtension(path) {
        return String(path || '').split('.').pop().toLowerCase()
    }

    function etNormalizePath(path) {
        return String(path || '').replace(/\\/g, '/').replace(/^\/+/, '').toLowerCase()
    }

    function etNaturalPath(path) {
        return etNormalizePath(path).replace(/\d+/g, function (value) {
            return value.length > 3 ? value : ('000' + value).slice(-4)
        })
    }

    function etMagnet(value) {
        return etText(value).indexOf('magnet:') === 0 ? etText(value) : ''
    }

    function etMagnetFor(recipe) {
        recipe = recipe || {}
        var stored = etMagnet(recipe.magnet)
        if (stored) return stored
        var hash = etText(recipe.infohash).toUpperCase()
        return /^(?:[A-F0-9]{40}|[A-Z2-7]{32})$/.test(hash) ? 'magnet:?xt=urn:btih:' + hash : ''
    }

    function etCreateViewedApi(Lampa) {
        var network = null
        function request(payload, success, fail) {
            try {
                if (typeof Lampa.Reguest !== 'function' || typeof Lampa.Torserver.url !== 'function') {
                    throw new Error('resume-torrent-viewed-api')
                }
                if (!network) network = new Lampa.Reguest()
                network.timeout(5000)
                network.silent(Lampa.Torserver.url() + '/viewed', success, fail, JSON.stringify(payload))
            } catch (error) {
                if (fail) fail(error)
            }
        }
        return {
            list: function (hash, success, fail) {
                if (typeof Lampa.Torserver.viewed === 'function') return Lampa.Torserver.viewed(hash, success, fail)
                request({
                    action: 'list',
                    hash: hash
                }, success, fail)
            },
            set: function (hash, fileIndex, timecode, success, fail) {
                if (typeof Lampa.Torserver.viewedSet === 'function') return Lampa.Torserver.viewedSet(hash, fileIndex, timecode)
                request({
                    action: 'set',
                    hash: hash,
                    file_index: fileIndex,
                    timecode: timecode
                }, success, fail)
            }
        }
    }

    function etHasFiles(response) {
        return Boolean(response && (Array.isArray(response.file_stats) || Array.isArray(response.files)))
    }

    function etRequestFiles(Lampa, hash, waitMs) {
        return new Promise(function (resolve) {
            var settled = false
            function finish(value) {
                if (settled) return
                settled = true
                clearTimeout(timer)
                resolve(value)
            }
            var timer = setTimeout(function () {
                return finish(null)
            }, waitMs)
            try {
                Lampa.Torserver.files(hash, function (response) {
                    return finish(etHasFiles(response) ? response : null)
                }, function () {
                    return finish(null)
                })
            } catch (error) {
                finish(null)
            }
        })
    }

    function etAddTorrent(Lampa, recipe, link, waitMs) {
        return new Promise(function (resolve, reject) {
            var settled = false
            function finish(error, value) {
                if (settled) return
                settled = true
                clearTimeout(timer)
                if (error) reject(error)
                else resolve(value)
            }
            var timer = setTimeout(function () {
                return finish(new Error('resume-torrent-add-timeout'))
            }, waitMs)
            try {
                Lampa.Torserver.hash({
                    title: recipe.torrent_title,
                    link: link,
                    poster: '',
                    data: {
                        lampa: true
                    }
                }, function (result) {
                    return finish(null, result || {})
                }, function (error) {
                    return finish(error || new Error('resume-torrent-add'))
                })
            } catch (error) {
                finish(error)
            }
        })
    }

    function etWait(milliseconds) {
        return new Promise(function (resolve) {
            return setTimeout(resolve, milliseconds)
        })
    }

    function etLoadFiles(Lampa, recipe, options) {
        options = options || {}
        var timeoutMs = Math.max(1, etNumber(options.timeoutMs) || 15000)
        var pollMs = Math.max(1, etNumber(options.pollMs) || 250)
        var requestTimeoutMs = Math.max(1, etNumber(options.requestTimeoutMs) || Math.min(ET_REQUEST_TIMEOUT_MS, timeoutMs))
        var deadline = Date.now() + timeoutMs
        return etRequestFiles(Lampa, recipe.infohash, Math.min(requestTimeoutMs, timeoutMs)).then(function (first) {
            if (first) return {
                response: first,
                hash: first.hash || recipe.infohash
            }
            var link = etMagnetFor(recipe)
            if (!link) throw new Error('resume-torrent-magnet')
            var remainingForAdd = deadline - Date.now()
            if (remainingForAdd <= 0) throw new Error('resume-torrent-timeout')
            return etAddTorrent(Lampa, recipe, link, remainingForAdd).then(function (added) {
                var hash = etText(added.hash) || etText(recipe.infohash)
                if (!hash) throw new Error('resume-torrent-hash')
                function poll() {
                    if (Date.now() >= deadline) throw new Error('resume-torrent-timeout')
                    var remaining = deadline - Date.now()
                    return etRequestFiles(Lampa, hash, Math.min(requestTimeoutMs, remaining)).then(function (response) {
                        if (response) return {
                            response: response,
                            hash: response.hash || hash,
                            magnet: link
                        }
                        var afterRequest = deadline - Date.now()
                        if (afterRequest <= 0) throw new Error('resume-torrent-timeout')
                        return etWait(Math.min(pollMs, afterRequest)).then(poll)
                    })
                }
                return poll()
            })
        })
    }

    function etBuildTorrentSubtitles(Lampa, hash, file, allFiles) {
        var name = String(file.path || '').split(/[/\\]/).pop().split('.').slice(0, -1).join('.')
        var index = -1
        var subtitles = allFiles.filter(function (candidate) {
            var short = String(candidate.path || '').split(/[/\\]/).pop()
            return short.indexOf(name) >= 0 && ET_SUBTITLE_EXTENSIONS.indexOf(etExtension(candidate.path)) >= 0
        }).map(function (candidate) {
            index++
            var segments = String(candidate.path || '').split(/[/\\]/)
            segments.pop()
            return {
                label: segments.slice(1).join(' - '),
                url: Lampa.Torserver.stream(candidate.path, hash, candidate.id).replace('&preload', '&play'),
                index: index
            }
        })
        return subtitles.length ? subtitles : false
    }

    function etBuildTorrentItem(Lampa, card, hash, file, allFiles, viewedEntries, recipe, viewedApi) {
        var parsed = Lampa.Torserver.parse({
            movie: card,
            files: allFiles,
            filename: file.path_human,
            path: file.path,
            is_file: ['vob', 'm2ts'].indexOf(etExtension(file.path)) >= 0
        })
        var timeline = Lampa.Timeline.view(parsed.hash)
        var serverRoad = viewedEntries.find(function (item) {
            return Number(item.file_index) === Number(file.id)
        })
        if (!timeline.time && serverRoad && serverRoad.timecode > 0) {
            timeline.time = serverRoad.timecode
            timeline.percent = timeline.duration ? Math.min(100, timeline.time / timeline.duration * 100) : 0
        }
        return Object.assign({}, file, {
            card: card,
            season: parsed.season,
            episode: parsed.episode,
            torrent_hash: hash,
            url: Lampa.Torserver.stream(file.path, hash, file.id),
            timeline: timeline,
            subtitles: etBuildTorrentSubtitles(Lampa, hash, file, allFiles),
            viewed: function (seconds) {
                if (typeof Lampa.Storage.field === 'function' && Lampa.Storage.field('torrserver_tracktimecode') === true) {
                    viewedApi.set(hash, file.id, seconds)
                }
            },
            lampac_resume: {
                mode: 'torrent',
                torrent: {
                    infohash: hash,
                    magnet: etMagnet(recipe.magnet),
                    file_index: Number(file.id),
                    file_path: String(file.path || ''),
                    torrent_title: etText(recipe.torrent_title)
                }
            }
        })
    }

    function etCallbackPromise(executor) {
        return new Promise(function (resolve, reject) {
            return executor(resolve, reject)
        })
    }

    function etCreateTorrentAdapter(Lampa) {
        var options = {}
        var viewedApi = etCreateViewedApi(Lampa)
        return {
            resolve: function (card, record) {
                return Promise.resolve().then(function () {
                    var recipe = record.torrent
                    return etLoadFiles(Lampa, recipe, options).then(function (loaded) {
                        var response = loaded.response
                        var hash = loaded.hash
                        var effectiveRecipe = Object.assign({}, recipe, {
                            magnet: loaded.magnet || etMagnetFor(recipe)
                        })
                        var allFiles = (response.file_stats || response.files || []).slice().sort(function (left, right) {
                            return etNaturalPath(left.path).localeCompare(etNaturalPath(right.path))
                        })
                        var viewedPromise = typeof Lampa.Storage.field === 'function' && Lampa.Storage.field('torrserver_tracktimecode') === true
                            ? etCallbackPromise(function (resolve) {
                                viewedApi.list(hash, resolve, function () {
                                    return resolve([])
                                })
                            })
                            : Promise.resolve([])
                        return viewedPromise.then(function (viewed) {
                            var videos = Lampa.Torserver.clearFileName(allFiles.filter(function (file) {
                                return ET_VIDEO_EXTENSIONS.indexOf(etExtension(file.path)) >= 0
                            }))
                            var playlist = videos.map(function (file) {
                                return etBuildTorrentItem(Lampa, card, hash, file, allFiles, viewed || [], effectiveRecipe, viewedApi)
                            }).sort(function (left, right) {
                                return Number(left.season) - Number(right.season) || Number(left.episode) - Number(right.episode) || etNaturalPath(left.path).localeCompare(etNaturalPath(right.path))
                            })
                            var item = playlist.find(function (file) {
                                return Number(file.id) === Number(recipe.file_index)
                            })
                            if (!item) item = playlist.find(function (file) {
                                return etNormalizePath(file.path) === etNormalizePath(recipe.file_path)
                            })
                            if (!item) item = playlist.find(function (file) {
                                return Number(file.season) === Number(record.episode.season) && Number(file.episode) === Number(record.episode.episode)
                            })
                            if (!item || !playlist.length) throw new Error('resume-torrent-file')
                            return {
                                item: item,
                                playlist: playlist
                            }
                        })
                    })
                })
            }
        }
    }

    function etCreateTorrentTimecodeWriter(Lampa) {
        var writtenAt = new Map()
        var viewedApi = etCreateViewedApi(Lampa)
        return {
            write: function (hash, fileIndex, seconds, force) {
                if (typeof Lampa.Storage.field !== 'function' || Lampa.Storage.field('torrserver_tracktimecode') !== true) return
                var key = hash + ':' + fileIndex
                var now = Date.now()
                if (!force && now - (writtenAt.get(key) || 0) < ET_TORRSERVER_WRITE_INTERVAL_MS) return
                writtenAt.set(key, now)
                viewedApi.set(hash, fileIndex, Math.round(seconds))
            }
        }
    }

    function etCreateTorrentContext(Lampa) {
        var remembered = new Map()
        var original = null
        var wrapped = null
        function hashKey(value) {
            return etText(value).toUpperCase()
        }
        function remember(infohash, input) {
            var key = hashKey(infohash)
            if (!key) return
            remembered.set(key, {
                infohash: key,
                magnet: etMagnet(input.link),
                torrent_title: etText(input.title)
            })
        }
        return {
            start: function () {
                if (wrapped || !Lampa.Torserver || typeof Lampa.Torserver.hash !== 'function') return this
                original = Lampa.Torserver.hash
                wrapped = function (input, success, fail) {
                    return original.call(this, input, function (result) {
                        remember(result && result.hash, input)
                        if (typeof success === 'function') success(result)
                    }, fail)
                }
                Lampa.Torserver.hash = wrapped
                return this
            },
            stop: function () {
                if (!wrapped) return this
                if (Lampa.Torserver && Lampa.Torserver.hash === wrapped) Lampa.Torserver.hash = original
                original = null
                wrapped = null
                return this
            },
            find: function (infohash) {
                var found = remembered.get(hashKey(infohash))
                return found ? Object.assign({}, found) : null
            }
        }
    }

    function etRootFor(event) {
        if (event && event.body && typeof event.body.find === 'function') return event.body
        var activity = event && event.object && event.object.activity
        if (!activity || typeof activity.render !== 'function') return null
        var rendered = activity.render()
        if (rendered && typeof rendered.find === 'function') return rendered
        return typeof $ === 'function' ? $(rendered) : null
    }

    function etLatestRecord(history, series) {
        if (!history || !history.modes) return null
        return Object.values(history.modes).filter(function (record) {
            return record && record.mode === 'torrent'
        }).filter(function (record) {
            return !series || record.episode && Number(record.episode.season) > 0 && Number(record.episode.episode) > 0
        }).sort(function (left, right) {
            return Number(right.updated_at) - Number(left.updated_at)
        })[0] || null
    }

    function etIsSeries(card) {
        return card && Number(card.number_of_seasons) > 0
    }

    function etLabelFor(record) {
        return 'S' + String(Number(record.episode.season)).padStart(2, '0') + 'E' + String(Number(record.episode.episode)).padStart(2, '0')
    }

    function etActionContainer(root) {
        return root.find('.full-start-new__buttons, .full-start__buttons').last()
    }

    function etModeAction(root, mode) {
        var container = etActionContainer(root)
        var actions = container.length ? container.find('.view--' + mode) : root.find('.view--' + mode)
        if (!actions.length) actions = root.find('.view--' + mode)
        return actions.last()
    }

    function etResumeButtonText(label, progress) {
        if (!label) return 'Продолжить просмотр'
        return etEpisodeCompleted(progress) ? 'Следующая серия · ' + label : 'Продолжить просмотр · ' + label
    }

    function etRenderButton(label, progress) {
        var dash = (etSanitizeProgress(progress).percent * 65.97 / 100).toFixed(2)
        return '<div class="full-start__button selector view--watch-resume">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none">' +
            '<circle cx="12" cy="12" r="10.5" stroke="currentColor" stroke-width="1.7" opacity="0.22"/>' +
            '<circle class="watch-resume__progress" cx="12" cy="12" r="10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="' + dash + ' 65.97" transform="rotate(-90 12 12)"/>' +
            '<path fill="currentColor" d="M9 7v10l8-5z"/></svg>' +
            '<span>' + etResumeButtonText(label, progress) + '</span>' +
            '</div>'
    }

    function etCreateResumeButton(Lampa, store, orchestrator) {
        var started = false
        var unsubscribe = null
        var currentEvent = null
        var pending = false

        function showFailure() {
            if (Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show('Не удалось восстановить просмотр')
        }

        function onFullEvent(event) {
            if (!event || event.type !== 'complite') return
            currentEvent = event
            var card = event.data && event.data.movie
            var root = etRootFor(event)
            if (!root) return
            var existing = root.find('.view--watch-resume')
            if (!card) {
                existing.remove()
                return
            }
            var record = etLatestRecord(store.find(card), etIsSeries(card))
            if (!record) {
                existing.remove()
                return
            }
            if (existing.length) {
                existing.find('.watch-resume__progress').attr('stroke-dasharray', (etSanitizeProgress(record.progress).percent * 65.97 / 100).toFixed(2) + ' 65.97')
                existing.find('span').text(etResumeButtonText(etIsSeries(card) ? etLabelFor(record) : '', record.progress))
                return
            }
            var button = $(etRenderButton(etIsSeries(card) ? etLabelFor(record) : '', record.progress))
            button.on('hover:enter', function () {
                if (pending) return
                pending = true
                var loading = true
                function stopLoading() {
                    if (!loading) return
                    loading = false
                    if (Lampa.Loading && typeof Lampa.Loading.stop === 'function') Lampa.Loading.stop()
                }
                if (Lampa.Loading && typeof Lampa.Loading.start === 'function') Lampa.Loading.start()
                orchestrator.resume(card, stopLoading)
                    .then(function () {
                        stopLoading()
                    })
                    .catch(function () {
                        stopLoading()
                        showFailure()
                    })
                    .then(function () {
                        pending = false
                    })
            })
            var container = etActionContainer(root)
            var online = container.length ? container.find('.view--online').last() : root.find('.view--online').last()
            var torrent = container.length ? container.find('.view--torrent').last() : root.find('.view--torrent').last()
            if (online.length) online.after(button)
            else if (torrent.length) torrent.after(button)
            else if (container.length) container.append(button)
        }

        return {
            start: function () {
                if (started) return this
                started = true
                Lampa.Listener.follow('full', onFullEvent)
                if (store && typeof store.subscribe === 'function') {
                    unsubscribe = store.subscribe(function () {
                        if (currentEvent) onFullEvent(currentEvent)
                    })
                }
                var active = Lampa.Activity && typeof Lampa.Activity.active === 'function' ? Lampa.Activity.active() : null
                if (active && active.component === 'full') {
                    onFullEvent({
                        type: 'complite',
                        object: active,
                        data: {
                            movie: active.card || active.movie
                        }
                    })
                }
                return this
            },
            stop: function () {
                if (!started) return this
                started = false
                Lampa.Listener.remove('full', onFullEvent)
                if (typeof unsubscribe === 'function') unsubscribe()
                unsubscribe = null
                currentEvent = null
                return this
            }
        }
    }

    function etCreateResumeRuntime(Lampa) {
        var store = etCreateRecipeStore(Lampa)
        var torrentTimecodes = etCreateTorrentTimecodeWriter(Lampa)
        var torrentContext = etCreateTorrentContext(Lampa)
        var capture = etCreateCapture(Lampa, store, {
            findTorrentContext: torrentContext.find,
            writeTorrentTimecode: torrentTimecodes.write,
            globalObject: typeof window != 'undefined' ? window : {}
        })
        var launcher = etCreatePlayerLauncher(Lampa)
        var orchestrator = etCreateResumeOrchestrator({
            store: store,
            torrent: etCreateTorrentAdapter(Lampa),
            launcher: launcher
        })
        var button = etCreateResumeButton(Lampa, store, orchestrator)
        var canCapture = Lampa.Player && Lampa.Player.listener && Lampa.PlayerPlaylist && Lampa.PlayerPlaylist.listener && Lampa.Timeline && Lampa.Timeline.listener
        return {
            start: function () {
                if (canCapture) {
                    torrentContext.start()
                    capture.start()
                }
                button.start()
                return this
            },
            stop: function () {
                if (canCapture) {
                    capture.stop()
                    torrentContext.stop()
                }
                button.stop()
                return this
            }
        }
    }

    function etResumeStart() {
        if (etResumeRuntime) return
        etResumeRuntime = etCreateResumeRuntime(Lampa)
        etResumeRuntime.start()
    }

    function etResumeStop() {
        if (!etResumeRuntime) return
        etResumeRuntime.stop()
        etResumeRuntime = null
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
`
        $('<style id="et-style">').html(css).appendTo('head')
    }

    function etInit() {
        etLoadConfig()
        etSettingsInit()
        etStyleInit()
        etPatchParser()
        etResumeStart()

        Lampa.Listener.follow('torrent', function (e) {
            if (e.type == 'render') etRenderPanel(e)
        })

        Lampa.Listener.follow('activity', function (e) {
            if (e.type == 'start' && e.component == 'torrents') console.log('[EasyTorrent] Новая страница торрентов')
        })

        console.log('[EasyTorrent] Готов к работе!')
    }

/* ================================================================
       Cardify: фон, трейлеры и слайдшоу (внедрена полностью, русский)
       ================================================================ */

    var cardifyVersion = '1.0.0'

    function cardifySetting(name, def) {
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

    function cardifyLang() {
        Lampa.Lang.add({
            cardify_enable_sound: {
                ru: 'Включить звук',
                en: 'Enable sound',
                uk: 'Увімкнути звук',
                be: 'Уключыць гук',
                zh: '启用声音',
                pt: 'Ativar som',
                bg: 'Включване на звук'
            }
        })
    }

    function cardifyStyle() {
        if ($('#cardify-style').length) return

        var css =
            '.cardify{-webkit-transition:all .3s;-o-transition:all .3s;-moz-transition:all .3s;transition:all .3s}' +
            '.cardify .full-start-new__body{height:80vh}' +
            '.cardify .full-start-new__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:end;-webkit-align-items:flex-end;-moz-box-align:end;-ms-flex-align:end;align-items:flex-end}' +
            '.cardify .full-start-new__title{text-shadow:0 0 .1em rgba(0,0,0,0.3);text-shadow:1px 2px 6px rgba(0,0,0,0.8)}' +
            '.cardify__left{-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1}' +
            '.cardify__right-box{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-direction:vertical;-webkit-box-orient:vertical;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;position:relative}' +
            '.cardify__details{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}' +
            '.cardify .full-start-new__rate-line.rate-fix{margin:0.4em 0 0.5em 0}' +
            '.full-start-new__details{margin:0 0 0.5em -0.3em;}' +
            '.full-start-new__rate-line{margin:0;margin-left:3.5em}' +
            '.cardify .full-start-new__rate-line>*:last-child{margin-right:0 !important}' +
            '.cardify .full-start-new__reactions{text-shadow:1px 1px 3px rgba(0,0,0,0.9);margin:0 0 0.4em 0}' +
            '.cardify .full-start__rate, .cardify .full-start__status, .cardify .full-start__pg{text-shadow:1px 1px 4px rgba(0,0,0,0.95);-webkit-backdrop-filter:blur(1px)}' +
            '.cardify-quality{display:inline-flex;align-items:center;gap:0.5em;margin:0 0 0.5em 0;padding:0.3em 0.7em;border-radius:0.5em;background:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.18);box-shadow:1px 1px 4px rgba(0,0,0,0.9)}' +
            '.cardify-quality__badge{display:inline-flex;align-items:center;gap:0.35em;font-size:1.05em;font-weight:700;color:#fff;text-shadow:1px 1px 3px rgba(0,0,0,0.9)}' +
            '.cardify-quality__badge svg{width:1.3em;height:1.3em;flex:0 0 auto}' +
            '.cardify-quality__icon{width:1.25em;height:1.25em;margin-right:0.35em;display:inline-block;vertical-align:middle;color:#fff;text-shadow:1px 1px 3px rgba(0,0,0,0.9)}' +
            '.cardify__background{left:0; will-change: opacity, transform; transform: translateZ(0);}' +
            '.cardify__background.nodisplay{opacity:0 !important}' +
            '.cardify.nodisplay{-webkit-transform:translate3d(0,50%,0);-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}' +
            '.head.nodisplay{-webkit-transform:translate3d(0,-100%,0);-moz-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}' +
            'body:not(.menu--open) .cardify__background{-webkit-mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));-webkit-mask-image:-webkit-linear-gradient(top,white 50%,rgba(255,255,255,0) 100%);mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));mask-image:linear-gradient(to bottom,white 50%,rgba(255,255,255,0) 100%)}' +
            '.cardify__background{animation:none !important;-webkit-animation:none !important;transform:none !important;-webkit-transform:none !important;}' +
            '.cardify-effects-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0;background-color:transparent;background-image:linear-gradient(225deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0) 55%);background-repeat:no-repeat;background-size:100vw 100vh;transition:background-color 0.4s ease;}' +
            '.cardify-effects-overlay.cardify-scrolled{background-color:rgba(0,0,0,0.5) !important;}' +
            '.custom-ghost-main .full-descr__text{max-width:100% !important;width:100% !important;margin:0 !important;padding:0 !important;text-align:right !important;white-space:normal !important;display:block !important;}' +
            '.cardify-trailer{opacity:0;transition:opacity .3s;position:absolute;top:0;left:0;width:100%;height:100%;z-index:0; will-change: opacity;}' +
            '.cardify-trailer__youtube{background-color:#000;position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:0;}' +
            '.cardify-trailer__youtube iframe{border:0;width:100%;height:100%;flex-shrink:0;z-index:0;transition:transform 0.3s;pointer-events:none; will-change: transform;}' +
            '.cardify-trailer__youtube-line{position:fixed;height:6.2em;background-color:#000;width:100%;left:0;display:none;z-index:2;}' +
            '.cardify-trailer__youtube-line.one{top:0}' +
            '.cardify-trailer__youtube-line.two{bottom:0}' +
            '.cardify-trailer__controlls{position:fixed;left:1.5em;right:1.5em;bottom:1.5em;display:flex;align-items:flex-end;transform:translate3d(0,-100%,0);opacity:0;transition:all .3s;z-index:10;}' +
            '.cardify-trailer__title{flex-grow:1;padding-right:5em;font-size:4em;font-weight:600;text-shadow: 2px 2px 4px #000;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;}' +
            '.cardify-trailer__remote{flex-shrink:0;display:flex;align-items:center;}' +
            '.cardify-trailer__remote-icon{flex-shrink:0;width:2.5em;height:2.5em}' +
            '.cardify-trailer__remote-text{margin-left:1em;text-shadow: 1px 1px 2px #000;}' +
            '.cardify-trailer.display{opacity:1}' +
            '.cardify-trailer.display .cardify-trailer__controlls{transform:translate3d(0,0,0);opacity:1}' +
            'body.cardify-hide-status .full-start__status { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important; border: 0 !important; overflow: hidden !important; font-size: 0 !important; }' +
            'body.cardify-hide-pg .full-start__pg { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important; border: 0 !important; overflow: hidden !important; font-size: 0 !important; }' +
            'body.cardify-hide-rating .full-start-new__rate-line.rate-fix { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; font-size: 0 !important; }' +
            'body.cardify-ratings-corner .cardify__right-box { align-items: center; flex-direction: column; }' +
            'body.cardify-ratings-corner .cardify__right-box .full-start-new__rate-line { margin: 0 !important; display: flex; align-items: center; }' +
            'body.cardify-ratings-corner .cardify__right-box > * { margin: 0.4em 0 0 0; }' +
            'body.cardify-ratings-corner .cardify__right-box > *:first-child { margin: 0; }'

        $('<style id="cardify-style">').html(css).appendTo('head')
    }

    function cardifyTemplate() {
        var tpl =
            '<div class="full-start-new cardify">' +
            '        <div class="full-start-new__body">' +
            '            <div class="full-start-new__left hide">' +
            '                <div class="full-start-new__poster">' +
            '                    <img class="full-start-new__img full--poster" />' +
            '                </div>' +
            '            </div>' +
            '' +
            '            <div class="full-start-new__right">' +
            '                ' +
            '                <div class="cardify__left">' +
            '                    <div class="full-start-new__head"></div>' +
            '                    <div class="full-start-new__title">{title}</div>' +
            '' +
            '                    <div class="full-start-new__rate-line rate-fix">' +
            '                        <div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>' +
            '                        <div class="full-start__rate rate--imdb hide"><div></div><div>IMDB</div></div>' +
            '                        <div class="full-start__rate rate--kp hide"><div></div><div>KP</div></div>' +
            '                        <div class="full-start__rate rate--cub hide"><div></div><div>CUB</div></div>' +
            '                    </div>' +
            '' +
            '                    <div class="full-start-new__reactions selector">' +
            '                        <div>#{reactions_none}</div>' +
            '                    </div>' +
            '' +
            '                    <div class="cardify__details">' +
            '                        <div class="full-start-new__details"></div>' +
            '                    </div>' +
            '' +
            '                    <div class="full-start-new__buttons">' +
            '                        <div class="full-start__button selector button--play">' +
            '                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>' +
            '                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>' +
            '                            </svg>' +
            '' +
            '                            <span>#{title_watch}</span>' +
            '                        </div>' +
            '' +
            '                        <div class="full-start__button selector button--book">' +
            '                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '                            <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.5 1.72386 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>' +
            '                            </svg>' +
            '' +
            '                            <span>#{settings_input_links}</span>' +
            '                        </div>' +
            '' +
            '                        <div class="full-start__button selector button--reaction">' +
            '                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '                                <circle cx="6" cy="10" r="3.4" fill="currentColor" opacity="0.9"/>' +
            '                                <circle cx="18" cy="10" r="3.4" fill="currentColor" opacity="0.55"/>' +
            '                                <circle cx="12" cy="18" r="3.4" fill="currentColor" opacity="0.7"/>' +
            '                            </svg>' +
            '' +
            '                            <span>#{title_reactions}</span>' +
            '                        </div>' +
            '' +
            '                        <div class="full-start__button selector button--subscribe hide">' +
            '                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '                            <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>' +
            '                            <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>' +
            '                            </svg>' +
            '' +
            '                            <span>#{title_subscribe}</span>' +
            '                        </div>' +
            '' +
            '                        <div class="full-start__button selector button--options">' +
            '                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>' +
            '                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>' +
            '                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>' +
            '                            </svg>' +
            '                        </div>' +
            '                    </div>' +
            '                </div>' +
            '' +
            '                <div class="cardify__right-box">' +
            '                    <div class="full-start-new__rate-line">' +
            '                        <div class="full-start__pg hide"></div>' +
            '                        <div class="full-start__status hide"></div>' +
            '                    </div>' +
            '                </div>' +
            '            </div>' +
            '        </div>' +
            '' +
            '        <div class="hide buttons--container">' +
            '            <div class="full-start__button view--torrent hide">' +
            '                <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px">' +
            '                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>' +
            '                </svg>' +
            '' +
            '                <span>#{full_torrents}</span>' +
            '            </div>' +
            '            <div class="full-start__button selector view--trailer">' +
            '                <svg width="28" height="29" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '                    <path d="M21.582 6.186c-.23-.86-.908-1.538-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418c-.86.23-1.538.908-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814c.23.86.908 1.538 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418c.86-.23 1.538-.908 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814zM9.75 15.021V8.979l6.5 3.021-6.5 3.021z" fill="currentColor"/>' +
            '                </svg>' +
            '                <span>Трейлеры</span>' +
            '            </div>' +
            '        </div>' +
            '    </div>'

        Lampa.Template.add('full_start_new', tpl)
    }

    function cardifySettings() {
        var icon =
            '<svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="1.5" y="1.5" width="33" height="25" rx="3.5" stroke="white" stroke-width="3"/>' +
            '<rect x="5" y="14" width="17" height="4" rx="2" fill="white"/>' +
            '<rect x="5" y="20" width="10" height="3" rx="1.5" fill="white"/>' +
            '<rect x="25" y="20" width="6" height="3" rx="1.5" fill="white"/>' +
            '</svg>'

        Lampa.SettingsApi.addComponent({
            component: 'cardify',
            icon: icon,
            name: 'Cardify'
        })

        Lampa.SettingsApi.addParam({
            component: 'cardify',
            param: { name: 'cardify_trailers_bg', type: 'trigger', default: false },
            field: {
                name: 'Фоновый видеоряд (Трейлер)',
                description: 'Автоматически воспроизводить трейлер на фоне без звука вместо изображений'
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'cardify',
            param: {
                name: 'cardify_trailers_blur',
                type: 'select',
                values: {
                    '0': 'Выключено (0%)',
                    '1': '1%',
                    '2': '2%',
                    '3': '3%',
                    '4': '4%',
                    '5': '5%',
                    '10': '10%'
                },
                default: '0'
            },
            field: {
                name: 'Размытие фонового видео',
                description: 'Настройте эффект размытия (Blur) для фонового плеера'
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'cardify',
            param: {
                name: 'cardify_trailers_zoom',
                type: 'select',
                values: {
                    '0': 'Выключено (0%)',
                    '25': '25%',
                    '33': '33%',
                    '40': '40%',
                    '45': '45%',
                    '50': '50%'
                },
                default: '0'
            },
            field: {
                name: 'Масштабирование видео',
                description: 'Увеличение видео для скрытия черных полос'
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'cardify',
            param: { name: 'cardify_run_slideshow', type: 'trigger', default: true },
            field: {
                name: 'Слайдшоу изображений',
                description: 'Плавное изменение фоновых постеров (отключается, если включен видеофон)'
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'cardify',
            param: {
                name: 'cardify_slideshow_quality',
                type: 'select',
                values: {
                    w780: 'Стандартное (W780)',
                    w1280: 'Высокое (W1280)',
                    original: 'Оригинал (Original)'
                },
                default: 'w1280'
            },
            field: {
                name: 'Качество фоновых изображений'
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'cardify',
            param: {
                name: 'cardify_slideshow_duration',
                type: 'select',
                values: {
                    5000: '5 секунд',
                    8000: '8 секунд',
                    10000: '10 секунд',
                    15000: '15 секунд'
                },
                default: 8000
            },
            field: {
                name: 'Интервал изменения изображений'
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'cardify',
            param: { name: 'cardify_move_text', type: 'trigger', default: false },
            field: {
                name: 'Перенос описания в угол',
                description: 'По умолчанию описание остаётся в карточке под кнопками. Включите, чтобы перенести его в правый верхний угол'
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'cardify',
            param: { name: 'cardify_show_status', type: 'trigger', default: true },
            field: {
                name: 'Показывать статус'
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'cardify',
            param: { name: 'cardify_show_rating', type: 'trigger', default: true },
            field: {
                name: 'Показывать рейтинги'
            },
            onChange: function () {
                cardifyUpdateVisibility()
                Lampa.Settings.update()
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'cardify',
            param: {
                name: 'cardify_ratings_position',
                type: 'select',
                values: {
                    card: 'В карточке',
                    corner: 'В правом нижнем углу'
                },
                default: 'card'
            },
            field: {
                name: 'Расположение рейтингов'
            },
            onChange: function (value) {
                Lampa.Storage.set('cardify_ratings_position', value)
                cardifyUpdateVisibility()
            },
            onRender: function (item) {
                var showRatings = Lampa.Storage.field('cardify_show_rating')
                if (showRatings === false || showRatings === 'false') item.hide()
            }
        })

        Lampa.SettingsApi.addParam({
            component: 'cardify',
            param: { name: 'cardify_show_pg', type: 'trigger', default: true },
            field: {
                name: 'Показывать возрастной рейтинг'
            }
        })
    }

    function cardifyUpdateVisibility() {
        var hideStatus = Lampa.Storage.field('cardify_show_status') === false || Lampa.Storage.field('cardify_show_status') === 'false'
        var hidePg = Lampa.Storage.field('cardify_show_pg') === false || Lampa.Storage.field('cardify_show_pg') === 'false'
        var hideRating = Lampa.Storage.field('cardify_show_rating') === false || Lampa.Storage.field('cardify_show_rating') === 'false'
        var posRating = Lampa.Storage.field('cardify_ratings_position') || 'card'

        $('body').toggleClass('cardify-hide-status', hideStatus)
        $('body').toggleClass('cardify-hide-pg', hidePg)
        $('body').toggleClass('cardify-hide-rating', hideRating)

        $('body').removeClass('cardify-ratings-card cardify-ratings-corner')
        $('body').addClass('cardify-ratings-' + posRating)
    }

    /* ----- Конечный автомат ----- */

    function CardifyState(object) {
        var machine = {}
        machine.state = object.state

        machine.start = function () {
            machine.dispath(machine.state)
        }

        machine.dispath = function (action_name) {
            var action = object.transitions[action_name]
            if (action) {
                action.call(machine, machine)
            } else {
                console.log('Cardify: invalid action')
            }
        }

        return machine
    }

    /* ----- Плеер трейлеров (YouTube) ----- */

    function CardifyPlayer(video, isBgMode) {
        var self = {}

        self.paused = false
        self.display = false
        self.ended = false
        self.isBgMode = isBgMode
        self.video = video
        self.listener = Lampa.Subscribe()

        self.html = $(
            '<div class="cardify-trailer">' +
            '    <div class="cardify-trailer__youtube">' +
            '        <div class="cardify-trailer__youtube-iframe"></div>' +
            '        <div class="cardify-trailer__youtube-line one"></div>' +
            '        <div class="cardify-trailer__youtube-line two"></div>' +
            '    </div>' +
            (!isBgMode ?
            '    <div class="cardify-trailer__controlls">' +
            '        <div class="cardify-trailer__title"></div>' +
            '        <div class="cardify-trailer__remote">' +
            '            <div class="cardify-trailer__remote-icon">' +
            '                <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '                    <path d="M32.5196 7.22042L26.7992 12.9408C27.8463 14.5217 28.4561 16.4175 28.4561 18.4557C28.4561 20.857 27.6098 23.0605 26.1991 24.7844L31.8718 30.457C34.7226 27.2724 36.4561 23.0667 36.4561 18.4561C36.4561 14.2059 34.983 10.2998 32.5196 7.22042Z" fill="white" fill-opacity="0.28"/>' +
            '                    <path d="M31.262 31.1054L31.1054 31.262C31.158 31.2102 31.2102 31.158 31.262 31.1054Z" fill="white" fill-opacity="0.28"/>' +
            '                    <path d="M29.6917 32.5196L23.971 26.7989C22.3901 27.846 20.4943 28.4557 18.4561 28.4557C16.4179 28.4557 14.5221 27.846 12.9412 26.7989L7.22042 32.5196C10.2998 34.983 14.2059 36.4561 18.4561 36.4561C22.7062 36.4561 26.6123 34.983 29.6917 32.5196Z" fill="white" fill-opacity="0.28"/>' +
            '                    <path d="M5.81349 31.2688L5.64334 31.0986C5.69968 31.1557 5.7564 31.2124 5.81349 31.2688Z" fill="white" fill-opacity="0.28"/>' +
            '                    <path d="M5.04033 30.4571L10.7131 24.7844C9.30243 23.0605 8.4561 20.857 8.4561 18.4557C8.4561 16.4175 9.06588 14.5217 10.113 12.9408L4.39251 7.22037C1.9291 10.2998 0.456055 14.2059 0.456055 18.4561C0.456054 23.0667 2.18955 27.2724 5.04033 30.4571Z" fill="white" fill-opacity="0.28"/>' +
            '                    <path d="M6.45507 5.04029C9.63973 2.18953 13.8455 0.456055 18.4561 0.456055C23.0667 0.456054 27.2724 2.18955 30.4571 5.04034L24.7847 10.7127C23.0609 9.30207 20.8573 8.45575 18.4561 8.45575C16.0549 8.45575 13.8513 9.30207 12.1275 10.7127L6.45507 5.04029Z" fill="white" fill-opacity="0.28"/>' +
            '                    <circle cx="18.4565" cy="18.4561" r="7" fill="white"/>' +
            '                </svg>' +
            '            </div>' +
            '            <div class="cardify-trailer__remote-text">' + Lampa.Lang.translate('cardify_enable_sound') + '</div>' +
            '        </div>' +
            '    </div>' : '') +
            '</div>'
        )

        self.initYoutube = function () {
            var blurVal = parseInt(Lampa.Storage.field('cardify_trailers_blur')) || 0
            var zoomVal = Lampa.Storage.field('cardify_trailers_zoom')
            if (zoomVal === true) zoomVal = '33'
            if (zoomVal === false) zoomVal = '0'
            zoomVal = zoomVal || '0'

            self.youtube = new window.YT.Player(
                self.html.find('.cardify-trailer__youtube-iframe')[0],
                {
                    height: window.innerHeight * 2,
                    width: window.innerWidth,
                    playerVars: {
                        controls: 0,
                        showinfo: 0,
                        autohide: 1,
                        modestbranding: 1,
                        autoplay: 0,
                        disablekb: 1,
                        fs: 0,
                        enablejsapi: 1,
                        playsinline: 1,
                        rel: 0,
                        suggestedQuality: 'hd1080',
                        setPlaybackQuality: 'hd1080',
                        mute: 1
                    },
                    videoId: self.video.id,
                    events: {
                        onReady: function () {
                            self.loaded = true
                            var iframe = $(self.youtube.getIframe())

                            if (blurVal > 0) {
                                iframe.css('filter', 'blur(' + blurVal + 'px)')
                            }

                            if (zoomVal !== '0') {
                                var scale = 1
                                if (zoomVal == '25') scale = 1.25
                                else if (zoomVal == '33') scale = 1.33
                                else if (zoomVal == '40') scale = 1.40
                                else if (zoomVal == '45') scale = 1.45
                                else if (zoomVal == '50') scale = 1.50
                                iframe.css('transform', 'scale(' + scale + ') translateZ(0)')
                            }

                            self.listener.send('loaded')
                        },
                        onStateChange: function (state) {
                            if (state.data == window.YT.PlayerState.PLAYING) {
                                self.paused = false
                                clearInterval(self.timer)
                                self.timer = setInterval(function () {
                                    var left = self.youtube.getDuration() - self.youtube.getCurrentTime()
                                    if (left <= 2) {
                                        clearInterval(self.timer)
                                        self.listener.send('ended')
                                    }
                                }, 100)

                                self.listener.send('play')

                                if (window.cardify_fist_unmute && !self.isBgMode) self.unmute()
                            }

                            if (state.data == window.YT.PlayerState.PAUSED) {
                                self.paused = true
                                clearInterval(self.timer)
                                self.listener.send('paused')
                            }

                            if (state.data == window.YT.PlayerState.ENDED) {
                                self.listener.send('ended')
                            }

                            if (state.data == window.YT.PlayerState.BUFFERING) {
                                state.target.setPlaybackQuality('hd1080')
                            }
                        },
                        onError: function () {
                            self.loaded = false
                            self.listener.send('error')
                        }
                    }
                }
            )
        }

        self.play = function () {
            try { self.youtube.playVideo() } catch (e) {}
        }

        self.pause = function () {
            try { self.youtube.pauseVideo() } catch (e) {}
        }

        self.unmute = function () {
            try {
                if (self.isBgMode) return
                self.youtube.unMute()
                self.html.find('.cardify-trailer__remote').remove()
                window.cardify_fist_unmute = true
            } catch (e) {}
        }

        self.show = function () {
            self.html.addClass('display')
            self.display = true
        }

        self.hide = function () {
            self.html.removeClass('display')
            self.display = false
        }

        self.render = function () {
            return self.html
        }

        self.destroy = function () {
            self.loaded = false
            self.display = false
            try { self.youtube.destroy() } catch (e) {}
            clearInterval(self.timer)
            self.html.remove()
        }

        return self
    }

    /* ----- Трейлер на стартовом экране (фон/основной) ----- */

    function CardifyTrailer(object, video, isBgMode) {
        var self = {}
        self.object = object
        self.video = video
        self.isBgMode = isBgMode
        self.activity = object.activity
        object.activity.trailer_ready = true
        self.timelauch = isBgMode ? 100 : 5000

        self.background = self.activity.render().find('.full-start__background')
        self.startblock = self.activity.render().find('.cardify')
        self.head = $('.head')

        self.state = new CardifyState({
            state: 'start',
            transitions: {
                start: function (state) {
                    clearTimeout(self.timer_load)
                    if (self.player.display) state.dispath('play')
                    else if (self.player.loaded) {
                        self.timer_load = setTimeout(function () {
                            state.dispath('load')
                        }, self.timelauch)
                    }
                },
                load: function (state) {
                    if (self.player.loaded && Lampa.Controller.enabled().name == 'full_start' && self.same()) {
                        state.dispath('play')
                    }
                },
                play: function () {
                    self.player.play()
                },
                toggle: function (state) {
                    if (self.isBgMode) return
                    clearTimeout(self.timer_load)
                    if (Lampa.Controller.enabled().name == 'cardify_trailer') {
                        return
                    } else if (Lampa.Controller.enabled().name == 'full_start' && self.same()) {
                        state.start()
                    } else if (self.player.display) {
                        state.dispath('hide')
                    }
                },
                hide: function () {
                    self.player.pause()
                    self.player.hide()
                    self.background.removeClass('nodisplay')
                    if (!self.isBgMode) {
                        self.startblock.removeClass('nodisplay')
                        self.head.removeClass('nodisplay')
                    }
                }
            }
        })

        self.same = function () {
            return Lampa.Activity.active().activity === self.activity
        }

        self.controll = function () {
            if (self.isBgMode) return

            var out = function () {
                self.state.dispath('hide')
                Lampa.Controller.toggle('full_start')
            }

            Lampa.Controller.add('cardify_trailer', {
                toggle: function () {
                    Lampa.Controller.clear()
                },
                enter: function () {
                    self.player.unmute()
                },
                left: out,
                up: out,
                down: out,
                right: out,
                back: function () {
                    self.player.destroy()
                    out()
                }
            })
            Lampa.Controller.toggle('cardify_trailer')
        }

        self.start = function () {
            var toggle = function (e) {
                self.state.dispath('toggle')
            }

            var destroy = function (e) {
                if (e.type == 'destroy' && e.object.activity === self.activity) remove()
            }

            var remove = function () {
                Lampa.Listener.remove('activity', destroy)
                Lampa.Controller.listener.remove('toggle', toggle)
                if (window.cardifyBgPlayer === self.player) window.cardifyBgPlayer = null
                self.destroy()
            }

            Lampa.Listener.follow('activity', destroy)
            Lampa.Controller.listener.follow('toggle', toggle)

            self.player = new CardifyPlayer(self.video, self.isBgMode)

            if (self.isBgMode) window.cardifyBgPlayer = self.player

            self.player.listener.follow('loaded', function () {
                self.state.start()
            })
            self.player.listener.follow('play', function () {
                clearTimeout(self.timer_show)
                self.timer_show = setTimeout(function () {
                    self.player.show()
                    self.background.addClass('nodisplay')
                    if (!self.isBgMode) {
                        self.startblock.addClass('nodisplay')
                        self.head.addClass('nodisplay')
                        self.controll()
                    }
                }, self.isBgMode ? 100 : 500)
            })
            self.player.listener.follow('ended,error', function () {
                if (self.isBgMode) {
                    self.player.play()
                    return
                }
                self.state.dispath('hide')
                if (Lampa.Controller.enabled().name !== 'full_start') Lampa.Controller.toggle('full_start')
                setTimeout(remove, 300)
            })

            var $render = self.activity.render()
            var $overlay = $render.find('.cardify-effects-overlay')
            if (self.isBgMode && $overlay.length) {
                $overlay.before(self.player.render())
            } else {
                $render.find('.activity__body').prepend(self.player.render())
            }

            var checkYT = setInterval(function () {
                if (window.YT && window.YT.Player) {
                    clearInterval(checkYT)
                    self.player.initYoutube()
                }
            }, 100)

            if (!window.YT && !window.cardify_yt_injecting) {
                window.cardify_yt_injecting = true
                Lampa.Utils.putScript(['https://www.youtube.com/iframe_api'], function () {})
            }
        }

        self.destroy = function () {
            clearTimeout(self.timer_load)
            clearTimeout(self.timer_show)
            self.player.destroy()
        }

        self.start()

        return self
    }

    /* ----- Выбор трейлера из данных ----- */

    function cardifyVideo(data) {
        var vids = data.videos || (data.movie && data.movie.videos) || (data.tv && data.tv.videos)
        if (vids && vids.results && vids.results.length) {
            var items = []
            vids.results.forEach(function (element) {
                items.push({
                    title: Lampa.Utils.shortText(element.name, 50),
                    id: element.key,
                    code: element.iso_639_1,
                    time: new Date(element.published_at).getTime(),
                    url: 'https://www.youtube.com/watch?v=' + element.key,
                    img: 'https://img.youtube.com/vi/' + element.key + '/default.jpg',
                    name_orig: (element.name || '').toLowerCase()
                })
            })
            items.sort(function (a, b) {
                return a.time > b.time ? -1 : a.time < b.time ? 1 : 0
            })
            var my_lang = items.filter(function (n) {
                return n.code == Lampa.Storage.field('tmdb_lang')
            })
            var en_lang = items.filter(function (n) {
                return n.code == 'en' && my_lang.indexOf(n) == -1
            })
            var al_lang = []
            if (my_lang.length) al_lang = al_lang.concat(my_lang)
            al_lang = al_lang.concat(en_lang)

            if (al_lang.length) {
                var best = al_lang.find(function (n) {
                    return n.name_orig.indexOf('official trailer') !== -1 ||
                        n.name_orig.indexOf('офіційний трейлер') !== -1 ||
                        n.name_orig.indexOf('официальный трейлер') !== -1
                })
                if (!best) {
                    best = al_lang.find(function (n) {
                        return n.name_orig.indexOf('trailer') !== -1 ||
                            n.name_orig.indexOf('трейлер') !== -1
                    })
                }
                return best || al_lang[0]
            }
        }
    }

    function cardifyLoadOriginalPoster(e, render) {
        var quality = Lampa.Storage.field('cardify_slideshow_quality') || 'w1280'
        var bgImg = render.find('img.full-start__background')

        var backdropPath = null
        if (e.data && e.data.movie && e.data.movie.backdrop_path) {
            backdropPath = e.data.movie.backdrop_path
        } else if (e.data && e.data.tv && e.data.tv.backdrop_path) {
            backdropPath = e.data.tv.backdrop_path
        } else if (e.object && e.object.card && e.object.card.backdrop_path) {
            backdropPath = e.object.card.backdrop_path
        } else if (bgImg.length && bgImg.attr('src')) {
            var srcMatch = bgImg.attr('src').match(/\/([^\/]+\.jpg)$/)
            if (srcMatch) backdropPath = '/' + srcMatch[1]
        }

        if (backdropPath && bgImg.length) {
            var targetUrl = 'https://image.tmdb.org/t/p/' + quality + backdropPath

            if (bgImg[0]) {
                bgImg[0].onerror = function () {
                    this.onerror = null
                    this.src = './img/img_broken.svg'
                }
            }

            var tempImg = new Image()
            tempImg.onload = function () {
                bgImg.attr('src', targetUrl)
            }
            tempImg.onerror = function () {}
            tempImg.src = targetUrl
        }
    }

    function cardifyQualityLevel(e) {
        var card = (e.object && e.object.card) || null
        var data = e.data || {}
        var movie = data.movie || null
        var tv = data.tv || null

        var best = null
        function consider(res) {
            if (!res) return
            var s = String(res).toLowerCase().trim()
            var n = parseInt(s, 10)
            if (!n || n <= 0) {
                // распознавание текстовых маркеров качества
                if (s.indexOf('4k') === 0 || /^4k/i.test(s)) n = 2160
                else if (/fullhd|fhd|1080/.test(s)) n = 1080
                else if (/qhd|1440|2k/.test(s)) n = 1440
                else if (/hd|720/.test(s)) n = 720
                else if (/sd|480/.test(s)) n = 480
                else return
            }
            if (!best || n > best.res) best = { res: n }
        }

        ;[card, movie, tv].forEach(function (src) {
            if (!src) return
            if (Array.isArray(src.resolutions)) src.resolutions.forEach(function (r) { consider(String(r)) })
            if (Array.isArray(src.qualities)) src.qualities.forEach(function (q) { consider(String(q)) })
            consider(src.quality)
            consider(src.video_quality)
            consider(src.resolution)
            if (src.item) {
                consider(src.item.quality)
                consider(src.item.resolution)
            }
        })

        if (!best) {
            try { consider(Lampa.Storage.field('quality')) } catch (e2) {}
            try { consider(Lampa.Storage.field('video_quality')) } catch (e3) {}
        }

        return best ? best.res : null
    }

    function cardifyQualitySvg(code) {
        if (code === '4k') {
            return '<svg class="cardify-quality__icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3zM5 7v10h3v-3h2v3h3v-4.5l-1.5-2.5h2v7h3V7h-3v3l-4-3H5z"/></svg>'
        }
        return '<svg class="cardify-quality__icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v16H4zM6 6v12h3v-5h2v5h3V6h-3v4H9V6z"/></svg>'
    }

    function cardifyQualityIcon(e) {
        var res = cardifyQualityLevel(e)
        var label, code
        if (res === null) {
            label = 'HD'
            code = ''
        } else if (res >= 2160) {
            code = '4k'
            label = '4K'
        } else if (res >= 1440) {
            label = 'QHD'
        } else if (res >= 1080) {
            label = 'Full HD'
        } else if (res >= 720) {
            label = 'HD'
        } else {
            label = 'SD'
        }
        return '<span class="cardify-quality__badge">' + cardifyQualitySvg(code) + '<span>' + label + '</span></span>'
    }

    function cardifyAttachQualityIcon(render, e) {
        var level = cardifyQualityLevel(e)
        var iconHtml = null

        // строка деталей: длительность, год, качество
        var $details = render.find('.full-start-new__details, .cardify__details').first()
        var $target = null
        var qText = ''

        if ($details.length) {
            // найдем span с уже написанным качеством
            $details.find('span').each(function () {
                var $s = $(this)
                var t = $s.text().trim()
                var tl = t.toLowerCase()
                if (/4k|4к|2160p|2160|1440p|1440|1080p|1080|720p|720|fullhd|full hd|fhd|qhd|\b2k\b|\bhd\b|\bsd\b/i.test(tl)) {
                    $target = $s
                    qText = tl
                    return false
                }
            })
        }

        // уровень качества из найденного текста (важнее данных)
        function textLevel(t) {
            if (/4k|4к|2160/.test(t)) return 2160
            if (/1440|qhd|2k/.test(t)) return 1440
            if (/1080|fullhd|full hd|fhd/.test(t)) return 1080
            if (/720|\bhd\b/.test(t)) return 720
            if (/sd|480/.test(t)) return 480
            return null
        }
        var tLevel = qText ? textLevel(qText) : null
        if (tLevel && (!level || tLevel > level)) level = tLevel
        iconHtml = cardifyQualitySvg(level && level >= 2160 ? '4k' : '')

        // если качество-текст найден — вставить SVG inline перед ним
        if ($target && $target.length) {
            if (!$target.find('.cardify-quality__icon').length) $target.prepend(iconHtml)
            return
        }

        // если нет span качества — добавить SVG в одну строку деталей (рядом с длительностью)
        if ($details.length) {
            if (!$details.find('.cardify-quality__icon').length) $details.prepend(iconHtml)
            return
        }

        // крайний fallback: бейдж под заголовком
        var $title = render.find('.full-start-new__title')
        if ($title.length) {
            var qHtml = cardifyQualityIcon(e)
            $('<div class="cardify-quality"></div>').html(qHtml).insertAfter($title)
        }
    }

    /* ----- Обработчик стартового экрана (полный) ----- */

    function cardifySkodf(e) {
        var render = e.object.activity.render()
        var bg = render.find('.full-start__background')
        var component = e.object.activity.component
        bg.addClass('cardify__background')

        if (render.find('.cardify-effects-overlay').length === 0) {
            bg.last().after('<div class="cardify-effects-overlay"></div>')
        }

        // Перемещение блок рейтингов согласно настройкам
        var posRating = Lampa.Storage.field('cardify_ratings_position') || 'card'
        if (posRating === 'corner') {
            var rateLine = render.find('.cardify__left .rate-fix')
            if (rateLine.length) {
                rateLine.insertBefore(render.find('.cardify__right-box .full-start-new__rate-line'))
            }
        }

        // Иконка качества рядом с уже написанным качеством в карточке
        cardifyAttachQualityIcon(render, e)

        // Убираем лишний разделитель серий в деталях
        var details = render.find('.full-start-new__details')
        if (details.length) {
            var nextEpisodeSpan = null
            details.children('span').each(function () {
                var $span = $(this)
                if (!$span.hasClass('full-start-new__split') && $span.text().indexOf('/') !== -1) {
                    nextEpisodeSpan = $span
                    return false
                }
            })
            if (nextEpisodeSpan) {
                var prevSplit = nextEpisodeSpan.prev('.full-start-new__split')
                var nextSplit = nextEpisodeSpan.next('.full-start-new__split')
                nextEpisodeSpan.detach()
                if (prevSplit.length && nextSplit.length) {
                    nextSplit.remove()
                } else {
                    prevSplit.remove()
                    nextSplit.remove()
                }
                nextEpisodeSpan.css('width', '100%')
                details.append(nextEpisodeSpan)
            }
        }

        cardifyLoadOriginalPoster(e, render)

        if (Lampa.Storage.field('cardify_move_text')) {
            if (!(window.innerHeight > window.innerWidth || Lampa.Platform.is('mobile'))) {
                render.find('.items-line__title').each(function () {
                    if ($(this).text().trim().toLowerCase() === 'детально') {
                        $(this).closest('.items-line__head').hide()
                    }
                })

                var description = render.find('.full-descr__text')
                var mainContainer = render.find('.full-start-new__body')

                if (description.length && mainContainer.length && render.find('.custom-ghost-main').length === 0) {
                    mainContainer.css('position', 'relative')
                    var wrapper = $('<div class="custom-ghost-main"></div>')
                    wrapper.css({
                        'position': 'absolute',
                        'top': '0',
                        'right': '0',
                        'width': '40vw',
                        'z-index': '9999',
                        'pointer-events': 'none',
                        'box-sizing': 'border-box'
                    })
                    description.css({
                        'line-height': '1.4',
                        'font-size': '1.2em',
                        'color': '#ffffff',
                        'text-shadow': '1px 1px 3px rgba(0,0,0,0.9)'
                    })
                    wrapper.append(description)
                    mainContainer.append(wrapper)
                }
            }
        }

        var titleEl = render.find('.full-start-new__title')[0]
        if (titleEl && typeof IntersectionObserver !== 'undefined') {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var $overlay = render.find('.cardify-effects-overlay')
                    if (entry.isIntersecting) {
                        $overlay.removeClass('cardify-scrolled')
                    } else {
                        $overlay.addClass('cardify-scrolled')
                    }
                })
            }, { threshold: 0 })

            observer.observe(titleEl)

            var stopObserver = function (a) {
                if (a.type == 'destroy' && a.object.activity === e.object.activity) {
                    observer.disconnect()
                    Lampa.Listener.remove('activity', stopObserver)
                }
            }
            Lampa.Listener.follow('activity', stopObserver)
        }

        if (component && component.rows && component.items && component.scroll && component.emit) {
            var add = component.rows.slice(component.items.length)
            if (add.length) {
                component.fragment = document.createDocumentFragment()
                add.forEach(function (row) {
                    component.emit('createAndAppend', row)
                })
                component.scroll.append(component.fragment)
                if (Lampa.Layer) Lampa.Layer.visible(component.scroll.render())
            }
        }
    }

    function cardifySlideshow(e, item_id) {
        var movie_data = e.data.movie || e.data.tv || (e.object && e.object.card)

        if (movie_data && movie_data.id) {
            var media_type = 'movie'

            if (e.object && e.object.method === 'tv') {
                media_type = 'tv'
            } else if (e.data && e.data.tv && !e.data.movie) {
                media_type = 'tv'
            } else if (movie_data.name && !movie_data.title) {
                media_type = 'tv'
            }

            var current_lang = Lampa.Storage.field('tmdb_lang') || 'uk'
            var include_languages = current_lang + ',xx,null,en'

            Lampa.Api.sources.tmdb.get(
                media_type + '/' + movie_data.id + '/images?include_image_language=' + include_languages,
                {},
                function (images_data) {
                    if (images_data && images_data.backdrops && images_data.backdrops.length > 0) {
                        var lang_backdrops = []
                        var no_lang_backdrops = []
                        var other_backdrops = []

                        images_data.backdrops.forEach(function (backdrop) {
                            var lang = backdrop.iso_639_1
                            if (lang === current_lang) {
                                lang_backdrops.push(backdrop)
                            } else if (!lang || lang === 'xx' || lang === 'null') {
                                no_lang_backdrops.push(backdrop)
                            } else {
                                other_backdrops.push(backdrop)
                            }
                        })

                        // Приоритет чистым изображениям без текста/логотипов
                        var final_backdrops = [].concat(no_lang_backdrops)
                        if (final_backdrops.length < 3 && lang_backdrops.length > 0) {
                            final_backdrops = final_backdrops.concat(lang_backdrops)
                        }
                        if (final_backdrops.length < 3 && other_backdrops.length > 0) {
                            other_backdrops.sort(function (a, b) {
                                return (b.vote_average || 0) - (a.vote_average || 0)
                            })
                            final_backdrops = final_backdrops.concat(other_backdrops)
                        }

                        final_backdrops = final_backdrops.slice(0, 15)

                        if (final_backdrops.length > 1) {
                            if (window.cardifyRotationTimer) clearInterval(window.cardifyRotationTimer)

                            var current_index = 0
                            var is_active = true
                            window.cardifyCurrentItemId = item_id

                            var quality = Lampa.Storage.field('cardify_slideshow_quality') || 'w1280'
                            var duration = parseInt(Lampa.Storage.field('cardify_slideshow_duration')) || 8000

                            window.cardifyRotationTimer = setInterval(function () {
                                if (!is_active || window.cardifyCurrentItemId !== item_id) {
                                    clearInterval(window.cardifyRotationTimer)
                                    return
                                }

                                current_index = (current_index + 1) % final_backdrops.length
                                var backdrop_url = Lampa.TMDB.image('t/p/' + quality + final_backdrops[current_index].file_path)

                                var $render = e.object.activity.render()
                                var $currentBg = $render.find('.full-start__background').last()
                                if ($currentBg.length === 0) return

                                var img = new Image()
                                img.onload = function () {
                                    if (!is_active || window.cardifyCurrentItemId !== item_id) return

                                    var $newBg = $currentBg.clone()
                                    $newBg.attr('src', backdrop_url)
                                    $newBg.css({
                                        'opacity': '0',
                                        'transition': 'opacity 1.5s ease-in-out',
                                        'transform': 'translateZ(0)'
                                    })

                                    var $overlay = $render.find('.cardify-effects-overlay')
                                    if ($overlay.length) {
                                        $overlay.before($newBg)
                                    } else {
                                        $currentBg.after($newBg)
                                    }

                                    $newBg[0].offsetHeight
                                    $newBg.css('opacity', '1')
                                    $currentBg.css({ 'transition': 'opacity 1.5s ease-in-out', 'opacity': '0' })

                                    setTimeout(function () {
                                        if (!is_active || window.cardifyCurrentItemId !== item_id) return
                                        $currentBg.remove()
                                        $render.find('.full-start__background').not($newBg).remove()
                                    }, 1550)
                                }
                                img.onerror = function () {}
                                img.src = backdrop_url
                            }, duration)

                            var stop_rotation = function (a) {
                                if (a.type == 'destroy' && a.object.activity === e.object.activity) {
                                    is_active = false
                                    if (window.cardifyRotationTimer) clearInterval(window.cardifyRotationTimer)
                                    Lampa.Listener.remove('activity', stop_rotation)
                                }
                            }
                            Lampa.Listener.follow('activity', stop_rotation)
                        }
                    }
                }
            )
        }
    }

    function cardifyOnFull(e) {
        if (e.type == 'archive') return

        if (e.type != 'complite') return

        var object = e.object
        if (!object || !object.activity) return
        var activity = object.activity

        cardifySkodf(e)

        // восстановление opacity фона
        var fixOpacity = function () {
            if (!e || !e.object || !e.object.activity || typeof e.object.activity.render !== 'function') return
            var renderEl = e.object.activity.render()
            if (!renderEl) return
            var $bg = renderEl.find('.full-start__background')
            if ($bg.length) {
                $bg.stop(true, true).css('opacity', '1')
            }
        }
        fixOpacity()
        setTimeout(fixOpacity, 300)
        setTimeout(fixOpacity, 1000)

        var isBgTrailers = Lampa.Storage.field('cardify_trailers_bg')
        var run_slideshow = Lampa.Storage.field('cardify_run_slideshow')

        if (isBgTrailers) {
            var tr = cardifyVideo(e.data)
            if (tr && Lampa.Manifest.app_digital >= 220) {
                if (Lampa.Activity.active().activity === activity) {
                    new CardifyTrailer(e.object, tr, isBgTrailers)
                } else {
                    var follow = function (a) {
                        if (a.type == 'start' && a.object.activity === activity && !activity.trailer_ready) {
                            Lampa.Listener.remove('activity', follow)
                            new CardifyTrailer(e.object, tr, isBgTrailers)
                        }
                    }
                    Lampa.Listener.follow('activity', follow)
                }
            } else {
                isBgTrailers = false
            }
        }

        if (run_slideshow && !isBgTrailers) {
            var movie_data = e.data.movie || e.data.tv || (e.object && e.object.card)
            if (movie_data && movie_data.id) {
                cardifySlideshow(e, movie_data.id)
            }
        }
    }

    function cardifyInit() {
        if (!Lampa.Platform.screen('tv')) {
            console.log('Cardify', 'не TV-экран, модуль отключен')
            return
        }

        cardifyLang()
        cardifyTemplate()
        cardifyStyle()
        cardifySettings()

        cardifyUpdateVisibility()

        Lampa.Storage.listener.follow('change', function (e) {
            if (e.name === 'cardify_show_status' || e.name === 'cardify_show_pg' || e.name === 'cardify_show_rating') {
                cardifyUpdateVisibility()
            }
        })

        Lampa.Listener.follow('full', cardifyOnFull)
    }

    function init() {
        network = new Lampa.Reguest()
network.timeout(1000 * 20)

        Lampa.Manifest.plugins = manifest
        translations()
        settingsInit()
        styleInit()
        etInit()
        cardifyInit()

        Lampa.Listener.follow('full', onFull)
        Lampa.Listener.follow('activity', onActivity)
    }

    if (window.appready) init()
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') init()
    })
})()
