export const DOC = document;

/**
 * Create DOM element node
 * @param  {String} nodeType type of node to create.
 * @param  {Object} props properties and attributes to apply to node.
 * @return {HTMLElement} newly created element.
 */
export const createElement = (nodeType, props) => {
  const domNode = DOC.createElement(nodeType);
  if (props && 'object' === typeof props) {
    for (const prop in props) {
      if (prop === 'html') {
        domNode.innerHTML = props[prop];
      } else if (prop === 'text') {
        domNode.textContent = props[prop];
      } else {
        if (prop.slice(0, 5) === 'aria_' || prop.slice(0, 4) === 'data_') {
          const attr = prop.slice(0, 4) + '-' + prop.slice(5);
          domNode.setAttribute(attr, props[prop]);
        } else {
          domNode.setAttribute(prop, props[prop]);
        }
      }
      // Set attributes on the element if passed
      if (['role', 'aria-label'].includes(prop))
        domNode.setAttribute(prop, props[prop]);
    }
  }
  return domNode;
};
