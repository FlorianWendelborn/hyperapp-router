// region import

import {app, html} from '../hyperapp'

// endregion

// region app

const effects = {}
const model = {
	route: {
		current: '/'
	}
}
const subscriptions = []
const update = {}

const anchor = n => html`
	<h1>
		<a href=${"/" + n}>
			${n}
		</a>
	</h1>`

const view = {
	'/': _ => anchor(Math.floor(Math.random() * 999)),
	'/:key': (model, actions) => html`
		<div>
			<h1>${model.route.key}</h1>
			<a href="/">Back</a>
		</div>`
}

// endregion

// region router

function route (routes, path) {
	for (var route in routes) {
		var re = regexify(route), params = {}, match

		path.replace(new RegExp(re.re, "g"), function () {
			for (var i = 1; i < arguments.length - 2; i++) {
				params[re.keys.shift()] = arguments[i]
			}

			match = route
		})

		if (match) {
			return [match, params]
		}
	}

	return ['/', {}]
}

function regexify(path) {
	var keys = [], re = "^" + path
		.replace(/\//g, "\\/")
		.replace(/:([A-Za-z0-9_]+)/g, function (_, key) {
			keys.push(key)
			return "([A-Za-z0-9_]+)"
		}) + "/?$"

	return { re: re, keys: keys }
}

const router = options => {
	if (!options.effects) options.effects = {}
	if (!options.update) options.update = {}
	if (!options.subscriptions) options.subscriptions = []

	const views = options.view

	options.effects.setLocation = (model, actions, url) => {
		const [match, params] = route(views, url)
		actions.saveLocation(Object.assign(params, {
			current: match
		}))
		history.pushState({}, '', url)
	}

	options.update.saveLocation = (model, route) => Object.assign({}, model, {route})

	options.view = (model, actions) => {
		return views[model.route.current](model, actions)
	}

	options.subscriptions.push(
		(model, actions) => window.addEventListener('popstate', () => actions.setLocation(location.pathname)),
		(model, actions) => window.addEventListener('click', e => {
			if (e.metaKey || e.shiftKey || e.ctrlKey || e.altKey) return

			let target = e.target

			while (target && target.localName !== 'a') {
				target = target.parentNode
			}

			if (target && target.host === location.host && !target.hasAttribute('data-no-routing')) {
				// TODO #
				e.preventDefault()
				return actions.setLocation(target.pathname)
			}
		})
	)

	return options
}

// endregion

// region start

window.addEventListener('load', () => app(router({
	effects,
	model,
	subscriptions,
	update,
	view
})))

// endregion
