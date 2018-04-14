<template>
  <li
    @mouseenter="hoverItem"
    @click.stop="selectOptionClick"
    class="el-select-dropdown__item"
    v-show="visible"
    :class="{
      'selected': itemSelected,
      'is-disabled': disabled || groupDisabled || limitReached,
      'hover': hover
    }">
    <slot>
      <span>{{ currentLabel }}</span>
    </slot>
  </li>
</template>

<script type="text/babel">
  import Emitter from 'element-ui/src/mixins/emitter';
  import { getValueByPath } from 'element-ui/src/utils/util';

  export default {
    mixins: [Emitter],

    name: 'ElOption',

    componentName: 'ElOption',

    inject: ['select'],

    props: {
      value: {
        required: true
      },
      label: [String, Number],
      created: Boolean,
      disabled: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        index: -1,
        groupDisabled: false,
        visible: true,
        // 对应的tag是否需要描边。
        hitState: false,
        hover: false
      };
    },

    computed: {
      // value是否为对象
      isObject() {
        return Object.prototype.toString.call(this.value).toLowerCase() === '[object object]';
      },
      // 选项显示名称，显示label值或value值或空值。
      currentLabel() {
        return this.label || (this.isObject ? '' : this.value);
      },
      // 选项值，为value值或label值或空值。
      currentValue() {
        return this.value || this.label || '';
      },
      // 选中状态判断，单选：与select选中值相等,多选：被select选中值包含。
      itemSelected() {
        if (!this.select.multiple) {
          return this.isEqual(this.value, this.select.value);
        } else {
          return this.contains(this.select.value, this.value);
        }
      },
      // 根据选中数目切换可选性，已被选中项仍可选。
      limitReached() {
        if (this.select.multiple) {
          return !this.itemSelected &&
            (this.select.value || []).length >= this.select.multipleLimit &&
            this.select.multipleLimit > 0;
        } else {
          return false;
        }
      }
    },

    watch: {
      // 由于currentLabel和value改变时，需要重新设置label和value值。
      currentLabel() {
        if (!this.created && !this.select.remote) this.dispatch('ElSelect', 'setSelected');
      },
      value() {
        if (!this.created && !this.select.remote) this.dispatch('ElSelect', 'setSelected');
      }
    },

    methods: {
      // 判断两值是否相同，若两值为对象则用valueKey对应的value进行比较。
      isEqual(a, b) {
        if (!this.isObject) {
          return a === b;
        } else {
          const valueKey = this.select.valueKey;
          return getValueByPath(a, valueKey) === getValueByPath(b, valueKey);
        }
      },
      // 判断是否存在某值，若两值为对象则用valueKey对应的value进行每项比较。
      contains(arr = [], target) {
        if (!this.isObject) {
          return arr.indexOf(target) > -1;
        } else {
          const valueKey = this.select.valueKey;
          return arr.some(item => {
            return getValueByPath(item, valueKey) === getValueByPath(target, valueKey);
          });
        }
      },
      // 根据optionGroup切换groupDisabled
      handleGroupDisabled(val) {
        this.groupDisabled = val;
      },
      // 设置当前选中项
      hoverItem() {
        if (!this.disabled && !this.groupDisabled) {
          this.select.hoverIndex = this.select.options.indexOf(this);
        }
      },
      // 触发选中事件
      selectOptionClick() {
        if (this.disabled !== true && this.groupDisabled !== true) {
          this.dispatch('ElSelect', 'handleOptionClick', this);
        }
      },

      queryChange(query) {
        // query 里如果有正则中的特殊字符，需要先将这些字符转义
        let parsedQuery = String(query).replace(/(\^|\(|\)|\[|\]|\$|\*|\+|\.|\?|\\|\{|\}|\|)/g, '\\$1');
        // 与搜索字段进行不区分大小写匹配，若匹配不上或不可创建新条目，那过滤选项数目减一。
        this.visible = new RegExp(parsedQuery, 'i').test(this.currentLabel) || this.created;
        if (!this.visible) {
          this.select.filteredOptionsCount--;
        }
      }
    },

    created() {
      // 在created阶段将option放进inject进来的select组件中。
      this.select.options.push(this);
      this.select.cachedOptions.push(this);
      this.select.optionsCount++;
      this.select.filteredOptionsCount++;
      // 监听select的搜索输入变化
      this.$on('queryChange', this.queryChange);
      // 监听optionGroup的选项组可用性变化
      this.$on('handleGroupDisabled', this.handleGroupDisabled);
    },
    // option从select.options中移除并减少选项数目和过滤选项数目。
    beforeDestroy() {
      this.select.onOptionDestroy(this.select.options.indexOf(this));
    }
  };
</script>
