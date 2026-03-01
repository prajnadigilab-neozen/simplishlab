import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, User, ShieldAlert, Trash2, FileText, CheckCircle2, XCircle } from 'lucide-react';
import api, { authApi } from '../utils/api';
import { useToast } from './Toast';

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'logs'
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 0, totalUsers: 0 });
    const showToast = useToast();

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers(1);
        } else if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await authApi.getSystemLogs();
            setLogs(res.data?.logs || []);
        } catch (err) {
            console.error('Failed to load system logs:', err);
            showToast('Failed to load system logs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            console.log(`Fetching users page ${page}...`);
            const res = await authApi.getAllUsers({ page, limit: pagination.limit });
            console.log('Users fetched successfully:', res.data);

            const { users: fetchedUsers, pagination: meta } = res.data;
            setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
            setPagination(meta || pagination);
        } catch (err) {
            console.error('Failed to load users:', err);
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await authApi.updateRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            showToast(`User role updated to ${newRole}`, 'success');
        } catch (err) {
            showToast('Failed to update role', 'error');
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await authApi.updateStatus(userId, newStatus);
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            showToast(`User is now ${newStatus}`, 'success');
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    if (loading && users.length === 0 && logs.length === 0) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>;

    return (
        <div style={{ padding: '1.5rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldCheck color="var(--primary)" /> Super Admin Operations
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage user roles and view system cleanup logs.</p>
            </header>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        background: 'none', border: 'none', padding: '1rem 2rem', cursor: 'pointer',
                        fontSize: '1rem', fontWeight: 600,
                        color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <User size={18} /> User Management
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    style={{
                        background: 'none', border: 'none', padding: '1rem 2rem', cursor: 'pointer',
                        fontSize: '1rem', fontWeight: 600,
                        color: activeTab === 'logs' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'logs' ? '2px solid var(--primary)' : '2px solid transparent',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <FileText size={18} /> System Logs
                </button>
            </div>

            {activeTab === 'users' && (

                <div className="glass-card responsive-table-wrapper" style={{ padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-main)' }}>User / Contact</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-main)' }}>Role</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-main)' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-main)' }}>Onboarding</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-main)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', background: 'transparent' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.full_name || u.fullName || 'Unnamed User'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {u.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>📱 {u.phone}</div>}
                                            {u.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>✉️ {u.email}</div>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                            background: (u.role === 'super_admin' || u.role === 'admin') ? 'var(--badge-admin-bg)' : u.role === 'moderator' ? 'var(--badge-mod-bg)' : 'var(--badge-user-bg)',
                                            color: (u.role === 'super_admin' || u.role === 'admin') ? 'var(--badge-admin-text)' : u.role === 'moderator' ? 'var(--badge-mod-text)' : 'var(--badge-user-text)'
                                        }}>
                                            {u.role === 'super_admin' ? 'SUPER ADMIN' : u.role === 'admin' ? 'ADMIN' : u.role === 'moderator' ? 'MODERATOR' : 'USER'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700,
                                            background: u.status === 'active' ? 'var(--badge-active-bg)' : u.status === 'inactive' ? 'var(--badge-inactive-bg)' : 'var(--badge-user-bg)',
                                            color: u.status === 'active' ? 'var(--badge-active-text)' : u.status === 'inactive' ? 'var(--badge-inactive-text)' : 'var(--badge-user-text)',
                                            textTransform: 'uppercase'
                                        }}>
                                            {u.status || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {u.onboarding_completed ? '✅ Done' : '⏳ Pending'}
                                        <div style={{ fontSize: '0.75rem' }}>{u.current_level || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            style={{
                                                padding: '0.4rem',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border)',
                                                background: 'var(--bg-card)',
                                                color: 'var(--text-main)',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            <option value="user">USER</option>
                                            <option value="admin">ADMIN</option>
                                            <option value="moderator">MODERATOR</option>
                                            <option value="super_admin">SUPER ADMIN</option>
                                        </select>
                                        {u.status !== 'deleted' && (
                                            <button
                                                onClick={() => handleStatusToggle(u.id, u.status || 'active')}
                                                style={{
                                                    marginLeft: '0.5rem',
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    border: '1px solid var(--border)',
                                                    background: u.status === 'inactive' ? 'var(--primary)' : 'var(--bg-card)',
                                                    color: u.status === 'inactive' ? '#fff' : 'var(--text-main)'
                                                }}
                                            >
                                                {u.status === 'inactive' ? 'Activate' : 'Restrict'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && !loading && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No users found in the database.
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'users' && (
                <div style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 0.5rem'
                }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Showing {users.length} of {pagination.totalUsers} users
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                            onClick={() => fetchUsers(pagination.page - 1)}
                            disabled={pagination.page <= 1 || loading}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-main)',
                                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                                opacity: pagination.page <= 1 ? 0.5 : 1,
                                fontSize: '0.8rem'
                            }}
                        >
                            Previous
                        </button>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                            Page {pagination.page} of {pagination.totalPages || 1}
                        </span>
                        <button
                            onClick={() => fetchUsers(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages || loading}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-main)',
                                cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                                opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                                fontSize: '0.8rem'
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="glass-card responsive-table-wrapper" style={{ padding: 0 }}>
                    {loading && logs.length === 0 ? (
                        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
                    ) : logs.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No system logs found.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-main)' }}>Timestamp</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-main)' }}>Event Type</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-main)' }}>Details</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-main)' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => {
                                    const details = log.details || {};
                                    const hasErrors = details.errors && details.errors.length > 0;

                                    return (
                                        <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem',
                                                    background: 'rgba(56, 189, 248, 0.1)', color: '#0ea5e9', textTransform: 'uppercase'
                                                }}>
                                                    {log.event_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                                                <div style={{ marginBottom: '0.2rem' }}>
                                                    <strong>Deleted Junk Files:</strong> {details.deletedFiles?.length || 0}
                                                </div>
                                                <div style={{ marginBottom: '0.2rem' }}>
                                                    <strong>Orphaned Auth Users Cleared:</strong> {details.deletedOrphanedUsers || 0}
                                                </div>
                                                {hasErrors && (
                                                    <div style={{ color: '#ef4444', marginTop: '0.5rem' }}>
                                                        <strong>Errors:</strong> {details.errors.length}
                                                        <ul style={{ margin: '0.2rem 0', paddingLeft: '1rem' }}>
                                                            {details.errors.map((e, i) => <li key={i}>{e}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                {hasErrors ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                                                        <XCircle size={16} /> Issues Found
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                                                        <CheckCircle2 size={16} /> Success
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserManagement;
