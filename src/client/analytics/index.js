// From https://gist.github.com/idarek/9ade69ac2a2ef00d98ab950426af5791

// Version 1.09.1.21062022

// Changelog:
// 1.09.1
// - minor changes of single quote in code (') to double quote (").
// 1.09
// - add listener for 90% scroll event. When user scrol to 90%+ of the page then script is fired again with scroll even and then (listener) terminates.
// - Specified global parameters and small tweak in search event.
// 1.08
// - replaced VAR with LET and moved new URLSearchParams, as caused issues when minified
// - changed Minified version from minify-js.com to go.tacodewolff.nl/minify as caused issues with higher number of new users than users
// 1.07
// - added event parameter (search_term) when tracking search via view_search_results event
// -- commented gtmId as currently not in use, hidden from minified version
// 1.06
// - added event identification when page view is a search to set as view_search_results, in other case page_view
// 1.05
// - Added _fv (first_visit indicator) based on cid_v4 in local storage for identification of returning users
// - Corrected (sr) screen resolution retection to include device Pixel ration (like Retina)
// - gtm - value convert to lower case
// - gtm - Google Tag Manager (GTM) Hash Info. If the current hit is coming was generated from GTM, it will contain a hash of current GTM/GTAG config
// 1.04
// - start new session (_ss) only when it is real new session (store session in sessionStorage); revert cid generation to previous method and store under cid_v4 to do not cause an issue when using minimal UA(v3) with this code.
// 1.03
// - split cid generation into two parts and combine at later stage
// 1.02
// - corrected generation of cid
// 1.01
// - changed method for generating _p, cid & sid
// 1.00
// - first release

enScroll = false;
const lStor = localStorage;
const sStor = sessionStorage;
const doc = document;
const docEl = document.documentElement;
const docBody = document.body;
const docLoc = document.location;
const w = window;
const s = screen;
const nav = navigator || {};

function a() {
  // debug options to clean cache
  // localStorage.clear();
  // sessionStorage.clear();

  const trackingId = 'G-HM9ZQSJVNZ'; // set here your Measurement ID for GA4 / Stream ID

  // gmt > If the current hit is coming was generated from GTM, it will contain a hash of current GTM/GTAG config, example: 2oear0
  // Currently not in use, leave XXXXXX , under investigation
  // let gtmId = "XXXXXX";
  // if (gtmId == "XXXXXX") {
  //    let gtmId = undefined;
  // }
  // else {
  //    let gtmId = gtmId.toLowerCase();
  // }

  // 10-ish digit number generator
  const generateId = () => Math.floor(Math.random() * 1000000000) + 1;
  // UNIX datetime generator
  const dategenId = () => Math.floor(Date.now() / 1000);

  const _pId = () => {
    if (!sStor._p) {
      sStor._p = generateId();
    }
    return sStor._p;
  };

  const generatecidId = () => generateId() + '.' + dategenId();
  const cidId = () => {
    if (!lStor.cid_v4) {
      lStor.cid_v4 = generatecidId();
    }
    return lStor.cid_v4;
  };

  const cidCheck = lStor.getItem('cid_v4');
  const _fvId = () => {
    if (cidCheck) {
      return undefined;
    } else if (enScroll == true) {
      return undefined;
    } else {
      return '1';
    }
  };

  const sidId = () => {
    if (!sStor.sid) {
      sStor.sid = dategenId();
    }
    return sStor.sid;
  };

  const _ssId = () => {
    if (!sStor._ss) {
      sStor._ss = '1';
      return sStor._ss;
    } else if (sStor.getItem('_ss') == '1') {
      return undefined;
    }
  };

  const generatesctId = '1';
  const sctId = () => {
    if (!sStor.sct) {
      sStor.sct = generatesctId;
    } else if (enScroll == true) {
      return sStor.sct;
    } else {
      x = +sStor.getItem('sct') + +generatesctId;
      sStor.sct = x;
    }
    return sStor.sct;
  };

  // Default GA4 Search Term Query Parameter: q,s,search,query,keyword
  const searchString = docLoc.search;
  const searchParams = new URLSearchParams(searchString);
  //const searchString = "?search1=test&query1=1234&s=dsf"; // test search string
  const sT = ['q', 's', 'search', 'query', 'keyword'];
  const sR = sT.some(
    (si) =>
      searchString.includes('&' + si + '=') ||
      searchString.includes('?' + si + '='),
  );

  const eventId = () => {
    if (sR == true) {
      return 'view_search_results';
    } else if (enScroll == true) {
      return 'scroll';
    } else {
      return 'page_view';
    }
  };

  const eventParaId = () => {
    if (enScroll == true) {
      return '90';
    } else {
      return undefined;
    }
  };

  // get search_term
  const searchId = () => {
    if (eventId() == 'view_search_results') {
      //Iterate the search parameters.
      for (let p of searchParams) {
        //console.log(p); // for debuging
        if (sT.includes(p[0])) {
          return p[1];
        }
      }
    } else {
      return undefined;
    }
  };

  const encode = encodeURIComponent;
  const serialize = (obj) => {
    let str = [];
    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        if (obj[p] !== undefined) {
          str.push(encode(p) + '=' + encode(obj[p]));
        }
      }
    }
    return str.join('&');
  };

  const debug = false; // enable analytics debuging

  // url
  const url = 'https://www.google-analytics.com/g/collect';
  // payload
  const data = serialize({
    v: '2', // Measurement Protocol Version 2 for GA4
    tid: trackingId, // Measurement ID for GA4 or Stream ID
    //gtm: gtmId, // Google Tag Manager (GTM) Hash Info. If the current hit is coming was generated from GTM, it will contain a hash of current GTM/GTAG config (not in use, currently under investigation)
    _p: _pId(), // random number, hold in sessionStorage, unknown use
    sr: (
      s.width * w.devicePixelRatio +
      'x' +
      s.height * w.devicePixelRatio
    ).toString(), // Screen Resolution
    ul: (nav.language || undefined).toLowerCase(), // User Language
    cid: cidId(), // client ID, hold in localStorage
    _fv: _fvId(), // first_visit, identify returning users based on existance of client ID in localStorage
    _s: '1', // session hits counter
    dl: docLoc.origin + docLoc.pathname + searchString, // Document location
    dt: doc.title || undefined, // document title
    dr: doc.referrer || undefined, // document referrer
    sid: sidId(), // session ID random generated, hold in sessionStorage
    sct: sctId(), // session count for a user, increase +1 in new interaction
    seg: '1', // session engaged (interacted for at least 10 seconds), assume yes
    en: eventId(), // event like page_view, view_search_results or scroll
    'epn.percent_scrolled': eventParaId(), // event parameter, used for scroll event
    'ep.search_term': searchId(), // search_term reported for view_search_results from search parameter
    _ss: _ssId(), // session_start, new session start
    _dbg: debug ? 1 : undefined, // console debug
  });

  const fullurl = url + '?' + data;

  // for debug purposes
  // console.log(data);
  // console.log(url, data);
  // console.log(fullurl);

  if (nav.sendBeacon) {
    nav.sendBeacon(fullurl);
  } else {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', fullurl, true);
  }
}
a();

// Scroll Percent
function sPr() {
  return (
    ((docEl.scrollTop || docBody.scrollTop) /
      ((docEl.scrollHeight || docBody.scrollHeight) - docEl.clientHeight)) *
    100
  );
}
// add scroll listener
doc.addEventListener('scroll', sEv, { passive: true });

// scroll Event
function sEv() {
  const percentage = sPr();

  if (percentage < 90) {
    return;
  }
  enScroll = true;
  // fire analytics script
  a();
  // remove scroll listener
  doc.removeEventListener('scroll', sEv, { passive: true });
}
