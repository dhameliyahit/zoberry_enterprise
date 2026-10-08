import React from 'react';
import { Modal as UIModal } from '../ui/Modal';

export const Modal = ({ isOpen, onClose, children, title, size = 'lg', className }) => {
  return (
    <UIModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={className}
    >
      {children}
    </UIModal>
  );
};

export default Modal;
