'use strict';
let optionNodes = [];
let categories = {
    enabled: {
        name: '模块',
        description: '启用想要关注的网站',
        listNodeSr: '#mods'
    },
    misc: {
        name: '杂项',
        description: false,
        listNodeSr: '#misc'
    }
};
function saveOptions() {
    let tmpConfig = {};
    for (let node of optionNodes) {
        tmpConfig[node.data('configKey')] = node.getValue();
    }
    localStorage.config = JSON.stringify(tmpConfig);
    console.log('saved', tmpConfig);
}
function loadOptions() {
    let savedConfig;
    savedConfig = config();
    console.log(savedConfig)
    for (let node of optionNodes) {
        if (savedConfig.hasOwnProperty(node.data('configKey'))) {
            //TODO
        }
        let value = savedConfig[node.data('configKey')];
                //console.log(node,value)
        node.setValue(value);
    }
}

function addCheckBox(id, name, list) {
    let node = $('#templates .checkOption').clone(true);
    node.find('span').text(name);
    node.data('configKey', id);
    let inputNode = node.find('input');
    
    node.setValue = (v) => {
        inputNode.prop('checked', v);
    };
    node.getValue = () => inputNode.prop('checked');
    optionNodes.push(node);
    node.appendTo(list);
}

$(document).ready(() => {
    translate()
    .then((transText) => {
        window._ = transText;
        options.forEach(i => i.name = _(i.name));
    })
    .then(() => {
        // make bind
        $('#templates .checkOption').click( (e) => saveOptions() );
        let $queryInterval;
        $queryInterval = $('#queryInterval');
        $queryInterval.bind("change", (e) => {//input propertychange
            //TODO
            if (!$queryInterval.check()) {
                $queryInterval.setValue($queryInterval.lastVal);
            } else {
                $queryInterval.lastVal = $queryInterval.getValue();
                saveOptions();
            }
        });
        $queryInterval.data('configKey', 'misc.queryinterval');
        $queryInterval.setValue = (v) => {
            $queryInterval.val(v);
        };
        $queryInterval.getValue = () => $queryInterval.val();
        $queryInterval.check = () => {
            let tmpValue = parseInt($queryInterval.getValue());
            return (0 < tmpValue);
        };
        optionNodes.push($queryInterval);
    })
    .then(() => { //init ui
        config.options.forEach( opt => {
            if (opt.type == 'checkbox') {
                let cateName = opt.key.replace(/^(.*?)\..*$/, '$1');
                addCheckBox(opt.key, opt.name, $(categories[cateName].listNodeSr));
            }
            
        });
    })
    .then(loadOptions)
    .then(() => {
        for (let node of optionNodes) {
            node.lastVal = node.getValue();
        }
    });
});