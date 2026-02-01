import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Form';
import { SliderControl } from '../ui/SliderControl';
import { Ruler, Droplets, Activity, Thermometer, Sun } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface RecordMetricModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plant: any;
}

export const RecordMetricModal = ({ isOpen, onClose, onSuccess, plant }: RecordMetricModalProps) => {
    const { t } = useLanguage();
    const [submitting, setSubmitting] = useState(false);
    const { register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            height_cm: 0,
            ph: 6.0,          // Standard hydro/soil pH
            ec: 1.0,          // Mild nutrient solution
            temperature_c: 24, // Optimal indoor temp (24C ~ 75F)
            humidity_pct: 60, // Good vegetative RH
            light_ppfd: 0,
            notes: '',
            recorded_at: new Date().toISOString().split('T')[0]
        }
    });

    useEffect(() => {
        if (isOpen && plant?.latest_record) {
            const latest = plant.latest_record;
            setValue('height_cm', latest.height_cm ? Number(latest.height_cm) + 1 : 0);
            setValue('ph', latest.ph ? Number(latest.ph) : 6.0);
            setValue('ec', latest.ec ? Number(latest.ec) : 1.0);
            setValue('temperature_c', latest.temperature_c ? Number(latest.temperature_c) : 24);
            setValue('humidity_pct', latest.humidity_pct ? Number(latest.humidity_pct) : 60);
            setValue('light_ppfd', latest.light_ppfd ? Number(latest.light_ppfd) : 0);
        }
    }, [isOpen, plant, setValue]);

    const onSubmit = async (data: any) => {
        if (!plant?.id) return;
        setSubmitting(true);
        try {
            await api.post(`/plants/${plant.id}/metrics`, {
                ...data,
                recorded_at: new Date(data.recorded_at).toISOString()
            });
            onSuccess();
            onClose();
            reset();
        } catch (e) {
            console.error(e);
            alert(t('failed_save_metrics'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${t('record_data')} - ${plant?.name || 'Plant'}`}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
                <input type="hidden" {...register('recorded_at')} />

                <SliderControl
                    label={t('height')}
                    value={watch('height_cm')}
                    onChange={(v) => setValue('height_cm', v)}
                    min={0}
                    max={300}
                    step={0.5}
                    unit="cm"
                    icon={Ruler}
                    colorClass="bg-green-600"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SliderControl
                        label={t('ph_level')}
                        value={watch('ph')}
                        onChange={(v) => setValue('ph', v)}
                        min={4.0}
                        max={9.0}
                        step={0.1}
                        unit="pH"
                        icon={Droplets}
                        colorClass="bg-blue-500"
                    />
                    <SliderControl
                        label={t('ec_ppm')}
                        value={watch('ec')}
                        onChange={(v) => setValue('ec', v)}
                        min={0}
                        max={5.0}
                        step={0.1}
                        unit="mS"
                        icon={Activity}
                        colorClass="bg-purple-500"
                    />
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{t('environment')}</h4>
                    <SliderControl
                        label={t('temperature')}
                        value={watch('temperature_c')}
                        onChange={(v) => setValue('temperature_c', v)}
                        min={10}
                        max={40}
                        step={0.5}
                        unit="°C"
                        icon={Thermometer}
                        colorClass="bg-red-500"
                    />
                    <SliderControl
                        label={t('humidity')}
                        value={watch('humidity_pct')}
                        onChange={(v) => setValue('humidity_pct', v)}
                        min={0}
                        max={100}
                        step={1}
                        unit="%"
                        icon={Droplets}
                        colorClass="bg-cyan-500"
                    />
                    <SliderControl
                        label={t('light_intensity')}
                        value={watch('light_ppfd') || 0}
                        onChange={(v) => setValue('light_ppfd', v)}
                        min={0}
                        max={2000}
                        step={10}
                        unit="µmol"
                        icon={Sun}
                        colorClass="bg-yellow-500"
                    />
                </div>

                <Input
                    label={t('notes')}
                    placeholder="Any observations?"
                    {...register('notes')}
                />

                <div className="pt-2 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">{t('cancel')}</button>
                    <button type="submit" disabled={submitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                        {submitting ? t('saving') : t('save_record')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
