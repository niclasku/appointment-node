'use strict';

const store = new Vuex.Store({
  strict: true,
  state: {
    assets: {},
    node_assets: {},
    config: {
      pages: [],
      times: [],
    },
  },
  mutations: {
    init(state, {
      assets,
      node_assets,
      config
    }) {
      state.assets = assets;
      state.node_assets = node_assets;
      state.config = config;
      if (state.config.times == null) {
        state.config.times = [];
      }
      if (state.config.times.length == 0) {
        for (var day = 0; day < 7; day++) {
          for (var hour = 0; hour < 24; hour++) {
            state.config.times.push(true);
          }
        }
      }
    },
    remove_page(state, index) {
      state.config.pages.splice(index, 1);
    },
    create_page(state, index) {
      var new_page = {
        media: "default-content.png",
        layout: "text-delivery",
        config: {},
        schedule: {
          earlierTime: 0,
          laterTime: 0,
        }
      }
      new_page.schedule.earlierTime = moment.utc().tz("Europe/Berlin").add(1, 'days').millisecond(0).second(0).minute(0).hour(0).unix();
      new_page.schedule.laterTime = moment.utc().tz("Europe/Berlin").add(1, 'days').millisecond(0).second(0).minute(59).hour(23).unix();
      if (index != -1) {
        var last_page = state.config.pages[index];
        new_page.media = last_page.media;
        new_page.layout = last_page.layout;
        state.config.pages.splice(index + 1, 0, new_page);
      } else {
        state.config.pages.splice(0, 0, new_page);
      }
    },
    set_header(state, asset_spec) {
      state.config.header = asset_spec;
    },
    set_music(state, asset_spec) {
      state.config.music = asset_spec;
    },
    set_layout(state, {
      index,
      layout
    }) {
      state.config.pages[index].layout = layout;
      if (layout == "text-delivery" || layout == "text-center") {
        state.config.pages[index].media = "default-content.png"
      }
    },
    set_schedule_time(state, {
      index,
      key,
      value
    }) {
      Vue.set(state.config.pages[index].schedule, key, value);
    },
    set_media(state, {
      index,
      media
    }) {
      state.config.pages[index].media = media;
    },
    set_duration(state, {
      index,
      duration
    }) {
      state.config.pages[index].duration = duration;
    },
    set_config(state, {
      index,
      key,
      value
    }) {
      Vue.set(state.config.pages[index].config, key, value);
    },
    set_times(state, {
      hour,
      value
    }) {
      Vue.set(state.config.times, hour, value);
    },
  },

  actions: {
    init(context, values) {
      context.commit('init', values);
    },
    remove_page(context, index) {
      console.log("removing ", index);
      context.commit('remove_page', index);
    },
    create_page(context, index) {
      console.log("appending new page");
      context.commit('create_page', index);
    },
    set_header(context, asset_spec) {
      context.commit('set_header', asset_spec);
    },
    set_music(context, asset_spec) {
      context.commit('set_music', asset_spec);
    },
    set_layout(context, update) {
      context.commit('set_layout', update);
    },
    set_media(context, update) {
      context.commit('set_media', update);
    },
    set_duration(context, update) {
      context.commit('set_duration', update);
    },
    set_schedule_time(context, update) {
      context.commit('set_schedule_time', update);
    },
    set_config(context, update) {
      context.commit('set_config', update);
    },
    set_times(context, update) {
      context.commit('set_times', update);
    },
  }
})

Vue.component('config-ui', {
  template: '#config-ui',
  computed: {
    header() {
      return this.$store.state.config.header;
    },
    music() {
      return this.$store.state.config.music;
    },
    pages() {
      return this.$store.state.config.pages;
    },
  },
  methods: {
    onAdd(index) {
      this.$store.dispatch('create_page', index);
    },
    onHeaderSelected(asset_spec) {
      this.$store.dispatch('set_header', asset_spec);
    },
    onMusicSelected(asset_spec) {
      this.$store.dispatch('set_music', asset_spec);
    },
  }
})

Vue.component('page-ui', {
  template: '#page-ui',
  props: ["page", "index"],
  data: () => ({
    open: false,
    durations: [{
      key: "auto",
      value: "Automatic",
    }, {
      key: "5",
      value: "5 seconds",
    }, {
      key: "10",
      value: "10 seconds",
    }, {
      key: "15",
      value: "15 seconds",
    }, {
      key: "20",
      value: "20 seconds",
    }]
  }),
  methods: {
    onRemove() {
      this.$store.dispatch('remove_page', this.index);
    },
    onScheduleUpdate(key, value) {
      this.$store.dispatch('set_schedule_time', {
        index: this.index,
        key: key,
        value: value,
      });
    },
    onLayoutSelected(layout) {
      this.$store.dispatch('set_layout', {
        index: this.index,
        layout: layout
      });
    },
    onConfigUpdate(key, value) {
      this.$store.dispatch('set_config', {
        index: this.index,
        key: key,
        value: value,
      });
    },
    onDurationChange(evt) {
      this.$store.dispatch('set_duration', {
        index: this.index,
        duration: evt.target.value,
      });
    },
    onMediaUpdate(asset_spec) {
      this.$store.dispatch('set_media', {
        index: this.index,
        media: asset_spec,
      });
    },
    onToggleOpen() {
      this.open = !this.open;
    },
  }
})

Vue.component('page-fullscreen', {
  template: '#page-fullscreen',
  props: ["page"],
  methods: {
    onAssetSelected(asset_spec) {
      this.$emit('mediaUpdated', asset_spec);
    },
  }
})

Vue.component('page-text-center', {
  template: '#page-text-center',
  props: ["page"],
  methods: {
    onAssetSelected(asset_spec) {
      this.$emit('mediaUpdated', asset_spec);
    },
    onUpdateForeground(evt) {
      this.$emit('configUpdated', 'foreground', evt.target.value);
    },
    onUpdateKenBurns(evt) {
      this.$emit('configUpdated', 'kenburns', evt.target.checked);
    },
    onUpdateText(evt) {
      this.$emit('configUpdated', 'text', evt.target.value);
    },
  }
})

Vue.component('page-text-delivery', {
  template: '#page-text-delivery',
  props: ["page"],
  methods: {
    onAssetSelected(asset_spec) {
      this.$emit('mediaUpdated', asset_spec);
    },
    onUpdateForeground(evt) {
      this.$emit('configUpdated', 'foreground', evt.target.value);
    },
    onUpdateKenBurns(evt) {
      this.$emit('configUpdated', 'kenburns', evt.target.checked);
    },
    onUpdateName(evt) {
      this.$emit('configUpdated', 'name', evt.target.value);
    },
    onUpdateModel(evt) {
      this.$emit('configUpdated', 'model', evt.target.value);
    },
  }
})

Vue.component('page-text-right', {
  template: '#page-text-right',
  props: ["page"],
  methods: {
    onAssetSelected(asset_spec) {
      this.$emit('mediaUpdated', asset_spec);
    },
    onUpdateForeground(evt) {
      this.$emit('configUpdated', 'foreground', evt.target.value);
    },
    onUpdateBackground(evt) {
      this.$emit('configUpdated', 'background', evt.target.value);
    },
    onUpdateTitle(evt) {
      this.$emit('configUpdated', 'title', evt.target.value);
    },
    onUpdateKenBurns(evt) {
      this.$emit('configUpdated', 'kenburns', evt.target.checked);
    },
    onUpdateText(evt) {
      this.$emit('configUpdated', 'text', evt.target.value);
    },
  }
})

Vue.component('page-text-left', {
  template: '#page-text-left',
  props: ["page"],
  methods: {
    onAssetSelected(asset_spec) {
      this.$emit('mediaUpdated', asset_spec);
    },
    onUpdateForeground(evt) {
      this.$emit('configUpdated', 'foreground', evt.target.value);
    },
    onUpdateBackground(evt) {
      this.$emit('configUpdated', 'background', evt.target.value);
    },
    onUpdateTitle(evt) {
      this.$emit('configUpdated', 'title', evt.target.value);
    },
    onUpdateKenBurns(evt) {
      this.$emit('configUpdated', 'kenburns', evt.target.checked);
    },
    onUpdateText(evt) {
      this.$emit('configUpdated', 'text', evt.target.value);
    },
  }
})

Vue.component('asset-name', {
  template: '#asset-name',
  props: ["asset_spec"],
  computed: {
    asset_info() {
      var assets = this.$store.state.assets;
      var node_assets = this.$store.state.node_assets;
      var asset = assets[this.asset_spec] || node_assets[this.asset_spec];
      if (asset == null) {
        return "";
      } else {
        return asset.filename;
      }
    }
  },
})

Vue.component('asset-view', {
  template: '#asset-view',
  props: ["asset_spec", "width", "height", "shadow"],
  computed: {
    asset_info() {
      var assets = this.$store.state.assets;
      var node_assets = this.$store.state.node_assets;
      return assets[this.asset_spec] || node_assets[this.asset_spec];
    },
    thumb_url() {
      var info = this.asset_info;
      var w = this.width || 256;
      var h = this.height || 256;
      var max = Math.max(w, h);
      var scale = 1.0;
      if (max > 512) {
        scale = 512 / max;
      }
      w = Math.ceil(w * scale);
      h = Math.ceil(h * scale);
      return info.thumb + '?w=' + w + '&h=' + h + '&crop=none';
    }
  },
})

Vue.component('asset-browser', {
  template: '#asset-browser',
  props: ["asset_spec", "valid", "title", "help"],
  data: () => ({
    sorted: "filename",
    open: false,
    highlight: undefined,
    search: "",
    top: 0,
  }),
  computed: {
    info() {
      if (this.highlight == undefined) {
        return "Click to select an asset";
      } else {
        return this.highlight.filename + " (" + this.highlight.filetype + ")";
      }
    },
    assets() {
      var valid = {};
      for (var v of this.valid.split(",")) {
        valid[v] = true;
      }
      var all_assets = [];

      function add_all(assets) {
        for (var asset_id in assets) {
          var asset = assets[asset_id];
          if (valid[asset.filetype]) {
            all_assets.push({
              id: asset.id,
              thumb: asset.thumb,
              filename: asset.filename,
              filetype: asset.filetype,
              uploaded: asset.uploaded || 0,
            })
          }
        }
      }
      add_all(this.$store.state.assets);
      add_all(this.$store.state.node_assets);
      all_assets.sort({
        filename: function(a, b) {
          var fa = a.filename.toLocaleLowerCase();
          var fb = b.filename.toLocaleLowerCase();
          return fa.localeCompare(fb)
        },
        age: function(a, b) {
          return a.uploaded - b.uploaded
        },
      }[this.sorted]);
      return all_assets;
    }
  },
  methods: {
    onToggleOpen(evt) {
      this.open = !this.open;
      this.top = evt.target.getBoundingClientRect().bottom;
    },
    onClose() {
      this.open = false;
    },
    onSort(sorted) {
      this.sorted = sorted;
    },
    onSelect(asset_spec) {
      this.$emit('assetSelected', asset_spec);
      this.open = false;
    },
    onHighlight(asset_spec) {
      this.highlight = this.$store.state.assets[asset_spec] ||
        this.$store.state.node_assets[asset_spec];
    }
  },
})

Vue.component('schedule-ui', {
  template: '#schedule-ui',
  props: ['schedule'],
  mounted: function() {
    var vm = this
    var earlierComp = $(this.$refs.earlierTime).datetimepicker({
      locale: 'de'
    })
    earlierComp.on('dp.change', function(e) {
      vm.value = e.date;
      vm.$emit('scheduleUpdated', 'earlierTime', e.date.unix());
    })
    var laterComp = $(this.$refs.laterTime).datetimepicker({
      locale: 'de'
    })
    laterComp.on('dp.change', function(e) {
      vm.value = e.date;
      vm.$emit('scheduleUpdated', 'laterTime', e.date.unix());
    })
  },
  computed: {
    earlierString() {
      var time = this.$store.state.config.pages[this.$parent.index].schedule.earlierTime;
      var date = moment.unix(time).tz("Europe/Berlin");
      return date.format("DD.MM.YYYY HH:mm");
    },
    laterString() {
      var time = this.$store.state.config.pages[this.$parent.index].schedule.laterTime;
      var date = moment.unix(time).tz("Europe/Berlin");
      return date.format("DD.MM.YYYY HH:mm");
    },
  }
})

Vue.component('device-schedule', {
  template: '#device-schedule',
  data: function() {
    return {
      update: 0,
      rawHtml: ""
    }
  },
  mounted: function() {
    var vm = this;
    vm.$el.onmouseup = this.bodyMouseUp;
    vm.$el.onmousedown = this.bodyMouseDown;
    vm.$el.onmouseover = this.bodyMouseOver;
  },
  methods: {
    edit_start(hour) {
      this.onoff = !this.$store.state.config.times[hour];
      this.edit_do(hour);
      this.edit = true;
    },
    edit_do(hour) {
      this.$store.dispatch('set_times', {
        hour: hour,
        value: this.onoff,
      });
      this.updateSchedule();
    },
    edit_stop() {
      this.edit = false;
    },
    hour_from_elem(e) {
      return parseInt(e.id.split("-")[1]);
    },
    bodyMouseOver(e) {
      if (!this.edit || e.target.id.split("-")[0] != "hour") return;
      var hour = this.hour_from_elem(e.target);
      this.edit_do(hour);
    },
    bodyMouseDown(e) {
      if (e.target.id.split("-")[0] != "hour") return;
      var hour = this.hour_from_elem(e.target);
      this.edit_start(hour);
    },
    bodyMouseUp() {
      this.edit_stop();
    },
    updateSchedule() {
      if (this.update = 1)
        this.update = 2;
      else
        this.update = 1;
    },
    createSchedule() {
      var html = document.createElement("div");
      var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      for (var hour = 0; hour < 168; hour++) {
        var active = this.$store.state.config.times[hour];
        if (hour % 24 == 0) {
          var day_div = document.createElement("div");
          var day_txt = document.createTextNode(days[Math.floor(hour / 24)]);
          day_div.appendChild(day_txt);
          day_div.className = "sch-day";
          html.appendChild(day_div);
        }
        var hour_div = document.createElement("div");
        var hour_txt = document.createTextNode(hour % 24);
        hour_div.appendChild(hour_txt);
        hour_div.id = "hour-" + hour;
        if (active)
          hour_div.className = "sch-hour" + " active";
        else
          hour_div.className = "sch-hour";
        html.appendChild(hour_div);
        if (hour % 24 == 23) {
          var br = document.createElement("br");
          html.appendChild(br);
        }
      }
      this.rawHtml = html.innerHTML;
    }
  },
  created: function() {
    this.$store.watch(
      function(state) {
        return state.config.times;
      },
      this.updateSchedule, {
        deep: true
      }
    );
  },
  watch: {
    update: {
      handler: function(val) {
        this.createSchedule();
      },
      deep: true,
      immediate: true
    }
  }
})

Vue.component('layout-select', {
  template: '#layout-select',
  props: ['layout'],
  data: () => ({
    options: [{
      value: "text-delivery",
      text: "Delivery Text",
    }, {
      value: "text-center",
      text: "Centered Text",
    }, {
      value: "fullscreen",
      text: "Fullscreen",
    }, {
      value: "text-left",
      text: "Text on left side",
    }, {
      value: "text-right",
      text: "Text on right side",
    }]
  }),
  methods: {
    onSelect(evt) {
      this.$emit('layoutSelected', evt.target.value);
    },
  }
})

const app = new Vue({
  el: "#app",
  store,
})

ib.setDefaultStyle();
ib.ready.then(() => {
  store.dispatch('init', {
    assets: ib.assets,
    node_assets: ib.node_assets,
    config: ib.config,
  })
  store.subscribe((mutation, state) => {
    ib.setConfig(state.config);
  })
})
