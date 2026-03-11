// Minimal Quill-compatible shim to avoid slow/blocked CDN loads.
// It supports the small subset used by admin pages in this project:
// - new Quill(selector, { ... })
// - instance.root.innerHTML get/set
// - instance.setContents([]) to clear
// - instance.getText() basic
//
// This is not full Quill. It provides a fast, local rich-text editor fallback.

(function () {
  if (window.Quill) return;

  function resolveEl(target) {
    if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (!el) throw new Error(`Quill shim: element not found for selector ${target}`);
      return el;
    }
    return target;
  }

  class QuillShim {
    constructor(target, options = {}) {
      const container = resolveEl(target);
      this.options = options;

      // Replace container content with a lightweight editor surface.
      container.classList.add('ql-container', 'ql-snow');
      container.innerHTML = '';

      const editor = document.createElement('div');
      editor.className = 'ql-editor';
      editor.setAttribute('contenteditable', 'true');
      editor.setAttribute('role', 'textbox');
      editor.setAttribute('aria-multiline', 'true');
      if (options.placeholder) editor.setAttribute('data-placeholder', options.placeholder);

      container.appendChild(editor);
      this.root = editor;
    }

    setContents(delta) {
      // Admin pages call setContents([]) to clear.
      if (Array.isArray(delta) && delta.length === 0) {
        this.root.innerHTML = '';
        return;
      }
      // Best-effort: if caller passes something else, clear to avoid surprises.
      this.root.innerHTML = '';
    }

    getText() {
      return (this.root.textContent || '').trim();
    }
  }

  window.Quill = QuillShim;
})();

