import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.setState({ errorInfo })
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
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                        {/* Error Icon */}
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                            <AlertTriangle size={40} className="text-red-500" />
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Oops! Something went wrong
                        </h1>

                        {/* Description */}
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            We're sorry, but something unexpected happened. Don't worry, your data is safe.
                        </p>

                        {/* Error Details (Development only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left border border-slate-200">
                                <p className="text-xs font-mono text-red-600 break-all">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo?.componentStack && (
                                    <details className="mt-2 text-slate-500">
                                        <summary className="text-xs cursor-pointer hover:text-slate-700">
                                            Stack trace
                                        </summary>
                                        <pre className="text-xs mt-2 overflow-auto max-h-40 p-2 bg-slate-100 rounded">
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
                                className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
                            >
                                <Home size={18} />
                                Go Home
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Try Again
                            </button>
                        </div>

                        {/* Support Link */}
                        <p className="mt-6 text-sm text-slate-500">
                            If this keeps happening,{' '}
                            <a
                                href="https://www.linkedin.com/in/selva-kumaran-a6529a321/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium hover:text-blue-700"
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
