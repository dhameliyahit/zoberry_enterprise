import React, { useState } from 'react';
import SEO from '../components/common/SEO';
import { FiPhone, FiMail, FiMapPin, FiMessageCircle, FiCheck } from 'react-icons/fi';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-12">
      <SEO
        title="Contact Us"
        description="Get in touch with Zoberry Enterprise customer support for orders, product queries, and wholesale inquiries."
        url="/contact"
      />
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xs border border-gray-200">
          <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">
            Customer Support
          </span>
          <h1 className="text-3xl font-extrabold text-secondary mb-3">
            Contact Zoberry Enterprise
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Have questions about a product, delivery, or custom order? We are here to help!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FiPhone size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Phone Support</h3>
                  <p className="text-gray-600 text-sm mt-0.5">+91 96386 01192</p>
                  <p className="text-xs text-gray-400">Mon - Sat, 10:00 AM - 7:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                  <FiMessageCircle size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">WhatsApp Chat</h3>
                  <p className="text-gray-600 text-sm mt-0.5">Quick order support & inquiries</p>
                  <a
                    href="https://wa.me/919638601192"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-1 text-xs font-bold text-green-600 hover:underline"
                  >
                    Chat on WhatsApp →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <FiMail size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Email Address</h3>
                  <p className="text-gray-600 text-sm mt-0.5">support@zoberryenterprise.shop</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Location</h3>
                  <p className="text-gray-600 text-sm mt-0.5">Surat, Gujarat, India</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiCheck size={24} />
                  </div>
                  <h3 className="font-bold text-gray-800 text-base mb-1">Message Sent!</h3>
                  <p className="text-xs text-gray-500">Thank you for reaching out. We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help you?"
                      className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button type="submit" className="w-full btn-primary text-xs py-2.5">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
