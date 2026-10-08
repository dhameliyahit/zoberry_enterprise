import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  Package, FolderTree, Tag, Truck, ShieldCheck,
  ArrowUpRight, Users, Plus, CheckCircle, Clock, ExternalLink
} from 'lucide-react';
import { GET_ALL_PRODUCTS, GET_ALL_CATEGORIES } from '../../graphql/products';
import { ADMIN_GET_ALL_PROMOTIONS } from '../../graphql/promotions';
import { ADMIN_GET_ALL_SHIPPING_METHODS } from '../../graphql/shipping';
import { ADMIN_GET_ALL_SHIPMENTS } from '../../graphql/fulfillment';
import { Card, CardBody, CardHeader, Button, Badge, StatusBadge, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui';

const AdminDashboard = () => {
  const { data: prodData, loading: prodLoading } = useQuery(GET_ALL_PRODUCTS, { variables: { limit: 5 } });
  const { data: catData } = useQuery(GET_ALL_CATEGORIES);
  const { data: promoData } = useQuery(ADMIN_GET_ALL_PROMOTIONS);
  const { data: shipMethodData } = useQuery(ADMIN_GET_ALL_SHIPPING_METHODS);
  const { data: shipmentData, loading: shipLoading } = useQuery(ADMIN_GET_ALL_SHIPMENTS, {
    variables: { limit: 5 },
    fetchPolicy: 'network-only',
  });

  const productsCount = prodData?.getAllProducts?.length || 0;
  const categoriesCount = catData?.getAllCategories?.length || 0;
  const promoCount = promoData?.adminGetAllPromotions?.totalCount || promoData?.adminGetAllPromotions?.promotions?.length || 0;
  const shippingMethodsCount = shipMethodData?.adminGetAllShippingMethods?.length || 0;
  const recentShipments = shipmentData?.adminGetAllShipments || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store operations, inventory catalog, fulfillment shipments, and business configuration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/products">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add Product
            </Button>
          </Link>
          <Link to="/" target="_blank">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Storefront
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-slate-300 transition-all">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Catalog Products</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {prodLoading ? '...' : productsCount}
              </div>
              <Link to="/admin/products" className="text-xs text-primary font-semibold hover:underline mt-2 inline-flex items-center gap-1">
                Manage Products <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Categories</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {categoriesCount}
              </div>
              <Link to="/admin/categories" className="text-xs text-primary font-semibold hover:underline mt-2 inline-flex items-center gap-1">
                Manage Categories <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FolderTree className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Promotions & Coupons</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {promoCount}
              </div>
              <Link to="/admin/promotions" className="text-xs text-primary font-semibold hover:underline mt-2 inline-flex items-center gap-1">
                Manage Coupons <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Tag className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Shipping Methods</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {shippingMethodsCount}
              </div>
              <Link to="/admin/shipping" className="text-xs text-primary font-semibold hover:underline mt-2 inline-flex items-center gap-1">
                Configure Rules <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Fulfillment Shipments */}
      <Card>
        <CardHeader className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Logistics Shipments</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live tracking status & carrier dispatches</p>
          </div>
          <Link to="/admin/shipping">
            <Button variant="ghost" size="sm">
              All Shipments
            </Button>
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {shipLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading shipments...</div>
          ) : recentShipments.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No shipments created yet. Shipments appear when orders are fulfilled in the admin panel.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>AWB / Ref</TableHeader>
                  <TableHeader>Carrier</TableHeader>
                  <TableHeader>Method</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Created</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentShipments.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono font-bold text-slate-900">
                      {s.awbNumber || s.trackingNumber || s.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">{s.provider}</TableCell>
                    <TableCell>{s.shippingMethodCode}</TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} type="shipment" />
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs">
                      {new Date(s.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 hover:border-slate-300 transition-all">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Catalog Management</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Create products, manage variants, upload high-res images, and update inventory stock counts.
          </p>
          <Link to="/admin/products">
            <Button variant="outline" size="sm" className="w-full">
              Go to Products
            </Button>
          </Link>
        </Card>

        <Card className="p-5 hover:border-slate-300 transition-all">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Coupons & Campaigns</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Configure percentage/fixed discounts, minimum cart spend conditions, and expiry dates.
          </p>
          <Link to="/admin/promotions">
            <Button variant="outline" size="sm" className="w-full">
              Go to Promotions
            </Button>
          </Link>
        </Card>

        <Card className="p-5 hover:border-slate-300 transition-all">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Shipping & GST Taxes</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Manage Standard/Express rates, free shipping thresholds, GST rates, and live parcel dispatches.
          </p>
          <Link to="/admin/shipping">
            <Button variant="outline" size="sm" className="w-full">
              Go to Logistics & Tax
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
