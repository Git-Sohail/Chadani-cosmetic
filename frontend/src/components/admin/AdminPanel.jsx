'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Layers,
  FileSpreadsheet,
  Users,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Loader2,
  Package,
  Eye,
  CheckCircle2,
  UploadCloud,
  Check,
} from 'lucide-react';
import axios from 'axios';
import AdminOrdersSection from './AdminOrdersSection';
import ImagePreviewModal from './ImagePreviewModal';
import SearchFilterBar from './SearchFilterBar';
import Pagination from './Pagination';
import { SkeletonStatCards, SkeletonTableRows } from './Skeleton';
import { formatPrice } from '../../utils/currency';

const PAGE_SIZE = 10;

export default function AdminPanel({ activeTab = 'dashboard' }) {
  const { user, token, API_URL } = useAuth();
  const router = useRouter();

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & Details
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);

  const [customerActionTarget, setCustomerActionTarget] = useState(null);
  const [deleteCustomerTarget, setDeleteCustomerTarget] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    stock: '10',
    sku: '',
    images: [],
  });

  const [categoryForm, setCategoryForm] = useState({ name: '', image: '' });

  // Notifications / Feedback
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search / Filter / Sort states
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productSort, setProductSort] = useState('');
  const [productPage, setProductPage] = useState(1);

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderSort, setOrderSort] = useState('newest');
  const [orderPage, setOrderPage] = useState(1);

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerVerified, setCustomerVerified] = useState('');
  const [customerPage, setCustomerPage] = useState(1);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Fetch all admin data
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
      const [prodRes, catRes, orderRes, custRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/orders`, authHeaders),
        axios.get(`${API_URL}/auth/customers`, authHeaders),
      ]);

      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setOrders(orderRes.data || []);
      setCustomers(custRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast('Could not load administrative records from server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      fetchData();
    }
  }, [user, token, fetchData]);

  // Operational metrics
  const stats = useMemo(() => {
    const validOrders = orders.filter((o) => (o.orderStatus || '').toLowerCase() !== 'cancelled');
    const grossOrderValue = validOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
    const deliveredOrders = validOrders.filter((o) => (o.orderStatus || '').toLowerCase() === 'delivered');
    const deliveredRevenue = deliveredOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
    const pendingOrders = validOrders.filter((o) => (o.orderStatus || '').toLowerCase() === 'pending');

    return {
      grossOrderValue,
      deliveredRevenue,
      pendingOrdersCount: pendingOrders.length,
      ordersCount: orders.length,
      productsCount: products.length,
      customersCount: customers.length,
    };
  }, [orders, products, customers]);

  // Stock alerts deriving from real inventory counts
  const stockAlerts = useMemo(() => {
    return products.filter((p) => Number(p.stock) < 5);
  }, [products]);

  // ── Product filtering ──────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (productSearch) {
      const q = productSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q) ||
          (p.category?.name || '').toLowerCase().includes(q)
      );
    }
    if (productCategory) {
      list = list.filter((p) => p.categoryId === productCategory);
    }
    if (productSort === 'priceAsc') list.sort((a, b) => a.price - b.price);
    else if (productSort === 'priceDesc') list.sort((a, b) => b.price - a.price);
    else if (productSort === 'stockAsc') list.sort((a, b) => a.stock - b.stock);
    else if (productSort === 'nameAsc') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, productSearch, productCategory, productSort]);

  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pagedProducts = filteredProducts.slice(
    (productPage - 1) * PAGE_SIZE,
    productPage * PAGE_SIZE
  );

  // ── Order filtering ────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      list = list.filter(
        (o) =>
          (o.customerName || '').toLowerCase().includes(q) ||
          (o.id || '').toLowerCase().includes(q) ||
          (o.phone || '').includes(q)
      );
    }
    if (orderStatus) {
      list = list.filter((o) => (o.orderStatus || '').toLowerCase() === orderStatus.toLowerCase());
    }
    if (orderSort === 'totalDesc') list.sort((a, b) => b.totalAmount - a.totalAmount);
    else if (orderSort === 'totalAsc') list.sort((a, b) => a.totalAmount - b.totalAmount);
    else if (orderSort === 'newest')
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (orderSort === 'oldest')
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return list;
  }, [orders, orderSearch, orderStatus, orderSort]);

  const orderTotalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((orderPage - 1) * PAGE_SIZE, orderPage * PAGE_SIZE);

  // ── Customer filtering ─────────────────────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    let list = [...customers];
    if (customerSearch) {
      const q = customerSearch.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.phone || '').includes(q)
      );
    }
    if (customerVerified === 'verified') list = list.filter((c) => c.isVerified);
    else if (customerVerified === 'unverified') list = list.filter((c) => !c.isVerified);
    return list;
  }, [customers, customerSearch, customerVerified]);

  const customerTotalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const pagedCustomers = filteredCustomers.slice(
    (customerPage - 1) * PAGE_SIZE,
    customerPage * PAGE_SIZE
  );

  // ── Product modal handlers ────────────────────────────────────────────────
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      categoryId: categories[0]?.id || '',
      stock: '10',
      sku: '',
      images: [],
    });
    setFormError('');
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    const existingImages = Array.isArray(product.images)
      ? product.images.map((img) => (typeof img === 'string' ? img : img.url)).filter(Boolean)
      : product.image
        ? [product.image]
        : [];

    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? String(product.price) : '',
      discountPrice: product.discountPrice ? String(product.discountPrice) : '',
      categoryId: product.categoryId || categories[0]?.id || '',
      stock: product.stock !== undefined ? String(product.stock) : '0',
      sku: product.sku || '',
      images: existingImages,
    });
    setFormError('');
    setShowProductModal(true);
  };

  // Image Upload handler (supports Cloudinary or backend upload endpoint)
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingImage(true);
    setFormError('');

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        if (res.data?.url) {
          uploadedUrls.push(res.data.url);
        }
      }

      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      showToast(`${uploadedUrls.length} image(s) uploaded.`);
    } catch (err) {
      console.error('Image upload error:', err);
      setFormError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    const parsedPrice = parseFloat(productForm.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return setFormError('Please enter a valid non-negative original price.');
    }

    let parsedDiscount = null;
    if (productForm.discountPrice.trim() !== '') {
      parsedDiscount = parseFloat(productForm.discountPrice);
      if (isNaN(parsedDiscount) || parsedDiscount < 0) {
        return setFormError('Discount price must be a valid non-negative number.');
      }
      if (parsedDiscount > parsedPrice) {
        return setFormError('Discount price cannot exceed the original price.');
      }
    }

    if (!productForm.name.trim()) {
      return setFormError('Product name is required.');
    }
    if (!productForm.categoryId) {
      return setFormError('Please assign a category to this product.');
    }

    setSubmitting(true);

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: parsedPrice,
      discountPrice: parsedDiscount,
      categoryId: productForm.categoryId,
      stock: parseInt(productForm.stock, 10) || 0,
      sku: productForm.sku.trim() || undefined,
      images: productForm.images,
      image: productForm.images[0] || null,
    };

    try {
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, payload, authHeaders);
        showToast('Product updated successfully.');
      } else {
        await axios.post(`${API_URL}/products`, payload, authHeaders);
        showToast('Product created successfully.');
      }
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    setSubmitting(true);
    try {
      await axios.delete(`${API_URL}/products/${deleteProductTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast(`Product "${deleteProductTarget.name}" deleted.`);
      setDeleteProductTarget(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Category modal handlers ───────────────────────────────────────────────
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', image: '' });
    setFormError('');
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name || '', image: cat.image || '' });
    setFormError('');
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      return setFormError('Collection name is required.');
    }
    setSubmitting(true);
    try {
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        name: categoryForm.name.trim(),
        image: categoryForm.image.trim() || null,
      };

      if (editingCategory) {
        await axios.put(`${API_URL}/categories/${editingCategory.id}`, payload, authHeaders);
        showToast('Collection updated successfully.');
      } else {
        await axios.post(`${API_URL}/categories`, payload, authHeaders);
        showToast('Collection created successfully.');
      }
      setShowCategoryModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save collection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    setSubmitting(true);
    try {
      await axios.delete(`${API_URL}/categories/${deleteCategoryTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast(`Collection "${deleteCategoryTarget.name}" deleted.`);
      setDeleteCategoryTarget(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Cannot delete collection.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Customer status handlers ──────────────────────────────────────────────
  const handleToggleCustomerActive = async () => {
    if (!customerActionTarget) return;
    const { customer, action } = customerActionTarget;
    setSubmitting(true);
    try {
      const endpoint =
        action === 'deactivate'
          ? `${API_URL}/auth/customers/${customer.id}/deactivate`
          : `${API_URL}/auth/customers/${customer.id}/activate`;

      await axios.patch(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(
        `Customer "${customer.name}" ${action === 'deactivate' ? 'deactivated' : 'reactivated'}.`
      );
      setCustomerActionTarget(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not change customer status.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteCustomerTarget) return;
    setSubmitting(true);
    try {
      await axios.delete(`${API_URL}/auth/customers/${deleteCustomerTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast(`Customer "${deleteCustomerTarget.name}" deleted.`);
      setDeleteCustomerTarget(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete customer.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Order status update handler ───────────────────────────────────────────
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Order status updated to ${newStatus}.`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-[200] p-4 text-xs font-medium max-w-sm flex items-center gap-2 border shadow-lg ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-[150] bg-brand-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-serif text-xl text-brand-dark">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-1 text-brand-muted hover:text-brand-dark"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-5">
              {/* Section 1: Details */}
              <div className="space-y-3">
                <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted block">
                  1. Basic Details
                </span>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-brand-muted block">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    placeholder="e.g. Silk Radiance Serum"
                    className="w-full px-3.5 py-2 bg-brand-surface border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-brand-muted block">
                      Collection / Category *
                    </label>
                    <select
                      value={productForm.categoryId}
                      onChange={(e) =>
                        setProductForm({ ...productForm, categoryId: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-brand-accent cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-brand-muted block">
                      SKU Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="e.g. CC-SR-01"
                      className="w-full px-3.5 py-2 bg-brand-surface border border-brand-border text-xs font-mono text-brand-dark focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-brand-muted block">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    required
                    placeholder="Refined formulation description..."
                    className="w-full px-3.5 py-2 bg-brand-surface border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* Section 2: Pricing & Inventory */}
              <div className="space-y-3 pt-3 border-t border-brand-border/60">
                <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted block">
                  2. Pricing & Stock
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-brand-muted block">
                      Original Price (NPR) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                      placeholder="1200"
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border text-xs font-mono text-brand-dark focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-brand-muted block">
                      Discount Price (NPR)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={productForm.discountPrice}
                      onChange={(e) =>
                        setProductForm({ ...productForm, discountPrice: e.target.value })
                      }
                      placeholder="Leave blank if none"
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border text-xs font-mono text-brand-dark focus:outline-none focus:border-brand-accent"
                    />
                    <span className="text-[10px] text-brand-muted block">
                      Active selling price if set. Must not exceed original price.
                    </span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-brand-muted block">
                      Stock Count *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border text-xs font-mono text-brand-dark focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Media */}
              <div className="space-y-3 pt-3 border-t border-brand-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted block">
                    3. Product Imagery
                  </span>
                  {uploadingImage && (
                    <span className="text-xs text-brand-accent flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {productForm.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 border border-brand-border bg-brand-bg group overflow-hidden"
                    >
                      <img
                        src={imgUrl}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-brand-dark text-brand-surface opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <label className="w-20 h-20 border border-dashed border-brand-border hover:border-brand-accent bg-brand-bg/40 flex flex-col items-center justify-center text-brand-muted cursor-pointer transition-colors">
                    <UploadCloud className="w-5 h-5 text-brand-accent mb-0.5" />
                    <span className="text-[9px] uppercase tracking-wider">Upload</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-brand-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-brand-border text-xs uppercase tracking-wider text-brand-dark hover:border-brand-accent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-5 py-2 bg-brand-dark text-brand-surface text-xs uppercase tracking-wider hover:bg-brand-accent disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation */}
      {deleteProductTarget && (
        <div className="fixed inset-0 z-[200] bg-brand-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border max-w-sm w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-brand-dark">Delete Product</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-brand-dark">{deleteProductTarget.name}</strong>?
              Historical order items referencing this product will be preserved.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteProductTarget(null)}
                className="flex-1 px-4 py-2 border border-brand-border text-xs uppercase tracking-wider text-brand-dark hover:border-brand-accent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-700 text-brand-surface text-xs uppercase tracking-wider hover:bg-red-800 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[150] bg-brand-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-serif text-lg text-brand-dark">
                {editingCategory ? 'Edit Collection' : 'Create Collection'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="p-1 text-brand-muted hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-brand-muted block">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                  placeholder="e.g. Skin Care, Fragrance, Lip Care"
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-brand-muted block">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="pt-3 border-t border-brand-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-brand-border text-xs uppercase tracking-wider text-brand-dark hover:border-brand-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-dark text-brand-surface text-xs uppercase tracking-wider hover:bg-brand-accent disabled:opacity-50"
                >
                  <span>{editingCategory ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      {deleteCategoryTarget && (
        <div className="fixed inset-0 z-[200] bg-brand-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border max-w-sm w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-brand-dark">Delete Collection</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Are you sure you want to delete collection{' '}
              <strong className="text-brand-dark">{deleteCategoryTarget.name}</strong>?
              Collections with active products cannot be deleted until those products are reassigned.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCategoryTarget(null)}
                className="flex-1 px-4 py-2 border border-brand-border text-xs uppercase tracking-wider text-brand-dark hover:border-brand-accent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-700 text-brand-surface text-xs uppercase tracking-wider hover:bg-red-800 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Action (Deactivate / Activate) Confirmation */}
      {customerActionTarget && (
        <div className="fixed inset-0 z-[200] bg-brand-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border max-w-sm w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-brand-dark">
              {customerActionTarget.action === 'deactivate'
                ? 'Deactivate Customer'
                : 'Reactivate Customer'}
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              {customerActionTarget.action === 'deactivate' ? (
                <>
                  Are you sure you want to deactivate{' '}
                  <strong className="text-brand-dark">{customerActionTarget.customer.name}</strong>?
                  The user will be immediately blocked from signing in or placing orders. Order history is preserved.
                </>
              ) : (
                <>
                  Restore access for{' '}
                  <strong className="text-brand-dark">{customerActionTarget.customer.name}</strong>?
                  They will be able to sign in and shop again.
                </>
              )}
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCustomerActionTarget(null)}
                className="flex-1 px-4 py-2 border border-brand-border text-xs uppercase tracking-wider text-brand-dark hover:border-brand-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleCustomerActive}
                disabled={submitting}
                className={`flex-1 px-4 py-2 text-xs uppercase tracking-wider text-brand-surface ${
                  customerActionTarget.action === 'deactivate'
                    ? 'bg-amber-700 hover:bg-amber-800'
                    : 'bg-brand-dark hover:bg-brand-accent'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Modal */}
      {deleteCustomerTarget && (
        <div className="fixed inset-0 z-[200] bg-brand-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border max-w-sm w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-brand-dark">Permanently Delete Customer</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Permanently delete{' '}
              <strong className="text-brand-dark">{deleteCustomerTarget.name}</strong>?
              Their account profile, wishlist, and cart will be removed. Historical orders are safely retained.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCustomerTarget(null)}
                className="flex-1 px-4 py-2 border border-brand-border text-xs uppercase tracking-wider text-brand-dark hover:border-brand-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-700 text-brand-surface text-xs uppercase tracking-wider hover:bg-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW: DASHBOARD / OVERVIEW                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-4">
            <div>
              <h1 className="font-serif text-2xl text-brand-dark font-normal">
                Commerce Overview
              </h1>
              <p className="text-xs text-brand-muted mt-0.5">
                Real-time metrics and operational alerts for Dharan delivery operations.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-brand-border bg-brand-surface hover:border-brand-accent text-xs font-medium uppercase tracking-wider text-brand-dark transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>

          {/* Metric Cards */}
          {loading && !orders.length ? (
            <SkeletonStatCards />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
              <div className="bg-brand-surface border border-brand-border p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-brand-muted block font-medium">
                  Gross Order Value
                </span>
                <p className="font-mono text-base sm:text-lg font-medium text-brand-dark">
                  {formatPrice(stats.grossOrderValue)}
                </p>
                <span className="text-[9px] text-brand-muted/70 block">
                  Includes flat Rs. 100 Dharan delivery
                </span>
              </div>

              <div className="bg-brand-surface border border-brand-border p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-brand-muted block font-medium">
                  Delivered Sales
                </span>
                <p className="font-mono text-base sm:text-lg font-medium text-brand-accent">
                  {formatPrice(stats.deliveredRevenue)}
                </p>
                <span className="text-[9px] text-brand-muted/70 block">
                  Fulfilled & completed orders
                </span>
              </div>

              <div className="bg-brand-surface border border-brand-border p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-brand-muted block font-medium">
                  Pending Orders
                </span>
                <p className="font-mono text-base sm:text-lg font-medium text-amber-700">
                  {stats.pendingOrdersCount}
                </p>
                <span className="text-[9px] text-brand-muted/70 block">Awaiting confirmation</span>
              </div>

              <div className="bg-brand-surface border border-brand-border p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-brand-muted block font-medium">
                  Total Orders
                </span>
                <p className="font-mono text-base sm:text-lg font-medium text-brand-dark">
                  {stats.ordersCount}
                </p>
                <span className="text-[9px] text-brand-muted/70 block">All recorded requests</span>
              </div>

              <div className="bg-brand-surface border border-brand-border p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-brand-muted block font-medium">
                  Active Products
                </span>
                <p className="font-mono text-base sm:text-lg font-medium text-brand-dark">
                  {stats.productsCount}
                </p>
                <span className="text-[9px] text-brand-muted/70 block">Catalog assortment</span>
              </div>

              <div className="bg-brand-surface border border-brand-border p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-brand-muted block font-medium">
                  Registered Clients
                </span>
                <p className="font-mono text-base sm:text-lg font-medium text-brand-dark">
                  {stats.customersCount}
                </p>
                <span className="text-[9px] text-brand-muted/70 block">Customer directory</span>
              </div>
            </div>
          )}

          {/* Real Inventory Alerts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-border pb-2">
              <h2 className="font-serif text-lg text-brand-dark flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Inventory Alerts (Derived from real stock counts)</span>
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-brand-muted font-mono">
                {stockAlerts.length} item(s) below threshold
              </span>
            </div>

            {stockAlerts.length === 0 ? (
              <div className="p-4 bg-brand-surface border border-brand-border text-xs text-brand-muted flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All catalog products are currently well-stocked. No shortages reported.</span>
              </div>
            ) : (
              <div className="overflow-x-auto bg-brand-surface border border-brand-border">
                <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-brand-border text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Available Stock</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40">
                    {stockAlerts.map((product) => (
                      <tr key={product.id} className="hover:bg-brand-bg/40 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-brand-dark">
                          {product.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-brand-muted">
                          {product.sku || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-brand-muted">
                          {product.category?.name || 'General'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-brand-dark">
                          {product.stock}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium border ${
                              product.stock === 0
                                ? 'bg-red-50 text-red-800 border-red-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => openEditProductModal(product)}
                            className="text-[11px] uppercase tracking-wider text-brand-dark hover:text-brand-accent underline cursor-pointer"
                          >
                            Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Orders Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-border pb-2">
              <h2 className="font-serif text-lg text-brand-dark">Recent Customer Orders</h2>
              <Link
                href="/admin/orders"
                className="text-xs uppercase tracking-wider text-brand-muted hover:text-brand-dark transition-colors"
              >
                View all orders &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto bg-brand-surface border border-brand-border">
              <table className="w-full text-left border-collapse text-xs min-w-[560px]">
                <thead>
                  <tr className="border-b border-brand-border text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                    <th className="py-2.5 px-3">Order Ref</th>
                    <th className="py-2.5 px-3">Client</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-brand-bg/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-brand-dark">
                        #{order.id.slice(0, 8)}…
                      </td>
                      <td className="py-2.5 px-3 text-brand-dark font-medium">
                        {order.customerName}
                      </td>
                      <td className="py-2.5 px-3 text-brand-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-brand-dark">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider border border-brand-border bg-brand-bg text-brand-dark">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[11px] uppercase tracking-wider text-brand-dark hover:text-brand-accent underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW: PRODUCTS MANAGEMENT                                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'products' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-4">
            <div>
              <h1 className="font-serif text-2xl text-brand-dark font-normal">
                Product Catalog
              </h1>
              <p className="text-xs text-brand-muted mt-0.5">
                Manage cosmetic items, inventory counts, and discount pricing.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddProductModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Filter Bar */}
          <SearchFilterBar
            search={productSearch}
            onSearch={(v) => {
              setProductSearch(v);
              setProductPage(1);
            }}
            placeholder="Search by title, SKU or category…"
            filters={[
              {
                label: 'All Collections',
                value: 'category',
                options: categories.map((c) => ({ label: c.name, value: c.id })),
              },
            ]}
            filterValues={{ category: productCategory }}
            onFilter={(_, val) => {
              setProductCategory(val);
              setProductPage(1);
            }}
            sortOptions={[
              { label: 'Name (A-Z)', value: 'nameAsc' },
              { label: 'Price (Low to High)', value: 'priceAsc' },
              { label: 'Price (High to Low)', value: 'priceDesc' },
              { label: 'Stock (Low to High)', value: 'stockAsc' },
            ]}
            sortValue={productSort}
            onSort={(val) => setProductSort(val)}
          />

          {/* Products Table */}
          <div className="bg-brand-surface border border-brand-border overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-brand-border text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  <th className="py-2.5 px-3 w-16">Image</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Collection</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Original</th>
                  <th className="py-2.5 px-3 text-right">Selling Price</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {loading && !products.length ? (
                  <SkeletonTableRows rows={6} cols={8} />
                ) : pagedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-brand-muted">
                      No products match your criteria.
                    </td>
                  </tr>
                ) : (
                  pagedProducts.map((p) => {
                    const hasDiscount =
                      p.discountPrice !== null &&
                      p.discountPrice !== undefined &&
                      p.discountPrice > 0;
                    return (
                      <tr key={p.id} className="hover:bg-brand-bg/30 transition-colors">
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => p.image && setPreviewImage(p.image)}
                            disabled={!p.image}
                            className="w-10 h-10 border border-brand-border bg-brand-bg overflow-hidden flex items-center justify-center shrink-0"
                          >
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-brand-muted/40" />
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-brand-dark">
                          {p.name}
                        </td>
                        <td className="py-2.5 px-3 text-brand-muted">
                          {p.category?.name || 'General'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-brand-muted">
                          {p.sku || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-brand-muted">
                          {hasDiscount ? (
                            <span className="line-through">{formatPrice(p.price)}</span>
                          ) : (
                            formatPrice(p.price)
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-brand-dark">
                          {hasDiscount ? (
                            <span className="text-brand-accent">{formatPrice(p.discountPrice)}</span>
                          ) : (
                            formatPrice(p.price)
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono border ${
                              p.stock === 0
                                ? 'bg-red-50 text-red-800 border-red-200'
                                : p.stock < 5
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-brand-bg text-brand-dark border-brand-border'
                            }`}
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditProductModal(p)}
                              className="p-1 text-brand-muted hover:text-brand-dark transition-colors cursor-pointer"
                              aria-label={`Edit ${p.name}`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteProductTarget(p)}
                              className="p-1 text-brand-muted hover:text-red-700 transition-colors cursor-pointer"
                              aria-label={`Delete ${p.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={productPage}
            totalPages={productTotalPages}
            onPage={(p) => setProductPage(p)}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW: CATEGORIES MANAGEMENT                                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-4">
            <div>
              <h1 className="font-serif text-2xl text-brand-dark font-normal">
                Product Collections
              </h1>
              <p className="text-xs text-brand-muted mt-0.5">
                Organize items into browsable storefront departments.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddCategoryModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider hover:bg-brand-accent transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Collection</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="bg-brand-surface border border-brand-border p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-brand-bg border border-brand-border overflow-hidden shrink-0 flex items-center justify-center">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <Layers className="w-5 h-5 text-brand-muted/40" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-xs text-brand-dark truncate">{cat.name}</h3>
                      <span className="text-[11px] text-brand-muted block font-mono">
                        {count} item{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditCategoryModal(cat)}
                      className="p-1.5 border border-brand-border text-brand-muted hover:text-brand-dark cursor-pointer"
                      aria-label={`Edit ${cat.name}`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCategoryTarget(cat)}
                      className="p-1.5 border border-brand-border text-brand-muted hover:text-red-700 cursor-pointer"
                      aria-label={`Delete ${cat.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW: ORDERS MANAGEMENT                                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-4">
            <div>
              <h1 className="font-serif text-2xl text-brand-dark font-normal">
                Order Fulfillment
              </h1>
              <p className="text-xs text-brand-muted mt-0.5">
                Process customer orders, verify Dharan delivery addresses, and coordinate dispatch.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-brand-border bg-brand-surface hover:border-brand-accent text-xs font-medium uppercase tracking-wider text-brand-dark transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>

          <SearchFilterBar
            search={orderSearch}
            onSearch={(v) => {
              setOrderSearch(v);
              setOrderPage(1);
            }}
            placeholder="Search by order ID, customer name or phone…"
            filters={[
              {
                label: 'All Statuses',
                value: 'status',
                options: [
                  { label: 'Pending', value: 'pending' },
                  { label: 'Confirmed', value: 'confirmed' },
                  { label: 'Shipped', value: 'shipped' },
                  { label: 'Delivered', value: 'delivered' },
                  { label: 'Cancelled', value: 'cancelled' },
                ],
              },
            ]}
            filterValues={{ status: orderStatus }}
            onFilter={(_, val) => {
              setOrderStatus(val);
              setOrderPage(1);
            }}
            sortOptions={[
              { label: 'Newest First', value: 'newest' },
              { label: 'Oldest First', value: 'oldest' },
              { label: 'Total (High to Low)', value: 'totalDesc' },
              { label: 'Total (Low to High)', value: 'totalAsc' },
            ]}
            sortValue={orderSort}
            onSort={(val) => setOrderSort(val)}
          />

          <AdminOrdersSection
            orders={pagedOrders}
            onStatusChange={handleOrderStatusChange}
          />

          <Pagination
            page={orderPage}
            totalPages={orderTotalPages}
            onPage={(p) => setOrderPage(p)}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW: CUSTOMERS MANAGEMENT                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'customers' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-4">
            <div>
              <h1 className="font-serif text-2xl text-brand-dark font-normal">
                Client Directory
              </h1>
              <p className="text-xs text-brand-muted mt-0.5">
                Inspect registered customer accounts, verify credentials, and manage account status.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-brand-border bg-brand-surface hover:border-brand-accent text-xs font-medium uppercase tracking-wider text-brand-dark transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Directory</span>
            </button>
          </div>

          <SearchFilterBar
            search={customerSearch}
            onSearch={(v) => {
              setCustomerSearch(v);
              setCustomerPage(1);
            }}
            placeholder="Search by name, email or phone…"
            filters={[
              {
                label: 'All Accounts',
                value: 'verified',
                options: [
                  { label: 'Email Verified', value: 'verified' },
                  { label: 'Unverified', value: 'unverified' },
                ],
              },
            ]}
            filterValues={{ verified: customerVerified }}
            onFilter={(_, val) => {
              setCustomerVerified(val);
              setCustomerPage(1);
            }}
          />

          <div className="bg-brand-surface border border-brand-border overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-brand-border text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  <th className="py-2.5 px-3">Client Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3 text-center">Email Verified</th>
                  <th className="py-2.5 px-3 text-center">Account State</th>
                  <th className="py-2.5 px-3 text-center">Orders</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {pagedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-brand-muted">
                      No customer accounts match your criteria.
                    </td>
                  </tr>
                ) : (
                  pagedCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-brand-bg/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-brand-dark">
                        {c.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-brand-muted">
                        {c.email}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-brand-muted">
                        {c.phone || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border ${
                            c.isVerified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {c.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border ${
                            c.isActive === false
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-brand-bg text-brand-dark border-brand-border'
                          }`}
                        >
                          {c.isActive === false ? 'Deactivated' : 'Active'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {c._count?.orders ?? '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCustomerActionTarget({
                                customer: c,
                                action: c.isActive === false ? 'activate' : 'deactivate',
                              })
                            }
                            className="text-[11px] uppercase tracking-wider text-brand-dark hover:text-brand-accent underline cursor-pointer"
                          >
                            {c.isActive === false ? 'Reactivate' : 'Deactivate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCustomerTarget(c)}
                            className="p-1 text-brand-muted hover:text-red-700 transition-colors cursor-pointer"
                            aria-label={`Delete ${c.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={customerPage}
            totalPages={customerTotalPages}
            onPage={(p) => setCustomerPage(p)}
          />
        </div>
      )}
    </div>
  );
}
