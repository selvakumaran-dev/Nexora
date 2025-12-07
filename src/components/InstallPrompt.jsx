import React, { useState, useEffect } from 'react'
import { X, Download, Smartphone, Monitor, Check } from 'lucide-react'

export default function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [isInstalled, setIsInstalled] = useState(false)
    const [isIOS, setIsIOS] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
        setIsIOS(isIOSDevice)

        // Listen for the beforeinstallprompt event
        const handleBeforeInstall = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)

            // Check if we should show the prompt (not dismissed recently)
            const lastDismissed = localStorage.getItem('pwa-prompt-dismissed')
            if (lastDismissed) {
                const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)
                if (daysSinceDismissed < 7) {
                    return // Don't show for 7 days after dismiss
                }
            }

            // Show prompt after a delay
            setTimeout(() => setShowPrompt(true), 3000)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true)
            setShowPrompt(false)
            setDeferredPrompt(null)
        })

        // For iOS, show install instructions after delay
        if (isIOSDevice) {
            const lastDismissed = localStorage.getItem('pwa-prompt-dismissed')
            if (!lastDismissed || (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24) > 7) {
                setTimeout(() => setShowPrompt(true), 5000)
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setIsInstalled(true)
        }

        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
    }

    if (!showPrompt || isInstalled) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-orange-400 p-4 relative">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={18} className="text-white" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Download size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Install Nexora</h3>
                            <p className="text-purple-100 text-sm">Get the full app experience</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {isIOS ? (
                        // iOS Instructions
                        <div>
                            <p className="text-gray-600 text-sm mb-4">
                                Install Nexora on your iPhone for quick access:
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                                        1
                                    </div>
                                    <span className="text-gray-700">
                                        Tap the <strong>Share</strong> button
                                        <span className="inline-block ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-xs">⬆️</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                                        2
                                    </div>
                                    <span className="text-gray-700">
                                        Scroll and tap <strong>"Add to Home Screen"</strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                                        3
                                    </div>
                                    <span className="text-gray-700">
                                        Tap <strong>"Add"</strong> to install
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Android/Desktop prompt
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Check size={16} className="text-green-500" />
                                <span className="text-sm text-gray-600">Works offline</span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <Check size={16} className="text-green-500" />
                                <span className="text-sm text-gray-600">Push notifications</span>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <Check size={16} className="text-green-500" />
                                <span className="text-sm text-gray-600">Faster than website</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleDismiss}
                            className="flex-1 py-2.5 text-gray-500 font-medium hover:text-gray-700 transition-colors text-sm"
                        >
                            Maybe Later
                        </button>
                        {!isIOS && (
                            <button
                                onClick={handleInstall}
                                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-orange-400 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
                            >
                                <Download size={16} />
                                Install Now
                            </button>
                        )}
                    </div>

                    {/* Platform indicator */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                        {/Android/i.test(navigator.userAgent) ? (
                            <>
                                <Smartphone size={12} />
                                <span>Android App</span>
                            </>
                        ) : isIOS ? (
                            <>
                                <Smartphone size={12} />
                                <span>iOS App</span>
                            </>
                        ) : (
                            <>
                                <Monitor size={12} />
                                <span>Desktop App</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

