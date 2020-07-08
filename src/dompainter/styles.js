export function initDefaultSnippetStyles() {
  const style = document.createElement('style');
  document.head.appendChild(style);
  style.type = 'text/css';
  style.innerHTML = `
        .highlight-snippet{
            background-color: var(--snippet-highlight-color);
            cursor: pointer;
        } 

        .highlight-hover{
            background-color: var(--snippet-hover-color);
        } 

        .highlight-clicked{
            background-color: var(--snippet-hover-color);
        } 
    `;
}
