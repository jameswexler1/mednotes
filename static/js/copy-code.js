document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('pre > code').forEach(block => {
    const btn = document.createElement('button');
    btn.textContent = 'Copy';
    btn.className = 'btn ghost';
    btn.style.float = 'right';
    btn.onclick = () => navigator.clipboard.writeText(block.textContent);
    block.parentElement.insertBefore(btn, block);
  });
});
