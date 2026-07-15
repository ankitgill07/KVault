import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDanger = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-zinc-950 p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl flex-shrink-0 ${isDanger ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' : 'bg-violet-50 dark:bg-violet-950/30 text-brand-purple'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div className="flex-1 space-y-2 text-left">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {message}
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg cursor-pointer ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-600/10' 
                : 'bg-brand-purple hover:bg-brand-purple/95 hover:shadow-violet-600/10'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
