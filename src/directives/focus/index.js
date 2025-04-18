const focus = (el, binding) => {
  const { value } = binding
  if (value) {
    if (el) {
      const tagName = el.tagName.toLowerCase()
      if (tagName === 'input') {
        setTimeout(() => {
          el.focus();
        }, 0);
      } else {
        const input = el.querySelector('input');
        if (input) {
          setTimeout(() => {
            input.focus();
          }, 0);
        }
      }
    }
  }
}

export default {
  mounted(el, binding) {
    focus(el, binding)
  }
};
