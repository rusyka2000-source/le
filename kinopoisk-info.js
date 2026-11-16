(function () {
    'use strict'

    if (window.filminfo_ready) return
    window.filminfo_ready = true

    var DEFAULT_TOKEN = '94ded508-eb21-47c9-b329-529d58b86b16'
    var CACHE_TTL = 24 * 60 * 60 * 1000
    var MAX_ALL_PAGES = 3
    var PREVIEW_COUNT = 3
    var KP_BASE = 'https://kinopoiskapiunofficial.tech'
    var BO_ORDER = { BUDGET: 0, WORLD: 1, USA: 2, RUS: 3 }

    var network = null

    var manifest = {
        type: 'video',
        version: '1.0.0',
        name: 'Кинопоиск: сборы и комментарии',
        description: 'Кассовые сборы и комментарии с Кинопоиска на странице фильма',
        component: 'kinopoisk_info'
    }

    function T(key) {
        return Lampa.Lang.translate(key)
    }

    function translations() {
        Lampa.Lang.add({
            filminfo_title: { ru: 'Кинопоиск: сборы и комментарии', en: 'Kinopoisk: box office & comments' },
            filminfo_box_office: { ru: 'Сборы', en: 'Box office' },
            filminfo_comments: { ru: 'Комментарии', en: 'Comments' },
            filminfo_budget: { ru: 'Бюджет', en: 'Budget' },
            filminfo_world: { ru: 'Сборы в мире', en: 'Worldwide' },
            filminfo_usa: { ru: 'Сборы в США', en: 'USA' },
            filminfo_rus: { ru: 'Сборы в России и СНГ', en: 'Russia & CIS' },
            filminfo_loading: { ru: 'Загрузка…', en: 'Loading…' },
            filminfo_no_data: { ru: 'Нет данных', en: 'No data' },
            filminfo_no_reviews: { ru: 'Комментариев пока нет', en: 'No comments yet' },
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
            filminfo_settings_name: { ru: 'Кинопоиск: сборы и комментарии', en: 'Kinopoisk: box office & comments' },
            filminfo_set_token: { ru: 'Токен API Кинопоиска (X-API-KEY)', en: 'Kinopoisk API token (X-API-KEY)' },
            filminfo_set_token_desc: { ru: 'Получить можно на kinopoiskapiunofficial.tech. Хранится только в настройках Lampa.', en: 'Get it at kinopoiskapiunofficial.tech. Stored only in Lampa settings.' },
            filminfo_set_boxoffice: { ru: 'Показывать сборы', en: 'Show box office' },
            filminfo_set_comments: { ru: 'Показывать комментарии', en: 'Show comments' },
            filminfo_set_proxy: { ru: 'CORS-прокси (необязательно)', en: 'CORS proxy (optional)' },
            filminfo_set_proxy_desc: { ru: 'Префикс прокси, если API недоступен напрямую. Должен передавать заголовок X-API-KEY.', en: 'Proxy prefix if the API is not reachable directly. It must forward the X-API-KEY header.' }
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
            param: { name: 'filminfo_token', type: 'input', default: DEFAULT_TOKEN },
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
            param: { name: 'filminfo_proxy', type: 'input', default: '' },
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
            '.filminfo-reviews-list{display:flex;flex-direction:column;gap:1em}' +
            '.filminfo-review{width:100%}' +
            '.filminfo-review__badge{font-size:1.1em;font-weight:600;margin-bottom:0.6em}' +
            '.filminfo-review__title{font-size:1.25em;font-weight:500;margin-bottom:0.5em}' +
            '.filminfo-review__text{-webkit-line-clamp:4;line-clamp:4}' +
            '.filminfo-review__author{font-weight:500}' +
            '.filminfo-review__date{margin-left:auto;opacity:0.6;font-size:0.9em;padding-left:1em}' +
            '.filminfo-review__likes{margin-left:2em;display:flex;gap:0.6em}' +
            '.filminfo-likes--pos{color:#4caf50}' +
            '.filminfo-likes--neg{color:#f44336}' +
            '.filminfo-summary{display:flex;flex-wrap:wrap;align-items:center;gap:0.5em 1.5em;font-size:1.15em;margin-bottom:0.5em}' +
            '.filminfo-summary__total{font-weight:600}' +
            '.filminfo-summary__item{display:inline-flex;align-items:center;gap:0.5em;opacity:0.85}' +
            '.filminfo-dot{width:0.7em;height:0.7em;border-radius:100%;display:inline-block}' +
            '.filminfo-btn{display:inline-block;align-self:flex-start;margin-top:0.5em;padding:0.6em 1.4em;font-size:1.2em;background:rgba(0,0,0,0.25);border-radius:2em;cursor:pointer}' +
            '.filminfo-btn.focus{background:#fff;color:#000}' +
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
            'body.light--version .filminfo-btn{background:rgba(0,0,0,0.08)}' +
            'body.light--version .filminfo-btn.focus{background:#000;color:#fff}' +
            'body.light--version .filminfo-all-review{border-bottom-color:rgba(0,0,0,0.1)}' +
            'body.light--version .filminfo-all-review__head.focus{background:rgba(0,0,0,0.08)}'

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

    function sectionHtml(body) {
        return '<div class="items-line filminfo-section">' +
            '<div class="items-line__head">' +
            '<div class="items-line__title">' + esc(T('filminfo_title')) + '</div>' +
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

    function loadingHtml() {
        return '<div class="filminfo-message filminfo-loading">' + esc(T('filminfo_loading')) + '</div>'
    }

    function msgHtml(text) {
        return '<div class="filminfo-message">' + esc(text) + '</div>'
    }

    function statHtml(name, value) {
        return '<div class="filminfo-stat">' +
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
            syncFull()
        })
    }

    function loadReviewsPreview(movie, kpId, $list) {
        $list.html(loadingHtml())

        fetchReviews(kpId, 1, function (json, kind) {
            if (!json) {
                $list.html(msgHtml(kind == 'auth' ? T('filminfo_error_auth') : T('filminfo_error')))
                syncFull()
                return
            }

            var items = json.items || []
            if (!items.length) {
                $list.html(msgHtml(T('filminfo_no_reviews')))
                syncFull()
                return
            }

            $list.html(summaryHtml(json))

            items.slice(0, PREVIEW_COUNT).forEach(function (r) {
                var $card = $(reviewCardHtml(r))
                $card.on('hover:enter', function () {
                    openReviewModal(movie, r)
                })
                $list.append($card)
            })

            var total = json.total || items.length
            var $btn = $('<div class="filminfo-btn selector">' + esc(T('filminfo_all_comments') + ' (' + total + ')') + '</div>')
            $btn.on('hover:enter', function () {
                openAllReviewsModal(movie, kpId, json)
            })
            $list.append($btn)

            syncFull()
        })
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
        var totalPages = firstPage.totalPages || 1
        var pagesToLoad = Math.min(totalPages, MAX_ALL_PAGES)
        var collected = (firstPage.items || []).slice()
        var total = firstPage.total || collected.length

        function next(page) {
            if (page > pagesToLoad) {
                if (pageStillActive(movie)) openAllModal(movie, kpId, collected, total, firstPage)
                return
            }
            fetchReviews(kpId, page, function (json) {
                if (json && json.items) collected = collected.concat(json.items)
                next(page + 1)
            })
        }

        next(2)
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
        if ($body.find('.filminfo-section').length) return

        var showBoxOffice = setting('filminfo_box_office', true)
        var showReviews = setting('filminfo_reviews', true)
        if (!showBoxOffice && !showReviews) return

        var $descr = $body.find('.full-descr').closest('.items-line')
        if (!$descr.length) $descr = $body.find('.items-line').eq(1)
        if (!$descr.length) return

        var bodyHtml = ''
        if (showBoxOffice) bodyHtml += boxOfficeBlockHtml()
        if (showReviews) bodyHtml += reviewsBlockHtml()

        var $section = $(sectionHtml(bodyHtml))
        $descr.after($section)
        syncFull()

        var $boStats = showBoxOffice ? $section.find('.filminfo-stats') : null
        var $rvList = showReviews ? $section.find('.filminfo-reviews-list') : null

        var token = getToken()
        if (!token) {
            if ($boStats) $boStats.html(msgHtml(T('filminfo_no_token')))
            if ($rvList) $rvList.html(msgHtml(T('filminfo_no_token')))
            return
        }

        resolveKpId(movie, function (res) {
            if (!res || !res.id) {
                var msg
                if (res && res.error == 'auth') msg = T('filminfo_error_auth')
                else if (res && res.error == 'network') msg = T('filminfo_error')
                else msg = T('filminfo_not_found_kp')
                if ($boStats) $boStats.html(msgHtml(msg))
                if ($rvList) $rvList.html(msgHtml(msg))
                return
            }

            if ($boStats) loadBoxOffice(res.id, $boStats)
            if ($rvList) loadReviewsPreview(movie, res.id, $rvList)
        })
    }

    function onActivity(e) {
        if (e.type == 'archive' || e.type == 'destroy') {
            if (network) network.clear()
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