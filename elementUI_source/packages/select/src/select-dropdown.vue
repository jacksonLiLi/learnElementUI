<template>
  <div
    class="el-select-dropdown el-popper"
    :class="[{ 'is-multiple': $parent.multiple }, popperClass]"
    :style="{ minWidth: minWidth }">
    <slot></slot>
  </div>
</template>

<script type="text/babel">
  import Popper from 'element-ui/src/utils/vue-popper';

  export default {  
    name: 'ElSelectDropdown',

    componentName: 'ElSelectDropdown',

    mixins: [Popper],

    props: {
      placement: {
        default: 'bottom-start'
      },

      boundariesPadding: {
        default: 0
      },

      popperOptions: {
        default() {
          return {
            gpuAcceleration: false
          };
        }
      },

      visibleArrow: {
        default: true
      },

      appendToBody: {
        type: Boolean,
        default: true
      }
    },

    data() {
      return {
        minWidth: ''
      };
    },

    computed: {
      // 弹出菜单的自定义类名
      popperClass() {
        return this.$parent.popperClass;
      }
    },

    watch: {
      // 咦...这里不会耦合吗，emit不好吗
      '$parent.inputWidth'() {
        this.minWidth = this.$parent.$el.getBoundingClientRect().width + 'px';
      }
    },

    mounted() {
      // 为popper设定reference（定位依据）和popper自身
      this.referenceElm = this.$parent.$refs.reference.$el;
      this.$parent.popperElm = this.popperElm = this.$el;
      this.$on('updatePopper', () => {
        if (this.$parent.visible) this.updatePopper();
      });
      this.$on('destroyPopper', this.destroyPopper);
    }
  };
</script>
