import React, { useState } from 'react';
import { useCreateSleepSession, useGetSleepSessions, useDeleteSleepSession, useGetSleepStats, useGetWeeklySummary, useGetSleepTimeline } from '@/hooks/sleep/useSleep';
import LoadingSpinner from '@/components/LoadingSpinner';
import { QUALITY_RATING } from '@/types/sleep/sleep.types';
import { sleepService } from '@/services/sleep/sleep.service';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from 'chart.js';
import { MdBedtime, MdBarChart, MdCalendarToday, MdHotel, MdAccessTime, MdStar, MdTrendingUp, MdTrendingDown, MdAlarm, MdWbSunny, MdScore, MdWarning } from 'react-icons/md';
import { FaListUl } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

const SleepDashboard: React.FC = () => {
    // Hooks
    const { createSession, loading: createLoading, error: createError } = useCreateSleepSession();
    const { getSessions, loading: sessionsLoading, error: sessionsError, data: sessions } = useGetSleepSessions();
    const { deleteSession, loading: deleteLoading, error: deleteError } = useDeleteSleepSession();
    const { getStats, loading: statsLoading, error: statsError, data: stats } = useGetSleepStats();
    const { getWeeklySummary, loading: weeklyLoading, error: weeklyError, data: weeklySummary } = useGetWeeklySummary();

    // Form state
    const [form, setForm] = useState({
        sleep_start: '',
        sleep_end: '',
        quality_rating: QUALITY_RATING.MIN
    });
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState<string>('');

    // Modal state for delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);

    // Fetch data on mount
    React.useEffect(() => {
        getSessions();
        getStats();
        getWeeklySummary();
    }, []);

    // Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = sleepService.validateSleepSession({
            ...form,
            quality_rating: Number(form.quality_rating)
        });
        setFormErrors(errors);
        if (errors.length === 0) {
            await createSession({
                ...form,
                quality_rating: Number(form.quality_rating)
            });
            getSessions();
            getStats();
            getWeeklySummary();
            setForm({ sleep_start: '', sleep_end: '', quality_rating: QUALITY_RATING.MIN });
            setSuccessMessage('Sleep session logged successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const handleDelete = async (sessionId: number) => {
        setSuccessMessage("");
        setFormErrors([]);
        try {
            await deleteSession(sessionId);
            await getSessions();
            await getStats();
            await getWeeklySummary();
            setSuccessMessage("Sleep session deleted successfully!");
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setFormErrors([err.message || "Failed to delete sleep session"]);
        }
    }

    const openDeleteModal = (id: number) => {
        setSessionToDelete(id);
        setShowDeleteModal(true);
    };
    const closeDeleteModal = () => {
        setSessionToDelete(null);
        setShowDeleteModal(false);
    };
    const confirmDelete = async () => {
        if (sessionToDelete !== null) {
            await handleDelete(sessionToDelete);
            closeDeleteModal();
        }
    };

    // Chart data
    const statsChartData = stats ? {
        labels: ['Avg Hours', 'Avg Quality', 'Total Sessions'],
        datasets: [{
            label: 'Sleep Stats',
            data: [stats.average_sleep_hours, stats.average_quality_rating, stats.total_sessions],
            backgroundColor: ['#60a5fa', '#34d399', '#fbbf24']
        }]
    } : undefined;

    return (
        <div className="space-y-8">
            {/* DaisyUI Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40">
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg flex items-center gap-2"><MdWarning className="text-warning text-2xl" /> Confirm Delete</h3>
                            <p className="py-4">Are you sure you want to delete this sleep session? This action cannot be undone.</p>
                            <div className="modal-action">
                                <button className="btn btn-error" onClick={confirmDelete} disabled={deleteLoading}>
                                    {deleteLoading ? <LoadingSpinner size="sm" /> : 'Delete'}
                                </button>
                                <button className="btn" onClick={closeDeleteModal}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Create Sleep Session */}
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title"><MdBedtime className="text-xl mr-2" /> Log Sleep Session</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="form-control space-x-2">
                            <label className="label">Sleep Start:</label>
                            <input type="datetime-local" name="sleep_start" value={form.sleep_start} onChange={handleChange} className="input input-bordered" required />
                        </div>
                        <div className="form-control space-x-2">
                            <label className="label">Sleep End:</label>
                            <input type="datetime-local" name="sleep_end" value={form.sleep_end} onChange={handleChange} className="input input-bordered" required />
                        </div>
                        <div className="form-control space-x-2">
                            <label className="label">Quality Rating:</label>
                            <div className="rating">
                                {[1, 2, 3, 4, 5].map(r => (
                                    <input
                                        key={r}
                                        type="radio"
                                        name="quality_rating"
                                        className="mask mask-star-2 bg-orange-400"
                                        aria-label={`${r} star`}
                                        value={r}
                                        checked={Number(form.quality_rating) === r}
                                        onChange={handleChange}
                                    />
                                ))}
                            </div>
                        </div>
                        {formErrors.length > 0 && (
                            <div className="alert alert-error">
                                <ul className="list-disc ml-4">
                                    {formErrors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                        )}
                        {successMessage && (
                            <div className="alert alert-success">
                                {successMessage}
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary" disabled={createLoading}>
                            {createLoading ? <LoadingSpinner size="sm" /> : 'Add Session'}
                        </button>
                        {createError && <div className="text-error">{createError}</div>}
                    </form>
                </div>
            </div>

            {/* Sleep Sessions List */}
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title"><FaListUl className="text-xl mr-2" /> Sleep Sessions</h2>
                    {sessionsLoading ? <LoadingSpinner /> : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Start</th>
                                        <th>End</th>
                                        <th>Quality</th>
                                        <th>Duration</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions && sessions.length > 0 ? sessions.map(s => (
                                        <tr key={s.id}>
                                            <td>{new Date(s.sleep_start).toLocaleDateString()}</td>
                                            <td>{new Date(s.sleep_start).toLocaleTimeString()}</td>
                                            <td>{new Date(s.sleep_end).toLocaleTimeString()}</td>
                                            <td>{s.quality_rating}</td>
                                            <td>{sleepService.formatDuration(s.sleep_start, s.sleep_end)}</td>
                                            <td>
                                                <button className="btn btn-error btn-xs" onClick={() => openDeleteModal(s.id)} disabled={deleteLoading}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan={6}>No sessions found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {sessionsError && <div className="text-error">{sessionsError}</div>}
                </div>
            </div>

            {/* Sleep Stats & Analytics */}
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title"><MdBarChart className="text-xl mr-2" /> Sleep Analytics</h2>
                    {statsLoading ? <LoadingSpinner /> : statsChartData ? (
                        <Bar data={statsChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    ) : <div>No stats available.</div>}
                    {statsError && <div className="text-error">{statsError}</div>}
                </div>
            </div>

            {/* Weekly Summary */}
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title"><MdCalendarToday className="text-xl mr-2" /> Weekly Summary</h2>
                    {weeklyLoading ? <LoadingSpinner /> : weeklySummary ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="badge badge-info badge-lg">Week</span>
                                <span className="font-semibold">{new Date(weeklySummary.week_start).toLocaleDateString()} - {new Date(weeklySummary.week_end).toLocaleDateString()}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="stat bg-base-100 rounded-xl shadow">
                                    <div className="stat-title"><MdHotel className="inline mr-1" /> Total Sessions</div>
                                    <div className="stat-value text-primary">{weeklySummary.total_sessions}</div>
                                </div>
                                <div className="stat bg-base-100 rounded-xl shadow">
                                    <div className="stat-title"><MdAccessTime className="inline mr-1" /> Total Sleep Hours</div>
                                    <div className="stat-value text-info">{weeklySummary.total_sleep_hours.toFixed(2)}</div>
                                </div>
                                <div className="stat bg-base-100 rounded-xl shadow">
                                    <div className="stat-title"><MdAlarm className="inline mr-1" /> Avg Sleep Hours</div>
                                    <div className="stat-value text-success">{weeklySummary.average_sleep_hours.toFixed(2)}</div>
                                </div>
                                <div className="stat bg-base-100 rounded-xl shadow">
                                    <div className="stat-title"><MdStar className="inline mr-1" /> Avg Quality</div>
                                    <div className="stat-value text-warning">{weeklySummary.average_quality_rating ?? 'N/A'}</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-4">
                                <div className="flex flex-col items-center">
                                    <span className="badge badge-outline badge-success mb-1"><MdBedtime className="inline mr-1" /> Avg Bedtime</span>
                                    <span className="font-mono text-lg">{weeklySummary.average_bedtime}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="badge badge-outline badge-info mb-1"><MdWbSunny className="inline mr-1" /> Avg Wake Time</span>
                                    <span className="font-mono text-lg">{weeklySummary.average_wake_time}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="badge badge-outline badge-primary mb-1"><MdScore className="inline mr-1" /> Consistency Score</span>
                                    <span className="font-bold text-lg">{weeklySummary.sleep_consistency_score}</span>
                                    <progress className="progress progress-primary w-24" value={weeklySummary.sleep_consistency_score} max="100"></progress>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="badge badge-outline badge-warning mb-1"><MdStar className="inline mr-1" /> Quality Trend</span>
                                    <span className={`font-bold text-lg ${weeklySummary.quality_trend === 'up' ? 'text-success' : weeklySummary.quality_trend === 'down' ? 'text-error' : 'text-base-content'}`}>{weeklySummary.quality_trend}
                                        {weeklySummary.quality_trend === 'up' && <MdTrendingUp className="inline text-success ml-1" />}
                                        {weeklySummary.quality_trend === 'down' && <MdTrendingDown className="inline text-error ml-1" />}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : <div>No summary available.</div>}
                    {weeklyError && <div className="text-error">{weeklyError}</div>}
                </div>
            </div>
        </div>
    );
};

export default SleepDashboard;