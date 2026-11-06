'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/auth';
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  getSiswaList,
  Siswa,
  CreateUserData,
  UpdateUserData,
} from '@/lib/api';
import {
  XIcon,
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  KeyIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  GraduationCapIcon,
  CheckIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  EyeIcon,
  EyeOffIcon,
} from './Icons';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: number;
}

export default function UserManagementModal({
  isOpen,
  onClose,
  currentUserId,
}: UserManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [siswaOptions, setSiswaOptions] = useState<Siswa[]>([]);

  // Create Form State
  const [createData, setCreateData] = useState<CreateUserData>({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'wali_kelas',
    kelas_diampu: '',
    siswa_id: null,
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateUserData>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Reset Password State
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Delete State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadSiswaOptions();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUserList();
      setUsers(data);
    } catch (err: any) {
      console.error('Gagal mengambil daftar pengguna', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSiswaOptions = async () => {
    try {
      const data = await getSiswaList();
      setSiswaOptions(data);
    } catch (err) {
      console.error('Gagal mengambil data siswa untuk relasi akun', err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const payload: CreateUserData = {
        username: createData.username.trim(),
        password: createData.password,
        first_name: createData.first_name?.trim() || '',
        last_name: createData.last_name?.trim() || '',
        email: createData.email?.trim() || '',
        role: createData.role,
        kelas_diampu: createData.role === 'wali_kelas' ? createData.kelas_diampu?.trim() : '',
        siswa_id: createData.role === 'siswa' && createData.siswa_id ? Number(createData.siswa_id) : null,
      };

      await createUser(payload);
      setCreateSuccess(`Akun "${payload.username}" berhasil dibuat!`);
      setCreateData({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        role: 'wali_kelas',
        kelas_diampu: '',
        siswa_id: null,
      });
      loadUsers();
      setTimeout(() => {
        setActiveTab('list');
        setCreateSuccess(null);
      }, 1200);
    } catch (err: any) {
      setCreateError(err.message || 'Gagal membuat pengguna');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role,
      kelas_diampu: user.kelas_diampu || '',
      siswa_id: user.siswa_id || null,
      is_active: user.is_active !== undefined ? user.is_active : true,
    });
    setEditError(null);
    setEditSuccess(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const payload: UpdateUserData = {
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
        email: editFormData.email,
        role: editFormData.role,
        kelas_diampu: editFormData.role === 'wali_kelas' ? editFormData.kelas_diampu : '',
        siswa_id: editFormData.role === 'siswa' ? editFormData.siswa_id : null,
        is_active: editFormData.is_active,
      };

      await updateUser(editingUser.id, payload);
      setEditSuccess('Perubahan data pengguna berhasil disimpan!');
      loadUsers();
      setTimeout(() => {
        setEditingUser(null);
        setEditSuccess(null);
      }, 1000);
    } catch (err: any) {
      setEditError(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setEditLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password minimal 6 karakter');
      return;
    }

    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    try {
      await updateUser(resettingUser.id, { password: newPassword });
      setResetSuccess(`Password untuk ${resettingUser.username} berhasil diperbarui!`);
      setTimeout(() => {
        setResettingUser(null);
        setNewPassword('');
        setResetSuccess(null);
      }, 1200);
    } catch (err: any) {
      setResetError(err.message || 'Gagal mereset password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteUser(deletingUser.id);
      setDeletingUser(null);
      loadUsers();
    } catch (err: any) {
      setDeleteError(err.message || 'Gagal menghapus pengguna');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUsername = u.username.toLowerCase().includes(q);
      const matchName = `${u.first_name} ${u.last_name}`.toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchSiswa = (u.siswa_nama || '').toLowerCase().includes(q);
      const matchKelas = (u.kelas_diampu || '').toLowerCase().includes(q);
      return matchUsername || matchName || matchEmail || matchSiswa || matchKelas;
    }
    return true;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Admin / TU
          </span>
        );
      case 'wali_kelas':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserCheckIcon className="w-3.5 h-3.5" />
            Wali Kelas
          </span>
        );
      case 'siswa':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <GraduationCapIcon className="w-3.5 h-3.5" />
            Santri / Siswa
          </span>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-inner">
              <UsersIcon className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Kelola Pengguna & Hak Akses
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200">
                Atur akun Admin/TU, Wali Kelas, dan Akun Siswa (Santri)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Tutup"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === 'list'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            Daftar Akun Pengguna
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === 'create'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PlusIcon className="w-4 h-4" />
            Tambah Pengguna Baru
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              {/* Search & Filter Toolbar */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1">
                  <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari username, nama santri, kelas, email..."
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                  <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Filter Peran:</span>
                  {[
                    { key: 'all', label: 'Semua' },
                    { key: 'admin', label: 'Admin/TU' },
                    { key: 'wali_kelas', label: 'Wali Kelas' },
                    { key: 'siswa', label: 'Santri' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setRoleFilter(f.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        roleFilter === f.key
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <button
                    onClick={loadUsers}
                    className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-all ml-1"
                    title="Muat ulang"
                  >
                    <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Table / List View */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200">
                  <RefreshCwIcon className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                  <p className="text-sm font-semibold">Memuat data pengguna...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-base font-bold text-slate-800">Tidak ada pengguna ditemukan</p>
                  <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter peran.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Pengguna</th>
                          <th className="py-3 px-4">Nama Lengkap</th>
                          <th className="py-3 px-4">Peran</th>
                          <th className="py-3 px-4">Keterangan Akses</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {filteredUsers.map((u) => {
                          const isSelf = currentUserId === u.id;
                          return (
                            <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                  <span>{u.username}</span>
                                  {isSelf && (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                      Anda
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500">{u.email || '-'}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-900">
                                  {`${u.first_name || ''} ${u.last_name || ''}`.trim() || '-'}
                                </div>
                              </td>
                              <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                              <td className="py-3 px-4">
                                {u.role === 'admin' ? (
                                  <span className="text-xs font-semibold text-purple-700">Akses Penuh Sistem</span>
                                ) : u.role === 'wali_kelas' ? (
                                  <span className="text-xs font-semibold text-emerald-700">
                                    {u.kelas_diampu ? `Wali Kelas: ${u.kelas_diampu}` : 'Semua Kelas'}
                                  </span>
                                ) : u.role === 'siswa' ? (
                                  <span className="text-xs font-semibold text-sky-800">
                                    {u.siswa_nama ? (
                                      <>
                                        Santri: <strong className="text-sky-950">{u.siswa_nama}</strong>
                                        {u.siswa_nisn && ` (NISN: ${u.siswa_nisn})`}
                                        {u.siswa_kelas && ` [${u.siswa_kelas}]`}
                                      </>
                                    ) : (
                                      <span className="text-amber-600 italic">Belum ditautkan ke data Santri</span>
                                    )}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {u.is_active !== false ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">
                                    Aktif
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">
                                    Nonaktif
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => openEditModal(u)}
                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Edit Pengguna"
                                  >
                                    <EditIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setResettingUser(u);
                                      setNewPassword('');
                                      setResetError(null);
                                      setResetSuccess(null);
                                    }}
                                    className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-all"
                                    title="Ganti Password"
                                  >
                                    <KeyIcon className="w-4 h-4" />
                                  </button>
                                  {!isSelf && (
                                    <button
                                      onClick={() => {
                                        setDeletingUser(u);
                                        setDeleteError(null);
                                      }}
                                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-all"
                                      title="Hapus Pengguna"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {filteredUsers.map((u) => {
                      const isSelf = currentUserId === u.id;
                      return (
                        <div
                          key={u.id}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-base">{u.username}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                    Anda
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600">
                                {`${u.first_name || ''} ${u.last_name || ''}`.trim() || '-'} &bull;{' '}
                                {u.email || 'Tanpa email'}
                              </p>
                            </div>
                            <div>{getRoleBadge(u.role)}</div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                            <span className="font-bold text-slate-600 block mb-1">Akses:</span>
                            {u.role === 'admin' ? (
                              <span className="font-semibold text-purple-700">Akses Penuh Sistem</span>
                            ) : u.role === 'wali_kelas' ? (
                              <span className="font-semibold text-emerald-700">
                                {u.kelas_diampu ? `Wali Kelas: ${u.kelas_diampu}` : 'Semua Kelas'}
                              </span>
                            ) : u.role === 'siswa' ? (
                              <span className="font-semibold text-sky-800">
                                {u.siswa_nama ? (
                                  <>
                                    Santri: <strong>{u.siswa_nama}</strong>
                                    {u.siswa_nisn && ` (NISN: ${u.siswa_nisn})`}
                                  </>
                                ) : (
                                  <span className="text-amber-600 italic">Belum ditautkan</span>
                                )}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <div>
                              {u.is_active !== false ? (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                  Aktif
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                                  Nonaktif
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(u)}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                              >
                                <EditIcon className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setResettingUser(u);
                                  setNewPassword('');
                                  setResetError(null);
                                  setResetSuccess(null);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1"
                              >
                                <KeyIcon className="w-3.5 h-3.5" />
                                Sandi
                              </button>
                              {!isSelf && (
                                <button
                                  onClick={() => {
                                    setDeletingUser(u);
                                    setDeleteError(null);
                                  }}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                  title="Hapus"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Tambah Pengguna Baru */
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
              <div className="mb-5 pb-4 border-b border-slate-100">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Formulir Tambah Akun Pengguna
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Lengkapi data akun untuk Wali Kelas, Santri (Siswa), atau Staf Tata Usaha / Admin.
                </p>
              </div>

              {createError && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
                  <AlertCircleIcon className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm">
                  <CheckIcon className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{createSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createData.username}
                      onChange={(e) => setCreateData({ ...createData, username: e.target.value })}
                      placeholder="contoh: ustadz_ahmad"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCreatePassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={createData.password}
                        onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-3.5 pr-10 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCreatePassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Nama Depan</label>
                    <input
                      type="text"
                      value={createData.first_name}
                      onChange={(e) => setCreateData({ ...createData, first_name: e.target.value })}
                      placeholder="Nama depan"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Nama Belakang</label>
                    <input
                      type="text"
                      value={createData.last_name}
                      onChange={(e) => setCreateData({ ...createData, last_name: e.target.value })}
                      placeholder="Nama belakang"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Email (Opsional)</label>
                  <input
                    type="email"
                    value={createData.email}
                    onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                    placeholder="email@pesantren.sch.id"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* Peran / Role Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Peran Pengguna (Hak Akses) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        createData.role === 'wali_kelas'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="role"
                          checked={createData.role === 'wali_kelas'}
                          onChange={() => setCreateData({ ...createData, role: 'wali_kelas' })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-bold text-slate-900 text-sm">Wali Kelas</span>
                      </div>
                      <span className="text-xs text-slate-600 leading-tight">
                        Dapat menginput & memperbarui nilai siswa per kelas
                      </span>
                    </label>

                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        createData.role === 'siswa'
                          ? 'border-sky-600 bg-sky-50/70 shadow-sm ring-1 ring-sky-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="role"
                          checked={createData.role === 'siswa'}
                          onChange={() => setCreateData({ ...createData, role: 'siswa' })}
                          className="text-sky-600 focus:ring-sky-500"
                        />
                        <span className="font-bold text-slate-900 text-sm">Santri / Siswa</span>
                      </div>
                      <span className="text-xs text-slate-600 leading-tight">
                        Hanya bisa melihat biodata & hasil nilai dirinya sendiri
                      </span>
                    </label>

                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        createData.role === 'admin'
                          ? 'border-purple-600 bg-purple-50/70 shadow-sm ring-1 ring-purple-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="role"
                          checked={createData.role === 'admin'}
                          onChange={() => setCreateData({ ...createData, role: 'admin' })}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-bold text-slate-900 text-sm">Admin / TU</span>
                      </div>
                      <span className="text-xs text-slate-600 leading-tight">
                        Kelola seluruh santri, nilai, import data, dan akun pengguna
                      </span>
                    </label>
                  </div>
                </div>

                {/* Conditional fields based on role */}
                {createData.role === 'wali_kelas' && (
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 animate-in fade-in">
                    <label className="block text-xs font-bold text-emerald-950 mb-1">
                      Kelas yang Diampu (Opsional)
                    </label>
                    <input
                      type="text"
                      value={createData.kelas_diampu || ''}
                      onChange={(e) => setCreateData({ ...createData, kelas_diampu: e.target.value })}
                      placeholder="contoh: 7A, 8B, atau kosongkan untuk semua kelas"
                      className="w-full px-3.5 py-2 rounded-lg border border-emerald-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                    />
                    <p className="text-[11px] text-emerald-700 mt-1">
                      Wali kelas akan otomatis diarahkan untuk menginput nilai pada kelas ini.
                    </p>
                  </div>
                )}

                {createData.role === 'siswa' && (
                  <div className="p-3.5 bg-sky-50/60 rounded-xl border border-sky-200 animate-in fade-in">
                    <label className="block text-xs font-bold text-sky-950 mb-1">
                      Tautkan Akun ke Data Santri <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={createData.siswa_id || ''}
                      onChange={(e) =>
                        setCreateData({
                          ...createData,
                          siswa_id: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-sky-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                    >
                      <option value="">-- Pilih Data Santri --</option>
                      {siswaOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama_lengkap} (NISN: {s.nisn} - Kelas {s.kelas})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-sky-700 mt-1">
                      Saat santri login, sistem hanya akan menampilkan biodata dan nilai santri yang dipilih di atas.
                    </p>
                  </div>
                )}

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {createLoading ? (
                      <>
                        <RefreshCwIcon className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Buat Akun Pengguna
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">
            Password akun dienkripsi dengan standar aman PBKDF2-SHA256 bawaan Django.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* ================= Sub-Modal: Edit Pengguna ================= */}
      {editingUser && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <EditIcon className="w-4 h-4 text-emerald-600" />
                Edit Akun: {editingUser.username}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5">
              {editError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-800 text-xs border border-rose-200">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                  {editSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Nama Depan</label>
                  <input
                    type="text"
                    value={editFormData.first_name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Nama Belakang</label>
                  <input
                    type="text"
                    value={editFormData.last_name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Peran Pengguna</label>
                <select
                  value={editFormData.role || 'wali_kelas'}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="wali_kelas">Wali Kelas</option>
                  <option value="siswa">Santri / Siswa</option>
                  <option value="admin">Admin / TU</option>
                </select>
              </div>

              {editFormData.role === 'wali_kelas' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Kelas yang Diampu</label>
                  <input
                    type="text"
                    value={editFormData.kelas_diampu || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, kelas_diampu: e.target.value })}
                    placeholder="contoh: 7A"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {editFormData.role === 'siswa' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tautkan ke Data Santri
                  </label>
                  <select
                    value={editFormData.siswa_id || ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        siswa_id: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Pilih Santri --</option>
                    {siswaOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama_lengkap} (NISN: {s.nisn} - Kelas {s.kelas})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.is_active}
                    onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800">Akun Aktif (Dapat Login)</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {editLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= Sub-Modal: Reset Password ================= */}
      {resettingUser && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                <KeyIcon className="w-4 h-4 text-amber-700" />
                Ganti Password: {resettingUser.username}
              </h3>
              <button
                onClick={() => setResettingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-5 space-y-3.5">
              {resetError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-800 text-xs border border-rose-200">
                  {resetError}
                </div>
              )}
              {resetSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                  {resetSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Password Baru</label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-3.5 pr-10 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Password akan otomatis dienkripsi dengan PBKDF2-SHA256 sebelum disimpan.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {resetLoading ? 'Menyimpan...' : 'Perbarui Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= Sub-Modal: Konfirmasi Hapus ================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-full">
                <TrashIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Akun Pengguna?</h3>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus akun{' '}
              <strong className="text-slate-900 font-bold">{deletingUser.username}</strong> ({deletingUser.role})?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 text-xs border border-rose-200">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={deleteLoading}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
