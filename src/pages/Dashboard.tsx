import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface Store {
  id: string;
  name: string;
}

interface StoreOwner {
  id: string;
  email: string;
  storeId: string | null;
  createdAt: string;
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [storeOwners, setStoreOwners] = useState<StoreOwner[]>([]);
  const [storeName, setStoreName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerStoreId, setOwnerStoreId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const loadStores = () => {
    if (!isSuperAdmin) return;
    api.get<Store[]>('/stores').then(setStores).catch(() => setStores([]));
  };

  const loadStoreOwners = () => {
    if (!isSuperAdmin) return;
    api.get<StoreOwner[]>('/auth/store-owners').then(setStoreOwners).catch(() => setStoreOwners([]));
  };

  useEffect(() => {
    loadStores();
    loadStoreOwners();
  }, [isSuperAdmin]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      await api.post('/stores', { name: storeName });
      setStoreName('');
      setMessage('Store created.');
      loadStores();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStoreOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/store-owners', {
        email: ownerEmail,
        password: ownerPassword,
        storeId: ownerStoreId || undefined,
      });
      setOwnerEmail('');
      setOwnerPassword('');
      setOwnerStoreId('');
      setMessage('Store owner created.');
      loadStoreOwners();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to create store owner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 640 }}>
      <h2>Dashboard</h2>
      <p>Logged in as {user?.email} (role: {user?.role})</p>
      <button onClick={() => logout()} style={{ marginBottom: '1.5rem' }}>Logout</button>

      {isSuperAdmin && (
        <>
          <hr style={{ margin: '1.5rem 0' }} />
          <h3>Create Store</h3>
          <form onSubmit={handleCreateStore} style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Store name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8 }}
            />
            <button type="submit" disabled={loading}>Create Store</button>
          </form>

          <h3>Create Store Owner</h3>
          <form onSubmit={handleCreateStoreOwner} style={{ marginBottom: '1.5rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8 }}
            />
            <input
              type="password"
              placeholder="Password"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8, padding: 8 }}
            />
            <select
              value={ownerStoreId}
              onChange={(e) => setOwnerStoreId(e.target.value)}
              style={{ width: '100%', marginBottom: 8, padding: 8 }}
            >
              <option value="">No store</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button type="submit" disabled={loading}>Create Store Owner</button>
          </form>

          {message && <p style={{ color: message.startsWith('F') ? 'red' : 'green', marginBottom: '1rem' }}>{message}</p>}

          <h3>Store Owners</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {storeOwners.map((o) => (
              <li key={o.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                {o.email} {o.storeId ? `(store: ${stores.find(s => s.id === o.storeId)?.name ?? o.storeId})` : '(no store)'}
              </li>
            ))}
            {storeOwners.length === 0 && <li style={{ color: '#666' }}>No store owners yet.</li>}
          </ul>
        </>
      )}
    </div>
  );
}
