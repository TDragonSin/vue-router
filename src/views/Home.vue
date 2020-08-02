<template>
  <div>
    <h1>首页</h1>
    <button @click="goCate">跳转列表页</button>
  </div>
</template>

<script>
export default {
  methods: {
    goCate() {
      this.$router.push("/cate");
    },
  },
};
</script>

<style>
</style>