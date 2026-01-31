import { useState, useRef, useEffect } from 'react';
import { MessageSquarePlus, X, Mic, Send, Bug, Lightbulb, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import api from '../lib/api';

declare global {
    interface Window {
        webkitSpeechRecognition: any;
    }
}

export const FeedbackFab = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);
    const { register, handleSubmit, setValue, reset, watch } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const checkConfig = async () => {
            try {
                const { data } = await api.get('/config/features');
                if (data.features?.feedback) {
                    setIsVisible(true);
                }
            } catch (e) {
                console.error('Failed to fetch config', e);
            }
        };
        checkConfig();
    }, []);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            const currentDesc = watch('description') || '';
            setValue('description', currentDesc + (currentDesc ? ' ' : '') + transcript);
        };

        recognition.start();
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const res = await api.post('/feedback', data);
            if (res.data.success) {
                setShowSuccess(res.data.issue_url);
                reset();
                setTimeout(() => {
                    setIsOpen(false);
                    setShowSuccess(null);
                }, 3000);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isVisible) return null;

    return (
        <>
            {/* FAB */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center group"
            >
                <MessageSquarePlus size={24} className="group-hover:animate-pulse" />
                <span className="absolute right-full mr-3 bg-white text-slate-900 px-2 py-1 rounded-md text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Feedback
                </span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-white/20 animate-in zoom-in-95 duration-200 overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100/50 bg-gradient-to-r from-slate-50 to-white">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Send Feedback</h3>
                                <p className="text-xs text-slate-500">Help us improve GrowLog</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {showSuccess ? (
                                <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Feedback Sent!</h4>
                                    <p className="text-slate-500 text-sm mb-4">Thanks for helping us grow.</p>
                                    {showSuccess !== '#' && (
                                        <a href={showSuccess} target="_blank" rel="noreferrer" className="text-green-600 hover:underline text-sm font-medium">
                                            View GitHub Issue
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="cursor-pointer">
                                                <input type="radio" value="enhancement" {...register('label')} className="peer sr-only" defaultChecked />
                                                <div className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-700 transition-all hover:bg-slate-50">
                                                    <Lightbulb size={18} />
                                                    <span className="text-sm font-medium">Idea</span>
                                                </div>
                                            </label>
                                            <label className="cursor-pointer">
                                                <input type="radio" value="bug" {...register('label')} className="peer sr-only" />
                                                <div className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700 transition-all hover:bg-slate-50">
                                                    <Bug size={18} />
                                                    <span className="text-sm font-medium">Bug</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                        <input
                                            {...register('title', { required: true })}
                                            placeholder="What's on your mind?"
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Description</label>
                                            <button
                                                type="button"
                                                onClick={startListening}
                                                className={clsx(
                                                    "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-all",
                                                    isListening ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                )}
                                            >
                                                <Mic size={12} />
                                                {isListening ? 'Listening...' : 'Voice Input'}
                                            </button>
                                        </div>
                                        <textarea
                                            {...register('description', { required: true })}
                                            rows={4}
                                            placeholder="Describe your idea or issue..."
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Submit Feedback
                                                <Send size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
