// Flight Journal — static PWA host.
//
// Serves the Expo web export (dist/) via the ASSETS binding, with SPA
// fallback: /logbook -> /(tabs)/logbook.html style route files first,
// anything unknown -> /index.html. (Expo's static export names tab
// routes after their route groups, e.g. "(tabs)/logbook.html"; the
// client router resolves them once the bundle loads.)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    let resp = await env.ASSETS.fetch(request);
    if (resp.status === 404) {
      const path = url.pathname.replace(/\/+$/, '');
      if (path && !path.split('/').pop().includes('.')) {
        // Try the plain route file, then the (tabs) group route file.
        for (const candidate of [path + '.html', '/(tabs)' + path + '.html']) {
          const routeResp = await env.ASSETS.fetch(
            new Request(new URL(candidate, url.origin), request)
          );
          if (routeResp.status !== 404) return routeResp;
        }
      }
      resp = await env.ASSETS.fetch(
        new Request(new URL('/index.html', url.origin), request)
      );
    }
    return resp;
  },
};
