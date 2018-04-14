/**
 * @description 递归查找当前组件的对应名称子组件实例并派发对应事件
 * @author JacksonLi
 * @param {any} componentName 组件名通常为options.componentName
 * @param {any} eventName 被派发事件名
 * @param {any} params 派发事件的参数
 */
function broadcast(componentName, eventName, params) {
    this.$children.forEach(child => {
        var name = child.$options.componentName;

        if (name === componentName) {
            child.$emit.apply(child, [eventName].concat(params));
        } else {
            broadcast.apply(child, [componentName, eventName].concat([params]));
        }
    });
}
export default {
    methods: {
        /**
         * @description 查找对应父组件实例并派发对应事件
         * @author JacksonLi
         * @param {any} componentName 组件名通常为options.componentName
         * @param {any} eventName 被派发事件名
         * @param {any} params 派发事件的参数
         */
        dispatch(componentName, eventName, params) {
            var parent = this.$parent || this.$root;
            var name = parent.$options.componentName;

            while (parent && (!name || name !== componentName)) {
                parent = parent.$parent;

                if (parent) {
                    name = parent.$options.componentName;
                }
            }
            if (parent) {
                parent.$emit.apply(parent, [eventName].concat(params));
            }
        },
        broadcast(componentName, eventName, params) {
            broadcast.call(this, componentName, eventName, params);
        }
    }
};