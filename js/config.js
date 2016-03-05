'use strict';
let options = [
    {
        key: 'misc.notice',
        name: '=有新的主播开始直播时提醒我', //有新的主播开始直播时提醒我
        defValue: true,
        type: 'checkbox'
    },
    {
        key: 'misc.preview',
        name: '=显示缩略图', //显示缩略图
        defValue: true,
        type: 'checkbox'
    },
	{
        key: 'misc.inject',
        name: '=使用无礼物显示的播放器(仅支持熊猫tv)',
        defValue: false,
        type: 'checkbox'
    },
    {
        key: 'misc.queryinterval',
        name: '=后台查询间隔', //后台查询间隔
        defValue: 5,
        type: 'text'
    }
]
for (let site of fetchers) {
    options.push({
        key: 'enabled.' + site.id,
        name: site.name,
        defValue: false,
        type: 'checkbox'
    });
}
function defaultConfig() {
    let defaultConf = {};
    for (let option of options) {
        defaultConf[option.key] = option.defValue;
    }
    return defaultConf;
}
function config(configKey) {
    let savedConfig;
    try {
        savedConfig = JSON.parse(localStorage.config);
        //console.log(options.length , Object.keys(savedConfig).length)
        //TODO
        if (options.length > Object.keys(savedConfig).length) {
            let tmpDef = defaultConfig();
            for (let key of Object.keys(tmpDef)) {
                if (!savedConfig.hasOwnProperty(key)) {
                    savedConfig[key] = tmpDef[key];
                }
            }
            localStorage.config = JSON.stringify(savedConfig);
        }
    } catch (e) {
        console.log('first get, make default options');
        savedConfig = defaultConfig();
        localStorage.config = JSON.stringify(savedConfig);
    }
    
    
    if (typeof configKey == 'undefined') {
        return savedConfig;
    } else {
        return savedConfig[configKey];
    }
}
config.options = options;
//function saveConfig()
window.config = config;