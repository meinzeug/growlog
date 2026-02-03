import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import { EmptyChartState } from '../ui/EmptyChartState';
import { format } from 'date-fns';

interface EnvironmentMetric {
    id: string;
    temperature_c: number;
    humidity_pct: number;
    vpd?: number;
    recorded_at: string;
}

interface EnvironmentChartProps {
    data?: EnvironmentMetric[];
    onEmptyAction?: () => void;
    height?: number;
}

export const EnvironmentChart = ({ data, onEmptyAction, height = 300 }: EnvironmentChartProps) => {
    const { t } = useLanguage();

    // Check if valid data exists
    const hasData = data && data.length > 0;

    if (!hasData) {
        return (
            <div style={{ height }} className="w-full">
                <EmptyChartState
                    title={t('no_environment_data') || 'No environment data'}
                    message={t('connect_sensor_hint') || 'Connect sensors or log environment data manually to visualize trends.'}
                    onAction={onEmptyAction}
                    actionLabel={t('log_environment') || 'Log Environment'}
                />
            </div>
        );
    }

    const chartData = useMemo(() => {
        return data?.map(d => ({
            ...d,
            time: format(new Date(d.recorded_at), 'HH:mm'),
            date: format(new Date(d.recorded_at), 'MMM d')
        }));
    }, [data]);

    return (
        <div style={{ height }} className="w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#94a3b8"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                        unit="°C"
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#94a3b8"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        unit="%"
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                        labelStyle={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}
                    />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="temperature_c"
                        name="Temperature"
                        stroke="#f97316"
                        fillOpacity={1}
                        fill="url(#colorTemp)"
                        strokeWidth={2}
                    />
                    <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="humidity_pct"
                        name="Humidity"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorHum)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
