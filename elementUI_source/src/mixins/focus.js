// TODO: 对应vnodefocus？vnode可以focus？
export default function(ref) {
    return {
        methods: {
            focus() {
                this.$refs[ref].focus();
            }
        }
    };
};