
import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import { Camera, Upload, Loader2, Calendar, Grip } from 'lucide-react';
import { format, differenceInWeeks } from 'date-fns';
import clsx from 'clsx';
import { useLanguage } from '../../context/LanguageContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface PlantPhotosProps {
    plantId: string;
}

export const PlantPhotos = ({ plantId }: PlantPhotosProps) => {
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('timeline');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [plantStartDate, setPlantStartDate] = useState<Date | null>(null);
    const { t, dateLocale } = useLanguage();

    const fetchPhotos = async () => {
        try {
            const res = await api.get(`/plants/${plantId}/photos`);
            setPhotos(res.data);

            const plantRes = await api.get(`/plants/${plantId}`);
            if (plantRes.data.start_date) {
                setPlantStartDate(new Date(plantRes.data.start_date));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, [plantId]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);
        formData.append('taken_at', new Date().toISOString());

        setUploading(true);
        try {
            await api.post(`/plants/${plantId}/photos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchPhotos();
        } catch (e) {
            console.error(e);
            alert(t('upload_failed'));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Group photos by date (Day)
    const groupedPhotos = photos.reduce((acc: any, photo) => {
        const dateKey = format(new Date(photo.taken_at || photo.created_at), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(photo);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedPhotos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const getWeekNumber = (dateStr: string) => {
        if (!plantStartDate) return null;
        const diff = differenceInWeeks(new Date(dateStr), plantStartDate);
        return diff >= 0 ? diff + 1 : 0; // Week 1 is the first week
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-slate-900">{t('photo_journal')}</h3>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={clsx("p-1.5 rounded-md transition-all", viewMode === 'timeline' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
                            title={t('timeline_view') || "Timeline View"}
                        >
                            <Calendar size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={clsx("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
                            title={t('grid_view') || "Grid View"}
                        >
                            <Grip size={18} />
                        </button>
                    </div>
                </div>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                        <span>{t('add_photo')}</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20"><LoadingSpinner message={t('loading_photos')} /></div>
            ) : photos.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <Camera size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="font-medium text-slate-600">{t('no_photos_yet')}</p>
                    <p className="text-sm text-slate-400 mt-1">{t('track_progress')}</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                        <div key={photo.id} className="group relative bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden aspect-square">
                            <img
                                src={photo.url}
                                alt={photo.caption || 'Plant photo'}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <p className="text-white text-xs font-medium">
                                    {format(new Date(photo.taken_at || photo.created_at), 'MMM d, yyyy', { locale: dateLocale })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-8 relative pl-4">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                    {sortedDates.map(dateStr => {
                        const weekNum = getWeekNumber(dateStr);
                        return (
                            <div key={dateStr} className="relative pl-8">
                                <div className="absolute left-1 top-1 w-6 h-6 bg-green-100 rounded-full border-2 border-white flex items-center justify-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        {format(new Date(dateStr), 'MMMM d, yyyy', { locale: dateLocale })}
                                        {weekNum !== null && (
                                            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{t('week')} {weekNum}</span>
                                        )}
                                    </h4>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {groupedPhotos[dateStr].map((photo: any) => (
                                        <div key={photo.id} className="group relative bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden aspect-video cursor-pointer">
                                            <img
                                                src={photo.url}
                                                alt={photo.caption || 'Plant photo'}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
