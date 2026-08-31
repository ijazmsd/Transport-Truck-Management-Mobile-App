import React, { useState } from 'react';
import {
  Users,
  X,
  UserCheck,
  UserX,
  Shield,
  Truck,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  UserPlus,
  LogIn,
  MoreVertical,
} from 'lucide-react';
import { User, UserRole, UserStatus, Truck as TruckType } from '../types';

interface Props {
  isOpen: boolean;
  users: User[];
  currentUser: User;
  trucks: TruckType[];
  onClose: () => void;
  onApproveUser: (userId: string) => void;
  onRejectUser: (userId: string, reason: string) => void;
  onToggleStatus: (userId: string, status: UserStatus) => void;
  onSaveUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onSwitchUser: (user: User) => void;
}

export const UserManagementModal: React.FC<Props> = ({
  isOpen,
  users,
  currentUser,
  trucks,
  onClose,
  onApproveUser,
  onRejectUser,
  onToggleStatus,
  onSaveUser,
  onDeleteUser,
  onSwitchUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Reject with reason modal state
  const [rejectingUser, setRejectingUser] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState('License verification pending or credentials incomplete.');

  // Create / Edit User state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User>>({
    name: '',
    phone: '+92 ',
    email: '',
    role: 'Driver',
    status: 'Active',
    driverId: '',
  });

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const pendingCount = users.filter((u) => u.status === 'Pending Approval').length;

  const handleOpenAddUser = () => {
    setEditFormData({
      id: `usr_${Date.now()}`,
      name: '',
      phone: '+92 ',
      email: '',
      role: 'Driver',
      status: 'Active',
      driverId: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setIsEditing(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.name?.trim() || !editFormData.phone?.trim()) return;

    onSaveUser(editFormData as User);
    setIsEditing(false);
  };

  const handleConfirmReject = () => {
    if (!rejectingUser) return;
    onRejectUser(rejectingUser.id, rejectReason);
    setRejectingUser(null);
    setRejectReason('License verification pending or credentials incomplete.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-4 py-3.5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">User & RBAC Management</h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Manage Roles, Approvals & Permissions</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleOpenAddUser}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user by name, phone or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-0.5">
            {/* Role Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Role:</span>
              {['all', 'Admin', 'Manager', 'Driver'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition ${
                    roleFilter === r
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r === 'all' ? 'All' : r}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Status:</span>
              {['all', 'Active', 'Pending Approval', 'Rejected'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s === 'Pending Approval' ? 'Pending' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Cards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No Users Found</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Try adjusting your search query or filters.
              </p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                className={`p-3 rounded-2xl border transition ${
                  u.status === 'Pending Approval'
                    ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                    : u.status === 'Rejected'
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                        {u.name.charAt(0)}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900">{u.name}</h4>
                        {currentUser.id === u.id && (
                          <span className="text-[9px] bg-slate-800 text-white px-1.5 py-0.2 rounded font-bold">
                            You
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {u.phone}
                        </span>
                        {u.email && (
                          <span className="hidden sm:flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {u.email}
                          </span>
                        )}
                      </div>

                      {u.notes && (
                        <p className="text-[10px] text-slate-600 mt-1 italic line-clamp-1">
                          {u.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'Admin'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : u.role === 'Manager'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {u.role}
                    </span>

                    <span
                      className={`px-2 py-0.2 rounded text-[9px] font-bold ${
                        u.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : u.status === 'Pending Approval'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : u.status === 'Inactive'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-rose-100 text-rose-700 border border-rose-300'
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSwitchUser(u)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    title="Switch active user session to test role perspective"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Login as {u.name.split(' ')[0]}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {u.status === 'Pending Approval' ? (
                      <>
                        <button
                          onClick={() => setRejectingUser(u)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <UserX className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => onApproveUser(u.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {u.status === 'Active' ? (
                          <button
                            onClick={() => onToggleStatus(u.id, 'Inactive')}
                            className="px-2 py-1 text-slate-600 hover:text-slate-800 text-[10px] font-semibold rounded hover:bg-slate-100"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => onToggleStatus(u.id, 'Active')}
                            className="px-2 py-1 text-emerald-600 hover:text-emerald-700 text-[10px] font-bold rounded hover:bg-emerald-50"
                          >
                            Activate
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditFormData(u);
                            setIsEditing(true);
                          }}
                          className="px-2 py-1 text-blue-600 hover:text-blue-700 text-[10px] font-semibold rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Admin permission allows approving new drivers, managing roles and full subscription control.
        </div>
      </div>

      {/* Reject Reason Sub-Modal */}
      {rejectingUser && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-xs font-bold">Reject User Request</h3>
            </div>
            <p className="text-[11px] text-slate-600">
              Provide a reason for rejecting <span className="font-bold">{rejectingUser.name}</span>. They will be notified.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingUser(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add User Sub-Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">
                {editFormData.id && users.some((u) => u.id === editFormData.id) ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editFormData.role || 'Driver'}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Driver">Driver</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editFormData.status || 'Active'}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as UserStatus })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Notes / License</label>
                <input
                  type="text"
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="e.g. HTV License #LHR-9012"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-xs"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
