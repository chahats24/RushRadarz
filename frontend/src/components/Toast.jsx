import React, { useEffect } from 'react';

// Toast component
// Props:
// - message: string to display
// - onClose: called when user dismisses
// - duration: number in ms; if null or <= 0, toast will stay until dismissed
// - actionLabel: optional label for a secondary action button
// - onAction: handler for the action button
export default function Toast({ message, onClose, duration = 4000, actionLabel, onAction }) {
  useEffect(() => {
    if (!message) return;
    if (!duration || duration <= 0) return; // don't auto-dismiss when duration is null/0
    const t = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className="bg-white shadow-lg rounded px-4 py-3 flex items-start gap-3 max-w-sm">
        <div className="text-aurora font-semibold">✓</div>
        <div className="flex-1">
          <div className="text-sm text-gray-800">{message}</div>
        </div>
        {actionLabel && onAction && (
          <div>
            <button onClick={() => onAction && onAction()} className="text-sm text-aurora mr-3">{actionLabel}</button>
          </div>
        )}
        <div>
          <button onClick={() => onClose && onClose()} className="text-sm text-gray-500">Dismiss</button>
        </div>
      </div>
    </div>
  );
}
