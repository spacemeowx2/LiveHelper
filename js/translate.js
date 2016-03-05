(function (){
    'use strict';
    function prefixExp(exp, context) {
        if (typeof exp == 'string') {
            return prefixExp(exp.trim().split(' '), context);
        }
        const ops = {
            '=': [1, (p1) => context.hasOwnProperty(p1)? context[p1]: p1],
            '+': [2, (p1, p2) => parseFloat(p1)+parseFloat(p2)],
            '-': [2, (p1, p2) => p1-p2],
            '*': [2, (p1, p2) => p1*p2],
            '/': [2, (p1, p2) => p1/p2],
            '&': [2, (p1, p2) => p1+p2],
            '<': [2, (p1, p2) => p1<p2],
            '>': [2, (p1, p2) => p1>p2],
            '.': [2, (p1, p2) => p1==p2],
            '[': [1, (p1) => Math.floor(p1)],
            ']': [1, (p1) => Math.ceil(p1)],
            '|': [1, (p1) => Math.round(p1)],
            '#': [1, (p1) => parseFloat(p1)],
            '!': [1, (p1) => !p1],
            '?': [3, (p1,p2,p3) => p1? p2: p3],
        };
        let p0 = exp.shift();
        let ret = p0;
        
        
        if (ops.hasOwnProperty(p0)) {
            let ps = [];
            let op = ops[p0];
            for (let i = 0; i<op[0]; i++) {
                ps[i] = prefixExp(exp, context);
            }
            
            ret = op[1].apply(null, ps);
            //console.log(p0, ps, ret);
        }
        //console.log(p0, exp, ret);
        return ret;
    }
    function getUIJson(locale) {
        return new Promise(function(resolve, reject) {
            var x = new XMLHttpRequest();
            x.open('GET', '_locales/'+locale+'/ui.json');
            x.onload = function () {
                try {
                    resolve(JSON.parse(x.responseText, {}));
                } catch(e) {
                    console.log('ui string wrong');
                    reject(e);
                }
            };
            x.onerror = function () {
                reject(locale);
            };
            try {
                x.send(null);
            } catch(e) {
                reject(e);
            }
        });
    }
    function startTranslate(transText) {
        //var reservedInfo, reservedInfoEnd='<!--}-->';
        var r = /{{(.*?)}}/g;
        
        document.body.innerHTML = document.body.innerHTML.replace(r, function (t, textName) {
            //reservedInfo = '<!--'+t+'{-->';
            //return reservedInfo + transText(textName) + reservedInfoEnd;
            return transText(textName);
        });
        document.title = document.title.replace(r, function (t, textName) {
            return transText(textName);
        });
    }
    function untilFirstResolve(list) {
        return new Promise((resolve, reject) => {
            var itr = list[Symbol.iterator]();
            var v, next;
            next = (e) => {
                v = itr.next()
                if (!v.done) {
                    v.value().then(resolve, next);
                } else {
                    reject();
                }
            };
            next();
        });
    }
    function translate(init_context) {
        if (typeof init_context == 'undefined') {
            init_context = {};
        }
        var lang = chrome.i18n.getUILanguage().replace('-', '_');
        var tryQue = [];
        tryQue.push(lang);
        if (lang.indexOf('_') != -1) {
            tryQue.push(lang.replace(/^(.*?)_(.*?)$/,'$1'));
        }
        tryQue.push('zh_CN');
        //tryQue[0] = 'en';
        var uiJSON, context = {};
        function transText(text) {
            if (typeof text == 'object') {
                context = {};
                //merge
                for (let i in uiJSON) if (uiJSON.hasOwnProperty(i)) {
                    context[i] = uiJSON[i];
                }
                for (let i in text) if (text.hasOwnProperty(i)) {
                    context[i] = text[i];
                }
                return;
            }
            //context = (typeof context == 'undefined')? {}: context;
            var r = /{{(.*?)}}/g;
            var op = text[0];
            var tmpText;
            if (op == '=') {
                text = text.substring(1);
                if (context.hasOwnProperty(text)) {
                    tmpText = context[text];
                } else {
                    return text;
                }
            } else  {
                tmpText = prefixExp(text, context);
                //console.log('pe', op, text, tmpText);
            }
            if (r.test(tmpText)) {
                tmpText = tmpText.replace(r, function (t, textName) {
                    return transText(textName);
                });
            }
            return tmpText;
        };
        
        return untilFirstResolve(tryQue.map(v => () => getUIJson(v) ))
        .then(dict => {
            uiJSON = dict;
            transText(init_context);
            startTranslate(transText);
            return transText;
        })
        .catch(console.log.bind(console));
    }
    window.translate = translate;
})();