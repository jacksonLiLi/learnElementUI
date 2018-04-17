import Vue from 'vue';
import {
    PopupManager
} from 'element-ui/src/utils/popup';

const PopperJS = Vue.prototype.$isServer ? function() {} : require('./popper');
const stop = e => e.stopPropagation();

/**
 * @param {HTMLElement} [reference=$refs.reference] - The reference element used to position the popper.
 * @param {HTMLElement} [popper=$refs.popper] - The HTML element used as popper, or a configuration used to generate the popper.
 * @param {String} [placement=button] - Placement of the popper accepted values: top(-start, -end), right(-start, -end), bottom(-start, -end), left(-start, -end)
 * @param {Number} [offset=0] - Amount of pixels the popper will be shifted (can be negative).
 * @param {Boolean} [visible=false] Visibility of the popup element.
 * @param {Boolean} [visible-arrow=false] Visibility of the arrow, no style.
 */
export default {
    props: {
        transformOrigin: {
            type: [Boolean, String],
            default: true
        },
        placement: {
            type: String,
            default: 'bottom'
        },
        boundariesPadding: {
            type: Number,
            default: 5
        },
        reference: {},
        popper: {},
        offset: {
            default: 0
        },
        value: Boolean,
        visibleArrow: Boolean,
        arrowOffset: {
            type: Number,
            default: 35
        },
        transition: String,
        appendToBody: {
            type: Boolean,
            default: true
        },
        popperOptions: {
            type: Object,
            default () {
                return {
                    gpuAcceleration: false
                };
            }
        }
    },

    data() {
        return {
            showPopper: false,
            currentPlacement: ''
        };
    },

    watch: {
        value: {
            immediate: true,
            handler(val) {
                this.showPopper = val;
                this.$emit('input', val);
            }
        },
        // 更新popper位置或切换位置
        showPopper(val) {
            val ? this.updatePopper() : this.destroyPopper();
            this.$emit('input', val);
        }
    },

    methods: {
        createPopper() {
            if (this.$isServer) return;
            this.currentPlacement = this.currentPlacement || this.placement;
            if (!/^(top|bottom|left|right)(-start|-end)?$/g.test(this.currentPlacement)) {
                return;
            }

            const options = this.popperOptions;
            const popper = this.popperElm = this.popperElm || this.popper || this.$refs.popper;
            let reference = this.referenceElm = this.referenceElm || this.reference || this.$refs.reference;
            // Popover ，提供三种触发方式：`hover`, `click` 和 `focus`。或者通过 `slot` 指定 reference。
            if (!reference &&
                this.$slots.reference &&
                this.$slots.reference[0]) {
                reference = this.referenceElm = this.$slots.reference[0].elm;
            }

            if (!popper || !reference) return;
            if (this.visibleArrow) this.appendArrow(popper);
            if (this.appendToBody) document.body.appendChild(this.popperElm);
            // 显式调用destroy则执行destroy
            if (this.popperJS && this.popperJS.destroy) {
                this.popperJS.destroy();
            } 

            options.placement = this.currentPlacement;
            options.offset = this.offset;
            options.arrowOffset = this.arrowOffset;
            this.popperJS = new PopperJS(reference, popper, options);
            this.popperJS.onCreate(_ => {
                this.$emit('created', this);
                this.resetTransformOrigin();
                this.$nextTick(this.updatePopper);
            });
            // 如果有自定义update则执行回调
            if (typeof options.onUpdate === 'function') {
                this.popperJS.onUpdate(options.onUpdate);
            }
            // 若已存在一个popper则另外一个popper的zIndex++1
            this.popperJS._popper.style.zIndex = PopupManager.nextZIndex();
            this.popperElm.addEventListener('click', stop);
        },

        updatePopper() {
            const popperJS = this.popperJS;
            if (popperJS) {
                popperJS.update();
                // 若已存在一个popper则另外一个popper的zIndex++1
                if (popperJS._popper) {
                    popperJS._popper.style.zIndex = PopupManager.nextZIndex();
                }
            } else {
                this.createPopper();
            }
        },

        doDestroy(forceDestroy) {
            /* istanbul ignore if */
            if (!this.popperJS || (this.showPopper && !forceDestroy)) return;
            this.popperJS.destroy();
            this.popperJS = null;
        },

        destroyPopper() {
            if (this.popperJS) {
                this.resetTransformOrigin();
            }
        },

        resetTransformOrigin() {
            if (!this.transformOrigin) return;
            let placementMap = {
                top: 'bottom',
                bottom: 'top',
                left: 'right',
                right: 'left'
            };
            let placement = this.popperJS._popper.getAttribute('x-placement').split('-')[0];
            let origin = placementMap[placement];
            this.popperJS._popper.style.transformOrigin = typeof this.transformOrigin === 'string' ?
                this.transformOrigin : ['top', 'bottom'].indexOf(placement) > -1 ? `center ${ origin }` : `${ origin } center`;
        },
        // 构造下拉浮动箭头并剔除v- 开头属性
        appendArrow(element) {
            let hash;
            if (this.appended) {
                return;
            }

            this.appended = true;
            // TODO: 这里为什么要去除v-开头的属性
            for (let item in element.attributes) {
                if (/^_v-/.test(element.attributes[item].name)) {
                    hash = element.attributes[item].name;
                    break;
                }
            }

            const arrow = document.createElement('div');

            if (hash) {
                arrow.setAttribute(hash, '');
            }
            arrow.setAttribute('x-arrow', '');
            arrow.className = 'popper__arrow';
            element.appendChild(arrow);
        }
    },

    beforeDestroy() {
        this.doDestroy(true);
        if (this.popperElm && this.popperElm.parentNode === document.body) {
            this.popperElm.removeEventListener('click', stop);
            document.body.removeChild(this.popperElm);
        }
    },

    // call destroy in keep-alive mode
    // 解决keepAlive 没销毁问题
    deactivated() {
        this.$options.beforeDestroy[0].call(this);
    }
};