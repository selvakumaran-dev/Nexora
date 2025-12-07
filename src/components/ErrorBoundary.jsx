import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to an error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.setState({ errorInfo })

        // In production, you would send this to an error tracking service
        // Example: Sentry.captureException(error);
    }

    handleReload = () => {
        window.location.reload()
    }

    handleGoHome = () => {
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-orange-50/30 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                        {/* Error Icon */}
                        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} className="text-red-500" />
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Oops! Something went wrong
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 mb-6">
                            We're sorry, but something unexpected happened. Don't worry, your data is safe.
                        </p>

                        {/* Error Details (Development only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                <p className="text-xs font-mono text-red-600 break-all">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo?.componentStack && (
                                    <details className="mt-2">
                                        <summary className="text-xs text-gray-500 cursor-pointer">
                                            Stack trace
                                        </summary>
                                        <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-40">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleGoHome}
                                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                <Home size={18} />
                                Go Home
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Try Again
                            </button>
                        </div>

                        {/* Support Link */}
                        <p className="mt-6 text-sm text-gray-500">
                            If this keeps happening,{' '}
                            <a
                                href="https://www.linkedin.com/in/selva-kumaran-a6529a321/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline font-medium"
                            >
                                contact support
                            </a>
                        </p>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
