import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, Package, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import type { Product, Category } from '../../types';

const emptyProduct = {
  name: '', slug: '', description: '', brand: '', category_id: '',
  price: 0, compare_at_price: null as number | null,
  image_url: '', images: [] as string[],
  puffs: null as number | null, battery: '', intensity: '',
  flavors: [] as string[], colors: [] as string[],
  in_stock: true, stock_count: 0,
  is_featured: false, is_new: false, is_limited: false,
  badge: '', technology: '', features: [] as Record<string, string>[],
};

function getPublicUrl(path: string) {
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [flavorInput, setFlavorInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setProducts(data as Product[]);
      setLoading(false);
    });
    supabase.from('categories').select('*').order('display_order').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const updateForm = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const uploadMainImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
    if (!error) {
      updateForm('image_url', getPublicUrl(path));
    } else {
      console.error('Upload error:', error);
    }
    setUploading(false);
  };

  const uploadGalleryImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
    if (!error) {
      updateForm('images', [...form.images, getPublicUrl(path)]);
    } else {
      console.error('Upload error:', error);
    }
    setUploading(false);
  };

  const removeGalleryImage = (url: string) => {
    updateForm('images', form.images.filter(x => x !== url));
  };

  const openNewForm = () => {
    setEditing(null);
    setForm({ ...emptyProduct });
    setFlavorInput('');
    setColorInput('');
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditing(product.id);
    setForm({
      name: product.name, slug: product.slug, description: product.description || '',
      brand: product.brand || '', category_id: product.category_id || '',
      price: product.price, compare_at_price: product.compare_at_price,
      image_url: product.image_url || '', images: product.images || [],
      puffs: product.puffs, battery: product.battery || '', intensity: product.intensity || '',
      flavors: product.flavors || [], colors: product.colors || [],
      in_stock: product.in_stock, stock_count: product.stock_count || 0,
      is_featured: product.is_featured, is_new: product.is_new, is_limited: product.is_limited,
      badge: product.badge || '', technology: product.technology || '',
      features: (product.features as Record<string, string>[]) || [],
    });
    setFlavorInput('');
    setColorInput('');
    setShowForm(true);
  };

  const addFlavor = () => {
    if (flavorInput.trim() && !form.flavors.includes(flavorInput.trim())) {
      updateForm('flavors', [...form.flavors, flavorInput.trim()]);
      setFlavorInput('');
    }
  };

  const removeFlavor = (f: string) => updateForm('flavors', form.flavors.filter(x => x !== f));

  const addColor = () => {
    if (colorInput.trim() && !form.colors.includes(colorInput.trim())) {
      updateForm('colors', [...form.colors, colorInput.trim()]);
      setColorInput('');
    }
  };

  const removeColor = (c: string) => updateForm('colors', form.colors.filter(x => x !== c));

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || generateSlug(form.name);
    const payload = {
      name: form.name, slug, description: form.description, brand: form.brand,
      category_id: form.category_id || null, price: form.price,
      compare_at_price: form.compare_at_price || null,
      image_url: form.image_url, images: form.images,
      puffs: form.puffs || null, battery: form.battery || null,
      intensity: form.intensity || null, flavors: form.flavors, colors: form.colors,
      in_stock: form.in_stock, stock_count: form.stock_count,
      is_featured: form.is_featured, is_new: form.is_new, is_limited: form.is_limited,
      badge: form.badge || null, technology: form.technology || null,
      features: form.features,
    };

    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing);
    } else {
      await supabase.from('products').insert(payload);
    }

    const { data } = await supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false });
    if (data) setProducts(data as Product[]);
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  if (authLoading) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerenciar Produtos</h1>
            <p className="text-gray-500 mt-1">{products.length} produtos cadastrados</p>
          </div>
          <button onClick={openNewForm}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all">
            <Plus size={18} /> Novo Produto
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-[#111] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(product => (
              <motion.div key={product.id} layout
                className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={20} className="text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold truncate">{product.name}</h3>
                    {product.badge && (
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded">{product.badge}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{product.brand} - R$ {product.price.toFixed(2).replace('.', ',')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditForm(product)}
                    className="p-2 text-gray-500 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(product.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 pb-8 overflow-y-auto"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-2xl mx-4 bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <h2 className="text-xl font-bold text-white">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  {/* Main Image Upload */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Imagem Principal</label>
                    <div className="relative">
                      {form.image_url ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#111] border border-white/10">
                          <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => updateForm('image_url', '')}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white hover:bg-red-500/80 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/10 hover:border-cyan-500/30 bg-[#111] flex flex-col items-center justify-center gap-3 transition-colors disabled:opacity-50"
                        >
                          <Upload size={32} className="text-gray-600" />
                          <span className="text-gray-500 text-sm">
                            {uploading ? 'Enviando...' : 'Clique para enviar imagem'}
                          </span>
                          <span className="text-gray-600 text-xs">PNG, JPG ate 5MB</span>
                        </button>
                      )}
                      {form.image_url && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="mt-2 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 text-sm transition-colors disabled:opacity-50"
                        >
                          <Upload size={14} /> Trocar imagem
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) uploadMainImage(file);
                          e.target.value = '';
                        }}
                      />
                    </div>
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Galeria de Imagens</label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {form.images.filter(Boolean).map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#111] border border-white/10">
                          <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeGalleryImage(url)}
                            className="absolute top-1 right-1 p-1 bg-black/60 backdrop-blur-sm rounded-md text-white hover:bg-red-500/80 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-cyan-500/30 bg-[#111] flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <Plus size={20} className="text-gray-600" />
                      </button>
                    </div>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => {
                        const files = e.target.files;
                        if (files) {
                          Array.from(files).forEach(file => uploadGalleryImage(file));
                        }
                        e.target.value = '';
                      }}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Nome *</label>
                      <input value={form.name} onChange={e => { updateForm('name', e.target.value); updateForm('slug', generateSlug(e.target.value)); }}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                        placeholder="Elf Bar BC10000" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Slug</label>
                      <input value={form.slug} onChange={e => updateForm('slug', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                        placeholder="elf-bar-bc10000" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Marca</label>
                      <input value={form.brand} onChange={e => updateForm('brand', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                        placeholder="Elf Bar" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Categoria *</label>
                      <select value={form.category_id} onChange={e => updateForm('category_id', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50">
                        <option value="">Selecione</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Descricao</label>
                    <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
                      placeholder="Descricao do produto..." />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Preco *</label>
                      <input type="number" step="0.01" value={form.price} onChange={e => updateForm('price', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Preco Antigo</label>
                      <input type="number" step="0.01" value={form.compare_at_price || ''} onChange={e => updateForm('compare_at_price', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Badge</label>
                      <select value={form.badge} onChange={e => updateForm('badge', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50">
                        <option value="">Nenhum</option>
                        <option value="Lancamento">Lancamento</option>
                        <option value="Mais Vendido">Mais Vendido</option>
                        <option value="Premium">Premium</option>
                        <option value="Best Seller">Best Seller</option>
                        <option value="Edicao Limitada">Edicao Limitada</option>
                        <option value="Novo">Novo</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Puffs</label>
                      <input type="number" value={form.puffs || ''} onChange={e => updateForm('puffs', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Bateria</label>
                      <input value={form.battery} onChange={e => updateForm('battery', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                        placeholder="650mAh" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Intensidade</label>
                      <input value={form.intensity} onChange={e => updateForm('intensity', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                        placeholder="Media" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Tecnologia</label>
                    <input value={form.technology} onChange={e => updateForm('technology', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                      placeholder="Mesh Coil 1.2ohm" />
                  </div>

                  {/* Sabores */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Sabores</label>
                    <div className="flex gap-2 mb-2">
                      <input value={flavorInput} onChange={e => setFlavorInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFlavor())}
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                        placeholder="Adicionar sabor..." />
                      <button onClick={addFlavor} className="px-4 py-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-colors text-sm font-medium">
                        Adicionar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.flavors.map(f => (
                        <span key={f} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">
                          {f}
                          <button onClick={() => removeFlavor(f)} className="text-gray-500 hover:text-red-400"><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cores */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Cores</label>
                    <div className="flex gap-2 mb-2">
                      <input value={colorInput} onChange={e => setColorInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())}
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                        placeholder="Adicionar cor..." />
                      <button onClick={addColor} className="px-4 py-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-colors text-sm font-medium">
                        Adicionar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.colors.map(c => (
                        <span key={c} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">
                          {c}
                          <button onClick={() => removeColor(c)} className="text-gray-500 hover:text-red-400"><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.in_stock} onChange={e => updateForm('in_stock', e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50" />
                        <span className="text-sm text-gray-300">Em estoque</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_featured} onChange={e => updateForm('is_featured', e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50" />
                        <span className="text-sm text-gray-300">Destaque</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_new} onChange={e => updateForm('is_new', e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50" />
                        <span className="text-sm text-gray-300">Novo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_limited} onChange={e => updateForm('is_limited', e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50" />
                        <span className="text-sm text-gray-300">Limitado</span>
                      </label>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Qtd em Estoque</label>
                      <input type="number" value={form.stock_count} onChange={e => updateForm('stock_count', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-white/5">
                  <button onClick={() => setShowForm(false)}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors text-sm">
                    Cancelar
                  </button>
                  <button onClick={handleSave} disabled={saving || !form.name || !form.category_id}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/25 disabled:opacity-50">
                    <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Produto'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
