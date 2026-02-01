
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Droplets, Scissors } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Form';
import api from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';

interface AddLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    plantId: string;
    onSuccess?: () => void;
    initialType?: string;
}

export const AddLogModal = ({ isOpen, onClose, plantId, onSuccess, initialType = 'NOTE' }: AddLogModalProps) => {
    const { t } = useLanguage();
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            type: initialType,
            title: '',
            content: '',
            logged_at: new Date().toISOString().split('T')[0]
        }
    });

    // Update type when initialType changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setValue('type', initialType);
            // set default date to today
            setValue('logged_at', new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, initialType, setValue]);

    const quickFill = (type: string, titleKey: string, contentKey?: string) => {
        setValue('type', type);
        setValue('title', t(titleKey) || titleKey);
        if (contentKey) setValue('content', t(contentKey) || '');
    };

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            await api.post(`/plants/${plantId}/logs`, {
                ...data,
                logged_at: new Date(data.logged_at).toISOString()
            });
            if (onSuccess) onSuccess();
            onClose();
            reset();
        } catch (e) {
            console.error(e);
            alert(t('failed_add_log'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('new_log_entry')}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Quick Actions */}
                <div className="flex gap-2 mb-2 overflow-x-auto pb-1 hide-scrollbar">
                    <button type="button" onClick={() => quickFill('WATER', 'Watering')} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-blue-100 flex items-center gap-1">
                        <Droplets size={12} /> {t('water')}
                    </button>
                    <button type="button" onClick={() => quickFill('NUTRIENT', 'Feeding')} className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-purple-100 flex items-center gap-1">
                        <Droplets size={12} /> {t('feed')}
                    </button>
                    <button type="button" onClick={() => quickFill('PRUNE', 'Defoliation')} className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-orange-100 flex items-center gap-1">
                        <Scissors size={12} /> {t('prune')}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label={t('type') || 'Type'}
                        {...register('type')}
                        options={[
                            { value: 'NOTE', label: t('type_note') },
                            { value: 'WATER', label: t('type_watering') },
                            { value: 'NUTRIENT', label: t('type_feeding') },
                            { value: 'PRUNE', label: t('type_prune') },
                            { value: 'ISSUE', label: t('type_issue') },
                            { value: 'PHASE_CHANGE', label: t('type_phase_change') }
                        ]}
                    />
                    <Input
                        type="date"
                        label={t('date')}
                        {...register('logged_at')}
                    />
                </div>

                <Input
                    label={t('title_optional')}
                    placeholder={t('log_title_placeholder')}
                    {...register('title')}
                />

                <div className="w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('details') || 'Details'}</label>
                    <textarea
                        {...register('content')}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all h-32 resize-none"
                        placeholder={t('log_details_placeholder')}
                    />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">{t('cancel')}</button>
                    <button type="submit" disabled={submitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                        {submitting ? t('saving') : t('save_entry')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
