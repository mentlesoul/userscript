// ==UserScript==
// @name            Bilibili Video Downloader
// @name:zh         哔哩哔哩视频下载器
// @namespace       https://github.com/jc3213/userscript
// @version         1.12
// @description     Download videos that you are watching from Bilibili (No Bangumi Support)
// @description:zh  从哔哩哔哩下载你正在收看的视频（不支持番剧）
// @author          jc3213
// @match           *://www.bilibili.com/video/*
// ==/UserScript==

var title = /^[^_]+/.exec(document.title)[0];
var extract = true;
var format = {
    '30280': {label: '音频 高码率', ext: '.192k.aac'},
    '30232': {label: '音频 中码率', ext: '.128k.aac'},
    '30216': {label: '音频 低码率', ext: '.64k.aac'},
    '120': {label: '4K 超清', ext: '.4K-UHD.mp4'},
    '116': {label: '1080P 60帧', ext: '.1080HQ.mp4'},
    '112': {label: '1080P 高码率', ext: '.1080Hbr.mp4'},
    '80': {label: '1080P 高清', ext: '.1080.mp4'},
    '74': {label: '720P 60帧', ext: '.720HQ.mp4'},
    '64': {label: '720P 高清', ext: '.720.mp4'},
    '32': {label: '480P 清晰', ext: '.480.mp4'},
    '16': {label: '360P 流畅', ext: '.360.mp4'},
    '15': {label: '360P 流畅', ext: '.360LQ.mp4'}
};
var control;
var toolbar;
var playurl;
var player;
var mybox = document.createElement('div')
var thumb = document.createElement('div');
var video = document.createElement('div');
var audio = document.createElement('div');
mybox.appendChild(thumb);
mybox.appendChild(video);
mybox.appendChild(audio);
mybox.className = 'mybox';

var css = document.createElement('style');
css.innerHTML = '.mybox {position: relative; top: -5px; left: 10px; height: 0px; z-index: 99999999;}\
.mybox > div {display: inline-block; margin-left: 3px; vertical-align: top; height: 38px; overflow-y: hidden;}\
.mybox > div:hover {height: max-content;}\
.mybox > div > a {background-color: #c26; color: #fff; display: block; margin-top: 1px; height: 16px; line-height: 16px; padding: 10px; text-align: center;}\
.mybox > div > a:hover {background-color: #26c;}';

var observer = setInterval(() => {
    control = document.querySelector('div.bilibili-player-video-control-wrap') ?? document.querySelector('div.bpx-player-control-wrap');
    toolbar = document.querySelector('#toolbar_module') ?? document.querySelector('#arc_toolbar_report');
    if (control && toolbar) {
        player = document.querySelector('video');
        toolbar.appendChild(mybox);
        toolbar.appendChild(css);
        biliVideoExtractor();
    }
}, 500);

function biliVideoExtractor() {
    player.addEventListener('playing', () => {
        if (extract) {
            if (location.pathname.startsWith('/video/')) {
                title = __INITIAL_STATE__.videoData.title;
                playurl = 'https://api.bilibili.com/x/player/playurl?cid=' + __INITIAL_STATE__.videoData.cid + '&avid=' + __INITIAL_STATE__.videoData.aid + '&fnval=80';
                fetch(playurl, {credentials: 'include'}).then(response => response.json()).then(json => getMediaInfo(json.data.dash));
                thumb.appendChild(createMenuitem('视频封面', __INITIAL_STATE__.videoData.pic, null, title + '.jpg'));
                biliVideoUIWrapper('div.bilibili-player-video-web-fullscreen', 'div.bilibili-player-video-btn-widescreen' , 'closed');
            }
            else {
                title = __INITIAL_STATE__.h1Title;
                playurl = 'https://api.bilibili.com/pgc/player/web/playurl?ep_id=' + __INITIAL_STATE__.epInfo.id + '&fnval=80';
                fetch(playurl, {credentials: 'include'}).then(response => response.json()).then(json => getMediaInfo(json.result.dash));
                thumb.appendChild(createMenuitem('视频封面', __INITIAL_STATE__.epInfo.cover, null, title + '.jpg'));
                biliVideoUIWrapper('div.squirtle-video-pagefullscreen', 'div.squirtle-video-widescreen' , 'active');
            }
            extract = false;
        }
    });
    player.addEventListener('loadstart', () => {
        extract = true;
        thumb.innerHTML = '';
        video.innerHTML = '';
        audio.innerHTML = '';
    });
    clearInterval(observer);
}

function getMediaInfo(json) {
    [...json.video, ...json.audio].forEach(meta => {
        var menu = meta.mimeType.startsWith('video') ? video : audio;
        var {label, ext} = format[meta.id];
        var codec = meta.codecs.slice(0, meta.codecs.indexOf('.'));
        var item = createMenuitem(label, meta.baseUrl, codec, title + '.' + codec + ext);
        menu.appendChild(item);
    });
}

function biliVideoUIWrapper(full, wide, active) {
    var observer = setInterval(() => {
        var full_btn = control.querySelector(full);
        var wide_btn = control.querySelector(wide);
        if (full_btn && wide_btn) {
            full_btn.addEventListener('click', () => { mybox.style.display = full_btn.classList.contains(active) ? 'none' : 'block'; });
            wide_btn.addEventListener('click', () => { mybox.style.display = 'block'; });
            if (!wide_btn.classList.contains(active)) { wide_btn.click(); }
            clearInterval(observer);
        }
    }, 500);
}

function createMenuitem(label, url, codec, filename) {
    var item = document.createElement('a');
    item.href = url;
    item.title = codec === 'avc1' ? '视频编码: H.264' : codec === 'hev1' ? '视频编码: HEVC' : codec === 'mp4a' ? '音频编码: AAC' : codec !== null ? '未知编码: ' + codec : '';
    item.target = '_self';
    item.innerText = label;
    item.download = filename;
    item.addEventListener('click', (event) => {
        if (event.ctrlKey) {
            event.preventDefault();
            navigator.clipboard.writeText(JSON.stringify({url: item.href, filename: item.download, referer: location.href}));
        }
    });
    return item;
}
