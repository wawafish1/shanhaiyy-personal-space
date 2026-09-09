const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '打开导航');
    navigation.classList.remove('is-open');
  }
});
let modalState = null;
function restorePage(dialog) {
  if (!modalState || modalState.dialog !== dialog) return;
  const {x, y, trigger} = modalState;
  modalState = null;
  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('--page-scroll-y');
  document.body.style.removeProperty('--page-scroll-x');
  // Native dialog focus restoration must not move the reading position.
  trigger?.focus({preventScroll:true});
  window.scrollTo({left:x, top:y, behavior:'instant'});
}
function openDialog(dialog, trigger) {
  if (!dialog || modalState) return;
  modalState = {dialog, trigger:trigger || document.activeElement, x:window.scrollX, y:window.scrollY};
  // Lock the current view BEFORE showModal can move browser focus/scroll.
  document.body.style.setProperty('--page-scroll-y', `${-modalState.y}px`);
  document.body.style.setProperty('--page-scroll-x', `${-modalState.x}px`);
  document.body.classList.add('modal-open');
  try {
    dialog.showModal();
    // Focus the dialog container so opening it does not paint the close
    // button's keyboard-only focus ring on touch devices.
    dialog.focus?.({preventScroll:true});
    dialog.scrollTop = 0;
  } catch (error) {
    restorePage(dialog);
    throw error;
  }
}
document.querySelectorAll('[data-dialog]').forEach(trigger => {
  trigger.setAttribute('type', 'button');
  trigger.addEventListener('click', event => {
    event.preventDefault();
    openDialog(document.getElementById(trigger.dataset.dialog), trigger);
  });
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => restorePage(dialog));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
});

const workspace = document.querySelector('.workspace-stage');
const workspaceButtons = [...document.querySelectorAll('[data-workspace]')];
function selectWorkspace(name) {
  workspace.dataset.active = name;
  workspaceButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.workspace === name)));
}
workspaceButtons.forEach(button => {
  button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') selectWorkspace(button.dataset.workspace); });
  button.addEventListener('focus', () => selectWorkspace(button.dataset.workspace));
  button.addEventListener('click', () => selectWorkspace(button.dataset.workspace));
});

document.querySelectorAll('[data-gallery]').forEach(root => {
  const stage = root.querySelector('.gallery-stage');
  const slides = [...stage.querySelectorAll('.gallery-slide')];
  let visible = false;
  let down = null;
  let nextAt = performance.now() + 5500;
  const controller = {
    slides, index: 0,
    step(direction) {
      controller.index = (controller.index + direction + slides.length) % slides.length;
      render();
      nextAt = performance.now() + 5500;
    }
  };
  function render() {
    slides.forEach((slide, i) => {
      let offset = (i - controller.index + slides.length) % slides.length;
      if (offset > slides.length / 2) offset -= slides.length;
      slide.style.setProperty('--offset', offset);
      slide.style.setProperty('--side', Math.sign(offset));
      slide.classList.toggle('is-current', offset === 0);
      slide.classList.toggle('is-neighbor', Math.abs(offset) === 1);
      slide.setAttribute('aria-hidden', String(offset !== 0));
      if (visible && Math.abs(offset) <= 1) slide.querySelector('img').loading = 'eager';
    });
    root.dataset.index = String(controller.index);
    root.querySelector('.gallery-label').textContent = slides[controller.index].dataset.caption;
    root.querySelector('.gallery-count').textContent = `${String(controller.index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }
  root.querySelector('[data-prev]').addEventListener('click', () => controller.step(-1));
  root.querySelector('[data-next]').addEventListener('click', () => controller.step(1));
  stage.addEventListener('pointerdown', event => {
    if (event.isPrimary && event.button === 0) down = {x:event.clientX, y:event.clientY, id:event.pointerId};
  });
  stage.addEventListener('pointerup', event => {
    if (!down || event.pointerId !== down.id) return;
    const dx = event.clientX - down.x, dy = event.clientY - down.y;
    down = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      controller.step(dx < 0 ? 1 : -1);
    }
  });
  stage.addEventListener('pointercancel', () => { down = null; });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    nextAt = performance.now() + 5500;
    if (visible) render(); // Prepare neighboring originals before the next transition.
  }, {threshold:.3}).observe(root);
  setInterval(() => {
    if (!visible || document.hidden || document.querySelector('dialog[open]')) return;
    if (performance.now() >= nextAt) controller.step(1);
  }, 500);
  render();
});

document.querySelector('[data-copy]').addEventListener('click', async event => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(event.currentTarget.dataset.copy);
    status.textContent = '微信号已复制';
  } catch {
    status.textContent = '请长按或选中号码复制：15861999754';
  }
});
