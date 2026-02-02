
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Plus, Ruler, Thermometer, Droplets, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Form';
import { useForm } from 'react-hook-form';
import { SliderControl } from '../ui/SliderControl';
import clsx from 'clsx';
import { useLanguage } from '../../context/LanguageContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface PlantMetricsProps {
    plantId: string;
}

export const PlantMetrics = ({ plantId }: PlantMetricsProps) => {
    const [metrics, setMetrics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeChart, setActiveChart] = useState<'height' | 'ph' | 'ec' | 'environment'>('height');
    const { t } = useLanguage();

    const { register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            height_cm: 0,
            node_count: 0,
            ph: 6.0,          // Standard hydro/soil pH
            ec: 1.0,          // Mild nutrient solution
            temperature_c: 24, // Optimal indoor temp
            humidity_pct: 60, // Good vegetative RH
            notes: '',
            recorded_at: new Date().toISOString().split('T')[0]
        }
    });

    const fetchMetrics = async () => {
        try {
            const res = await api.get(`/plants/${plantId}/metrics`);
            setMetrics(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, [plantId]);

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            await api.post(`/plants/${plantId}/metrics`, {
                ...data,
                recorded_at: new Date(data.recorded_at).toISOString()
            });
            await fetchMetrics();
            setIsModalOpen(false);
            reset();
        } catch (e) {
            console.error(e);
            alert(t('failed_save_metrics'));
        } finally {
            setSubmitting(false);
        }
    };

    // Smart Defaults: Pre-fill form with last recorded values
    useEffect(() => {
        if (isModalOpen && metrics.length > 0) {
            const latest = metrics[metrics.length - 1];
            if (latest) {
                setValue('height_cm', latest.height_cm ? Number(latest.height_cm) + 1 : 0);
                setValue('node_count', latest.node_count ? Number(latest.node_count) : 0);
                setValue('ph', latest.ph ? Number(latest.ph) : 6.0);
                setValue('ec', latest.ec ? Number(latest.ec) : 1.0);
                setValue('temperature_c', latest.temperature_c ? Number(latest.temperature_c) : 24);
                setValue('humidity_pct', latest.humidity_pct ? Number(latest.humidity_pct) : 60);
                // Recorded_at stays default (today)
            }
        }
    }, [isModalOpen, metrics, setValue]);

    const formatDate = (dateStr: string) => format(new Date(dateStr), 'MMM d');

    if (loading) return <div className="py-20"><LoadingSpinner message={t('loading_metrics')} /></div>;

    const hasData = metrics.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-slate-900">{t('growth_metrics')}</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus size={16} />
                    <span>{t('record_data')}</span>
                </button>
            </div>

            {!hasData ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <Activity size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="font-medium text-slate-600">{t('no_metrics_yet')}</p>
                    <p className="text-sm text-slate-400 mt-1">{t('track_metrics_hint')}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Chart Selector */}
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        <ChartTab
                            active={activeChart === 'height'}
                            onClick={() => setActiveChart('height')}
                            label={t('height')}
                            icon={Ruler}
                        />
                        <ChartTab
                            active={activeChart === 'ph'}
                            onClick={() => setActiveChart('ph')}
                            label={t('ph_level')}
                            icon={Droplets}
                        />
                        <ChartTab
                            active={activeChart === 'ec'}
                            onClick={() => setActiveChart('ec')}
                            label={t('ec_ppm')}
                            icon={Activity}
                        />
                        <ChartTab
                            active={activeChart === 'environment'}
                            onClick={() => setActiveChart('environment')}
                            label={t('environment')}
                            icon={Thermometer}
                        />
                    </div>

                    {/* Chart Area */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="recorded_at"
                                    tickFormatter={formatDate}
                                    stroke="#94a3b8"
                                    fontSize={12}
                                />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                                />
                                <Legend />

                                {activeChart === 'height' && (
                                    <Line type="monotone" dataKey="height_cm" name={t('height') + " (cm)"} stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                )}
                                {activeChart === 'ph' && (
                                    <Line type="monotone" dataKey="ph" name="pH" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                )}
                                {activeChart === 'ec' && (
                                    <Line type="monotone" dataKey="ec" name="EC" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                )}
                                {activeChart === 'environment' && [
                                    <Line key="temp" type="monotone" dataKey="temperature_c" name={t('temperature') + " (°C)"} stroke="#ef4444" strokeWidth={2} dot={false} />,
                                    <Line key="hum" type="monotone" dataKey="humidity_pct" name={t('humidity') + " (%)"} stroke="#3b82f6" strokeWidth={2} dot={false} />
                                ]}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Recent History Table */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                            <h4 className="font-semibold text-slate-800 text-sm">{t('recent_entries')}</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">{t('date')}</th>
                                        <th className="px-6 py-3">{t('height')}</th>
                                        <th className="px-6 py-3">{t('nodes')}</th>
                                        <th className="px-6 py-3">{t('ph_level')}</th>
                                        <th className="px-6 py-3">{t('ec_ppm')}</th>
                                        <th className="px-6 py-3">{t('environment') || 'Env'}</th>
                                        <th className="px-6 py-3">{t('notes')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[...metrics].reverse().slice(0, 5).map((metric) => (
                                        <tr key={metric.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-3 font-medium text-slate-700">
                                                {format(new Date(metric.recorded_at), 'MMM d')}
                                            </td>
                                            <td className="px-6 py-3">{metric.height_cm ? `${metric.height_cm}cm` : '-'}</td>
                                            <td className="px-6 py-3">{metric.node_count || '-'}</td>
                                            <td className="px-6 py-3">{metric.ph || '-'}</td>
                                            <td className="px-6 py-3">{metric.ec || '-'}</td>
                                            <td className="px-6 py-3">
                                                {metric.temperature_c && <span className="mr-2 text-red-600">{metric.temperature_c}°C</span>}
                                                {metric.humidity_pct && <span className="text-blue-600">{metric.humidity_pct}%</span>}
                                                {!metric.temperature_c && !metric.humidity_pct && '-'}
                                            </td>
                                            <td className="px-6 py-3 text-slate-500 max-w-xs truncate">{metric.notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('record_metrics')}>
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

                    <SliderControl
                        label={t('nodes')}
                        value={watch('node_count')}
                        onChange={(v) => setValue('node_count', v)}
                        min={0}
                        max={50}
                        step={1}
                        unit={t('pairs')}
                        icon={Activity}
                        colorClass="bg-teal-500"
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
                    </div>

                    <Input
                        label={t('notes')}
                        placeholder={t('notes_placeholder')}
                        {...register('notes')}
                    />

                    <div className="pt-2 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">{t('cancel')}</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                            {submitting ? t('saving') : t('save_record')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const ChartTab = ({ active, onClick, label, icon: Icon }: any) => (
    <button
        onClick={onClick}
        className={clsx(
            "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
            active
                ? "bg-green-50 text-green-700 border-green-200 border"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
        )}
    >
        <Icon size={16} />
        <span>{label}</span>
    </button>
);
