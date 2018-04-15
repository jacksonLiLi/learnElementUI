import Vue from 'vue';
import merge from 'element-ui/src/utils/merge';
import PopupManager from 'element-ui/src/utils/popup/popup-manager';
import getScrollBarWidth from '../scrollbar-width';
import { getStyle } from '../dom';

let idSeed = 1;
const transitions = [];
// 添加vue全局过渡动画
const hookTransition = (transition) => {
    // TODO: 不理解这句有什么用途?
    if (transitions.indexOf(transition) !== -1) return;

    const getVueInstance = (element) => {
        let instance = element.__vue__;
        if (!instance) {
            const textNode = element.previousSibling;
            if (textNode.__vue__) {
                instance = textNode.__vue__;
            }
        }
        return instance;
    };

    Vue.transition(transition, {
        afterEnter(el) {
            const instance = getVueInstance(el);

            if (instance) {
                instance.doAfterOpen && instance.doAfterOpen();
            }
        },
        afterLeave(el) {
            const instance = getVueInstance(el);

            if (instance) {
                instance.doAfterClose && instance.doAfterClose();
            }
        }
    });
};

let scrollBarWidth;

const getDOM = function(dom) {
    if (dom.nodeType === 3) {
        //nextSibling属性返回元素节点之后的兄弟节点（包括文本节点、注释节点即回车、换行、空格、文本等等）； 
        // nextElementSibling属性只返回元素节点之后的兄弟元素节点（不包括文本节点、注释节点）；
        dom = dom.nextElementSibling || dom.nextSibling;
        getDOM(dom);
    }
    return dom;
};

export default {
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        transition: {
            type: String,
            default: ''
        },
        // 触发方式为 hover 时的显示延迟，单位为毫秒
        openDelay: {},
        closeDelay: {},
        zIndex: {},
        // 是否需要遮罩层
        modal: {
            type: Boolean,
            default: false
        },
        // 是否需要过渡效果
        modalFade: {
            type: Boolean,
            default: true
        },
        modalClass: {},
        modalAppendToBody: {
            type: Boolean,
            default: false
        },
        lockScroll: {
            type: Boolean,
            default: true
        },
        // 按esc关闭最顶部modal
        closeOnPressEscape: {
            type: Boolean,
            default: false
        },
        // 点击遮罩层关闭modal
        closeOnClickModal: {
            type: Boolean,
            default: false
        }
    },

    created() {
        if (this.transition) {
            hookTransition(this.transition);
        }
    },
    // modal标识id
    beforeMount() {
        this._popupId = 'popup-' + idSeed++;
        PopupManager.register(this._popupId, this);
    },
    // 
    beforeDestroy() {
        PopupManager.deregister(this._popupId);
        PopupManager.closeModal(this._popupId);
        // TODO: 这里为什么要这么设置？
        if (this.modal && this.bodyOverflow !== null && this.bodyOverflow !== 'hidden') {
            document.body.style.overflow = this.bodyOverflow;
            document.body.style.paddingRight = this.bodyPaddingRight;
        }
        this.bodyOverflow = null;
        this.bodyPaddingRight = null;
    },

    data() {
        return {
            opened: false,
            bodyOverflow: null,
            bodyPaddingRight: null,
            rendered: false
        };
    },

    watch: {
        visible(val) {
            if (val) {
                if (this._opening) return;
                // TODO: 为什么这里要这样写，rendered是什么意思？和component.vue有关系？
                if (!this.rendered) {
                    this.rendered = true;
                    Vue.nextTick(() => {
                        this.open();
                    });
                } else {
                    this.open();
                }
            } else {
                this.close();
            }
        }
    },

    methods: {
        open(options) {
            if (!this.rendered) {
                this.rendered = true;
            }

            const props = merge({}, this.$props || this, options);

            if (this._closeTimer) {
                clearTimeout(this._closeTimer);
                this._closeTimer = null;
            }
            clearTimeout(this._openTimer);

            const openDelay = Number(props.openDelay);
            if (openDelay > 0) {
                this._openTimer = setTimeout(() => {
                    this._openTimer = null;
                    this.doOpen(props);
                }, openDelay);
            } else {
                this.doOpen(props);
            }
        },

        doOpen(props) {
            if (this.$isServer) return;
            if (this.willOpen && !this.willOpen()) return;
            if (this.opened) return;

            this._opening = true;

            const dom = getDOM(this.$el);

            const modal = props.modal;

            const zIndex = props.zIndex;
            if (zIndex) {
                PopupManager.zIndex = zIndex;
            }

            if (modal) {
                if (this._closing) {
                    PopupManager.closeModal(this._popupId);
                    this._closing = false;
                }
                PopupManager.openModal(this._popupId, PopupManager.nextZIndex(), this.modalAppendToBody ? undefined : dom, props.modalClass, props.modalFade);
                if (props.lockScroll) {
                    if (!this.bodyOverflow) {
                        this.bodyPaddingRight = document.body.style.paddingRight;
                        this.bodyOverflow = document.body.style.overflow;
                    }
                    scrollBarWidth = getScrollBarWidth();
                    let bodyHasOverflow = document.documentElement.clientHeight < document.body.scrollHeight;
                    let bodyOverflowY = getStyle(document.body, 'overflowY');
                    if (scrollBarWidth > 0 && (bodyHasOverflow || bodyOverflowY === 'scroll')) {
                        document.body.style.paddingRight = scrollBarWidth + 'px';
                    }
                    document.body.style.overflow = 'hidden';
                }
            }

            if (getComputedStyle(dom).position === 'static') {
                dom.style.position = 'absolute';
            }

            dom.style.zIndex = PopupManager.nextZIndex();
            this.opened = true;

            this.onOpen && this.onOpen();

            if (!this.transition) {
                this.doAfterOpen();
            }
        },

        doAfterOpen() {
            this._opening = false;
        },

        close() {
            if (this.willClose && !this.willClose()) return;

            if (this._openTimer !== null) {
                clearTimeout(this._openTimer);
                this._openTimer = null;
            }
            clearTimeout(this._closeTimer);

            const closeDelay = Number(this.closeDelay);

            if (closeDelay > 0) {
                this._closeTimer = setTimeout(() => {
                    this._closeTimer = null;
                    this.doClose();
                }, closeDelay);
            } else {
                this.doClose();
            }
        },

        doClose() {
            this._closing = true;

            this.onClose && this.onClose();

            if (this.lockScroll) {
                setTimeout(() => {
                    if (this.modal && this.bodyOverflow !== 'hidden') {
                        document.body.style.overflow = this.bodyOverflow;
                        document.body.style.paddingRight = this.bodyPaddingRight;
                    }
                    this.bodyOverflow = null;
                    this.bodyPaddingRight = null;
                }, 200);
            }

            this.opened = false;

            if (!this.transition) {
                this.doAfterClose();
            }
        },

        doAfterClose() {
            PopupManager.closeModal(this._popupId);
            this._closing = false;
        }
    }
};

export {
    PopupManager
};