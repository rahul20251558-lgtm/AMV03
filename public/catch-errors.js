window.addEventListener('error', function(event) {
  const msg = String(event.error ? event.error.stack || event.error : event.message || '');
  if (msg.includes('WebSocket') || msg.includes('vite') || msg.includes('ResizeObserver loop')) return;
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: msg })
  }).catch(function() {});
});
window.addEventListener('unhandledrejection', function(event) {
  const reason = String(event.reason ? event.reason.stack || event.reason : event.reason || '');
  if (reason.includes('WebSocket') || reason.includes('vite') || reason.includes('ResizeObserver loop')) return;
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: reason })
  }).catch(function() {});
});
