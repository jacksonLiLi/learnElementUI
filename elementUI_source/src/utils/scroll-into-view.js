import Vue from 'vue';
// 通过控制scrollTop，滚动到对应元素的位置。
export default function scrollIntoView(container, selected) {
  if (Vue.prototype.$isServer) return;

  if (!selected) {
    container.scrollTop = 0;
    return;
  }

  const top = selected.offsetTop;
  const bottom = selected.offsetTop + selected.offsetHeight;
  const viewRectTop = container.scrollTop;
  const viewRectBottom = viewRectTop + container.clientHeight;
  // 元素在容器顶部溢出，向上滚动到元素位置。
  if (top < viewRectTop) {
    container.scrollTop = top;
    // 元素在容器底部溢出，向下滚动到元素位置。
  } else if (bottom > viewRectBottom) {
    container.scrollTop = bottom - container.clientHeight;
  }
}
