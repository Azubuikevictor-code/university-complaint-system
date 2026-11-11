function renderIcons(root = document) {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: { class: "icon" },
      root,
    });
  }
}

renderIcons();
