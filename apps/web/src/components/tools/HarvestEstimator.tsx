import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../lib/api';
import { Select } from '../../components/ui/Form';

export const HarvestEstimator = () => {
    const { t } = useLanguage();
    const [flowerStartDate, setFlowerStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [weeks, setWeeks] = useState(9);
    const [plants, setPlants] = useState<any[]>([]);
    const [selectedPlant, setSelectedPlant] = useState<string>('');

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await api.get('/plants?phase=FLOWERING');
                setPlants(res.data);
            } catch (e) { console.error(e); }
        };
        fetchPlants();
    }, []);

    useEffect(() => {
        if (selectedPlant) {
            const plant = plants.find(p => p.id === selectedPlant);
            if (plant && plant.phase_started_at) {
                setFlowerStartDate(plant.phase_started_at.split('T')[0]);
                // If we had a strain db, we'd lookup weeks here.
                // For now, default to 9
            }
        }
    }, [selectedPlant, plants]);

    const getEstimatedDate = () => {
        const date = new Date(flowerStartDate);
        date.setDate(date.getDate() + (weeks * 7));
        return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Calendar className="text-orange-500" />
                {t('harvest_estimator')}
            </h3>
            <div className="space-y-4">
                {plants.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('plants')}</label>
                        <Select
                            value={selectedPlant}
                            onChange={(e) => setSelectedPlant(e.target.value)}
                            options={[
                                { value: '', label: t('select_template') || 'Select a plant...' },
                                ...plants.map(p => ({ value: p.id, label: p.name }))
                            ]}
                        />
                        <p className="text-xs text-slate-500 mt-1">Select a flowering plant to auto-fill start date.</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('flower_start_date')}</label>
                    <input
                        type="date"
                        value={flowerStartDate}
                        onChange={(e) => setFlowerStartDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('flower_time_weeks')}</label>
                    <input
                        type="number"
                        min="1"
                        max="24"
                        value={weeks}
                        onChange={(e) => setWeeks(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">{t('check_breeder')}</p>
                    <p className="text-xs text-slate-400">Typical range: 8-10 weeks</p>
                </div>

                <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <h4 className="font-medium text-orange-900 mb-1">{t('est_harvest')}</h4>
                    <p className="text-2xl font-bold text-orange-600">
                        {getEstimatedDate()}
                    </p>
                </div>
            </div>
        </div>
    );
};
