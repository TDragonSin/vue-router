let Vue = null;
class VueRouter {
  constructor(options) {
    this.mode = options.mode;
    this.base = options.base;
    this.routes = options.routes;
    this.routesMap = {};
    this.url = new Vue({
      data: {
        current: "/",
      },
    });
    this.init();
  }
  init() {
    this.bindEvent();
    this.createRouteMap();
    this.defineComponent();
  }
  bindEvent() {
    if (this.mode === "hash") {
      window.onload = () => {
        this.handleRedirect();
      };
      window.addEventListener("hashchange", this.onHashChange.bind(this));
    } else if (this.mode === "history") {
      window.onload = () => {
        if (
          this.routesMap[window.location.pathname] &&
          this.routesMap[window.location.pathname].isRed
        ) {
          window.history.replaceState(
            {},
            "",
            this.routesMap[window.location.pathname].path
          );
        }
        this.url.current = window.location.pathname;
      };
      window.addEventListener("popstate", () => {
        this.url.current = window.location.pathname;
      });
    }
  }
  onHashChange() {
    this.handleRedirect();
  }
  createRouteMap() {
    this.routes.forEach((item) => {
      if (item.redirect) {
        let tmpItem = this.routes.find((i) => i.path === item.redirect);
        this.routesMap[item.path] = Object.assign({}, tmpItem);
        this.routesMap[item.path].isRed = true;
      } else {
        this.routesMap[item.path] = item;
      }
    });
    console.log(this.routesMap);
  }
  defineComponent() {
    let getComObj = (that) => {
      let comObj = {
        style: {
          padding: "0 10px",
        },
        attrs: {
          href: this.mode === "hash" ? "#" + that.to : that.to,
        },
      };
      if (this.mode === "history") {
        comObj.on = {
          click: (ev) => {
            ev.preventDefault();
            window.history.pushState({}, "", that.to);
            this.url.current = that.to;
          },
        };
      }
      return comObj;
    };

    Vue.component("router-link", {
      props: {
        to: String,
      },
      render(h) {
        return h("a", getComObj(this), [this.$slots.default]);
      },
    });
    Vue.component("router-view", {
      render: (h) => {
        if (!this.routesMap[this.url.current]) return;
        const Com = this.routesMap[this.url.current].component;
        return h(Com);
      },
    });
  }
  // 这个函数就是为了纠正意外的路径
  handleRedirect() {
    if (!window.location.hash.slice(1)) {
      window.location.hash = "#/";
    }
    this.url.current = window.location.hash.slice(1) || "/";
    if (
      this.routesMap[this.url.current] &&
      this.routesMap[this.url.current].isRed
    ) {
      window.location.hash = "#" + this.routesMap[this.url.current].path;
    }
  }
  // 只实现了一个push
  push(path) {
    if (this.mode === "history") {
      window.history.pushState({}, "", path);
      this.url.current = path;
    } else if (this.mode === "hash") {
      window.location.hash = "#" + path;
      this.url.current = path;
    }
  }
}

VueRouter.install = function(V) {
  Vue = V;
  Vue.mixin({
    created() {
      if (this.$root.$options.router) {
        this.$router = this.$root.$options.router;
      }
    },
  });
};

export default VueRouter;
