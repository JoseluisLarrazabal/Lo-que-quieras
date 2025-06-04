"use client"

import type { ReactNode } from "react"

interface EmptyStateProps {
  title: string
  description: string
  actionText?: string
  onAction?: () => void
  icon?: ReactNode
}

export default function EmptyState({ title, description, actionText, onAction, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="mb-4">{icon}</div>}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      <p className="text-gray-600 mb-6 max-w-sm">{description}</p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}
