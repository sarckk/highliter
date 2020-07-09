export const NODE_TYPE_COMMENT = 8;
export const NODE_TYPE_TEXT = 3;
export const NODE_TYPE_ELEMENT = 1;
export const DEFAULT_HIGHLIGHT_COLOR = '#FAFF60';
export const DEFAULT_HIGHLIGHT_HOVER_COLOR = '#F1F73B';
export const DEFAULT_SNIPPET_TAGNAME = 'highlight-snippet';

export function generateConfig(userCfg) {
  const defaultCfg = {
    originalHighlightColor: userCfg.highlightColor || DEFAULT_HIGHLIGHT_COLOR,
    originalHoverColor: userCfg.hoverColor || DEFAULT_HIGHLIGHT_HOVER_COLOR,
    snippetTagName: userCfg.snippetTagName || DEFAULT_SNIPPET_TAGNAME
  };

  return {
    ...defaultCfg,
    ...userCfg
  };
}
