export default {
    data() {
        return {
            // 当前hover的option
            hoverOption: -1
        };
    }, 

    computed: {
        // 判断选项是否全部隐藏
        optionsAllDisabled() {
            return this.options.length === this.options.filter(item => item.disabled === true).length;
        }
    },

    watch: {
        // 方便键盘操作,为hover中的option添加当前hover值
        hoverIndex(val) {
            if (typeof val === 'number' && val > -1) {
                this.hoverOption = this.options[val] || {};
            }
            this.options.forEach(option => {
                option.hover = this.hoverOption === option;
            });
        }
    },

    methods: {
        // 键盘Up/Down 操作 hoverOption，若遇到option为disable状态则跳过该项。
        navigateOptions(direction) {
            if (!this.visible) {
                this.visible = true;
                return;
            }
            if (this.options.length === 0 || this.filteredOptionsCount === 0) return;
            if (!this.optionsAllDisabled) {
                if (direction === 'next') {
                    this.hoverIndex++;
                    if (this.hoverIndex === this.options.length) {
                        this.hoverIndex = 0;
                    }
                } else if (direction === 'prev') {
                    this.hoverIndex--;
                    if (this.hoverIndex < 0) {
                        this.hoverIndex = this.options.length - 1;
                    }
                }
                const option = this.options[this.hoverIndex];
                if (option.disabled === true ||
                    option.groupDisabled === true ||
                    !option.visible) {
                    this.navigateOptions(direction);
                }
            }
            // 滚动到选中选项的位置，若为多选则滚动到距离最远的元素。
            this.$nextTick(() => this.scrollToOption(this.hoverOption));
        }
    }
};