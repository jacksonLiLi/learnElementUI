<template>
  <!-- 过渡动画 -->
  <transition :name="disableTransitions ? '' : 'el-zoom-in-center'">
    <span
      class="el-tag"
      :class="[
        // 主题样式
        type ? 'el-tag--' + type : '',
        // 大小
        tagSize && `el-tag--${tagSize}`,
        // 是否描边
        {'is-hit': hit}
      ]"
      :style="{backgroundColor: color}">
      <slot></slot>
      <i class="el-tag__close el-icon-close"
        v-if="closable"
        @click.stop="handleClose"></i>
    </span>
  </transition>
</template>
<script>
  export default {
    name: 'ElTag',
    props: {
      text: String,
      closable: Boolean,
      type: String,
      hit: Boolean,
      disableTransitions: Boolean,
      color: String,
      size: String
    },
    methods: {
      // 自定义关闭触发事件
      handleClose(event) {
        this.$emit('close', event);
      }
    },
    computed: {
      // 当未设置大小时以全局配置为准。
      tagSize() {
        return this.size || (this.$ELEMENT || {}).size;
      }
    }
  };
</script>
