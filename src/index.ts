/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const blacklist: string[] = [];
const whitelist: string[] = ['.*'];

const isListed = (uri: string, listing: string[]) => {
	return listing.some((m) => uri.match(m));
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const fetchUrl = request.url.split('?')[1] ?? '';
		if (!fetchUrl) return new Response('https://cloudflare-cors-anywhere.alpyg.workers.dev/?<url>');
		if (isListed(fetchUrl, blacklist) || !isListed(fetchUrl, whitelist)) return new Response('Poopoo');

		const res = await fetch(fetchUrl);
		const headers = new Headers(res.headers);

		let cors_headers = [];
		let allh: Record<string, string> = {};

		for (const [key, value] of res.headers.entries()) {
			cors_headers.push(key);
			allh[key] = value;
		}

		cors_headers.push('cors-received-headers');
		headers.set('Access-Control-Allow-Origin', request.headers.get('Origin') ?? '');

		const data = await res.text();
		return new Response(data, { headers: headers });
	},
};
