import React from 'react';
import { Badge } from './Badge';

/**
 * Universal Semantic Status Badge for Orders, Payments, and Shipments
 */
export function StatusBadge({ status, type = 'general', className, size = 'md' }) {
  if (!status) return null;

  const normalized = status.toString().toUpperCase().trim();

  // Semantic mappings
  let variant = 'default';
  let label = normalized.replace(/_/g, ' ');

  switch (normalized) {
    // Green / Success states
    case 'CONFIRMED':
    case 'PAID':
    case 'SUCCESS':
    case 'DELIVERED':
    case 'FULFILLED':
      variant = 'success';
      break;

    // Blue / Active progress states
    case 'PROCESSING':
    case 'SHIPPED':
    case 'SHIPMENT_CREATED':
    case 'PICKED_UP':
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
    case 'PARTIALLY_FULFILLED':
      variant = 'primary';
      break;

    // Amber / Pending / Attention states
    case 'PENDING':
    case 'READY_TO_SHIP':
    case 'INITIATED':
    case 'UNFULFILLED':
      variant = 'warning';
      break;

    // Red / Failed / Cancelled states
    case 'CANCELLED':
    case 'FAILED':
    case 'REFUNDED':
      variant = 'danger';
      break;

    default:
      variant = 'default';
  }

  // Nicely formatted display text
  if (normalized === 'READY_TO_SHIP') label = 'Ready to Ship';
  if (normalized === 'SHIPMENT_CREATED') label = 'Label Created';
  if (normalized === 'OUT_FOR_DELIVERY') label = 'Out for Delivery';
  if (normalized === 'IN_TRANSIT') label = 'In Transit';
  if (normalized === 'PICKED_UP') label = 'Picked Up';
  if (normalized === 'PARTIALLY_FULFILLED') label = 'Partially Shipped';

  return (
    <Badge variant={variant} size={size} dot className={className}>
      {label}
    </Badge>
  );
}

export default StatusBadge;
