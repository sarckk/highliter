export const NODE_TYPE_COMMENT = 8;
export const NODE_TYPE_TEXT = 3;
export const NODE_TYPE_ELEMENT = 1;

const DEFAULT_HIGHLIGHT_COLOR = '#FAFF60';
const DEFAULT_HIGHLIGHT_HOVER_COLOR = '#F1F73B';
const DEFAULT_CUSTOM_TAGNAME = 'highlight-snippet';
const DEFAULT_EXCLUDED_ELEMENTS = ['SCRIPT', 'STYLE', 'NOSCRIPT'];

export function generateConfig(userConfig) {
  let elementsToExclude = userConfig.exclude;
  if (!elementsToExclude) {
    elementsToExclude = [];
  }

  if (!Array.isArray(elementsToExclude)) {
    elementsToExclude = [elementsToExclude];
  }

  elementsToExclude = elementsToExclude.map(e => e.toUpperCase());

  const config = {
    originalHighlightColor:
      userConfig.highlightColor || DEFAULT_HIGHLIGHT_COLOR,
    originalHoverColor: userConfig.hoverColor || DEFAULT_HIGHLIGHT_HOVER_COLOR,
    customTagName: userConfig.customTagName || DEFAULT_CUSTOM_TAGNAME,
    exclude: [...elementsToExclude, ...DEFAULT_EXCLUDED_ELEMENTS]
  };

  return config;
}
