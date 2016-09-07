function getTime() {
  return (new Date).getTime();
}
new Vue({
  el: 'body',
  data: {
    sites: [],
    config: config,
    currentTime: getTime()
  },
  methods: {
    open: function (url) {
      window.open(url);
    },
    getShowTime: function (item) {
      if (!item.beginTime) {
        return custom.trans('=已开播');
      }
      t = (this.currentTime - item.beginTime) / 1000;
      var context = {
        sec: parseInt(t),
        min: parseInt(t / 60),
        hour: parseInt(t / 3600)
      };
      if (t < 60)
        return custom.trans('=刚刚开播', context);
      t /= 60;
      if (t < 10000)
        return custom.trans('=开播_分钟单位', context);
      t /= 60;
      return custom.trans('=开播_小时单位', context);
    }
  },
  ready: function () {
    if (!config.misc.preview) {
      $(document.body).width(400-120);
    } else {
      $(document.body).width(400);
    }
    var self = this;
    setInterval(function () {
      self.currentTime = getTime();
    }, 1000);

    var sites = enabledFetchers().map(function (site) {
      site.ready = false;
      site.stream = [];
      return site;
    });
    var toBottom = function (site) {
      for (var i=0; i<sites.length; i++) {
        if (sites[i] == site) {
          sites.splice(i, 1);
          sites.push(site);
          break;
        }
      }
    };

    var allPromise = sites.map(function (site) {
      return site.getFollowList()
        .then(function (list) {
          if (list.length == 0) {
            toBottom(site);
          }
          list = list.sort( function (a, b) {
            return b.online - a.online;
          });
          site.stream = list;
          site.ready = true;
        }, function (e) {
          toBottom(site)
        })
    });
    Promise.all(allPromise)
      .then(function () {
        Vue.nextTick(function () {
          bindDrag();
        })
      });
    this.sites = sites;
  }
});



function bindDrag() {
  //drag
  var movingNode;
  var floatingNode, offsetX, offsetY;
  var ani = false;
  $('.site-template .site-header').mousedown(function (e) {
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    var self = $(this);
    ani = false;
    movingNode = self.parent();
    self.data('move', true);
    self.data('x', self.offset().left);
    self.data('y', self.offset().top);
    e.preventDefault();
    return false;
  });
  
  $(document).mousemove(function (e) {
      var mt = e.clientY - offsetY;
      if ((!movingNode) || (mt < 0)) {
          return;
      }
      if (!ani) {
          $('.site-template .site-items').slideToggle();
          movingNode.fadeTo('fast', 0);
          floatingNode = movingNode.clone(false);
          floatingNode.css('position', 'absolute');
          floatingNode.appendTo(document.body);
          floatingNode.find('.site-items').remove();
          floatingNode.width(movingNode.width());
          floatingNode.css('left', 0).css('top', e.clientY-offsetY);
          
          ani = true;
      }
      floatingNode.css('top', e.clientY-offsetY)
      var self = movingNode;
      var curIndex = -1;
      var list = $('#list').children();
      $.each(list, function (i, node) {
          node = $(node);
          var t = node.offset().top, h = node.height();
          if ((t-h < mt) && (mt <= t)) {
              curIndex = i;
              return false;
          }
      });
      if (curIndex == -1) {
          movingNode.appendTo($('#list'));
      } else {
          movingNode.insertBefore($(list[curIndex]));
      }
      e.preventDefault();
      return false;
  })
  .mouseup(function (e) {
      if (ani) {
          $('.site-template .site-items').slideToggle();
          movingNode.fadeTo('fast', 1);
          floatingNode.fadeTo('fast', 0, function (){$(this).remove()});
          
          var idList = $.map($('#list').children(), function (node) {
            return $(node).attr('data-id');
          });
          console.log(idList);
          localStorage.idList = JSON.stringify(idList);
      
          ani = false;
      }
      movingNode = false;
      e.preventDefault();
      return false;
      //$('#list .stream-item-template').show();
  });;
}