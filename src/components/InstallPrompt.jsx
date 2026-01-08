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
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
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
        const handleAppInstalled = () => {
            setIsInstalled(true)
            setShowPrompt(false)
            setDeferredPrompt(null)
        }
        window.addEventListener('appinstalled', handleAppInstalled)

        // For iOS, show install instructions after delay
        if (isIOSDevice) {
            const lastDismissed = localStorage.getItem('pwa-prompt-dismissed')
            if (!lastDismissed || (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24) > 7) {
                setTimeout(() => setShowPrompt(true), 5000)
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
            window.removeEventListener('appinstalled', handleAppInstalled)
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
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[1000] animate-in slide-in-from-bottom duration-500">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
                {/* Header */}
                <div className="bg-slate-900 p-4 relative">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                            <Download size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Install Nexora</h3>
                            <p className="text-slate-400 text-sm">Get the full app experience</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    {isIOS ? (
                        // iOS Instructions
                        <div>
                            <p className="text-slate-600 text-sm mb-4">
                                Install Nexora on your iPhone for quick access:
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-xs">
                                        1
                                    </div>
                                    <span className="text-slate-700">
                                        Tap the <strong>Share</strong> button
                                        <span className="inline-block ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-xs">⬆️</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-xs">
                                        2
                                    </div>
                                    <span className="text-slate-700">
                                        Scroll and tap <strong>"Add to Home Screen"</strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-xs">
                                        3
                                    </div>
                                    <span className="text-slate-700">
                                        Tap <strong>"Add"</strong> to install
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Android/Desktop prompt
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Check size={16} className="text-emerald-500" />
                                <span className="text-sm text-slate-600">Works offline</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={16} className="text-emerald-500" />
                                <span className="text-sm text-slate-600">Push notifications</span>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <Check size={16} className="text-emerald-500" />
                                <span className="text-sm text-slate-600">Faster than website</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleDismiss}
                            className="flex-1 py-2.5 text-slate-500 font-medium hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                        >
                            Maybe Later
                        </button>
                        {!isIOS && (
                            <button
                                onClick={handleInstall}
                                className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                            >
                                <Download size={16} />
                                Install Now
                            </button>
                        )}
                    </div>

                    {/* Platform indicator */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
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
