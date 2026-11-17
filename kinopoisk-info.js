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
        version: '1.5.0',
        name: 'Кинопоиск: сборы, награды, актёры и трейлеры',
        description: 'Сборы, награды, информация об актёрах и трейлеры с Кинопоиска',
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
            'body.light--version .filminfo-actor__fact{background:rgba(0,0,0,0.05)}' +
            '.filminfo-trailers{display:flex;flex-wrap:wrap;gap:1em}'

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

    function trailerIconSvg() {
        return '<svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"></path>' +
            '</svg>'
    }

    function addTrailersButton(movie, kpId, $body) {
        try {
            if (!$body || !$body.length || !kpId) return
            var $cont = $body.find('.full-start-new__buttons, .full-start__buttons').first()
            if (!$cont || !$cont.length) return
            if ($cont.find('.filminfo-trailer-btn').length) return

            var $btn = $('<div class="full-start__button selector filminfo-trailer-btn">' +
                trailerIconSvg() +
                '<span>' + esc(T('filminfo_trailers')) + '</span>' +
                '</div>')

            $btn.on('hover:enter', function () {
                openKpTrailers(movie, kpId)
            })

            $cont.append($btn)

            try {
                if (Lampa.Controller && typeof Lampa.Controller.collectionAppend == 'function') Lampa.Controller.collectionAppend($btn)
            } catch (e) {}
        } catch (e) {}
    }

    function trailerVideoId(t) {
        var id = String(t.videoId || '').trim()
        if (id) return id
        var m = String(t.url || '').match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^\/?#&]+)/i)
        return m ? m[1] : ''
    }

    function playTrailer(t) {
        var videoId = trailerVideoId(t)
        if (!videoId) {
            openExternal(String(t.url || ''))
            return
        }
        var url = 'https://www.youtube.com/watch?v=' + videoId
        var data = {
            title: (t.name || '').trim() || T('filminfo_trailer'),
            url: url
        }
        try {
            if (typeof Lampa.Player != 'undefined' && typeof Lampa.Player.play == 'function') Lampa.Player.play(data)
            else openExternal(url)
        } catch (e) {
            openExternal(url)
        }
    }

    function showTrailersModal(movie, items, kind, controller) {
        var $html = $('<div class="filminfo-modal filminfo-trailers"></div>')

        if (!items || !items.length) {
            var msg = kind == 'auth' ? T('filminfo_error_auth') : (kind == 'network' ? T('filminfo_error') : T('filminfo_no_trailers'))
            $html.append('<div class="filminfo-message">' + esc(msg) + '</div>')
        } else {
            items.forEach(function (t) {
                var name = (t.name || '').trim() || T('filminfo_trailer')
                var $btn = $('<div class="filminfo-btn selector filminfo-trailer">' + esc(name) + '</div>')
                $btn.on('hover:enter', function () {
                    restoreController(controller)
                    playTrailer(t)
                })
                $html.append($btn)
            })
        }

        var params = modalBase(movie)
        params.html = $html
        params.buttons[0].onSelect = function () { restoreController(controller) }
        params.onBack = function () { restoreController(controller) }
        Lampa.Modal.open(params)
    }

    function openKpTrailers(movie, kpId) {
        var controller = currentController()

        fetchVideos(kpId, function (items, kind) {
            if (!pageStillActive(movie)) return
            showTrailersModal(movie, items, kind, controller)
        })
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

            if (showTrailers) addTrailersButton(movie, res.id, $body)

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

    function init() {
        network = new Lampa.Reguest()
        network.timeout(1000 * 20)

        Lampa.Manifest.plugins = manifest
        translations()
        settingsInit()
        styleInit()

        Lampa.Listener.follow('full', onFull)
        Lampa.Listener.follow('activity', onActivity)
    }

    if (window.appready) init()
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') init()
    })
})()
