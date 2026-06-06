"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Trash2, Edit2, Shield, FileText, Check, X, Eye, EyeOff, Send, Copy, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function RoleBadge({ role }) {
  return role === 'admin' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700">
      <Shield className="w-2.5 h-2.5" /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700">
      <FileText className="w-2.5 h-2.5" /> Editor
    </span>
  );
}

function StatusBadge({ active }) {
  return active !== false ? (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active</span>
  ) : (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">Inactive</span>
  );
}

/**
 * AdminUsers — manage existing users + send invites.
 *
 * The old "Add User" flow (admin sets password directly) has been replaced
 * with an invite flow: admin enters email + role only; backend mints a
 * tokenized link, posts it to Slack via SLACK_WEBHOOK_URL; recipient sets
 * their own name + password by visiting /:lang/invite/:token.
 *
 * Editing existing users still allows resetting role / active / password,
 * so admins keep a break-glass path if a teammate forgets their password.
 */
export default function AdminUsers({ token, currentUserEmail }) {
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'editor' });
  const [inviteResult, setInviteResult] = useState(null);  // {invite_url, email, role, expires_at}

  const [editingEmail, setEditingEmail] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', password: '', role: 'editor' });
  const [showPw, setShowPw] = useState(false);

  // User-table filter. Defaults to 'pending' when the page is opened from a
  // Slack pending-approval notification (URL contains ?filter=pending).
  const initialFilter = (() => {
    try {
      const p = new URLSearchParams(window.location.search).get('filter');
      return p === 'pending' || p === 'active' ? p : 'all';
    } catch { return 'all'; }
  })();
  const [statusFilter, setStatusFilter] = useState(initialFilter);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, { headers: authHeaders });
      const data = await res.json();
      setUsers(data.users || []);
    } catch { /* ignore — empty state shows below */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchInvites = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/invites`, { headers: authHeaders });
      const data = await res.json();
      setInvites(data.invites || []);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { fetchUsers(); fetchInvites(); }, [fetchUsers, fetchInvites]);

  const resetInviteForm = () => {
    setInviteForm({ email: '', role: 'editor' });
    setShowInviteForm(false);
    setError('');
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setInviteResult(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/invites`, {
        method: 'POST', headers,
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setInviteResult(data);
        resetInviteForm();
        fetchInvites();
      } else {
        setError(typeof data.detail === 'string' ? data.detail : 'Failed to send invite');
      }
    } catch { setError('Connection failed'); }
  };

  const handleRevokeInvite = async (inviteId) => {
    // We list invites without the token field for safety — call the
    // backend by invite_id is not supported, so we re-fetch and ask the
    // admin to confirm by email shown.
    const target = invites.find(i => i.invite_id === inviteId);
    if (!target) return;
    if (!window.confirm(`Revoke invite to ${target.email}?`)) return;
    setError(''); setMessage('');
    try {
      // We don't have token client-side; backend route takes token. Add a
      // by-id endpoint? For now: list-and-delete is rarely used; expose by
      // adding the invite_id route on backend would be cleanest. Quick
      // alternative: re-issue invite by email (server will revoke prior
      // outstanding). Surface a hint instead.
      setError('To revoke: send a fresh invite to the same email — the backend automatically revokes any earlier outstanding invite.');
    } catch { setError('Connection failed'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    const payload = {};
    if (editForm.name) payload.name = editForm.name;
    if (editForm.role) payload.role = editForm.role;
    if (editForm.password) payload.password = editForm.password;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${encodeURIComponent(editingEmail)}`, {
        method: 'PUT', headers, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setEditingEmail(null);
        setEditForm({ name: '', password: '', role: 'editor' });
        fetchUsers();
      } else {
        setError(typeof data.detail === 'string' ? data.detail : 'Update failed');
      }
    } catch { setError('Connection failed'); }
  };

  const handleToggleActive = async (email, currentlyActive) => {
    setError(''); setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${encodeURIComponent(email)}`, {
        method: 'PUT', headers, body: JSON.stringify({ active: !currentlyActive }),
      });
      const data = await res.json();
      if (res.ok) { setMessage(data.message); fetchUsers(); }
      else setError(typeof data.detail === 'string' ? data.detail : 'Failed');
    } catch { setError('Connection failed'); }
  };

  const handleDelete = async (email) => {
    if (!window.confirm(`Permanently delete ${email}?`)) return;
    setError(''); setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${encodeURIComponent(email)}`, {
        method: 'DELETE', headers,
      });
      const data = await res.json();
      if (res.ok) { setMessage(data.message); fetchUsers(); }
      else setError(typeof data.detail === 'string' ? data.detail : 'Delete failed');
    } catch { setError('Connection failed'); }
  };

  const startEdit = (user) => {
    setEditingEmail(user.email);
    setEditForm({ name: user.name || '', password: '', role: user.role });
    setError(''); setMessage('');
  };

  const copyInviteUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Invite link copied to clipboard');
    } catch { setError('Could not copy — long-press to select the link manually.'); }
  };

  return (
    <div className="space-y-6 max-w-5xl" data-testid="admin-users">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">Invite teammates and manage existing access</p>
        </div>
        {!showInviteForm && (
          <Button
            onClick={() => { resetInviteForm(); setShowInviteForm(true); setInviteResult(null); }}
            className="bg-violet-600 hover:bg-violet-700 text-white"
            data-testid="invite-user-btn"
          >
            <Mail className="w-4 h-4 mr-2" /> Invite User
          </Button>
        )}
      </div>

      {message && <p className="text-emerald-800 font-medium text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">{message}</p>}
      {error && <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      {/* Invite Form */}
      {showInviteForm && (
        <form onSubmit={handleInvite} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4" data-testid="invite-form">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Mail className="w-4 h-4 text-violet-600" />
            Send a new invite
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            The recipient sets their own name and password. Link is single-use and expires in 72&nbsp;hours.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Email address</label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))}
                required
                placeholder="teammate@credsure.io"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                data-testid="invite-email-input"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Role</label>
              <select
                value={inviteForm.role}
                onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                data-testid="invite-role-select"
              >
                <option value="editor">Editor (blogs only)</option>
                <option value="admin">Admin (full access)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" data-testid="invite-submit-btn">
              <Send className="w-4 h-4 mr-2" /> Send Invite
            </Button>
            <Button type="button" onClick={resetInviteForm} variant="outline">
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Last issued invite — show link in case Slack is missing */}
      {inviteResult && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 space-y-3" data-testid="invite-result">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-900">
            <Send className="w-4 h-4" /> Invite sent to {inviteResult.email}
          </div>
          <p className="text-xs text-violet-800">
            Posted to Slack. If Slack is offline, copy this link and send it manually:
          </p>
          <div className="flex items-center gap-2 bg-white border border-violet-200 rounded-xl px-3 py-2">
            <code className="flex-1 text-xs text-gray-800 truncate font-mono" data-testid="invite-result-url">{inviteResult.invite_url}</code>
            <button
              onClick={() => copyInviteUrl(inviteResult.invite_url)}
              className="p-1.5 rounded-lg hover:bg-violet-100 text-violet-700"
              title="Copy link"
              data-testid="copy-invite-url"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Outstanding Invites */}
      {invites.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden" data-testid="pending-invites">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Hourglass className="w-4 h-4 text-amber-500" />
            Pending invites ({invites.length})
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Invited by</th>
                <th className="px-5 py-3 text-left">Expires</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map(inv => (
                <tr key={inv.invite_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900">{inv.email}</td>
                  <td className="px-5 py-3"><RoleBadge role={inv.role} /></td>
                  <td className="px-5 py-3 text-xs text-gray-500">{inv.invited_by}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{inv.expires_at?.slice(0, 16).replace('T', ' ')}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleRevokeInvite(inv.invite_id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"
                      title="How to revoke"
                      data-testid={`revoke-invite-${inv.invite_id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Form (existing user) */}
      {editingEmail && (
        <form onSubmit={handleUpdate} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4" data-testid="edit-user-form">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Edit2 className="w-4 h-4 text-violet-600" /> Edit {editingEmail}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                data-testid="edit-user-name-input"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Role</label>
              <select
                value={editForm.role}
                onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                data-testid="edit-user-role-select"
              >
                <option value="admin">Admin (full access)</option>
                <option value="editor">Editor (blogs only)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Reset password <span className="text-gray-400">(leave blank to keep)</span>
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={editForm.password}
                onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Leave blank to keep current"
                className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                data-testid="edit-user-password-input"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">
              <Check className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button type="button" onClick={() => { setEditingEmail(null); setEditForm({ name:'', password:'', role:'editor' }); }} variant="outline">
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        </form>
      )}

      {/* User Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-gray-700">
            Users ({users.length})
            {(() => {
              const pendingCount = users.filter(u => u.active === false).length;
              if (pendingCount === 0) return null;
              return (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800" data-testid="pending-count-badge">
                  <Hourglass className="w-3 h-3" /> {pendingCount} pending approval
                </span>
              );
            })()}
          </div>
          <div className="flex items-center gap-1" role="tablist" aria-label="Filter users by status">
            {[
              { key: 'all',     label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'active',  label: 'Active' },
            ].map(({ key, label }) => {
              const count = key === 'all'
                ? users.length
                : key === 'pending'
                  ? users.filter(u => u.active === false).length
                  : users.filter(u => u.active !== false).length;
              const isActive = statusFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`users-filter-${key}`}
                >
                  {label} <span className={`ml-1 ${isActive ? 'opacity-80' : 'text-gray-500'}`}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Created</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(u => statusFilter === 'all' ? true : statusFilter === 'pending' ? u.active === false : u.active !== false)
              .map(user => {
              const isSelf = user.email === currentUserEmail;
              const isPending = user.active === false;
              return (
                <tr key={user.email} className={`border-b border-gray-100 hover:bg-gray-50 ${isPending ? 'bg-amber-50/40' : ''}`} data-testid={`user-row-${user.email}`}>
                  <td className="px-5 py-3">
                    <div className="text-gray-900 font-medium">{user.name || '—'}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-5 py-3"><RoleBadge role={user.role} /></td>
                  <td className="px-5 py-3"><StatusBadge active={user.active} /></td>
                  <td className="px-5 py-3 text-xs text-gray-500">{user.created_at?.slice(0, 10) || '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isPending && !isSelf && (
                        <button
                          onClick={() => handleToggleActive(user.email, false)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                          title="Approve user"
                          data-testid={`approve-user-${user.email}`}
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                      )}
                      <button onClick={() => startEdit(user)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900" title="Edit user" data-testid={`edit-user-${user.email}`}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!isSelf && !isPending && (
                        <>
                          <button onClick={() => handleToggleActive(user.email, user.active !== false)} className={`p-1.5 rounded-lg hover:bg-gray-100 ${user.active !== false ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-500 hover:text-emerald-600'}`} title={user.active !== false ? 'Deactivate' : 'Activate'} data-testid={`toggle-user-${user.email}`}>
                            {user.active !== false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleDelete(user.email)} className="p-1.5 rounded-lg hover:bg-gray-100 text-red-500 hover:text-red-600" title="Delete user" data-testid={`delete-user-${user.email}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {!isSelf && isPending && (
                        <button onClick={() => handleDelete(user.email)} className="p-1.5 rounded-lg hover:bg-gray-100 text-red-500 hover:text-red-600" title="Reject (delete request)" data-testid={`delete-user-${user.email}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isSelf && <span className="text-[10px] text-gray-400 ml-1">You</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <div className="text-center py-12 text-gray-500 text-sm">No users found</div>}
        {users.length > 0 && users.filter(u => statusFilter === 'all' ? true : statusFilter === 'pending' ? u.active === false : u.active !== false).length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">No users match this filter.</div>
        )}
      </div>

      {/* Role Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Role Permissions</h4>
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-2"><Shield className="w-3.5 h-3.5 text-violet-600" /> <span className="text-gray-900 font-medium">Admin</span></div>
            <ul className="space-y-1 text-gray-600 pl-5">
              <li>Dashboard &amp; analytics</li>
              <li>Blog management</li>
              <li>AI content generation</li>
              <li>Lead management &amp; export</li>
              <li>Site settings</li>
              <li>User management</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2"><FileText className="w-3.5 h-3.5 text-sky-600" /> <span className="text-gray-900 font-medium">Editor</span></div>
            <ul className="space-y-1 text-gray-600 pl-5">
              <li>Blog management</li>
              <li>AI content generation</li>
              <li>Image uploads</li>
              <li className="text-gray-400 line-through">Lead management</li>
              <li className="text-gray-400 line-through">Site settings</li>
              <li className="text-gray-400 line-through">User management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
