"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft } from "lucide-react"

interface SharedRideConfirmationPopupProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export function SharedRideConfirmationPopup({ isOpen, onClose, message }: SharedRideConfirmationPopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <button onClick={onClose} className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed</h2>
          </div>
          <div></div>
        </div>

        {/* Message */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap">
            {message}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <Button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 font-semibold rounded-lg"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
