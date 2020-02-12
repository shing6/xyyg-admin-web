<template>
  <svg class="svg-icon" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script>
  export default {
    name: 'icon-svg',
    props: {
      iconClass: {
        type: String,
        required: true
      }
    },
    computed: {
      iconName() {
        return `#icon-${this.iconClass}` // 与配置文件的配置格式一致
      }
    }
  }
</script>

<style>
  .svg-icon {
    width: 50px;
    height: 50px;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
</style>
