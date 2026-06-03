'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Layers,
  FileSpreadsheet,
  Users,
  AlertTriangle,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Sparkles,
  RefreshCw,
  FolderPlus,
  Loader2,
  ShieldCheck,
  Eye,
  Info,
  IndianRupee,
  Package,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import AdminOrdersSection from './AdminOrdersSection';
import OrderSummaryPanel from './OrderSummaryPanel';
import OrderedProductsTable from './OrderedProductsTable';
import ImagePreviewModal from './ImagePreviewModal';
import { formatPrice } from '../../utils/currency';

export default function AdminPanel({ activeTab = 'dashboard' }) {
  const { user, token, API_URL } = useAuth();
  const router = useRouter();

  // Server Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & details
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // High-res image modal preview

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    oldPrice: '',
    categoryId: '',
    stock: '10',
    sku: '',
    isFeatured: false,
    isSale: false,
    images: [],
  });

  // Category Form State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '' });

  // Notifications/Toasts
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [uploading, setUploading] = useState(false);

  // Settings mock state
  const [settingsForm, setSettingsForm] = useState({
    storeName: 'Chadani Cosmetic Store',
    contactEmail: 'support@chadanicosmetic.com',
    currency: 'NPR',
    smtpHost: process.env.NEXT_PUBLIC_SMTP_HOST || 'smtp.gmail.com',
    smtpPort: '587'
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Fetch Data from Server
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
      
      const [prodRes, catRes, orderRes, custRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/orders`, authHeaders),
        axios.get(`${API_URL}/auth/customers`, authHeaders)
      ]);
      
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setOrders(orderRes.data);
      setCustomers(custRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast('Error syncing live database records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      fetchData();
    }
  }, [user, token, fetchData]);

  // Compute Statistics
  const stats = useMemo(() => {
    const totalSales = orders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((acc, o) => acc + o.totalAmount, 0);

    return {
      productsCount: products.length,
      ordersCount: orders.length,
      totalSales: totalSales,
      customersCount: customers.length
    };
  }, [products, orders, customers]);

  // Stock alerts
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock < 5);
  }, [products]);

  const uploadAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const uploadImageFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axios.post(`${API_URL}/upload`, formData, uploadAuthHeaders());
    return res.data.url;
  };

  const uploadMultipleImageFiles = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const res = await axios.post(`${API_URL}/upload/multiple`, formData, uploadAuthHeaders());
    return res.data;
  };

  const handleImageUpload = async (e, type = 'product') => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      if (type === 'product') {
        setProductForm((prev) => ({ ...prev, images: [...(prev.images || []), url] }));
      } else {
        setCategoryForm((prev) => ({ ...prev, image: url }));
      }
      showToast('Image uploaded successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to upload image.';
      showToast(errorMsg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleProductImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) {
      showToast('Please select image files only.', 'error');
      return;
    }
    e.target.value = '';
    setUploading(true);
    try {
      const result = await uploadMultipleImageFiles(files);
      const urls = result.urls || [];
      if (!urls.length) {
        showToast(result.error || 'No images were uploaded.', 'error');
        return;
      }
      setProductForm((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
      if (result.failed > 0) {
        showToast(
          `${urls.length} uploaded, ${result.failed} failed.`,
          'error'
        );
      } else {
        showToast(
          urls.length === 1 ? 'Image uploaded successfully!' : `${urls.length} images uploaded!`
        );
      }
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        (error.response?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to upload images. Try one at a time or paste URLs.');
      showToast(msg, 'error');
      console.error('Multi image upload error:', error.response?.data || error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeProductImage = (index) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const setProductMainImage = (index) => {
    setProductForm((prev) => {
      if (index <= 0) return prev;
      const next = [...prev.images];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return { ...prev, images: next };
    });
  };

  const addProductImageUrl = (url) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setProductForm((prev) => ({ ...prev, images: [...(prev.images || []), trimmed] }));
  };

  // Product form submission
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        discountPrice: product.discountPrice?.toString() || '',
        oldPrice: product.oldPrice?.toString() || '',
        categoryId: product.categoryId,
        stock: product.stock.toString(),
        sku: product.sku || '',
        isFeatured: product.isFeatured,
        isSale: product.isSale,
        images:
          product.images?.length > 0
            ? [...product.images]
            : product.image
              ? [product.image]
              : [],
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        oldPrice: '',
        categoryId: categories[0]?.id || '',
        stock: '10',
        sku: '',
        isFeatured: false,
        isSale: false,
        images: [],
      });
    }
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        images: productForm.images || [],
        image: productForm.images?.[0] || null,
        price: parseFloat(productForm.price),
        discountPrice: productForm.discountPrice ? parseFloat(productForm.discountPrice) : null,
        oldPrice: productForm.oldPrice ? parseFloat(productForm.oldPrice) : null,
        stock: parseInt(productForm.stock),
      };

      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, payload, authHeaders);
        showToast('Product updated successfully!');
      } else {
        await axios.post(`${API_URL}/products`, payload, authHeaders);
        showToast('New product listed successfully!');
      }
      setShowProductModal(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to save product.', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Product deleted from inventory.');
      fetchData();
    } catch (error) {
      showToast('Failed to delete product.', 'error');
    }
  };

  // Category Actions
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name, image: cat.image || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', image: '' });
    }
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
      if (editingCategory) {
        await axios.put(`${API_URL}/categories/${editingCategory.id}`, categoryForm, authHeaders);
        showToast('Category updated!');
      } else {
        await axios.post(`${API_URL}/categories`, categoryForm, authHeaders);
        showToast('Category created!');
      }
      setShowCategoryModal(false);
      setCategoryForm({ name: '', image: '' });
      fetchData();
    } catch (error) {
      showToast('Failed to save category.', 'error');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!confirm('Deleting this category will affect related products. Proceed?')) return;
    try {
      await axios.delete(`${API_URL}/categories/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Category removed.');
      fetchData();
    } catch (error) {
      showToast('Failed to delete category.', 'error');
    }
  };

  // Order workflow status updates
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(`Order status updated to: ${newStatus.toUpperCase()}`);
      
      // Update selected order details view if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
      
      fetchData();
    } catch (error) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOrder(res.data);
      setShowOrderModal(true);
    } catch (error) {
      showToast('Could not retrieve order snapshot data.', 'error');
    }
  };

  // Settings save handler
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    showToast('Boutique configurations updated successfully!');
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      {/* Toast Alert */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border animate-slideIn ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-800 border-emerald-100'
        }`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5 text-emerald-600" />}
          <span className="text-xs font-bold leading-normal">{toast.message}</span>
        </div>
      )}

      {/* Image Preview Zoom Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[300] bg-rose-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2 border border-pink-100 animate-zoomIn" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-rose-950 hover:bg-rose-900 hover:text-white transition-all shadow-md">
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Preview Zoom" className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="p-2.5 rounded-xl border border-pink-100 hover:bg-rose-900 hover:text-white transition-all duration-300 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-950 bg-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {loading && products.length === 0 && activeTab !== 'settings' && (
            <div className="flex flex-col justify-center items-center py-40 text-rose-900/40 gap-4 animate-pulse">
              <Loader2 className="w-12 h-12 animate-spin text-rose-600" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Updating Records...</span>
            </div>
          )}

          {(!loading || products.length > 0) && (
            <div className="animate-fadeIn">
              
              {/* ==================== DASHBOARD TAB ==================== */}
              {activeTab === 'dashboard' && (
                <div className="space-y-10">
                  {/* Banner */}
                  <div className="bg-rose-950 text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-900 rounded-full translate-x-20 -translate-y-20 opacity-30 blur-2xl" />
                    <div className="space-y-3 relative z-10">
                      <span className="text-[10px] font-black tracking-[0.3em] text-rose-300 uppercase">Executive Suite</span>
                      <h2 className="text-3xl sm:text-4xl font-serif font-black leading-tight">Welcome, {user.name}</h2>
                      <p className="text-xs text-rose-200/70 max-w-md font-semibold">
                        Here is a summary of your premium luxury bangles, cosmetic sales, inventory statuses, and recent client activity.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenProductModal(null)}
                      className="px-6 py-3.5 bg-white text-rose-950 hover:bg-rose-50 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg relative z-10 transition-transform active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-rose-900" />
                      <span>Add Listing</span>
                    </button>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { name: 'Total Revenue', value: formatPrice(stats.totalSales), icon: TrendingUp, desc: 'Gross Earnings', color: 'bg-rose-50 text-rose-900 border-rose-100' },
                      { name: 'Orders Processed', value: stats.ordersCount, icon: FileSpreadsheet, desc: 'Sales Logged', color: 'bg-pink-50 text-pink-900 border-pink-100' },
                      { name: 'Active Catalog', value: stats.productsCount, icon: ShoppingBag, desc: 'Total SKUs', color: 'bg-amber-50 text-amber-900 border-amber-100' },
                      { name: 'Client Directory', value: stats.customersCount, icon: Users, desc: 'Registered Buyers', color: 'bg-emerald-50 text-emerald-900 border-emerald-100' },
                    ].map((m, idx) => {
                      const Icon = m.icon;
                      return (
                        <div key={idx} className="bg-white border border-pink-50 rounded-[2rem] p-7 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                          <div className="space-y-2">
                            <span className="text-[10px] text-rose-950/40 uppercase tracking-widest block font-black">{m.name}</span>
                            <span className="text-3xl font-black text-rose-950 block">{m.value}</span>
                            <span className="text-[9px] text-rose-600/60 uppercase font-black block">{m.desc}</span>
                          </div>
                          <div className={`p-4 rounded-xl border ${m.color} shadow-sm group-hover:scale-105 transition-transform`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Critical alerts */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 bg-white border border-pink-100/70 rounded-[2.5rem] p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-6 pb-3 border-b border-pink-50">
                        <h3 className="font-serif font-black text-xl text-rose-950 flex items-center gap-2.5">
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                          Inventory Warning Alerts
                        </h3>
                        <span className="text-[10px] bg-rose-50 text-rose-900 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                          {lowStockProducts.length} Items Low
                        </span>
                      </div>

                      {lowStockProducts.length === 0 ? (
                        <div className="text-center py-16 text-rose-900/40 text-xs font-black uppercase tracking-widest bg-[#fffafb] rounded-2xl border-2 border-dashed border-pink-100">
                          ✨ All products are adequately stocked.
                        </div>
                      ) : (
                        <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {lowStockProducts.map((p) => (
                            <div key={p.id} className="p-4 bg-pink-50/20 hover:bg-pink-50/40 rounded-xl flex items-center justify-between transition-colors border border-pink-100/30">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-pink-100 flex-shrink-0">
                                  {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-pink-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-pink-300" /></div>}
                                </div>
                                <div>
                                  <span className="font-extrabold text-xs text-rose-950 block">{p.name}</span>
                                  <span className="text-[9px] text-rose-900/40 font-bold block">SKU: {p.sku || 'N/A'}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-black text-red-600 px-3 py-1 bg-red-50 rounded-full border border-red-100">
                                Only {p.stock} units left
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick actions panel */}
                    <div className="lg:col-span-4 bg-white border border-pink-100/70 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className="font-serif font-black text-xl text-rose-950">Quick Operations</h3>
                        <p className="text-xs text-rose-900/60 font-semibold leading-relaxed">
                          Rapidly perform core boutique updates:
                        </p>
                      </div>
                      <div className="space-y-3 mt-6">
                        <button onClick={() => handleOpenProductModal(null)} className="w-full py-4.5 bg-rose-900 hover:bg-rose-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                          <Plus className="w-4 h-4" />
                          <span>Create Listing</span>
                        </button>
                        <button onClick={() => handleOpenCategoryModal(null)} className="w-full py-4.5 border border-pink-200 hover:bg-pink-50/50 text-rose-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer bg-white">
                          <FolderPlus className="w-4 h-4 text-rose-800" />
                          <span>Add Category</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== PRODUCTS TAB ==================== */}
              {activeTab === 'products' && (
                <div className="bg-white border border-pink-100/70 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-5 border-b border-pink-50">
                    <div>
                      <h3 className="font-serif font-black text-2xl text-rose-950">Active Inventory</h3>
                      <p className="text-[10px] text-rose-900/40 font-black uppercase tracking-wider mt-1">Manage Listings, stock, & promotional pricing</p>
                    </div>
                    <button onClick={() => handleOpenProductModal(null)} className="px-6 py-3.5 bg-rose-900 hover:bg-rose-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 cursor-pointer">
                      <Plus className="w-4 h-4" />
                      <span>Create Listing</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-pink-50 text-rose-950/40 font-black uppercase text-[10px] tracking-[0.2em]">
                          <th className="py-4 px-4">Visual & Listing</th>
                          <th className="py-4 px-4">SKU</th>
                          <th className="py-4 px-4">Category</th>
                          <th className="py-4 px-4">Original / Sale Price</th>
                          <th className="py-4 px-4 text-center">Status</th>
                          <th className="py-4 px-4 text-right">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-50/30">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-pink-50/20 transition-colors">
                            <td className="py-5 px-4">
                              <div className="flex items-center gap-4.5">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-pink-100 flex-shrink-0 cursor-zoom-in bg-pink-50" onClick={() => p.image && setPreviewImage(p.image)}>
                                  {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-pink-200" /></div>}
                                </div>
                                <div className="space-y-1">
                                  <span className="font-extrabold text-sm text-rose-950 block leading-tight">{p.name}</span>
                                  <div className="flex gap-2">
                                    {p.isFeatured && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded border border-amber-100">Featured</span>}
                                    {p.isSale && <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[8px] font-black uppercase tracking-widest rounded border border-rose-100">Sale</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-4 font-mono font-bold text-xs text-rose-900/60">{p.sku || 'N/A'}</td>
                            <td className="py-5 px-4 font-extrabold text-xs text-rose-950/70">{p.category?.name || 'General'}</td>
                            <td className="py-5 px-4 text-sm font-bold">
                              {p.discountPrice ? (
                                <div className="space-y-0.5">
                                  <span className="text-rose-900 font-extrabold block">{formatPrice(p.discountPrice)}</span>
                                  <span className="text-[10px] text-rose-900/40 line-through block">{formatPrice(p.price)}</span>
                                </div>
                              ) : (
                                <span className="text-rose-950 font-extrabold">{formatPrice(p.price)}</span>
                              )}
                            </td>
                            <td className="py-5 px-4 text-center">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.stock <= 0 ? 'bg-red-50 text-red-600 border border-red-100' : p.stock < 5 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {p.stock} units
                              </span>
                            </td>
                            <td className="py-5 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleOpenProductModal(p)} className="p-2.5 rounded-xl bg-pink-50/50 text-rose-950 hover:bg-rose-900 hover:text-white transition-all cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-2.5 rounded-xl bg-pink-50/50 text-rose-950 hover:bg-red-600 hover:text-white transition-all cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ==================== CATEGORIES TAB ==================== */}
              {activeTab === 'categories' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
                  
                  {/* Left Side: Create / Edit Form */}
                  <div className="lg:col-span-5 bg-white border border-pink-100/70 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                    <h3 className="font-serif font-black text-xl text-rose-950 flex items-center gap-2.5">
                      <FolderPlus className="w-5 h-5 text-rose-800" />
                      {editingCategory ? 'Edit Collection' : 'Launch New Collection'}
                    </h3>
                    <form onSubmit={handleCategorySubmit} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1.5">Collection Name</label>
                        <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Bangles, Cosmetics, etc." className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100/70 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-300 focus:outline-none" required />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1.5">Cover Image Url</label>
                        <div className="relative">
                          <input type="text" value={categoryForm.image} onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })} placeholder="https://..." className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100/70 rounded-xl text-xs font-bold pr-28 focus:ring-2 focus:ring-rose-300 focus:outline-none" />
                          <label className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-rose-900 text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-md hover:bg-rose-950 transition-colors">
                            <Plus className="w-3 h-3" />
                            <span>{uploading ? '...' : 'Upload'}</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'category')} disabled={uploading} />
                          </label>
                        </div>
                      </div>

                      {categoryForm.image && (
                        <div className="w-full h-32 rounded-xl border border-pink-100 overflow-hidden bg-pink-50 shadow-inner">
                          <img src={categoryForm.image} alt="Category preview" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        {editingCategory && (
                          <button type="button" onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', image: '' }); }} className="flex-1 py-3.5 border border-pink-200 hover:bg-pink-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-950 bg-white">Cancel</button>
                        )}
                        <button type="submit" className="flex-grow py-3.5 bg-rose-900 hover:bg-rose-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">{editingCategory ? 'Update' : 'Publish'}</button>
                      </div>
                    </form>
                  </div>

                  {/* Right Side: Active list */}
                  <div className="lg:col-span-7 bg-white border border-pink-100/70 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                    <h3 className="font-serif font-black text-xl text-rose-950">Boutique Collections</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categories.map((c) => (
                        <div key={c.id} className="p-5 bg-[#fffafb] rounded-2xl border border-pink-100/40 hover:bg-white hover:shadow-xl hover:shadow-pink-150/10 transition-all duration-300 flex flex-col justify-between gap-4 group relative overflow-hidden">
                          <div className="flex items-start justify-between relative z-10">
                            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-md bg-pink-50">
                              {c.image ? <img src={c.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-4 h-4 text-pink-200" /></div>}
                            </div>
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenCategoryModal(c)} className="p-2 rounded-lg bg-white text-rose-950 hover:bg-rose-900 hover:text-white transition-all shadow-sm cursor-pointer"><Edit className="w-3 h-3" /></button>
                              <button onClick={() => handleDeleteCategory(c.id)} className="p-2 rounded-lg bg-white text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                          <div className="space-y-1 relative z-10">
                            <span className="font-black text-rose-950 text-base block">{c.name}</span>
                            <span className="text-[9px] text-rose-900/40 font-black uppercase block tracking-wider">{c._count?.products || 0} listings</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ==================== ORDERS TAB ==================== */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif font-black text-2xl text-rose-950">Order Management</h3>
                    <p className="text-[10px] text-rose-900/40 font-black uppercase tracking-wider mt-1">
                      Full product snapshots with images — expand any order or open full details
                    </p>
                  </div>
                  <AdminOrdersSection orders={orders} onStatusChange={handleOrderStatusChange} />
                </div>
              )}

              {/* ==================== CUSTOMERS TAB ==================== */}
              {activeTab === 'customers' && (
                <div className="bg-white border border-pink-100/70 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif font-black text-2xl text-rose-950">Client Base Directory</h3>
                    <p className="text-[10px] text-rose-900/40 font-black uppercase tracking-wider mt-1">Review active customer accounts and verification statuses</p>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-pink-50 text-rose-950/40 font-black uppercase text-[10px] tracking-[0.2em]">
                          <th className="py-4 px-4">Client Name</th>
                          <th className="py-4 px-4">Email</th>
                          <th className="py-4 px-4">Contact Phone</th>
                          <th className="py-4 px-4">Email Verification</th>
                          <th className="py-4 px-4">Join Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-50/30">
                        {customers.map((c) => (
                          <tr key={c.id} className="hover:bg-pink-50/20 transition-colors">
                            <td className="py-5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-pink-50 text-rose-950 font-black rounded-xl flex items-center justify-center text-xs">
                                  {c.name.charAt(0)}
                                </div>
                                <span className="font-extrabold text-xs text-rose-950 block">{c.name}</span>
                              </div>
                            </td>
                            <td className="py-5 px-4 text-xs font-semibold text-rose-900/80">{c.email}</td>
                            <td className="py-5 px-4 text-xs font-bold text-rose-950/60">{c.phone || 'N/A'}</td>
                            <td className="py-5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                c.isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${c.isVerified ? 'bg-emerald-600' : 'bg-red-500'}`} />
                                <span>{c.isVerified ? 'Verified' : 'Unverified'}</span>
                              </span>
                            </td>
                            <td className="py-5 px-4 text-xs font-semibold text-rose-950/40">{new Date(c.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ==================== SETTINGS TAB ==================== */}
              {activeTab === 'settings' && (
                <div className="bg-white border border-pink-100/70 rounded-[2.5rem] p-8 shadow-sm space-y-8 max-w-2xl">
                  <div>
                    <h3 className="font-serif font-black text-2xl text-rose-950">Store Configurations</h3>
                    <p className="text-[10px] text-rose-900/40 font-black uppercase tracking-wider mt-1">Calibrate general boutique settings & mail server status</p>
                  </div>

                  <form onSubmit={handleSettingsSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1.5">Boutique Name</label>
                        <input type="text" value={settingsForm.storeName} onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })} className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100/70 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-300 focus:outline-none" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1.5">Support Email</label>
                        <input type="email" value={settingsForm.contactEmail} onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })} className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100/70 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-300 focus:outline-none" required />
                      </div>
                    </div>

                    <div className="p-6 bg-pink-50/20 rounded-2xl border border-pink-100/50 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-rose-900">SMTP Server Information (Environment Status)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] text-rose-950/40 font-bold block">SMTP Host</span>
                          <span className="text-xs font-bold text-rose-950 block mt-1">{settingsForm.smtpHost}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-rose-950/40 font-bold block">SMTP Port</span>
                          <span className="text-xs font-bold text-rose-950 block mt-1">{settingsForm.smtpPort}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-[9px] text-rose-950/40 font-bold block">Status</span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-900 text-[9px] font-black uppercase rounded-full mt-2 tracking-widest border border-rose-100">
                            SMTP Active (Secured)
                          </span>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="px-8 py-4 bg-rose-900 hover:bg-rose-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all">Save Changes</button>
                  </form>
                </div>
              )}

            </div>
          )}

      {/* ==================== PRODUCT DETAILS & EDITING MODAL ==================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-[100] bg-rose-950/40 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-pink-100 rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 sm:p-12 space-y-8 relative custom-scrollbar">
            <button onClick={() => setShowProductModal(false)} className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-red-50 text-red-600 transition-all cursor-pointer"><X className="w-5 h-5" /></button>
            
            <div className="space-y-1">
              <h3 className="font-serif font-black text-2xl text-rose-950">{editingProduct ? 'Update Boutique Listing' : 'Publish New Listing'}</h3>
              <p className="text-[9px] text-rose-900/40 font-black uppercase tracking-widest">Detail catalog listings with SKUs, original price levels, and discounts</p>
            </div>

            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1.5">Product Title</label>
                <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-rose-300 focus:outline-none" required />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1.5">Description</label>
                <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows="4" className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100 rounded-2xl text-xs font-bold resize-none focus:ring-2 focus:ring-rose-300 focus:outline-none" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1.5">Original Price (USD)</label>
                <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-rose-300 focus:outline-none" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1.5">Discounted Price (USD) (Optional)</label>
                <input type="number" step="0.01" value={productForm.discountPrice} onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })} className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-rose-300 focus:outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1.5">SKU Reference</label>
                <input type="text" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} placeholder="e.g. BANG-GOLD-001" className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-rose-300 focus:outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1.5">Collection Category</label>
                <select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })} className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-rose-300 focus:outline-none" required>
                  <option value="" disabled>Select Section</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1.5">Available Stock Count</label>
                <input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="w-full px-5 py-3.5 bg-pink-50/20 border border-pink-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-rose-300 focus:outline-none" required />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-[9px] font-black text-rose-950/40 uppercase tracking-[0.2em] ml-1.5">
                  Product Images ({productForm.images?.length || 0})
                </label>
                <p className="text-[10px] text-rose-900/50 font-semibold ml-1.5">
                  First image is the main thumbnail. Upload multiple or add URLs.
                </p>
                <div className="flex flex-wrap gap-2">
                  <label className="px-4 py-2.5 bg-rose-900 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-md">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{uploading ? '...' : 'Add images'}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleProductImagesUpload}
                      disabled={uploading}
                    />
                  </label>
                  <label className="px-4 py-2.5 border border-pink-200 text-rose-950 rounded-xl text-[9px] font-black uppercase flex items-center gap-1.5 cursor-pointer bg-white">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{uploading ? '...' : 'One file'}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'product')}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="product-image-url-input"
                    placeholder="Paste image URL and press Add"
                    className="flex-1 px-5 py-3 bg-pink-50/20 border border-pink-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addProductImageUrl(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 border border-pink-200 rounded-xl text-[9px] font-black uppercase text-rose-950 bg-white"
                    onClick={() => {
                      const el = document.getElementById('product-image-url-input');
                      if (el) {
                        addProductImageUrl(el.value);
                        el.value = '';
                      }
                    }}
                  >
                    Add URL
                  </button>
                </div>
                {productForm.images?.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {productForm.images.map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-pink-50 ${
                          index === 0 ? 'border-rose-600' : 'border-pink-100'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 bg-rose-900 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                            Main
                          </span>
                        )}
                        <div className="absolute top-1 right-1 flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => removeProductImage(index)}
                            className="p-1 rounded-full bg-white/90 text-rose-900 shadow"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => setProductMainImage(index)}
                            className="absolute bottom-1 left-1 right-1 py-0.5 text-[7px] font-black uppercase bg-white/90 text-rose-900 rounded"
                          >
                            Set main
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-pink-200 py-8 text-center text-[10px] font-bold text-rose-900/40 uppercase tracking-widest">
                    No images yet
                  </div>
                )}
              </div>

              <div className="flex gap-6 md:col-span-2 py-4 px-5 bg-pink-50/25 rounded-2xl border border-pink-100/40">
                <label className="flex items-center gap-2 text-[10px] text-rose-950 font-black uppercase tracking-wider cursor-pointer">
                  <input type="checkbox" checked={productForm.isFeatured} onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })} className="w-4 h-4 accent-rose-900 rounded" />
                  <span>Highlight on Home</span>
                </label>
                <label className="flex items-center gap-2 text-[10px] text-rose-950 font-black uppercase tracking-wider cursor-pointer">
                  <input type="checkbox" checked={productForm.isSale} onChange={(e) => setProductForm({ ...productForm, isSale: e.target.checked })} className="w-4 h-4 accent-rose-900 rounded" />
                  <span>Flash Sale Promo</span>
                </label>
              </div>

              <div className="md:col-span-2 pt-6 border-t border-pink-50 flex justify-end gap-3">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-6 py-3 border border-pink-200 hover:bg-pink-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-950 bg-white">Discard</button>
                <button type="submit" className="px-8 py-3 bg-rose-900 hover:bg-rose-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">Publish Listing</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-rose-950/40 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-[#fffafb] border border-pink-100 rounded-[2.5rem] w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-10 space-y-6 relative custom-scrollbar">
            <button
              type="button"
              onClick={() => setShowOrderModal(false)}
              className="absolute top-6 right-6 p-3 rounded-2xl hover:bg-red-50 text-red-600 transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <ImagePreviewModal
              imageUrl={previewImage}
              onClose={() => setPreviewImage(null)}
            />
            <OrderSummaryPanel
              order={selectedOrder}
              statusControl={
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleOrderStatusChange(selectedOrder.id, e.target.value)}
                  className="w-full mt-2 bg-white border border-pink-200 rounded-xl text-[10px] font-black uppercase tracking-widest px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              }
            />
            <div className="bg-white border border-pink-100/70 rounded-[2rem] p-6 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-rose-900 mb-4">Ordered products</h4>
              <OrderedProductsTable
                items={selectedOrder.products || selectedOrder.orderItems}
                compact
                onImagePreview={(url) => setPreviewImage(url)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
