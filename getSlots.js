
/**
 * Get attributes of given node
 * @param children
 * @param Vue
 * @returns {*}
 */
export function getAttributes(children) {
  const attributes = {};

  Array.from(children.attributes).forEach((attribute) => {
    attributes[attribute.nodeName === 'vue-slot' ? 'slot' : attribute.nodeName] = attribute.nodeValue;
  });

  return attributes;
}

/**
 * Get childNodes of an element
 * @param {HTMLElement} element
 * @returns {NodeList}
 */
export function getChildNodes(element) {
  if (element.childNodes.length) return element.childNodes;
  if (element.content && element.content.childNodes && element.content.childNodes.length) {
    return element.content.childNodes;
  }

  const placeholder = document.createElement('div');

  placeholder.innerHTML = element.innerHTML;

  return placeholder.childNodes;
}

/**
 * Get Vue element representing a template for use with slots
 * @param {Function} createElement - createElement function from vm
 * @param {HTMLElement} element - template element
 * @param {Object} elementOptions
 * @returns {VNode}
 */
export function templateElement(createElement,element,elementOptions) {
  const templateChildren = getChildNodes(element);

  const vueTemplateChildren = Array.from(templateChildren).map((child) => {
    // children passed to create element can be a string
    // https://vuejs.org/v2/guide/render-function#createElement-Arguments
    if (child.nodeName === '#text') return child.nodeValue;

    return createElement(child.tagName,{
      attrs: getAttributes(child),
      domProps: {
        innerHTML: child.innerHTML
      }
    });
  });

  elementOptions.slot = element.id;

  return createElement('template',elementOptions,vueTemplateChildren);
}

/**
 * Helper utility returning slots for render function
 * @param children
 * @param createElement
 * @param Vue
 */
export function getSlots(children = [],createElement,isReact = false) {
  const slots = [];
  Array.from(children).forEach((child) => {
    if (child.nodeName === '#text') {
      if (child.nodeValue.trim()) {
        console.log("🚀 ~ file: getSlots.js:75 ~ Array.from ~ child:", child)
        slots.push(isReact ? createElement('span', {}, 'aaa') :createElement('span',child.nodeValue));
      }
    } else if (child.nodeName !== '#comment') {
      const attributes = getAttributes(child);
      const elementOptions = isReact ? {
        ...attributes,
        dangerouslySetInnerHTML: {
          __html: (child.innerHTML === '' ? child.innerText : child.innerHTML)
        }
      } : {
        attrs: attributes,
        domProps: {
          innerHTML: (child.innerHTML === '' ? child.innerText : child.innerHTML)
        }
      };

      console.log(elementOptions)

      if (attributes.slot) {
        if (isReact) {
          elementOptions.children = attributes.slot;
        } else {
          elementOptions.slot = attributes.slot;
        }
        attributes.slot = undefined;
      }

      const slotVueElement = (child.tagName === 'TEMPLATE') ?
        templateElement(createElement,child,elementOptions) :
        isReact ? createElement(child.tagName, {...elementOptions}): createElement(child.tagName,{ ...elementOptions.attrs,...elementOptions.domProps });

      slots.push(slotVueElement);
    }
  });

  return slots;
}