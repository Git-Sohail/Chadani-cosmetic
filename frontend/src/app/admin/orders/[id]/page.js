'use client';

import { useParams } from 'next/navigation';
import AdminOrderDetail from '../../../../components/admin/AdminOrderDetail';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  return <AdminOrderDetail orderId={id} />;
}
