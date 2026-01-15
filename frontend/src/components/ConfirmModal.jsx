function ConfirmModal({ message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) {
  const bgColor = {
    danger: 'bg-red-500/20 border-red-500/50',
    warning: 'bg-yellow-500/20 border-yellow-500/50',
    info: 'bg-blue-500/20 border-blue-500/50',
  }[type] || 'bg-yellow-500/20 border-yellow-500/50';

  const buttonColor = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    info: 'bg-blue-500 hover:bg-blue-600',
  }[type] || 'bg-yellow-500 hover:bg-yellow-600';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-bg-card border border-border p-4 sm:p-6 rounded-2xl w-full max-w-md shadow-2xl my-auto">
        <div className={`${bgColor} border rounded-lg p-4 mb-4`}>
          <p className="text-text-primary">{message}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 ${buttonColor} text-white rounded-lg transition font-medium`}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-bg-hover border border-border text-text-primary rounded-lg hover:bg-bg-card transition"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
