import chroma from 'chroma-js';

function getSnippetsByDataId(id) {
  return document.querySelectorAll(`[data-highlight-id='${id}']`);
}

function generateColorOptions() {
  const colors = ['#F7A586', '#FAFD22', '#9BEBAA', '#9BC1EB'];
  const options = document.createElement('div');
  options.classList.add('highlight-menu-options');
  for (let i = 0; i < 4; i += 1) {
    const optionWrapper = document.createElement('div');
    optionWrapper.classList.add('highlight-option-wrapper');

    const option = document.createElement('div');
    option.classList.add('highlight-option');
    option.setAttribute('data-color', colors[i]);
    option.style.backgroundColor = colors[i];
    option.style.borderColor = chroma(colors[i])
      .darken(0.3)
      .hex();

    optionWrapper.append(option);
    options.append(optionWrapper);
  }

  return options;
}

function prepareMenu() {
  const highlightMenu = document.createElement('div');
  highlightMenu.classList.add('highlight-menu-container');

  const pointer = document.createElement('div');
  pointer.classList.add('highlight-menu-pointer');
  highlightMenu.append(pointer);

  const options = generateColorOptions();
  highlightMenu.append(options);

  return { highlightMenu, pointer };
}

export { getSnippetsByDataId, prepareMenu };
