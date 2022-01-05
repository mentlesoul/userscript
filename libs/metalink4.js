(function() {
    this.toMetalink4 = i => {
        var a = ['<?xml version="1.0" encoding="UTF-8"?>', '<metalink xmlns="urn:ietf:params:xml:ns:metalink">', ...i.map(m), '</metalink>'];
        var b = new Blob(a, {type: 'application/metalink+xml; charset=utf-8'});
        return { binary: a, text: a.join(''), blob: b, saveAs: n => s(b, n) };
    }

    function s(b, n = 'metalink') {
        var s = document.createElement('a');
        s.href = URL.createObjectURL(b);
        s.download = n + '-' + new Date().toJSON().slice(0, -2).replace(/[T:\.\-]/g, '') + '.meta4';
        s.click();
        s.remove();
    }

    function m({name, size, version, locale, hash, url, metaurl}) {
        var f = name ? '<file name="' + name + '">' : '<file>';
        if (size) { f += '<size>' + size + '</size>'; }
        if (version) { f += '<version>' + version + '</version>'; }
        if (locale) { f += '<language>' + locale + '</language>'; }
        if (hash) { if (Array.isArray(hash[0])) { hash.forEach(h => { f += '<hash type="' + h[0] + '">' + h[1] + '</hash>'; }); } else { f += '<hash type="' + hash[0] + '">' + hash[1] + '</hash>'; } }
        if (Array.isArray(url)) { url.forEach(u => { f += Array.isArray(u) ? '<url location="' + u[0] + '">' + u[1] + '</url>' : '<url>' + u + '</url>'; }); } else { f += '<url>' + url + '</url>'; }
        if (metaurl) { if (Array.isArray(metaurl[0])) { metaurl.forEach(m => { f += '<metaurl metatype="' + m[0] + '">' + m[1] + '</metaurl>'; }); } else { f += '<metaurl metatype="' + metaurl[0] + '">' + metaurl[1] + '</metaurl>'; } }
        return f += '</file>';
    }
})();
